'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'measurement-uncertainty');
const make = o => def.build({ ...M.defaults(def), ...o });
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b)), msg + ' ' + a + ' vs ' + b);

// 獨立參考真值：小角度週期乘上 1 + θ²/16 + 11θ⁴/3072（5°）
const A = (5 * Math.PI) / 180;
const small = 2 * Math.PI * Math.sqrt(1 / 9.81);
near(make({}).trueT, small * (1 + A * A / 16 + (11 * A ** 4) / 3072), 1e-6, 'true period');

// 可重現；增加 n 不改變先前測量
assert.deepEqual(make({}).trials, make({}).trials);
assert.deepEqual(make({ n: 50 }).trials.slice(0, 20), make({ n: 20 }).trials);
assert.notDeepEqual(make({ seed: 8 }).trials, make({ seed: 7 }).trials);

// 統計量與手算一致
const sim = make({ n: 12 });
const xs = sim.trials;
const mean = xs.reduce((a, b) => a + b) / 12;
const s = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / 11);
const end = sim.sample(sim.duration);
near(end.mean, mean, 1e-12, 'mean');
near(end.s, s, 1e-12, 'sample standard deviation (n-1)');
near(end.se, s / Math.sqrt(12), 1e-12, 'standard error');
assert.equal(end.k, 12);
assert.equal(sim.sample(0).k, 1);

// 計時 N 個週期：同一組隨機數下，誤差正好縮為 1/N
const one = make({ N: 1, n: 30 }),
  ten = make({ N: 10, n: 30 });
for (let i = 0; i < 30; i++) near((ten.trials[i] - ten.trueT) * 10, one.trials[i] - one.trueT, 1e-9, 'error scales 1/N');
near(ten.sample(ten.duration).s * 10, one.sample(one.duration).s, 1e-9, 's scales 1/N');

// 抽樣分布：很多次測量時 s ≈ √2σ/N（n = 50，抽樣誤差約 10%；以多個種子平均）
let sum = 0;
for (let seed = 1; seed <= 40; seed++) sum += make({ n: 50, seed, sigma: 0.1, N: 1 }).sample(1e9).s;
near(sum / 40, Math.SQRT2 * 0.1, 0.03, 'standard deviation ≈ √2σ/N');
// 平均值誤差約 s/√n：多個種子的平均值標準差
let errs = [];
for (let seed = 1; seed <= 200; seed++) {
  const m = make({ n: 25, seed });
  errs.push(m.sample(1e9).mean - m.trueT);
}
const rms = Math.sqrt(errs.reduce((a, b) => a + b * b, 0) / errs.length);
near(rms, (Math.SQRT2 * 0.1) / Math.sqrt(25), 0.15, 'error of mean ≈ σ√2/√n');

// 有效數字：不確定度 1 位（首位為 1 時 2 位），平均值同位數
const r = M.Uncertainty.report;
assert.deepEqual(r(2.0123, 0.0347), { mean: 2.01, u: 0.03, decimals: 2 });
assert.equal(r(2.0123, 0.0147).decimals, 3);
assert.equal(r(2.0123, 0.0147).u, 0.015);
assert.equal(r(2.0123, 0.0147).mean, 2.012);
assert.equal(r(2.0123, 0.9).decimals, 1);
assert.equal(r(1234, 56).decimals, 0);
assert.equal(r(1234, 56).u, 60);
assert.equal(r(1234, 56).mean, 1230);
console.log('PASS measurement-uncertainty');
