'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/michelson.js');

const def = Mechanics.defs.find(d => d.id === 'michelson');
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const sample = (parameters, t = 0) => build(parameters).sample(t);
const near = (actual, expected, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} differs from ${expected}`);

// 1. 中心：光程差 2d；鏡移 λ/2 時中心亮暗循環一次
for (const lambda of [633, 532, 405]) {
  const b = build({ lambda, tilt: 0, d0: 0 });
  for (const d of [0, 10, 37.5, 120]) {
    near(b.pathDifference(d, 0, 0), 2 * d, 1e-9);
    near(b.pattern(d, 0, 0), Math.cos((2 * Math.PI * d * 1e3) / lambda) ** 2, 1e-6);
  }
  const dHalf = lambda / 2e3; // μm
  near(b.pattern(dHalf, 0, 0), 1, 1e-9); // 移動 λ/2 → 回到亮
  near(b.pattern(dHalf / 2, 0, 0), 0, 1e-9); // 移動 λ/4 → 暗
}

// 2. 數條紋：N = ⌊2Δd/λ⌋，Nλ/2 與實際位移相差小於 λ/2
for (const [lambda, speed, d0] of [
  [633, 0.5, 30],
  [532, 1.3, 80],
  [405, -2, 15],
  [700, 0.05, 0]
]) {
  for (const t of [0, 1.7, 4, 10]) {
    const s = sample({ lambda, speed, d0 }, t),
      moved = Math.abs(speed * t); // μm
    near(s.displacement, speed * t, 1e-9);
    assert.equal(s.count, Math.floor((2 * moved * 1e3) / lambda + 1e-9), `N at t=${t}`);
    near(s.estimate, (s.count * lambda) / 2e3, 1e-12);
    assert.ok(moved - s.estimate >= -1e-9 && moved - s.estimate < lambda / 2e3, 'N·λ/2 underestimates by < λ/2');
  }
}
// 預設：10 s 移動 5 μm，633 nm → N = 15，推得 4.7475 μm
const end = sample({}, 10);
assert.equal(end.count, 15);
near(end.estimate, 4.7475, 1e-12);
near(end.displacement, 5, 1e-12);
// 中心亮暗次數與 N 一致：數中心強度由亮→暗→亮的完整循環
{
  const b = build({ d0: 30, speed: 0.5 });
  let cycles = 0,
    armed = false;
  const start = b.sample(0).fringeOrder;
  for (let i = 0; i <= 20000; i++) {
    const s = b.sample((10 * i) / 20000);
    if (s.fringeOrder - start >= cycles + 0.5) armed = true;
    if (armed && s.fringeOrder - start >= cycles + 1) {
      cycles++;
      armed = false;
    }
  }
  assert.equal(cycles, end.count);
}

// 3. 同心環：δ(θ) ≈ 2d cosθ，第 k 個暗環在 2d(1 − cosθ) = (k − ½)λ 附近（d 使中心為亮時）
{
  const lambda = 633,
    d = (100 * lambda) / 2e3; // 中心光程差恰為 100λ（亮）
  const b = build({ lambda, tilt: 0 });
  near(b.pattern(d, 0, 0), 1, 1e-9);
  for (const k of [1, 2, 3]) {
    const cos = 1 - ((k - 0.5) * lambda * 1e-9) / (2 * d * 1e-6),
      rho = 0.2 * Math.tan(Math.acos(cos)) * 1e3; // mm
    assert.ok(b.pattern(d, rho, 0) < 1e-4, 'dark ring ' + k + ' at ' + rho.toFixed(2) + ' mm');
    near(b.pattern(d, rho / Math.SQRT2, rho / Math.SQRT2), b.pattern(d, rho, 0), 1e-9); // 圓對稱
  }
  // d 越大，視窗內環越多
  const rings = dd => {
    let n = 0,
      prev = b.pattern(dd, 0, 0);
    for (let i = 1; i <= 4000; i++) {
      const v = b.pattern(dd, (50 * i) / 4000, 0);
      if (prev >= 0.5 && v < 0.5) n++;
      prev = v;
    }
    return n;
  };
  assert.ok(rings(150) > rings(50) && rings(50) > rings(10), 'more rings as d grows');
}

// 4. 傾斜、d = 0：直條紋，間距 λ/(2β)，與 y 無關
for (const [lambda, tilt] of [
  [633, 0.05],
  [450, 0.1],
  [700, 0.04]
]) {
  const b = build({ lambda, tilt, d0: 0 }),
    spacing = (lambda * 1e-9) / (2 * tilt * 1e-3) * 1e3; // mm
  const at = x => b.pattern(0, x, 0);
  // 從中心起，強度隨 x 以 spacing 為週期（小角度近似，容許 1%）
  const darkNear = x0 => {
    let best = x0,
      min = 2;
    for (let i = -400; i <= 400; i++) {
      const x = x0 + (spacing * i) / 800,
        v = at(x);
      if (v < min) {
        min = v;
        best = x;
      }
    }
    return best;
  };
  const x1 = darkNear(spacing * 0.5),
    x2 = darkNear(spacing * 1.5);
  assert.ok(Math.abs(x2 - x1 - spacing) < 0.01 * spacing, `straight fringe spacing ${x2 - x1} vs ${spacing}`);
  assert.ok(Math.abs(b.pattern(0, x1, 30) - b.pattern(0, x1, 0)) < 0.05, 'fringes run along y');
}

// 5. 邊界值皆為有限數
for (const p of def.params)
  for (const edge of [p.min, p.max])
    for (const t of [0, 5, 10]) {
      const state = sample({ [p.id]: edge }, t);
      for (const m of [...def.metrics, ...def.plotMetrics])
        assert.ok(Number.isFinite(state[m.key]), `${p.id}=${edge} t=${t}: ${m.key}`);
    }
console.log(
  'PASS michelson: center path difference 2d, fringe count N = ⌊2Δd/λ⌋ with Nλ/2 within λ/2, ring radii from 2d cosθ, tilted straight fringes λ/(2β), slider limits'
);
