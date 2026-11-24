/* 邁克生干涉儀：移動鏡子數條紋，ΔL = Nλ/2。 */
(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const L = 0.2; // 擴束後點光源到屏的等效距離（m）
  const screenHalf = 50; // 屏的半寬（mm）
  const duration = 10;
  // 兩臂在屏前等效為兩個點光源：S₁ 距屏 L；S₂ 再遠 2d，並因 M₁ 傾角 β 側移 2βL。
  // 屏上 (x, y)（m）的光程差（m）
  const pathDifference = (d, beta, x, y) => {
    const a = 2 * beta * L;
    return Math.hypot(L + 2 * d, x - a, y) - Math.hypot(L, x, y);
  };

  M.register(
    'michelson',
    '邁克生干涉儀',
    '波動光學',
    'michelson',
    [
      P('lambda', '雷射波長 λ', 400, 700, 1, 633, 'nm'),
      P('d0', '兩臂長度差 d₀（拉動鏡 M₁）', 0, 200, 0.05, 30, 'μm'),
      P('speed', '播放時 M₁ 等速移動速率', -2, 2, 0.05, 0.5, 'μm/s'),
      P('tilt', '鏡 M₁ 傾角 β', 0, 0.1, 0.002, 0, 'mrad')
    ],
    [
      metric('count', '中心已經過的條紋數 N', ''),
      metric('estimate', '由條紋推得的位移 Nλ/2', 'μm'),
      metric('displacement', '鏡 M₁ 實際位移 Δd', 'μm')
    ],
    '光程差 δ = 2d cosθ；中心每經過一條條紋，鏡移動 λ/2 ⇒ ΔL = Nλ/2；傾斜時直條紋間距 ≈ λ/(2β)',
    '雷射經擴束成點光源，分光鏡把光分到兩臂，鏡 M₁、M₂ 反射後在屏上重疊。從屏看過去，兩面鏡等效為前後相距 d 的兩個虛光源，來回使光程差為 2d，偏離軸線角度 θ 時約為 2d cosθ，所以屏上是同心圓環；d 越大，環越密。移動 M₁ 使 d 增加 λ/2，光程差增加一個波長，中心恰好亮暗循環一次——數條紋 N 就能量位移 ΔL = Nλ/2，誤差小於半個波長。M₁ 傾斜 β 時兩虛光源也會側移，d ≈ 0 時變成間距約 λ/(2β) 的直條紋（與楔形空氣膜相同）。強度以兩道等振幅光 cos²(πδ/λ) 計算，屏距 L = 0.2 m、屏寬 ±50 mm 為等效值，不計分光鏡的額外相位、補償板與光源相干長度。3D 中鏡子位移與傾角大幅放大示意。',
    [
      '播放讓 M₁ 等速移動，數中心亮暗變化的次數 N，用 Nλ/2 估計位移，與實際位移比較。',
      '把 d₀ 從 0 慢慢加大，環的數量與疏密怎麼變？環是從中心冒出還是縮進中心？',
      '把 d₀ 調到接近 0 再加大傾角 β，同心環如何變成直條紋？'
    ],
    p => {
      const beta = p.tilt * 1e-3,
        lambda = p.lambda * 1e-9,
        intensityAt = (d, x, y) => Math.cos((Math.PI * pathDifference(d, beta, x, y)) / lambda) ** 2,
        d0 = p.d0 * 1e-6,
        center0 = pathDifference(d0, beta, 0, 0),
        state = t => {
          const d = d0 + p.speed * 1e-6 * t,
            center = pathDifference(d, beta, 0, 0),
            count = Math.floor(Math.abs(center - center0) / lambda + 1e-9);
          return { d, center, count };
        };
      return trajectory(
        duration,
        t => {
          const { d, center, count } = state(t);
          return {
            mirror: d * 1e6,
            displacement: (d - d0) * 1e6,
            pathCenter: center * 1e6,
            fringeOrder: center / lambda,
            centerIntensity: intensityAt(d, 0, 0),
            count,
            estimate: (count * p.lambda) / 2e3
          };
        },
        {
          L,
          screenHalf,
          // 屏上強度：臂長差 d（μm）、屏座標 x、y（mm）
          pattern: (d, x, y) => intensityAt(d * 1e-6, x * 1e-3, y * 1e-3),
          pathDifference: (d, x, y) => pathDifference(d * 1e-6, beta, x * 1e-3, y * 1e-3) * 1e6,
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          schematic: true,
          minimumSceneScale: 5,
          bounds: { min: [-6.6, -1.2, -4.6], max: [4.8, 4.2, 3.6] },
          scaleNote: '鏡子位移與傾角大幅放大示意；屏上條紋依等效尺寸計算。',
          endLabel: '鏡子移動結束'
        }
      );
    },
    'models/michelson.js'
  );

  const def = M.defs.find(d => d.id === 'michelson');
  def.defaultPlotMetric = 'centerIntensity';
  def.plotMetrics = [
    metric('centerIntensity', '屏中心相對亮度', ''),
    metric('mirror', '目前臂長差 d', 'μm'),
    metric('pathCenter', '中心光程差 2d', 'μm'),
    metric('fringeOrder', '中心光程差／λ', '')
  ];
  def.initialView = { yaw: 0.55, pitch: 0.62 };
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
