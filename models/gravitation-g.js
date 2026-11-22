/* Cavendish torsion balance (mode 0) and effective gravity g(h, latitude) of a rotating spherical planet (mode 1). */
(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const G = 6.674e-11, // N·m²/kg²
    GM = 3.986004418e14, // Earth, m³/s²
    RE = 6.371e6; // Earth mean radius, m
  M.GravitationG = { G, GM, RE };
  M.register(
    'gravitation-g',
    '萬有引力與重力加速度',
    '萬有引力',
    'gravitation-g',
    [
      P('mode', '模式（0 卡文迪西扭秤／1 地球重力）', 0, 1, 1, 0, ''),
      P('M', '大鉛球質量', 10, 160, 1, 158, 'kg'),
      P('m', '小鉛球質量', 0.1, 1, 0.01, 0.73, 'kg'),
      P('l', '懸臂半長（轉軸到小球）', 0.2, 1, 0.01, 0.93, 'm'),
      P('R', '大小球球心距', 0.1, 0.4, 0.01, 0.23, 'm'),
      P('T0', '扭擺週期', 10, 60, 5, 60, 's'),
      P('zeta', '阻尼比', 0, 0.3, 0.01, 0.03, ''),
      P('h', '探測器高度', 0, 40000, 100, 0, 'km'),
      P('phi', '緯度', 0, 90, 1, 0, '°'),
      P('day', '自轉週期', 6, 48, 0.1, 23.9, 'h')
    ],
    [
      metric('thetaMrad', '偏轉角（模式 1 為鉛垂線偏角）', 'mrad'),
      metric('Gmeas', 'G（模式 0 由偏轉讀數反推）', '×10⁻¹¹ N·m²/kg²'),
      metric('gEff', '重力加速度（模式 0 為大球在小球處的 GM/R²）', 'm/s²')
    ],
    '扭秤：θeq = GMT²/(4π²R²l)，G = 4π²R²lθ/(MT²)；行星：g⃗ = −(GM/r²)r̂ + ω²r cosφ x̂，r = R + h',
    '模式 0：兩小球 m 位於輕桿兩端（半長 l），兩大球 M 在小球旁相距 R、位置使力矩同向；每對作用力 GMm/R²，力矩 τ = 2GMm l/R²，扭轉常數 κ = Iω²、I = 2ml²、ω = 2π/T，故 θeq = GMT²/(4π²R²l)，與 m 無關。只計近側大球（略去遠側球、桿與懸絲慣量及 R 隨偏轉的微小改變），從零角度起以阻尼比 ζ 的欠阻尼扭擺趨向 θeq；3D 的偏轉角已放大，僅示意；實際儀器週期約 400 s，這裡把扭擺週期縮短到 10–60 s 以便觀察（θeq ∝ T²，G 的反推不變）。模式 1：均勻球形地球（GM = 3.986×10¹⁴ m³/s²，R = 6371 km）。重力 GM/r² 隨 r 平方反比，自轉的離心加速度 ω²r cosφ 使有效重力 g⃗ 在赤道最小、極點最大，且除赤道與極點外略偏離徑向；探測器以固定速率在 10 秒內升到設定高度，因此圖表橫軸對應高度。指標中的 G 在模式 1 為採用的常數 6.674×10⁻¹¹；偏轉角在模式 1 指鉛垂線（有效重力方向）偏離徑向的角度。實際地球為扁球，赤道 g ≈ 9.780、極點 ≈ 9.832 m/s²，本模型略有差異。',
    ['卡文迪西實驗為何能「稱出地球」？偏轉角與 G 有什麼關係？', '在哪個高度與緯度，自轉使有效重力降為零？'],
    p => {
      if (!p.mode) {
        const w = (2 * Math.PI) / p.T0,
          eq = (G * p.M * p.T0 ** 2) / (4 * Math.PI ** 2 * p.R ** 2 * p.l),
          z = p.zeta,
          wd = w * Math.sqrt(1 - z * z),
          theta = t => eq * (1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t))),
          read = th => (4 * Math.PI ** 2 * p.R ** 2 * p.l * th) / (p.M * p.T0 ** 2);
        return trajectory(
          3 * p.T0,
          t => {
            const th = theta(t);
            return {
              theta: th,
              thetaMrad: th * 1000,
              Gmeas: read(th) * 1e11,
              torque: (2 * G * p.M * p.m * p.l) / p.R ** 2,
              force: (G * p.M * p.m) / p.R ** 2,
              eq,
              gEff: (G * p.M) / p.R ** 2,
              gTrue: (G * p.M) / p.R ** 2,
              gRad: 0,
              centrifugal: 0,
              hKm: 0
            };
          },
          {
            scientificNumbers: true,
            hidePrimary: true,
            hideFloor: true,
            schematic: true,
            endLabel: '三個扭擺週期；平衡偏轉角即讀數',
            bounds: { min: [-2.2, 0, -2.2], max: [2.2, 3, 2.2] }
          }
        );
      }
      const w = (2 * Math.PI) / (p.day * 3600),
        phi = (p.phi * Math.PI) / 180,
        gravity = h => {
          const r = RE + h,
            g0 = GM / (r * r),
            // axes: x equatorial radius direction, y rotation axis; radial r̂ = (cosφ, sinφ)
            gx = -g0 * Math.cos(phi) + w * w * r * Math.cos(phi),
            gy = -g0 * Math.sin(phi),
            mag = Math.hypot(gx, gy),
            radial = -(gx * Math.cos(phi) + gy * Math.sin(phi)),
            north = -gx * Math.sin(phi) + gy * Math.cos(phi);
          return { r, g0, gx, gy, mag, radial, north, centrifugal: w * w * r * Math.cos(phi) };
        };
      const e = 3 * (1 + p.h / 6371) + 1;
      return trajectory(
        10,
        t => {
          const hm = (p.h * 1000 * t) / 10,
            q = gravity(hm);
          return {
            hKm: hm / 1000,
            r: q.r,
            gTrue: q.g0,
            gEff: q.mag,
            gRad: q.radial,
            gNorth: q.north,
            centrifugal: q.centrifugal,
            ratio: q.mag / (GM / (RE * RE)),
            tilt: Math.atan2(Math.abs(q.north), q.radial),
            gx: q.gx,
            gy: q.gy,
            theta: 0,
            thetaMrad: Math.atan2(Math.abs(q.north), q.radial) * 1000,
            Gmeas: G * 1e11
          };
        },
        {
          hidePrimary: true,
          hideFloor: true,
          schematic: true,
          endLabel: '探測器到達設定高度',
          bounds: { min: [-e, -e, -e], max: [e, e, e] }
        }
      );
    },
    'models/gravitation-g.js'
  );
  const d = M.defs.find(d => d.id === 'gravitation-g');
  d.plotMetrics = [
    metric('theta', '偏轉角', 'rad'),
    metric('gTrue', '萬有引力加速度 GM/r²', 'm/s²'),
    metric('gRad', '有效重力徑向分量', 'm/s²'),
    metric('centrifugal', '離心加速度', 'm/s²'),
    metric('hKm', '高度', 'km')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
