/* 牛頓環與楔形空氣膜：兩玻璃面之間的薄膜等厚干涉。 */
(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const glass = 1.52; // 上下玻璃的折射率
  const ringWindow = 5; // 牛頓環觀察視窗半徑（mm）
  const wedgeWindow = 20; // 楔形膜觀察長度（mm，自接觸邊算起）
  const duration = 10;
  // 膜厚 t（nm）：牛頓環 t ≈ r²/2R；楔形膜 t = αx（位置單位 mm）
  const thicknessAt = (p, pos) => (p.mode === 0 ? (pos * pos) / (2 * p.R) : p.wedge * pos) * 1e3;
  // 第 m 條暗紋：反射 2nt = mλ；透射 2nt = (m − ½)λ（mm）
  const darkPosition = (p, m) => {
    const order = p.view === 0 ? m : m - 0.5,
      t = (order * p.lambda) / (2 * p.n) / 1e3; // μm
    return p.mode === 0 ? Math.sqrt(2 * p.R * t) : t / p.wedge;
  };

  M.register(
    'newton-rings',
    '牛頓環與楔形空氣膜干涉',
    '波動光學',
    'newton-rings',
    [
      P('mode', '模式：0 牛頓環（平凸透鏡）／1 楔形膜（兩玻璃片）', 0, 1, 1, 0),
      P('R', '透鏡曲率半徑 R', 1, 10, 0.1, 2, 'm'),
      P('wedge', '楔角 α', 0.05, 1, 0.01, 0.2, 'mrad'),
      P('lambda', '光的波長 λ', 400, 700, 1, 589, 'nm'),
      P('n', '膜內介質折射率 n（空氣 1、水 1.33）', 1, 1.5, 0.01, 1),
      P('view', '觀察：0 反射光／1 透射光', 0, 1, 1, 0),
      P('m', '標示第 m 條暗環／暗紋', 1, 20, 1, 5)
    ],
    [
      metric('rDark', '第 m 條暗環半徑／暗紋位置', 'mm'),
      metric('spacing', '第 m 與 m+1 條暗紋間距', 'mm'),
      metric('pathRatio', '掃描點光程差 2nt／λ', '')
    ],
    '反射暗紋 2nt = mλ；牛頓環 t ≈ r²/2R ⇒ rₘ = √(mλR/n)；楔形膜 t = αx ⇒ Δx = λ/(2nα)',
    '上下都是玻璃（n = 1.52），中間夾一層厚度隨位置變化的薄膜（空氣或液體），光近似垂直入射。膜上、下表面的兩道反射光疊加；兩次反射中恰有一次是由低折射率射向高折射率，產生半波損失（相位 π），所以接觸點（t = 0）反射看到的是暗點／暗線，暗紋條件為 2nt = mλ。牛頓環以 t ≈ r²/2R 近似（r ≪ R），得 rₘ = √(mλR/n)，環越往外越密；楔形膜厚度與位置成正比，條紋等距 Δx = λ/(2nα)。透射光沒有這個額外的 π，亮暗與反射互補，但兩道光強度差很多，實際對比很低，畫面已放大對比。強度以兩道光的 Fresnel 振幅計算，不計多次反射、吸收與色散；n 接近 1.52 時兩界面幾乎不反射，條紋變得非常淡。與平行薄膜（膜厚處處相同、看顏色隨膜厚變化）不同，這裡看的是同一片膜上不同位置的「等厚條紋」。',
    [
      '接觸點為什麼是暗的？把觀察切到透射光，中心變成什麼？',
      '量第 1、4、9 條暗環的半徑，它們的比是多少？為什麼外圈越來越密？',
      '在空氣膜中注入水（n = 1.33），環的半徑會怎麼變？'
    ],
    p => {
      const span = p.mode === 0 ? ringWindow : wedgeWindow,
        r = (glass - p.n) / (glass + p.n),
        peak = 4 * r * r, // 反射最大值（兩道光同相疊加）
        reflectance = pos => peak * Math.sin((2 * Math.PI * p.n * thicknessAt(p, pos)) / p.lambda) ** 2,
        // 畫面亮度（0–1）：反射用 R/R峰值，透射以 1 − R 拉開對比
        display = pos => {
          const s = Math.sin((2 * Math.PI * p.n * thicknessAt(p, pos)) / p.lambda) ** 2;
          return p.view === 0 ? s : 1 - s;
        },
        rDark = darkPosition(p, p.m),
        spacing = darkPosition(p, p.m + 1) - rDark,
        darks = Array.from({ length: 200 }, (_, i) => darkPosition(p, i + (p.view === 0 ? 0 : 1))).filter(
          x => x <= span
        );
      return trajectory(
        duration,
        t => {
          const probe = (span * t) / duration,
            thickness = thicknessAt(p, probe);
          return {
            probe,
            thickness,
            pathRatio: (2 * p.n * thickness) / p.lambda,
            intensity: display(probe),
            reflectance: 100 * reflectance(probe),
            transmittance: 100 * (1 - reflectance(probe)),
            rDark,
            spacing,
            darkCount: darks.length
          };
        },
        {
          span,
          glass,
          darks,
          display,
          peakReflectance: 100 * peak,
          positionPlot: {
            key: 'probe',
            label: p.mode === 0 ? '離中心距離 r' : '離接觸邊距離 x',
            unit: 'mm',
            min: 0,
            max: span,
            title: (p.view === 0 ? '反射' : '透射') + '條紋的相對亮度',
            menuLabel: '亮度對位置',
            yUnit: '相對亮度',
            scopeLabel: '— 相對亮度　● 掃描點',
            series: [{ label: '相對亮度', color: '#8ee0c0', value: display }]
          },
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          schematic: true,
          minimumSceneScale: 5,
          bounds: { min: [-6.6, -3.0, -1.6], max: [6.6, 4.4, 1.6] },
          scaleNote: '透鏡曲率與膜厚大幅放大示意；條紋圖依實際尺寸繪製，以讀值與圖表比較。',
          endLabel: '掃描完成'
        }
      );
    },
    'models/newton-rings.js'
  );

  const def = M.defs.find(d => d.id === 'newton-rings');
  def.defaultPlotMode = 'position';
  def.defaultPlotMetric = 'intensity';
  def.initialView = { yaw: -0.3, pitch: 0.3 };
  def.plotMetrics = [
    metric('probe', '掃描點位置', 'mm'),
    metric('thickness', '掃描點膜厚 t', 'nm'),
    metric('intensity', '相對亮度', ''),
    metric('reflectance', '反射率', '%'),
    metric('darkCount', '視窗內暗環／暗紋數', '')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
