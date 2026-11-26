/* Repeated stopwatch timing of a pendulum with Gaussian reaction-time noise (fixed seed): mean, s, standard error, significant figures. */
(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  // Seeded uniform stream and Box–Muller normals; draw i depends only on (seed, i), so the first k trials never change when n grows.
  function normals(seed, count) {
    let s = seed >>> 0;
    const uniform = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return (s + 0.5) / 4294967296;
    };
    return Array.from({ length: count }, () => {
      const a = uniform(),
        b = uniform();
      return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
    });
  }
  // Round the uncertainty to 1 significant figure (2 if its leading digit is 1), then the mean to the same decimal place.
  function report(mean, u) {
    if (!(u > 0)) return { mean, u, decimals: 6 };
    const e = Math.floor(Math.log10(u)),
      lead = Math.floor(u / 10 ** e + 1e-9),
      exp = lead === 1 ? e - 1 : e,
      decimals = Math.max(0, -exp),
      q = 10 ** exp;
    const rnd = x => (exp < 0 ? Number(x.toFixed(decimals)) : Math.round(x / q) * q);
    return { mean: rnd(mean), u: rnd(u), decimals };
  }
  // Exact period / small-angle period = 2K(sin(A/2))/π = 1/AGM(1, cos(A/2)).
  function periodFactor(A) {
    let a = 1,
      b = Math.cos(A / 2);
    for (let i = 0; i < 30 && Math.abs(a - b) > 1e-15; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
    return 1 / a;
  }
  M.Uncertainty = { normals, report, periodFactor };
  M.register(
    'measurement-uncertainty',
    '測量與不確定度：反覆測單擺週期',
    '振動',
    'measurement-uncertainty',
    [
      P('L', '擺長', 0.4, 2, 0.05, 1, 'm'),
      P('N', '每次計時的週期數', 1, 20, 1, 1),
      P('n', '測量次數', 3, 50, 1, 20),
      P('sigma', '單次按錶反應誤差 σ', 0.02, 0.2, 0.01, 0.1, 's'),
      P('seed', '抽樣種子', 1, 100, 1, 7)
    ],
    [metric('mean', '平均週期', 's'), metric('s', '標準差 s', 's'), metric('se', '標準誤 s/√n', 's')],
    'T̄ = ΣTᵢ/n；s = √[Σ(Tᵢ−T̄)²/(n−1)]；u = s/√n；計時 N 個週期後 T = t/N，隨機誤差縮為 1/N',
    '擺角 5°，真值取完整單擺週期 T = 2π√(L/g)·(2K(k)/π)（g = 9.81）。每次用碼錶量 N 個週期：起停各有獨立常態的反應誤差，標準差 σ，故總時間誤差標準差為 √2σ，單次週期估計 Tᵢ = (N·T + ε)/N，其隨機誤差為 √2σ/N。第 i 次的誤差只由種子與 i 決定，增加測量次數不會改變先前的結果；同一 i 的誤差與 N 無關，只在除以 N 時縮小。平均值的不確定度取標準誤 u = s/√n（n−1 估計標準差），結果寫成不確定度取 1 位有效數字（首位為 1 時取 2 位）、平均值取到同一小數位。忽略碼錶解析度與系統誤差（如固定的反應時間延遲）。每 0.5 秒多完成一次測量，可看標準誤如何隨 n 下降。',
    [
      '計時 1 個週期與計時 10 個週期，平均值的不確定度差多少？',
      '測量次數加倍，標準誤會變成多少倍？標準差 s 會不會跟著縮小？'
    ],
    p => {
      const A = (5 * Math.PI) / 180,
        T = 2 * Math.PI * Math.sqrt(p.L / 9.81) * periodFactor(A),
        z = normals(p.seed, 2 * p.n),
        // trial i: start and stop reaction errors
        trials = Array.from({ length: p.n }, (_, i) => T + (p.sigma * (z[2 * i + 1] - z[2 * i])) / p.N),
        step = 0.5;
      function stats(k) {
        const xs = trials.slice(0, k),
          mean = xs.reduce((a, b) => a + b, 0) / k,
          s = k > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (k - 1)) : 0, // k = 1: s undefined, shown as 0
          se = s / Math.sqrt(k);
        return { mean, s, se, ...(k > 1 ? { rep: report(mean, se) } : {}) };
      }
      return trajectory(
        p.n * step,
        t => {
          const k = Math.max(1, Math.min(p.n, Math.floor(t / step + 1e-9) + 1)),
            q = stats(k);
          return {
            k,
            T,
            mean: q.mean,
            s: q.s,
            se: q.se,
            reportMean: q.rep?.mean,
            reportU: q.rep?.u,
            decimals: q.rep?.decimals,
            offset: q.mean - T,
            theta: A * Math.cos((2 * Math.PI * t) / T)
          };
        },
        {
          trials,
          trueT: T,
          stats,
          hidePrimary: true,
          hideFloor: true,
          schematic: true,
          endLabel: '全部測量完成',
          bounds: { min: [-3.6, 0, -2], max: [3.6, 3.6, 2] }
        }
      );
    },
    'models/measurement-uncertainty.js'
  );
  const d = M.defs.find(d => d.id === 'measurement-uncertainty');
  d.plotMetrics = [
    metric('k', '已完成測量次數', ''),
    metric('offset', '平均與真值之差', 's'),
    metric('T', '真值 T', 's')
  ];
  // 圖示畫在 xy 平面，預設正對它看，標籤才不會被斜角透視擠在一起。
  M.defs.find(d => d.id === 'measurement-uncertainty').initialView = { yaw: 0, pitch: 0.12 };
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
