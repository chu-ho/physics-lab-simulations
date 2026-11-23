(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const e = 1.602176634e-19; // C
  const eta = 1.83e-5; // 空氣黏滯係數 Pa·s
  const g = 9.8;
  const dRho = 886 - 1.2; // 油密度減空氣密度 kg/m³
  const gap = 5e-3; // 板距 m
  const tScale = 10; // 模擬 1 s = 真實 10 s
  const vMeasure = 500; // 兩速度法的量測電壓 V
  const count = 24;
  const duration = 12;
  const fallSpeed = a => (2 * dRho * g * a * a) / (9 * eta);
  const radiusFrom = v => Math.sqrt((9 * eta * v) / (2 * dRho * g));
  const weight = a => (4 / 3) * Math.PI * a ** 3 * dRho * g;
  const drag = a => 6 * Math.PI * eta * a;
  const riseSpeed = (a, q, V) => ((q * V) / gap - weight(a)) / drag(a);

  // 固定種子的油滴樣本：半徑、元電荷數 n，以及帶計時誤差的兩速度法量測電荷（10⁻¹⁹ C）
  function makeDrops(seed, noise) {
    let s = seed;
    const u = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return (s + 0.5) / 4294967296;
    };
    return Array.from({ length: count }, () => {
      const a = (0.45 + 0.45 * u()) * 1e-6,
        n = 1 + Math.floor(8 * u()),
        r = Math.sqrt(-2 * Math.log(u())) * (noise / 100),
        th = 2 * Math.PI * u();
      const vf = fallSpeed(a) * (1 + r * Math.cos(th)),
        vr = riseSpeed(a, n * e, vMeasure) * (1 + r * Math.sin(th));
      return { a, n, charge: n * e, measured: (drag(radiusFrom(vf)) * (vf + vr) * gap) / vMeasure / 1e-19 };
    });
  }
  // 以整數倍擬合找出基本電荷：先掃描 1.0–2.5，再用最小平方細修
  function estimate(qs) {
    let best = 1,
      bestError = Infinity;
    for (let c = 1; c <= 2.5; c += 0.001) {
      const error = qs.reduce((sum, q) => sum + (q / c - Math.round(q / c)) ** 2, 0);
      if (error < bestError - 1e-12) [best, bestError] = [c, error];
    }
    const ns = qs.map(q => Math.round(q / best));
    return qs.reduce((sum, q, i) => sum + ns[i] * q, 0) / ns.reduce((sum, n) => sum + n * n, 0);
  }

  M.register(
    'millikan-oil-drop',
    '密立坎油滴實驗：電荷量子化',
    '近代物理',
    'millikan-oil-drop',
    [
      P('voltage', '平行板電壓（上板為正）', 0, 1000, 0.5, 0, 'V'),
      P('drop', '油滴編號', 1, count, 1, 1),
      P('noise', '計時誤差', 0, 3, 0.1, 0.8, '%'),
      P('seed', '抽樣種子', 1, 100, 1, 17)
    ],
    [
      metric('velocity', '油滴速度（向上為正）', 'μm/s'),
      metric('measuredCharge', '兩速度法量得電荷', '10⁻¹⁹ C'),
      metric('eEstimate', '全部油滴擬合的基本電荷', '10⁻¹⁹ C')
    ],
    'Stokes：v = 2(ρ−σ)g a²/9η；懸浮：qV/d = mg；兩速度法：q = 6πηa(v_f+v_r)d/V',
    '油滴為帶負電的球形油珠，上板為正使電力向上。空氣阻力採 Stokes 定律，終端速度視為瞬間達成；未含 Cunningham 修正與空氣浮力以外的效應。半徑由無電場時的下落速度反推。油滴半徑、帶電量（1–8 個基本電荷）與計時誤差由固定種子產生，24 顆油滴各以 500 V 做兩速度法量測，右圖為其量測電荷的分布，峰值落在基本電荷的整數倍。模擬 1 秒相當於真實 10 秒，油滴碰到板後視為停止；圖中的油滴尺寸經放大。',
    [
      '先把電壓設為 0，記下油滴下落的速度。下落速度能告訴你油滴的什麼性質？',
      '慢慢調高電壓，找出讓油滴幾乎不動的電壓，並用 qV/d = mg 算出電荷。',
      '換幾顆油滴重複，再開啟電荷分布圖。各峰之間的間隔代表什麼？'
    ],
    p => {
      const list = makeDrops(p.seed, p.noise),
        measured = list.map(d => d.measured),
        eEstimate = estimate(measured),
        now = list[p.drop - 1],
        W = weight(now.a),
        V = p.voltage,
        v = riseSpeed(now.a, now.charge, V),
        sigma = 0.12,
        density = x => measured.reduce((sum, m) => sum + Math.exp(-((x - m) ** 2) / (2 * sigma * sigma)), 0) / count;
      return trajectory(
        duration,
        t => {
          const h = Math.min(gap, Math.max(0, gap / 2 + v * tScale * t)),
            stuck = (h === 0 && v < 0) || (h === gap && v > 0);
          return {
            height: h * 1e3,
            stuck,
            velocity: stuck ? 0 : v * 1e6,
            fieldForce: (now.charge * V) / gap / 1e-14,
            weight: W / 1e-14,
            measuredCharge: now.measured,
            trueCharge: now.charge / 1e-19,
            eEstimate,
            radius: now.a * 1e6,
            fallSpeed: fallSpeed(now.a) * 1e6,
            hoverVoltage: (W * gap) / now.charge,
            balanceCharge: V > 0 ? (W * gap) / V / 1e-19 : 0,
            fieldStrength: V / gap / 1e3
          };
        },
        {
          drops: list,
          positionPlot: {
            key: 'measuredCharge',
            label: '量得電荷',
            unit: '10⁻¹⁹ C',
            min: 0,
            max: 14,
            title: '24 顆油滴的量測電荷分布',
            menuLabel: '電荷分布圖',
            yUnit: '相對次數',
            scopeLabel: '— 24 顆油滴的量測電荷分布　● 目前油滴',
            series: [{ label: '油滴分布', color: '#8ee0c0', value: density }]
          },
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          schematic: true,
          minimumSceneScale: 5,
          bounds: { min: [-3.4, -0.4, -1.8], max: [3.4, 4.7, 1.8] },
          scaleNote: '油滴放大顯示，模擬 1 s 約為真實 10 s。以讀值與圖表比較物理量。',
          endLabel: '觀察結束'
        }
      );
    },
    'models/millikan-oil-drop.js'
  );

  const def = M.defs.find(d => d.id === 'millikan-oil-drop');
  def.defaultPlotMode = 'position';
  def.defaultPlotMetric = 'velocity';
  def.plotMetrics = [
    metric('height', '距下板高度', 'mm'),
    metric('radius', '油滴半徑（由下落速度反推）', 'μm'),
    metric('fallSpeed', '無電場終端下落速度', 'μm/s'),
    metric('fieldForce', '電力 qE', '10⁻¹⁴ N'),
    metric('weight', '重力 mg（扣空氣浮力）', '10⁻¹⁴ N'),
    metric('hoverVoltage', '懸浮所需電壓', 'V'),
    metric('balanceCharge', '若此電壓使油滴懸浮的電荷 mgd/V', '10⁻¹⁹ C'),
    metric('trueCharge', '油滴實際電荷', '10⁻¹⁹ C')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
