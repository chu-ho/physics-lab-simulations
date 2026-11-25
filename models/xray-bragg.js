(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const hc = 1.239841984; // keV·nm
  const planes = 8; // 示意的反射晶面數
  const duration = 12;
  // 陽極靶：Kα、Kβ 特徵 X 射線能量與 K 吸收邊（keV）
  const targets = [
    { name: '銅 Cu', ka: 8.041, kb: 8.905, edge: 8.979 },
    { name: '鉬 Mo', ka: 17.479, kb: 19.608, edge: 20.0 },
    { name: '銀 Ag', ka: 22.163, kb: 24.942, edge: 25.514 }
  ];
  const sources = ['Kα 特徵線', 'Kβ 特徵線', '連續譜中自選波長'];
  // 多晶面反射的相對強度：x = 2d sinθ/λ，整數時為 1（各階主極大）
  // x < 0.5 屬於第 0 階（θ → 0 的未偏折直射光），不是布拉格反射，強度記為 0。
  const planeResponse = x => {
    if (Math.abs(x) < 0.5) return 0;
    const s = Math.sin(Math.PI * x);
    return Math.abs(s) < 1e-9 ? 1 : (Math.sin(planes * Math.PI * x) / (planes * s)) ** 2;
  };

  M.register(
    'xray-bragg',
    'X 射線產生與布拉格繞射',
    '近代物理',
    'xray-bragg',
    [
      P('voltage', 'X 光管加速電壓', 5, 60, 0.5, 30, 'kV'),
      P('target', '陽極靶：0 Cu／1 Mo／2 Ag', 0, 2, 1, 0),
      P('spacing', '晶面間距 d', 0.15, 0.45, 0.002, 0.282, 'nm'),
      P('source', '入射波長：0 Kα／1 Kβ／2 自選', 0, 2, 1, 0),
      P('wavelength', '自選波長', 0.03, 0.3, 0.001, 0.1, 'nm'),
      P('angle', '掠射角 θ（固定模式）', 5, 85, 0.1, 15.9, '°'),
      P('sweep', '角度模式：0 固定／1 自動由 5° 掃至 85°', 0, 1, 1, 0)
    ],
    [
      metric('lambdaMin', '截止波長 λmin', 'nm'),
      metric('orderExact', '2d sinθ／λ（整數時建設性干涉）', ''),
      metric('intensity', '反射相對強度', '')
    ],
    'λmin = hc/eV；特徵線能量 E = hc/λ；布拉格條件 2d sinθ = nλ',
    'X 光管電子被 V 加速後撞擊陽極：連續譜（制動輻射）的短波截止為 λmin = hc/eV，與靶材無關；強度以 Kramers 近似 (λ/λmin−1)/λ² 示意。電壓超過靶的 K 吸收邊時才出現 Kα、Kβ 特徵線，其強度比例與絕對高度僅為示意。晶體以間距 d 的平行晶面反射，掠射角 θ 為入射線與晶面的夾角；相鄰晶面反射波的光程差為 2d sinθ，等於整數倍波長時建設性干涉。反射強度採 8 個晶面的多光束干涉 [sin(Nπx)/(N sin πx)]²，x = 2d sinθ/λ，不計吸收、熱振動及原子散射因子。分析用單色光時，選特徵線或自選波長；自選波長短於 λmin 時管內不產生該光，反射為零。',
    [
      '先調高電壓，觀察光譜的短波端。λmin 與電壓有什麼關係？換成 Mo 靶，λmin 會改變嗎？',
      '固定 Kα 並慢慢增加掠射角，找出各階反射的角度，再用 2d sinθ = nλ 驗證。',
      '增大晶面間距 d，預測第幾階最多可以出現，並用自動掃描驗證。'
    ],
    p => {
      const tg = targets[p.target],
        V = p.voltage,
        lambdaMin = hc / V,
        kOn = V > tg.edge,
        lines = [
          { name: 'Kα', lambda: hc / tg.ka, height: kOn ? 2 * (V / tg.edge - 1) ** 1.5 : 0 },
          { name: 'Kβ', lambda: hc / tg.kb, height: kOn ? 0.4 * (V / tg.edge - 1) ** 1.5 : 0 }
        ],
        continuum = l => (l > lambdaMin ? (0.01 * (l / lambdaMin - 1)) / (l * l) : 0),
        spectrum = l =>
          continuum(l) +
          lines.reduce((sum, line) => sum + line.height * Math.exp(-((l - line.lambda) ** 2) / (2 * 0.0012 ** 2)), 0),
        lambda = p.source === 2 ? p.wavelength : lines[p.source].lambda,
        present = p.source === 2 ? lambda > lambdaMin : lines[p.source].height > 0,
        maxOrder = present ? Math.floor((2 * p.spacing) / lambda + 1e-9) : 0,
        orders = Array.from({ length: maxOrder }, (_, i) => ({
          n: i + 1,
          angle: (Math.asin(((i + 1) * lambda) / (2 * p.spacing)) * 180) / Math.PI
        })),
        pathAt = deg => 2 * p.spacing * Math.sin((deg * Math.PI) / 180),
        reflectedAt = deg => (present ? planeResponse(pathAt(deg) / lambda) : 0);
      return trajectory(
        duration,
        t => {
          const angle = p.sweep === 1 ? 5 + (80 * t) / duration : p.angle,
            orderExact = pathAt(angle) / lambda;
          return {
            angle,
            lambda,
            lambdaMin,
            photonEnergy: hc / lambda,
            pathDifference: pathAt(angle),
            orderExact,
            nearestOrder: Math.round(orderExact),
            intensity: reflectedAt(angle),
            maxOrder,
            present: present ? 1 : 0
          };
        },
        {
          targetName: tg.name,
          sourceName: sources[p.source],
          lines,
          orders,
          spectrum,
          positionPlot: {
            key: 'angle',
            label: '掠射角 θ',
            unit: '°',
            min: 0,
            max: 90,
            title: '單色 X 射線的反射強度',
            menuLabel: '反射強度對掠射角',
            yUnit: '相對強度',
            scopeLabel: '— 8 個晶面的反射強度　● 目前掠射角',
            series: [{ label: '反射強度', color: '#8ee0c0', value: reflectedAt }]
          },
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          schematic: true,
          minimumSceneScale: 5,
          bounds: { min: [-6.4, -3.3, -1.8], max: [5.6, 4.3, 1.8] },
          scaleNote: '管、晶體與光路為示意比例；晶面間距放大顯示。以圖表與讀值比較物理量。',
          endLabel: p.sweep === 1 ? '角度掃描完成' : '觀察結束'
        }
      );
    },
    'models/xray-bragg.js'
  );

  const def = M.defs.find(d => d.id === 'xray-bragg');
  def.defaultPlotMode = 'position';
  def.defaultPlotMetric = 'intensity';
  def.plotMetrics = [
    metric('angle', '掠射角 θ', '°'),
    metric('lambda', '入射波長 λ', 'nm'),
    metric('photonEnergy', '光子能量 hc/λ', 'keV'),
    metric('pathDifference', '相鄰晶面光程差 2d sinθ', 'nm'),
    metric('nearestOrder', '最接近的階數 n', ''),
    metric('maxOrder', '可出現的最高階數', '')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
