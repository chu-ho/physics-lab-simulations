'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/millikan-oil-drop.js');

const def = Mechanics.defs.find(d => d.id === 'millikan-oil-drop');
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const sample = (parameters, t = 0) => build(parameters).sample(t);
const near = (actual, expected, rel = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= rel * Math.max(1, Math.abs(expected)), `${actual} differs from ${expected}`);

// 獨立常數與公式（SI）
const e = 1.602176634e-19, eta = 1.83e-5, g = 9.8, rho = 886 - 1.2, d = 5e-3;
const mass = a => (4 / 3) * Math.PI * a ** 3 * rho;

// 1. 無電場：Stokes 終端速度 v = 2ρ g a²/(9η)，向下；半徑與速度互相一致
const free = build({ noise: 0 });
const a = free.drops[0].a;
const vFall = (2 * rho * g * a * a) / (9 * eta);
near(free.sample(0).velocity, -vFall * 1e6);
near(free.sample(0).radius, a * 1e6);
near(free.sample(0).fallSpeed, vFall * 1e6);
near(free.sample(6).height, 2.5 - vFall * 60 * 1e3);

// 2. 懸浮：qV/d = mg 時速度為零，略高上升、略低下降
for (const drop of [1, 5, 12, 24]) {
  const dr = free.drops[drop - 1];
  const vHover = (mass(dr.a) * g * d) / (dr.n * e);
  near(sample({ drop, voltage: 0 }).hoverVoltage, vHover);
  if (vHover <= 1000) {
    assert.ok(Math.abs(sample({ drop, voltage: vHover }).velocity) < 1e-6, 'hover');
    assert.ok(sample({ drop, voltage: Math.min(1000, vHover * 1.05) }).velocity > 0);
    assert.ok(sample({ drop, voltage: vHover * 0.95 }).velocity < 0);
    near(sample({ drop, voltage: vHover }).balanceCharge, dr.n * e / 1e-19);
  }
}
// 懸浮時高度不變
const dr1 = free.drops[0], vh1 = (mass(dr1.a) * g * d) / (dr1.n * e);
near(sample({ drop: 1, voltage: vh1 }, 12).height, 2.5);

// 3. 終端上升速度與電壓成線性關係（Stokes）
const q = dr1.n * e, Va = 700, Vb = 900;
const slope = (sample({ drop: 1, voltage: Vb }).velocity - sample({ drop: 1, voltage: Va }).velocity) / (Vb - Va);
near(slope, (q / d / (6 * Math.PI * eta * dr1.a)) * 1e6, 1e-6);

// 4. 無計時誤差時，兩速度法量得電荷正好是 n e；樣本電荷全是 e 的整數倍
for (const [i, dr] of free.drops.entries()) {
  assert.ok(Number.isInteger(dr.n) && dr.n >= 1 && dr.n <= 8);
  near(sample({ drop: i + 1, noise: 0 }).measuredCharge, dr.n * e / 1e-19, 1e-9);
}
near(sample({ noise: 0 }).eEstimate, e / 1e-19, 1e-6);

// 5. 有計時誤差：各油滴量得電荷落在 n e 附近，擬合出的 e 與公認值差 < 2%（多組種子）
for (const seed of [1, 7, 17, 42, 99]) {
  const b = build({ seed });
  b.drops.forEach(dr => assert.ok(Math.abs(dr.measured / (e / 1e-19) - dr.n) < 0.3, `seed ${seed}: ${dr.measured}`));
  near(b.sample(0).eEstimate, e / 1e-19, 0.02);
}

// 6. 可重現：同種子相同、不同種子不同；分布圖在整數倍處取得峰值
assert.deepEqual(build({ seed: 17 }).drops, build({ seed: 17 }).drops);
assert.notDeepEqual(build({ seed: 17 }).drops, build({ seed: 18 }).drops);
const plot = build({ noise: 0 }).positionPlot.series[0].value;
const present = new Set(free.drops.map(dr => dr.n));
for (let n = 1; n <= 8; n++) {
  const at = plot((n * e) / 1e-19);
  if (present.has(n)) assert.ok(at > 0.9 / 24 && at > plot(((n + 0.5) * e) / 1e-19), 'peak at n=' + n);
  else assert.ok(at < 1e-6, 'no peak at absent n=' + n);
}
assert.ok(plot((0.5 * e) / 1e-19) < 1e-6, 'no drops below e');

// 7. 碰板後停止、所有滑桿邊界值皆為有限數
for (const voltage of [0, 1000]) {
  const end = sample({ drop: 1, voltage }, 12);
  assert.ok(end.height >= 0 && end.height <= 5);
  if (end.stuck) assert.equal(end.velocity, 0);
}
assert.equal(sample({ drop: 1, voltage: 0 }, 12).stuck, true, 'falling drop reaches the lower plate');
for (const p of def.params) {
  for (const edge of [p.min, p.max]) {
    for (const t of [0, 6, 12]) {
      const state = sample({ [p.id]: edge }, t);
      for (const m of [...def.metrics, ...def.plotMetrics]) assert.ok(Number.isFinite(state[m.key]), `${p.id}=${edge} t=${t}: ${m.key}`);
    }
  }
}
console.log('PASS millikan-oil-drop: Stokes fall speed, hover voltage, two-velocity charge, e fit, seeded samples and slider limits');
