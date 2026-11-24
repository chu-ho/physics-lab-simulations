'use strict';
// 稜鏡色散：模型以向量 Snell 定律在三角形內逐面追跡；本檔以解析式 δ = θ₁ + θ₂ − A、
// 最小偏向 θ₁ = sin⁻¹[n sin(A/2)] 及 n = sin[(A+δmin)/2]/sin(A/2) 獨立核對。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Mechanics = require('./mechanics-models.js');
require('./models/prism-dispersion.js');

const def = Mechanics.defs.find(d => d.id === 'prism-dispersion');
const O = Mechanics.PrismOptics;
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const near = (actual, expected, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} differs from ${expected}`);
const rad = d => (d * Math.PI) / 180,
  deg = r => (r * 180) / Math.PI;
let count = 0;

// 1. 材料：d 線折射率與阿貝數換算的 Cauchy 式
for (const [j, m] of O.materials.entries()) {
  near(O.nOf(j, 589.3), m.nd, 1e-12);
  near((O.nOf(j, 589.3) - 1) / (O.nOf(j, 486.1) - O.nOf(j, 656.3)), m.V, 1e-9);
  for (let k = 1; k < O.bands.length; k++) assert.ok(O.nOf(j, O.bands[k].lambda) > O.nOf(j, O.bands[k - 1].lambda), 'normal dispersion');
}
assert.ok(O.nOf(3, 410) - O.nOf(3, 656) > O.nOf(2, 410) - O.nOf(2, 656), 'SF11 disperses more than F2');
assert.ok(O.nOf(2, 410) - O.nOf(2, 656) > O.nOf(1, 410) - O.nOf(1, 656), 'F2 disperses more than BK7');

// 2. 逐面追跡與解析式一致：Snell、r₁ + r₂ = A、偏向角、第二面全反射判定
for (const material of [0, 1, 2, 3])
  for (const A of [30, 45, 60, 75])
    for (let theta1 = 0; theta1 <= 89; theta1 += 2.5) {
      const geo = O.prismGeometry(A);
      for (const band of O.bands) {
        const n = O.nOf(material, band.lambda),
          r = O.traceBand(geo, n, theta1),
          r1 = Math.asin(Math.sin(rad(theta1)) / n),
          s2 = n * Math.sin(rad(A) - r1);
        count++;
        near(r.r1, deg(r1), 1e-9);
        if (r.firstFace === 'right') {
          near(r.r2, Math.abs(A - deg(r1)), 1e-8);
          assert.equal(r.tirAtSecond, Math.abs(s2) > 1, `TIR flag A=${A} θ1=${theta1} n=${n}`);
        }
        if (r.clean) {
          const expected = theta1 + deg(Math.asin(s2)) - A;
          near(r.deviation, expected, 1e-9);
          near(O.analyticDeviation(A, n, theta1), expected, 1e-12);
          near(Math.sin(rad(r.theta2)), Math.abs(s2), 1e-9);
        } else assert.ok(r.tirCount > 0 || r.firstFace !== 'right', 'non-clean ray must be TIR or leave elsewhere');
        if (Math.abs(s2) > 1) assert.ok(!Number.isFinite(O.analyticDeviation(A, n, theta1)));
      }
    }

// 3. 最小偏向：對稱光路、極小值、由 δmin 回推折射率
for (const material of [0, 1, 2, 3])
  for (const A of [30, 45, 60, 75])
    for (const ref of [0, 3, 6]) {
      const n = O.nOf(material, O.bands[ref].lambda),
        sim = build({ material, apex: A, ref, mode: 1 }),
        s = sim.sample(4);
      if (n * Math.sin(rad(A) / 2) > 1) {
        assert.ok(!Number.isFinite(s.deltaMin) && !Number.isFinite(s.refDeviation), 'no minimum when n sin(A/2) > 1');
        continue;
      }
      const best = deg(Math.asin(n * Math.sin(rad(A) / 2))),
        dmin = 2 * best - A;
      near(s.incidence, best, 1e-12);
      near(s.deltaMin, dmin, 1e-12);
      near(s.refDeviation, dmin, 1e-9);
      near(s.nFromMin, n, 1e-12);
      assert.equal(s.atMinimum, 1);
      const r = O.traceBand(O.prismGeometry(A), n, best);
      near(r.r1, A / 2, 1e-9);
      near(r.r2, A / 2, 1e-9);
      near(r.theta2, best, 1e-8);
      const inside = [r.points[2][0] - r.points[1][0], r.points[2][1] - r.points[1][1]];
      assert.ok(Math.abs(inside[1]) < 1e-9 * Math.hypot(...inside), 'symmetric ray is parallel to the base');
      for (const d of [-5, -1, -0.2, 0.2, 1, 5]) {
        const other = O.analyticDeviation(A, n, best + d);
        if (Number.isFinite(other) && best + d <= 90) assert.ok(other > dmin, `δ(${best + d}) > δmin`);
      }
    }
// 課本數值：BK7（nd = 1.5168）、A = 60° 時 δmin ≈ 38.65°
near(2 * deg(Math.asin(1.5168 * 0.5)) - 60, 38.6496, 1e-4);
const bk7 = build({ material: 1, apex: 60, ref: 2, mode: 1 }).sample(1);
assert.ok(Math.abs(bk7.deltaMin - 38.65) < 0.02, 'BK7 yellow δmin ≈ 38.65°: ' + bk7.deltaMin);

// 4. 色散：可射出的光中紫光偏折最多、紅光最少；紅紫分散角隨材料色散增加
const spreadOf = material => build({ material, apex: 60, mode: 1 }).sample(1).spread;
const dev = build({ material: 2 }).sample(1);
for (let j = 1; j < 7; j++) assert.ok(dev['dev' + j] > dev['dev' + (j - 1)]);
assert.ok(spreadOf(3) > spreadOf(2) && spreadOf(2) > spreadOf(1));

// 5. 全反射明示：大頂角重火石玻璃，入射角小時全部全反射；接近掠射臨界時部分顏色先全反射
const allTir = build({ material: 3, apex: 75, mode: 0, incidence: 30 }).sample(5);
assert.equal(allTir.tirBands, 7);
assert.ok(!Number.isFinite(allTir.refDeviation));
const sim60 = build({ material: 3, apex: 60, ref: 6 });
const grazing = sim60.grazingIncidence; // 紫光在第二面恰好掠射時的入射角
const split = build({ material: 3, apex: 60, ref: 6, incidence: grazing - 0.3 }).sample(5);
const traces = sim60.tracesAt(0);
assert.ok(split.tirBands >= 1 && split.tirBands < 7, 'violet TIR while red still exits: ' + split.tirBands);
assert.ok(!Number.isFinite(split.dev6) && Number.isFinite(split.dev0));
assert.ok(traces.length === 7);

// 6. 播放：手動光束前進、掃描模式入射角線性增加
const fixed = build({});
assert.equal(fixed.sample(0).front, 0);
assert.ok(fixed.sample(fixed.duration).front >= Math.max(...fixed.tracesAt(0).map(r => r.length)));
const sweep = build({ mode: 2 });
near(sweep.sample(0).incidence, 0);
near(sweep.sample(6).incidence, 44.5);
near(sweep.sample(sweep.duration).incidence, 89);
for (const [j, series] of fixed.positionPlot.series.entries())
  near(series.value(40), O.analyticDeviation(60, fixed.ns[j], 40), 1e-12);

// 7. 參數邊界：讀值為有限數或明示全反射（NaN 只出現在全反射時）
for (const p of def.params)
  for (const edge of [p.min, p.max])
    for (const t of [0, 2.5, 5]) {
      const s = build({ [p.id]: edge }).sample(t);
      for (const key of ['incidence', 'refN', 'tirBands', 'front']) assert.ok(Number.isFinite(s[key]), `${p.id}=${edge}: ${key}`);
      if (!Number.isFinite(s.refDeviation)) assert.ok(s.tirBands > 0, `${p.id}=${edge}: missing deviation without TIR`);
    }

// 8. 實驗頁：對準最小偏向會同步入射角拉桿，拖入射角會回到手動；全反射與掃描都能繪製
const { domHarness } = require('./tools/dom-harness.cjs'),
  html = fs.readFileSync('mechanics.html', 'utf8'),
  { sandbox } = domHarness(html);
sandbox.assert = assert;
for (const m of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g))
  vm.runInContext(fs.readFileSync(m[1], 'utf8'), sandbox, { filename: m[1] });
vm.runInContext(
  `selectExperiment('prism-dispersion', false);
  $('param-material').value = 1; $('param-material').listeners.input();
  $('param-mode').value = 1; $('param-mode').listeners.input();
  assert.equal(params.mode, 1);
  assert.ok(Math.abs(+$('param-incidence').value - simulation.bestIncidence) < 0.06);
  t = simulation.duration; render();
  $('param-incidence').value = 20; $('param-incidence').listeners.input();
  assert.equal(params.mode, 0);
  $('param-material').value = 3; $('param-material').listeners.input();
  $('param-apex').value = 80; $('param-apex').listeners.input();
  t = simulation.duration; render();
  $('param-mode').value = 2; $('param-mode').listeners.input();
  for (const f of [0, .3, .7, 1]) { t = f * simulation.duration; render(); }`,
  sandbox
);
console.log(
  'PASS prism-dispersion: ' +
    count +
    ' traced rays match δ = θ₁ + θ₂ − A and second-face TIR; minimum deviation symmetric path and n = sin[(A+δmin)/2]/sin(A/2); normal dispersion order, TIR display, sweep and page controls.'
);
