'use strict';
// 載流導線受磁力（電流天平）：F = ILB sinθ、方向由向量外積、反向、線性比例、平衡電流事件與指示仰角。
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'current-balance');
const base = M.defaults(def);
const run = overrides => def.build({ ...base, ...overrides });
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);
const rad = d => (d * Math.PI) / 180;

let cases = 0;
for (const current of [-5, -1.3, 0, 2, 5])
  for (const field of [0, 0.07, 0.3])
    for (const angle of [0, 30, 90, 135, 180])
      for (const length of [2, 7.5, 10]) {
        const sim = run({ current, field, angle, length });
        const end = sim.sample(sim.duration);
        // 大小：|F| = |I| L B sinθ（單位 N）
        const magnitude = Math.abs(current) * (length / 100) * field * Math.sin(rad(angle));
        near(Math.hypot(end.forceX, end.forceY, end.forceZ), magnitude);
        // 力垂直於電流與磁場
        const B = sim.field;
        near(end.forceX * current, 0);
        near(end.forceX * B[0] + end.forceY * B[1] + end.forceZ * B[2], 0);
        // 水平磁場與水平導線：磁力只有鉛直分量
        near(end.forceX, 0);
        near(end.forceZ, 0);
        near(end.force, end.forceY * 1000);
        // 磁場在水平面內，大小為 B
        near(Math.hypot(...B), field);
        near(B[1], 0);
        cases++;
      }

// 右手定則方向：I 沿 +x、B 沿 −z（θ=90°）→ F 沿 +y（x̂ × (−ẑ) = +ŷ）
const up = run({ current: 2, angle: 90 }).sample(10);
assert.ok(up.forceY > 0);
near(run({ current: -2, angle: 90 }).sample(10).forceY, -up.forceY);
// θ 與 180°−θ 同大小同向（sin 相同），θ = 0、180° 為零
near(run({ angle: 30 }).sample(10).force, run({ angle: 150 }).sample(10).force);
near(run({ angle: 0 }).sample(10).force, 0);
near(run({ angle: 180 }).sample(10).force, 0);
// 線性比例：L、B、I 各加倍則 F 加倍
const ref = run({}).sample(10).force;
near(run({ length: 2 * base.length }).sample(10).force, 2 * ref);
near(run({ field: 2 * base.field }).sample(10).force, 2 * ref);
near(run({ current: base.current / 2 }).sample(10).force, ref / 2);

// 電流在 8 s 內線性增加後保持
const sim = run({});
near(sim.sample(0).currentNow, 0);
near(sim.sample(4).currentNow, base.current / 2);
near(sim.sample(9).currentNow, base.current);

// 平衡事件：ILB sinθ = mg，事件時刻淨力為零、仰角為零，前後仰角變號
const weight = (base.mass / 1000) * 9.81 * 1000;
near(sim.sample(0).weight, weight);
const expected = (base.mass / 1000) * 9.81 / ((base.length / 100) * base.field * Math.sin(rad(base.angle)));
near(sim.balanceCurrent, expected);
assert.equal(sim.events.length, 1);
const event = sim.events[0];
near(event.t, (8 * expected) / base.current);
near(sim.sample(event.t).net, 0, 1e-9);
near(sim.sample(event.t).tilt, 0, 1e-9);
assert.ok(sim.sample(event.t - 0.2).tilt < 0 && sim.sample(event.t + 0.2).tilt > 0);
// 平衡電流與砝碼成正比
near(run({ mass: 2 * base.mass }).balanceCurrent, 2 * expected);
// 不能平衡的情況：反向電流、θ = 0、電流不足、無砝碼
assert.equal(run({ current: -base.current }).events.length, 0);
assert.equal(run({ angle: 0 }).balanceCurrent, null);
assert.equal(run({ angle: 0 }).events.length, 0);
assert.equal(run({ current: 0.5 }).events.length, 0);
assert.equal(run({ mass: 0 }).events.length, 0);
// 指示仰角與淨力同號且在擋止內
for (const t of [0, 2, 5, 8, 10]) {
  const s = run({ current: 5, field: 0.3, length: 10 }).sample(t);
  assert.ok(Math.abs(s.tilt) <= 10 + 1e-12);
  assert.ok(Math.sign(s.tilt) === Math.sign(s.net) || s.net === 0);
}
assert.equal(run({ current: -5, field: 0.3, length: 10 }).sample(10).tilt, -10);

for (const p of def.params) assert.ok(p.value >= p.min && p.value <= p.max);
console.log(`PASS current-balance: |F| = ILB sinθ and F ⟂ I, B in ${cases} cases, right-hand direction, linear scaling, balance-current event, tilt indicator`);
