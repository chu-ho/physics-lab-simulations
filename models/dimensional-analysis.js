/* Guess T ∝ m^a L^b g^c from dimensions; compare the fitted prediction with two simulated pendulums. */
(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  // Dimension exponents of m^a L^b g^c in (M, L, T): g has [L T⁻²].
  const dimensions = (a, b, c) => ({ M: a, L: b + c, T: -2 * c });
  M.DimensionalAnalysis = { dimensions };
  M.register(
    'dimensional-analysis',
    '因次分析：由單位猜單擺週期',
    '振動',
    'dimensional-analysis',
    [
      P('a', '質量 m 的指數 a', -2, 2, 0.5, 0, ''),
      P('b', '擺長 L 的指數 b', -2, 2, 0.5, 1, ''),
      P('c', '重力加速度 g 的指數 c', -2, 2, 0.5, 0, ''),
      P('L', '甲擺擺長', 0.5, 2, 0.1, 1, 'm'),
      P('m', '甲擺質量', 0.1, 2, 0.1, 0.5, 'kg'),
      P('g', '重力加速度', 1.6, 25, 0.1, 9.8, 'm/s²'),
      P('angle', '擺角', 2, 20, 1, 5, '°')
    ],
    [
      metric('dimT', '時間因次指數（需為 1）', ''),
      metric('Tpred', '乙擺預測週期', 's'),
      metric('err', '預測誤差', '%')
    ],
    'T = k mᵃ Lᵇ gᶜ；[mᵃLᵇgᶜ] = Mᵃ L^(b+c) T^(−2c) 須等於 T¹，得 a = 0、b = −c = ½',
    '甲擺 (L, m) 與乙擺 (4L, 2m) 同在重力 g 下擺動。你選指數 a、b、c，假設 T = k mᵃLᵇgᶜ：頁面先算此式的因次 Mᵃ L^(b+c) T^(−2c)，需恰為 T¹（M⁰L⁰）才可能正確；再用甲擺的模擬週期定出無因次常數 k = T甲/(m甲ᵃL甲ᵇgᶜ)，預測乙擺週期並與模擬比較。擺角小時完整週期 T = 2π√(L/g)·[1 + θ²/16 + …]，即 a = 0、b = ½、c = −½、k ≈ 2π；因次分析無法決定 2π，也看不出與擺角有關的微小修正。模擬以 cos 運動表示，只為視覺，週期取完整單擺精確值（橢圓積分），擺角上限 20°。指數需為 0.5 的倍數。',
    [
      '哪些 (a, b, c) 通過因次檢查？通過後預測週期為何一定相符？',
      '因次正確時，k 為何約是 2π 而不是 1？因次分析能不能決定這個常數？'
    ],
    p => {
      const A = (p.angle * Math.PI) / 180,
        // exact period / small-angle period = 1/AGM(1, cos(A/2))
        factor = (() => {
          let x = 1,
            y = Math.cos(A / 2);
          for (let i = 0; i < 30 && Math.abs(x - y) > 1e-15; i++) [x, y] = [(x + y) / 2, Math.sqrt(x * y)];
          return 1 / x;
        })(),
        period = L => 2 * Math.PI * Math.sqrt(L / p.g) * factor,
        L2 = 4 * p.L,
        m2 = 2 * p.m,
        T1 = period(p.L),
        T2 = period(L2),
        dim = dimensions(p.a, p.b, p.c),
        ok = dim.M === 0 && dim.L === 0 && dim.T === 1,
        base = (m, L) => m ** p.a * L ** p.b * p.g ** p.c,
        k = T1 / base(p.m, p.L),
        Tpred = k * base(m2, L2);
      return trajectory(
        3 * T2,
        t => ({
          theta1: A * Math.cos((2 * Math.PI * t) / T1),
          theta2: A * Math.cos((2 * Math.PI * t) / T2),
          T1,
          T2,
          dimM: dim.M,
          dimL: dim.L,
          dimT: dim.T,
          ok: ok ? 1 : 0,
          k,
          Tpred,
          err: ((Tpred - T2) / T2) * 100
        }),
        {
          hidePrimary: true,
          hideFloor: true,
          schematic: true,
          endLabel: '三個乙擺週期',
          bounds: { min: [-3.5, 0, -2.4], max: [3.5, 7.4, 2.4] }
        }
      );
    },
    'models/dimensional-analysis.js'
  );
  const d = M.defs.find(d => d.id === 'dimensional-analysis');
  d.plotMetrics = [metric('theta1', '甲擺角度', 'rad'), metric('theta2', '乙擺角度', 'rad'), metric('k', '常數 k', '')];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
