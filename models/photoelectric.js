(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const planckEvThz = 4.135667696e-3;
  const electronCharge = 1.602176634e-19;
  const duration = 12;

  M.register('photoelectric', '光電效應：光子能量與光電流', '近代物理', 'photoelectric', [
    P('frequency', '入射光頻率', 300, 2000, 1, 1100, 'THz'),
    P('intensityMode', '入射條件：0 固定光子流率／1 固定光功率', 0, 1, 1, 0),
    P('flux', '固定光子流率（模式 0）', 0, 20, .2, 10, '10¹³/s'),
    P('power', '固定入射光功率（模式 1）', 0, 100, 1, 60, 'μW'),
    P('workFunction', '金屬逸出功', 1.5, 5.5, .01, 2.3, 'eV'),
    P('retarding', '遏止方向電壓 V（負值為加速）', -2, 8, .01, 0, 'V'),
    P('sweep', '電壓模式：0 固定／1 自動由 −2 掃至 8 V', 0, 1, 1, 0)
  ], [
    metric('maxEnergy', '最大初動能', 'eV'),
    metric('current', '收集電流大小', 'μA'),
    metric('stoppingVoltage', '理想遏止電壓', 'V')
  ],
  'E光子=hf；f₀=φ/h；hf>φ 時 Kmax=hf−φ、Vs=Kmax/e；I=e×每秒收集電子數',
  '本模型採單色光、單光子吸收與理想平行電極。hf≤φ 設為無可收集的發射電子，零動能臨界點不計。發射效率示意為固定 20%，假設沿電極法向的初動能在 0 到 Kmax 均勻分布。到達收集極須克服遏止電位能 eV。正遏止電壓下電流線性下降是此分布的結果，真實曲線依金屬表面、能量角度分布及幾何而異。掃描採即時穩態近似，忽略渡越時間、空間電荷及接觸電位。裝置、光與電子以放大且減速的代表粒子示意。固定光子流率與固定光功率分開操作，後者的光子流率為功率除以 hf。',
  [
    '先預測：低於截止頻率時，把光強提高會如何？調高光子流率後觀察電流，並用單個光子的能量解釋。',
    '在遏止電壓為零時，分別固定光子流率與光功率，再提高頻率。比較最大初動能與電流，解釋為何電子變快不代表收集電流變大。',
    '換成逸出功較高的金屬，預測截止頻率和遏止電壓會如何改變。開啟電壓掃描，交叉讀取電流與電壓圖來檢查。'
  ], p => {
    const photonEnergy = planckEvThz * p.frequency;
    const cutoffFrequency = p.workFunction / planckEvThz;
    const maxEnergy = planckEvThz * Math.max(0, p.frequency - cutoffFrequency);
    const incidentRate = p.intensityMode === 0
      ? p.flux
      : p.power * 1e-19 / (photonEnergy * electronCharge);
    const incidentPower = incidentRate * 1e19 * photonEnergy * electronCharge;
    const emittedRate = maxEnergy > 0 ? .2 * incidentRate : 0;
    const stoppingVoltage = maxEnergy;
    // ponytail: Uniform normal energy distribution yields a linear I–V curve.
    const rateAt = voltage => maxEnergy > 0
      ? emittedRate * Math.max(0, 1 - Math.max(0, voltage) / maxEnergy)
      : 0;
    const currentAt = voltage => rateAt(voltage) * electronCharge * 1e19;
    return trajectory(duration, t => {
      const voltage = p.sweep === 1 ? -2 + 10 * t / duration : p.retarding;
      return {
        voltage, photonEnergy, cutoffFrequency, maxEnergy, stoppingVoltage,
        incidentPower, incidentRate, emittedRate, collectedRate: rateAt(voltage),
        current: currentAt(voltage)
      };
    }, {
      positionPlot: {
        key: 'voltage', label: '遏止方向電壓', unit: 'V', min: -2, max: 8,
        title: '光電流對電壓', menuLabel: '光電流—電壓圖', yUnit: 'μA',
        scopeLabel: '— 穩態 I–V 曲線　● 目前電壓',
        series: [{ label: '收集電流', color: '#8ee0c0', value: currentAt }]
      },
      hideFloor: true, hidePrimary: true, hideGrid: () => true, schematic: true,
      minimumSceneScale: 5, bounds: { min: [-4.5, -.8, -1.5], max: [3.8, 4.8, 1.5] },
      scaleNote: '示意粒子的尺寸、時間及流率經縮放。以圖表與讀值比較物理量。',
      endLabel: p.sweep === 1 ? '電壓掃描完成' : '觀察結束'
    });
  }, 'models/photoelectric.js');

  const def = Mechanics.defs.find(d => d.id === 'photoelectric');
  def.defaultPlotMode = 'position';
  def.defaultPlotMetric = 'current';
  def.plotMetrics = [
    metric('voltage', '外加遏止方向電壓', 'V'),
    metric('photonEnergy', '入射光子能量', 'eV'),
    metric('cutoffFrequency', '截止頻率', 'THz'),
    metric('incidentPower', '入射光功率', 'μW'),
    metric('incidentRate', '入射光子流率', '10¹³/s'),
    metric('emittedRate', '光電子發射率', '10¹³/s'),
    metric('collectedRate', '光電子收集率', '10¹³/s')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
