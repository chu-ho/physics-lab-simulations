'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'dimensional-analysis');
const make = o => def.build({ ...M.defaults(def), ...o });
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b)), msg + ' ' + a + ' vs ' + b);
const end = o => {
  const s = make(o);
  return s.sample(0);
};

// 因次：窮舉指數（0.5 的倍數），只有 (0, ½, −½) 同時使 M⁰ L⁰ T¹
const good = [];
for (let a = -2; a <= 2; a += 0.5)
  for (let b = -2; b <= 2; b += 0.5)
    for (let c = -2; c <= 2; c += 0.5) {
      const d = M.DimensionalAnalysis.dimensions(a, b, c);
      if (d.M === 0 && d.L === 0 && d.T === 1) good.push([a, b, c]);
    }
assert.deepEqual(good, [[0, 0.5, -0.5]]);
// 模型的檢查旗標與獨立解一致
assert.equal(end({ a: 0, b: 0.5, c: -0.5 }).ok, 1);
assert.equal(end({ a: 0, b: 1, c: 0 }).ok, 0);
assert.equal(end({ a: 1, b: 0.5, c: -0.5 }).ok, 0);

// 小角度：預測乙擺週期（甲擺定 k）等於 2π√(4L/g)，k = 2π·(1 + θ²/16…)
const right = end({ a: 0, b: 0.5, c: -0.5, angle: 2 });
near(right.k, 2 * Math.PI, 1e-3, 'k ≈ 2π');
near(right.T2 / right.T1, 2, 1e-5, 'T ∝ √L');
assert.ok(Math.abs(right.err) < 1e-9, 'correct dimensions → exact scaling prediction (same angle): ' + right.err);
near(right.T1, 2 * Math.PI * Math.sqrt(1 / 9.8), 1e-3, 'simulated T');
// 與完整單擺的獨立橢圓積分週期比較（20°）：T = 4√(L/g)K(k)
const K = k => {
  let s = 0;
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const t = ((i + 0.5) / n) * (Math.PI / 2);
    s += 1 / Math.sqrt(1 - k * k * Math.sin(t) ** 2);
  }
  return (s * (Math.PI / 2)) / n;
};
near(end({ angle: 20 }).T1, 4 * Math.sqrt(1 / 9.8) * K(Math.sin((20 * Math.PI) / 180 / 2)), 1e-6, 'exact period at 20°');
// 因次錯誤的猜測，預測誤差明顯：T ∝ L（b=1）預測乙擺為甲擺的 4 倍，實際 2 倍
near(end({ a: 0, b: 1, c: 0 }).err, 100, 1e-6, 'T ∝ L predicts 4× instead of 2× (+100%)');
// 質量指數不為零時，即使選 m 也錯：乙擺質量為甲擺的 2 倍
near(end({ a: 1, b: 0.5, c: -0.5 }).Tpred / end({ a: 0, b: 0.5, c: -0.5 }).Tpred, 2, 1e-9, 'extra m¹ doubles prediction');
// 對 g 的依賴：月球 g 較小，T 較長
assert.ok(end({ g: 1.6 }).T1 > end({ g: 9.8 }).T1);
console.log('PASS dimensional-analysis');
