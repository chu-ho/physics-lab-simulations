(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  M.register('magnetic-induction', '磁鐵穿線圈：磁通與感應電壓', '電磁學', 'magnetic-induction', [
    P('speed', '軸向速度（向右為正）', -1, 1, .1, .5, 'm/s'),
    P('polarity', '磁極（−1：N 向左；+1：N 向右）', -1, 1, 2, 1, ''),
    P('turns', '線圈匝數', 10, 200, 10, 100, '匝')
  ], [
    metric('x', '磁鐵中心位置', 'm'),
    metric('fluxMilli', '每匝磁通 Φ', 'mWb'),
    metric('emfMilli', '感應電動勢 ε', 'mV')
  ],
  'Φ=μ₀m a²/[2(a²+x²)^(3/2)]；ε=−N dΦ/dt=3NΦ xv/(a²+x²)',
  '小磁鐵以軸向點磁偶極近似，薄線圈各匝視為半徑 a=0.45 m 的同一圓環。磁通由圓周上的磁向量勢環積分求得，不取中心點場乘面積。面法線為 +x，正電動勢沿右手繞向。磁鐵由外力維持定速，線圈接高阻電壓表；此模型只計開路電壓，不算閉路電流、自感或磁阻尼。速度設為 0 時，磁鐵停在中心左方。圖表可切換磁通、磁通變化率與感應電動勢。',
  [
    '先預測磁鐵通過線圈中心時的電動勢。播放觀察這一刻的磁通與電壓，解釋兩者何時達到極值。',
    '預測速度加倍、匝數加倍及反轉磁極各會怎麼改變電壓。操作後以圖表比較同一位置，再解釋固定磁鐵時的結果。'
  ], p => {
    const radius = .45;
    const start = p.speed < 0 ? 1.5 : -1.5;
    const duration = p.speed === 0 ? 4 : 3 / Math.abs(p.speed);
    const axisHeight = .8;
    const fluxConstant = 2 * Math.PI * 1e-7 * (120 * p.polarity) * radius ** 2;
    const events = p.speed === 0 ? [] : [
      { t: (1.5 - radius / 2) / Math.abs(p.speed), label: '進入側電動勢絕對值最大' },
      { t: duration / 2, label: '通過中心，磁通絕對值最大，感應電壓過零' },
      { t: (1.5 + radius / 2) / Math.abs(p.speed), label: '離開側電動勢絕對值最大' }
    ];
    return trajectory(duration, t => {
      const x = start + p.speed * t;
      const denominator = radius ** 2 + x ** 2;
      const flux = fluxConstant / denominator ** 1.5;
      const fluxRate = -3 * flux * x * p.speed / denominator;
      const emf = -p.turns * fluxRate;
      return {
        x, y: axisHeight, vx: p.speed, flux, fluxRate, emf,
        fluxMilli: flux * 1000, fluxRateMilli: fluxRate * 1000, emfMilli: emf * 1000
      };
    }, {
      radius, displayScale: 3, events,
      bounds: { min: [-5.1, 0, -1.7], max: [5.1, 4.6, 1.7] },
      scaleNote: '磁鐵與線圈的顯示比例為 3 倍，繞線匝數與電壓表為示意。藍箭頭標示 +x 面法線，綠／橙代表正／負感應電動勢。',
      endLabel: p.speed === 0 ? '磁鐵保持靜止，感應電壓為零' : '磁鐵已穿過線圈'
    });
  }, 'models/magnetic-induction.js');
  const def = M.defs.at(-1);
  def.defaultPlotMetric = 'emfMilli';
  def.plotMetrics = [metric('fluxRateMilli', '每匝磁通變化率 dΦ/dt', 'mWb/s'), metric('vx', '軸向速度', 'm/s')];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
