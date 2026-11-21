'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/xray-bragg.js');

const def = Mechanics.defs.find(d => d.id === 'xray-bragg');
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const sample = (parameters, t = 0) => build(parameters).sample(t);
const near = (actual, expected, rel = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= rel * Math.max(1e-12, Math.abs(expected)), `${actual} differs from ${expected}`);
const hc = 1.239841984; // keV·nm
near(hc, (6.62607015e-34 * 299792458) / 1.602176634e-19 / 1e3 / 1e-9, 1e-8);
const rad = deg => (deg * Math.PI) / 180;

// 1. Duane–Hunt：λmin = hc/eV，與靶材無關，電壓加倍則減半
for (const target of [0, 1, 2]) near(sample({ voltage: 40, target }).lambdaMin, hc / 40);
near(sample({ voltage: 60 }).lambdaMin, sample({ voltage: 30 }).lambdaMin / 2);
const spec = build({ voltage: 30 }).spectrum;
const lm = hc / 30;
assert.equal(spec(lm * 0.99), 0, 'no radiation below cutoff');
assert.equal(spec(lm), 0);
assert.ok(spec(lm * 1.5) > 0);
// Kramers 連續譜在 2λmin 最大（解析：d/dλ[(λ/λmin−1)/λ²] = 0 → λ = 2λmin）
const cont = build({ voltage: 5, target: 0 }).spectrum; // 低於 K 邊，只有連續譜
const l5 = hc / 5;
assert.ok(cont(2 * l5) > cont(1.5 * l5) && cont(2 * l5) > cont(3 * l5));

// 2. 特徵線：Cu Kα 約 0.1542 nm；低於 K 吸收邊不出現
const cu = build({ voltage: 30, target: 0 });
near(cu.lines[0].lambda, 0.15418, 1e-3);
near(cu.lines[1].lambda, 0.13922, 1e-3);
assert.ok(cu.spectrum(cu.lines[0].lambda) > 5 * cu.spectrum(cu.lines[0].lambda * 1.05), 'Kα peak');
assert.ok(build({ voltage: 8.5, target: 0 }).lines.every(l => l.height === 0));
assert.equal(sample({ voltage: 8.5, target: 0 }).present, 0);
assert.equal(sample({ voltage: 8.5, target: 0 }).intensity, 0);
assert.ok(build({ voltage: 19, target: 1 }).lines.every(l => l.height === 0), 'Mo needs 20 kV');
assert.ok(build({ voltage: 21, target: 1 }).lines[0].height > 0);
assert.ok(build({ voltage: 40 }).lines[0].height > build({ voltage: 20 }).lines[0].height);

// 3. 布拉格角：NaCl(200) d = 0.282 nm、Cu Kα → θ1 ≈ 15.87°，且 2d sinθ = nλ
const b = build({ spacing: 0.282, source: 0 });
const lambda = b.lines[0].lambda;
assert.equal(b.orders.length, Math.floor((2 * 0.282) / lambda));
for (const o of b.orders) {
  near(2 * 0.282 * Math.sin(rad(o.angle)), o.n * lambda, 1e-9);
  near(sample({ spacing: 0.282, angle: o.angle }).intensity, 1, 1e-6);
  near(sample({ spacing: 0.282, angle: o.angle }).orderExact, o.n, 1e-9);
}
assert.ok(Math.abs(b.orders[0].angle - 15.87) < 0.05);
assert.ok(sample({ angle: 25 }).intensity < 0.02, 'between orders the reflection is weak');
const half = (Math.asin((1.5 * lambda) / 0.564) * 180) / Math.PI; // x = 1.5：sin(8π·1.5) = 0，N=8 時恰為極小
assert.ok(sample({ spacing: 0.282, angle: half }).intensity < 1e-9);

// 4. 階數上限：d 越大階數越多；λ > 2d 無反射
near(build({ spacing: 0.45 }).orders.length, Math.floor(0.9 / lambda));
assert.ok(build({ spacing: 0.45 }).orders.length > b.orders.length);
assert.equal(sample({ source: 2, wavelength: 0.3, spacing: 0.15, voltage: 60 }).maxOrder, 1);
near(build({ source: 2, wavelength: 0.3, spacing: 0.15, voltage: 60 }).orders[0].angle, 90, 1e-6); // λ = 2d：只有掠射 90°
assert.equal(sample({ source: 2, wavelength: 0.03, voltage: 20 }).present, 0, 'wavelength below λmin');
assert.equal(sample({ source: 2, wavelength: 0.1, voltage: 20 }).present, 1);
assert.ok(build({ source: 1 }).orders[0].angle < b.orders[0].angle, 'shorter Kβ gives smaller angle');

// 5. 掃描與圖表
near(sample({ sweep: 1 }, 0).angle, 5);
near(sample({ sweep: 1 }, 12).angle, 85);
const curve = b.positionPlot.series[0].value;
for (const o of b.orders) near(curve(o.angle), 1, 1e-6);
assert.ok(Math.max(...Array.from({ length: 900 }, (_, i) => curve(i / 10))) <= 1 + 1e-9);

// 6. 邊界值皆為有限數
for (const p of def.params)
  for (const edge of [p.min, p.max])
    for (const t of [0, 6, 12]) {
      const state = sample({ [p.id]: edge }, t);
      for (const m of [...def.metrics, ...def.plotMetrics])
        assert.ok(Number.isFinite(state[m.key]), `${p.id}=${edge} t=${t}: ${m.key}`);
    }
console.log('PASS xray-bragg: Duane–Hunt cutoff, characteristic lines, Bragg angles and orders, plane interference, sweep and slider limits');
