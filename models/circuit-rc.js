(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  M.register('circuit-rc', '串並聯電路與 RC 充放電', '電磁學', 'circuit-rc', [
    P('mode', '模式（0：串聯；1：並聯；2：充電；3：放電）', 0, 3, 1, 0, ''),
    P('closed', '開關（0：斷開；1：閉合）', 0, 1, 1, 1, ''),
    P('voltage', '電源／初始充電電壓', 1, 12, 1, 6, 'V'),
    P('r1', '電阻 R₁', 1, 20, 1, 5, 'Ω'),
    P('r2', '電阻 R₂（串／並聯）', 1, 20, 1, 10, 'Ω'),
    P('cMilli', '電容 C（RC）', 20, 250, 10, 100, 'mF')
  ], [
    metric('nodeVoltage', '量測節點電壓', 'V'),
    metric('current', '總電流（有號）', 'A'),
    metric('stored', '電容儲能', 'J')
  ],
  '串聯 R_eq=R₁+R₂；並聯 1/R_eq=1/R₁+1/R₂；RC 中 τ=R₁C、V_C(t)=V_∞+(V₀−V_∞)e^(−t/τ)；I=(V_∞−V_C)/R₁',
  '使用理想電源、導線、開關及集中電阻電容。串聯量測節點在兩電阻之間，並聯量測節點在開關與兩支路之間，皆以回流端為零電位。RC 放電起始時電容已充至拉桿所設電壓，電源移出閉合迴路。每次改參數都重新開始該模式，開關斷開時電容維持初始電壓。正電流指充電時流入電容上極板的方向。RC 觀察 5 個時間常數，電流箭頭表示傳統電流方向。直流場景顏色用於標示不同節點電位。',
  [
    '先預測串聯與並聯時 R₁ 和 R₂ 的電流、電壓各有何關係，再切換模式驗證。用總電流解釋哪種接法的等效電阻較小。',
    '先預測增大 R₁ 或 C 如何改變充電速度。播放到一個時間常數，讀取電容電壓，再比較放電時電流方向與電容能量的去向。'
  ], p => {
    const series = p.mode === 0;
    const rc = p.mode >= 2;
    const discharge = p.mode === 3;
    const capacitance = p.cMilli / 1000;
    const tau = p.r1 * capacitance;
    const duration = rc ? 5 * tau : 4;
    const equivalent = rc ? p.r1 : series ? p.r1 + p.r2 : p.r1 * p.r2 / (p.r1 + p.r2);
    const initial = discharge ? p.voltage : 0;
    const target = discharge ? 0 : p.voltage;
    const initialEnergy = .5 * capacitance * initial ** 2;
    const events = rc && p.closed ? [{
      t: tau, label: discharge ? '經過一個時間常數，電容電壓剩約 36.8%' : '經過一個時間常數，電容電壓達電源的約 63.2%'
    }] : [];
    return trajectory(duration, t => {
      if (rc) {
        const decay = Math.exp(-t / tau);
        const chargeChange = p.closed ? capacitance * (target - initial) * -Math.expm1(-t / tau) : 0;
        const nodeVoltage = initial + chargeChange / capacitance;
        const current = p.closed ? (target - initial) * decay / p.r1 : 0;
        const stored = .5 * capacitance * nodeVoltage ** 2;
        const supplied = target * chargeChange;
        const dissipated = p.closed ? .5 * capacitance * (target - initial) ** 2 * -Math.expm1(-2 * t / tau) : 0;
        return {
          nodeVoltage, current, i1: current, i2: 0, v1: current * p.r1, v2: 0,
          stored, charge: capacitance * nodeVoltage, supplied, dissipated,
          power: current * current * p.r1, equivalent, tau,
          residual: supplied + initialEnergy - stored - dissipated
        };
      }
      const current = p.closed ? p.voltage / equivalent : 0;
      const i1 = series ? current : p.closed * p.voltage / p.r1;
      const i2 = series ? current : p.closed * p.voltage / p.r2;
      const v1 = i1 * p.r1, v2 = i2 * p.r2;
      const power = i1 * v1 + i2 * v2;
      return {
        nodeVoltage: v2, current, i1, i2, v1, v2, stored: 0, charge: 0,
        supplied: p.voltage * current * t, dissipated: power * t, power,
        equivalent, tau: 0, residual: (p.voltage * current - power) * t
      };
    }, {
      events, bounds: { min: [-4.7, 0, -1], max: [4.7, 4.8, 1] },
      hideGrid: () => true, hidePrimary: true,
      scaleNote: '場景為電路示意，長度不對應實物大小。青色箭頭標示傳統電流方向，箭頭長度固定。',
      endLabel: rc && p.closed ? '已觀察 5 個時間常數' : '觀察結束'
    });
  }, 'models/circuit-rc.js');
  const def = M.defs.at(-1);
  def.plotMetrics = [
    metric('i1', 'R₁ 電流', 'A'), metric('i2', 'R₂ 電流', 'A'),
    metric('v1', 'R₁ 電壓降', 'V'), metric('v2', 'R₂ 電壓降', 'V'),
    metric('charge', '電容電荷', 'C'), metric('supplied', '電源已供能量', 'J'),
    metric('dissipated', '電阻累積耗散', 'J'), metric('power', '電阻瞬時總功率', 'W')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
