'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'power-hoist');
const make = o => def.build({ ...M.defaults(def), ...o });
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), msg + ' ' + a + ' vs ' + b);
// 獨立參考：m=200, g=9.8, f=200, h=10 → F=2160 N, W=21600 J
const sim = make({});
const end = sim.sample(sim.duration);
near(end.WA, 21600, 1e-12, 'A work');
near(end.WB, 21600, 1e-12, 'B work equal');
near(sim.sample(10).PA, 2160 * (10 / 20), 1e-12, 'P = Fv for A');
near(sim.sample(4).PB, 2160 * (10 / 8), 1e-12, 'P = Fv for B');
near(sim.sample(10).avgPB / sim.sample(10).avgPA, 20 / 8, 1e-12, 'average power inverse to time');
assert.equal(sim.sample(9).PB, 0, 'B stops after arriving');
// ∫P dt = W（梯形積分）
let sum = 0;
const n = 4000;
for (let i = 0; i < n; i++) sum += (sim.sample((i * sim.duration) / n).PB + sim.sample(((i + 1) * sim.duration) / n).PB) / 2 * (sim.duration / n);
near(sum, 21600, 2e-3, 'integral of power');
// 無摩擦：作功等於重力位能增加 mgh；效率 100%
const free = make({ f: 0 });
const fe = free.sample(free.duration);
near(fe.WA, 200 * 9.8 * 10, 1e-12, 'frictionless work = mgh');
near(fe.effMech, 1, 1e-12, 'frictionless efficiency');
near(sim.sample(0).effMech, 1960 / 2160, 1e-12, 'mechanical efficiency');
near(end.Ein, 21600 / 0.8, 1e-12, 'electrical input');
// 同時間則同功率；時間減半則功率加倍
const same = make({ tA: 10, tB: 10 });
near(same.sample(5).PA, same.sample(5).PB, 1e-12, 'equal times');
near(make({ tB: 10 }).sample(5).PB / make({ tB: 20 }).sample(5).PB, 2, 1e-12, 'half time double power');
console.log('PASS power-hoist');
