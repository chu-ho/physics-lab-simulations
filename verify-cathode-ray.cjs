'use strict';
// 陰極射線與荷質比：加速動能 eV、純電場拋物線解析解、交叉場以獨立 RK4 積分比對、能量（磁力不作功）、
// 速度選擇器 E = vB、湯姆森 e/m 推算、撞板事件與縮放關係。
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'cathode-ray');
const base = M.defaults(def);
const run = overrides => def.build({ ...base, ...overrides });
const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1e-6, Math.abs(b)), `${a} ≠ ${b}`);
const e = 1.602176634e-19,
  me = 9.1093837015e-31,
  ratio = e / me;
const plate = 0.05,
  gap = 0.02,
  drift = 0.15;

// 1. 加速區：通過陽極時動能 = eVa，v0 = √(2eVa/m)
for (const accel of [500, 2000, 5000]) {
  const sim = run({ accel, deflect: 0, field: 0 });
  const anode = sim.events[0].t;
  near(sim.sample(anode).kinetic, accel, 1e-12);
  near(sim.flight.v0, Math.sqrt(2 * ratio * accel), 1e-12);
  near(sim.sample(10).kinetic, accel, 1e-12);
  near(sim.screenY, 0, 1e-12);
  // 加速區內動能與走過的電位差成正比
  const half = sim.sample(anode / 2);
  near(half.kinetic, (accel * (half.x + 0.06)) / 0.02, 1e-9);
}

// 2. 純電場：板端偏移 y = aℓ²/(2v0²)，螢幕 Y = (aℓ/v0²)(ℓ/2 + D)
let cases = 0;
for (const accel of [800, 2000, 5000])
  for (const deflect of [-200, 60, 150]) {
    const sim = run({ accel, deflect, field: 0 });
    const v0 = Math.sqrt(2 * ratio * accel),
      a = (ratio * deflect) / gap;
    assert.equal(sim.outcome, 'exit');
    near(sim.flight.end.y, (a * plate * plate) / (2 * v0 * v0), 1e-9);
    near(sim.screenY, ((a * plate) / (v0 * v0)) * (plate / 2 + drift), 1e-9);
    // 偏移與 V偏/V加 成正比，正電壓（上板高）使電子向上
    assert.equal(Math.sign(sim.screenY), Math.sign(deflect));
    cases++;
  }
near(run({ accel: 4000 }).screenY, run({}).screenY / 2, 1e-9);
near(run({ deflect: 2 * base.deflect }).screenY, 2 * run({}).screenY, 1e-9);

// 3. 交叉場：與獨立 RK4 積分 m dv/dt = q(E + v × B) 比對板間位置與速度
function rk4(accel, deflect, fieldMilli, tau, n = 20000) {
  const q = -e,
    Ey = -deflect / gap,
    Bz = -fieldMilli / 1000;
  const f = s => [s[2], s[3], (q / me) * (s[3] * Bz), (q / me) * (Ey - s[2] * Bz)];
  let s = [0, 0, Math.sqrt(2 * ratio * accel), 0];
  const h = tau / n;
  for (let i = 0; i < n; i++) {
    const k1 = f(s),
      k2 = f(s.map((v, j) => v + (h / 2) * k1[j])),
      k3 = f(s.map((v, j) => v + (h / 2) * k2[j])),
      k4 = f(s.map((v, j) => v + h * k3[j]));
    s = s.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
  }
  return s;
}
for (const [accel, deflect, field] of [
  [2000, 150, 0.4],
  [800, -100, -0.6],
  [5000, 300, 1],
  [1200, 0, 0.8],
  [3000, 50, 0.005]
]) {
  const sim = run({ accel, deflect, field });
  const scale = 10 / sim.flight.tD;
  const tau = 0.7 * (sim.flight.tC - sim.flight.tB);
  const s = sim.sample((sim.flight.tB + tau) * scale);
  const [x, y, vx, vy] = rk4(accel, deflect, field, tau);
  near(s.x, x, 1e-8);
  near(s.y, y, 1e-6);
  near(s.vx, vx, 1e-8);
  near(s.vy, vy, 1e-6);
  // 能量：磁力不作功，動能 = eVa + 偏向電場作功
  for (const t of [0.3, 5, 7.7, 10]) {
    const r = sim.sample(t);
    if (r.x >= 0) near(r.kinetic, accel + r.fieldWork, 1e-9);
  }
  cases++;
}

// 4. 速度選擇器與湯姆森 e/m：B = E/v0 時光束直行，推算 e/m 等於真值；偏離平衡時推算值偏離
const balanced = run({ field: run({}).balanceField });
near(balanced.screenY, 0, 1e-9);
near(balanced.selectorSpeed, balanced.flight.v0, 1e-12);
near(balanced.estimate, ratio, 1e-9);
for (const t of [3, 4, 5]) near(balanced.sample(t).yMillimetre, 0, 1e-9);
const off = run({ field: 1.2 * run({}).balanceField });
assert.ok(Math.abs(off.estimate - ratio) / ratio > 0.2);
assert.ok(off.screenY < 0);
assert.equal(run({ field: 0 }).estimate, null);
assert.equal(run({ deflect: 0, field: 0.3 }).estimate, null);

// 5. 撞板：大偏向電壓、低加速電壓時在板內 |y| = d/2 停止，不到螢幕
const hit = run({ accel: 500, deflect: 400 });
assert.equal(hit.outcome, 'hit');
assert.equal(hit.screenY, null);
near(Math.abs(hit.sample(10).y), gap / 2, 1e-9);
assert.ok(hit.sample(10).x < plate);
assert.ok(hit.events.some(ev => ev.label.includes('撞上')));

// 6. 事件與狀態：事件時間遞增、所有讀值有限
for (const accel of [500, 5000])
  for (const deflect of [-400, 0, 400])
    for (const field of [-1, 0, 1]) {
      const sim = run({ accel, deflect, field });
      for (let i = 1; i < sim.events.length; i++) assert.ok(sim.events[i].t >= sim.events[i - 1].t);
      for (const t of [0, 2.5, 5, 7.5, 10])
        for (const key of [...def.metrics, ...def.plotMetrics].map(m => m.key)) assert.ok(Number.isFinite(sim.sample(t)[key]), key);
      assert.ok(Math.abs(sim.sample(10).y) <= gap / 2 + 1e-12 || sim.reaches !== false);
      cases++;
    }
for (const p of def.params) assert.ok(p.value >= p.min && p.value <= p.max);
console.log(`PASS cathode-ray: eV gain, parabolic deflection, crossed-field RK4 match, magnetic no-work energy, E=vB selector, Thomson e/m, plate hit (${cases} cases)`);
