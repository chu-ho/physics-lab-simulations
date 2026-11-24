'use strict';
// 全反射與光纖：模型以射線與直線／圓弧壁面求交並逐次判定全反射；本檔用解析式獨立核對。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Mechanics = require('./mechanics-models.js');
require('./models/optical-fiber.js');

const def = Mechanics.defs.find(d => d.id === 'optical-fiber');
const F = Mechanics.FiberOptics;
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const near = (actual, expected, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} differs from ${expected}`);
const rad = d => (d * Math.PI) / 180,
  deg = r => (r * 180) / Math.PI,
  C = 299792458,
  a = F.a;
let count = 0;

// 1. 臨界角、數值孔徑、受光角
for (const [n1, n2] of [
  [1.49, 1.4],
  [1.62, 1.52],
  [1.7, 1.3],
  [1.45, 1.45],
  [1.4, 1.6]
]) {
  const s = build({ n1, n2 }).sample(0);
  near(s.critical, n2 < n1 ? deg(Math.asin(n2 / n1)) : 90);
  near(s.na, Math.sqrt(Math.max(0, n1 * n1 - n2 * n2)));
  near(s.acceptance, deg(Math.asin(Math.min(1, Math.sqrt(Math.max(0, n1 * n1 - n2 * n2))))));
}
near(build({ n1: 1.49, n2: 1.4 }).sample(0).na, 0.51, 1e-12); // √(1.49² − 1.40²) = 0.51，塑膠光纖典型值

// 2. 直光纖：導光 ⇔ sin θ₀ ≤ NA；牆面入射角 φ = 90° − θr；碰壁次數由展開光路求得；出射角等於入射角
for (const n1 of [1.45, 1.55, 1.7])
  for (const n2 of [1.3, 1.4, 1.5])
    for (let theta0 = 0; theta0 <= 85; theta0 += 2.5)
      for (const offset of [-0.6, 0, 0.35]) {
        const sim = build({ bend: 0, n1, n2, angle: theta0, offset }),
          ray = sim.ray,
          NA = Math.sqrt(Math.max(0, n1 * n1 - n2 * n2)),
          margin = Math.sin(rad(theta0)) - NA;
        if (n2 < n1 && Math.abs(margin) < 1e-6) continue;
        count++;
        const thetaR = Math.asin(Math.sin(rad(theta0)) / n1),
          phi = 90 - deg(thetaR);
        near(ray.thetaR, deg(thetaR), 1e-9);
        const shouldGuide = n2 < n1 && margin < 0;
        const L = 24,
          y0 = offset * a,
          span = L * Math.tan(thetaR),
          wallsCrossed = Math.floor((y0 + span + a) / (2 * a) + 1e-12) - Math.floor((y0 + a) / (2 * a) + 1e-12);
        if (theta0 === 0) assert.equal(ray.hits.length, 0);
        for (const h of ray.hits) near(h.angle, phi, 1e-8);
        if (wallsCrossed === 0) assert.equal(ray.status, 'guided');
        else if (shouldGuide) {
          assert.equal(ray.status, 'guided', `n1=${n1} n2=${n2} θ0=${theta0}`);
          assert.equal(ray.hits.length, wallsCrossed);
          near(Math.abs(Math.atan2(ray.exitDir[1], ray.exitDir[0])), rad(theta0), 1e-9);
        } else {
          assert.equal(ray.status, 'escaped', `n1=${n1} n2=${n2} θ0=${theta0}`);
          assert.equal(ray.hits.length, 1);
          // 逸出光在包層中滿足 n₁ sin φ = n₂ sin φ'
          const h = ray.hits[0],
            d = ray.escapeDir,
            sinOut = Math.abs(d[0] * h.normal[1] - d[1] * h.normal[0]);
          near(n1 * Math.sin(rad(h.angle)), n2 * sinOut, 1e-9);
        }
      }
// 受光角兩側：恰在 θa 內導光、超過即逸出
const edge = build({ bend: 0 }).sample(0).acceptance;
assert.equal(build({ bend: 0, angle: Math.floor(edge * 2) / 2 }).ray.status, 'guided');
assert.equal(build({ bend: 0, angle: Math.ceil(edge * 2) / 2 }).ray.status, 'escaped');

// 3. 彎曲：沿軸射入（θ₀ = 0、中心）時，在圓弧外壁 sin φ = R/(R+a)，所有外壁碰撞角相同；
//    全反射條件 n₁R/(R+a) ≥ n₂ ⇔ R ≥ n₂a/(n₁ − n₂)
for (const [n1, n2] of [
  [1.49, 1.4],
  [1.5, 1.46],
  [1.7, 1.4]
]) {
  const Rmin = (n2 * a) / (n1 - n2);
  for (let R = 2; R <= 20; R += 0.5) {
    if (Math.abs(R - Rmin) < 1e-6) continue;
    const ray = build({ n1, n2, angle: 0, offset: 0, bend: 1, radius: R }).ray,
      expected = deg(Math.asin(R / (R + a)));
    count++;
    assert.ok(ray.hits.length > 0, 'axial ray must meet the outer wall in the bend');
    const arcHits = ray.hits.filter(h => h.point[1] < R && h.point[0] > 14 - 1e-9);
    near(arcHits[0].angle, expected, 1e-8);
    near(Math.hypot(arcHits[0].point[0] - 14, arcHits[0].point[1] - R), R + a, 1e-9);
    for (const h of arcHits) near(h.angle, expected, 1e-7);
    assert.equal(ray.hits[0].tir, R > Rmin, `R=${R} Rmin=${Rmin}`);
    if (R < Rmin) assert.equal(ray.status, 'escaped');
  }
}
const defaultFirst = build({ angle: 0 }).ray;
assert.equal(defaultFirst.status, 'guided');
assert.equal(build({ angle: 0, radius: 4 }).ray.status, 'escaped');

// 4. 每次碰壁：反射定律與全反射判定（彎曲、偏心、斜射的一般情形）
for (const radius of [3, 6, 12, 20])
  for (const angle of [5, 15, 25])
    for (const offset of [-0.8, 0.4]) {
      const ray = build({ radius, angle, offset }).ray;
      for (let i = 0; i < ray.hits.length; i++) {
        const h = ray.hits[i];
        if (!h.normal) continue;
        assert.equal(h.tir, 1.49 * Math.sin(rad(h.angle)) >= 1.4);
        const before = ray.segments.find(s => s.end === h.point),
          after = ray.segments[ray.segments.indexOf(before) + 1];
        const din = [(before.end[0] - before.start[0]) / before.length, (before.end[1] - before.start[1]) / before.length],
          dout = [(after.end[0] - after.start[0]) / after.length, (after.end[1] - after.start[1]) / after.length],
          ci = din[0] * h.normal[0] + din[1] * h.normal[1],
          co = dout[0] * h.normal[0] + dout[1] * h.normal[1];
        if (h.tir) {
          near(co, -ci, 1e-9);
          near(din[0] * h.normal[1] - din[1] * h.normal[0], dout[0] * h.normal[1] - dout[1] * h.normal[0], 1e-9);
        }
        count++;
      }
    }

// 5. 時間：每段 Δt = nL/c，總時間連續；樣本沿光路前進
const sim = build({});
for (const seg of sim.ray.segments) near(seg.t1 - seg.t0, (seg.length * 1e-3 * seg.n) / C, 1e-12);
for (let i = 1; i < sim.ray.segments.length; i++) near(sim.ray.segments[i].t0, sim.ray.segments[i - 1].t1, 1e-12);
near(sim.duration, sim.ray.segments.at(-1).t1, 1e-12);
assert.equal(sim.sample(0).reflections, 0);
assert.equal(sim.sample(sim.duration).reflections, sim.ray.hits.length);
near(sim.duration / sim.playbackScale, 6, 1e-12);

// 6. 包層不小於纖芯：沒有全反射，斜射光第一次碰壁就逸出
const bad = build({ n1: 1.45, n2: 1.55, angle: 10 });
assert.equal(bad.ray.status, 'escaped');
assert.equal(bad.sample(bad.duration).escaped, 1);
assert.equal(bad.sample(0).na, 0);

// 7. 參數邊界：讀值皆為有限數
for (const p of def.params)
  for (const v of [p.min, p.max]) {
    const s = build({ [p.id]: v });
    for (const t of [0, 0.5, 1]) {
      const q = s.sample(s.duration * t);
      for (const m of [...def.metrics, ...def.plotMetrics]) assert.ok(Number.isFinite(q[m.key]), `${p.id}=${v}: ${m.key}`);
    }
  }

// 8. 實驗頁：改參數、切換直／彎、全程繪製
const { domHarness } = require('./tools/dom-harness.cjs'),
  html = fs.readFileSync('mechanics.html', 'utf8'),
  { sandbox } = domHarness(html);
sandbox.assert = assert;
for (const m of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g))
  vm.runInContext(fs.readFileSync(m[1], 'utf8'), sandbox, { filename: m[1] });
vm.runInContext(
  `selectExperiment('optical-fiber', false);
  assert.equal(simulation.ray.status, 'guided');
  $('param-radius').value = 3; $('param-radius').listeners.input();
  assert.equal(params.radius, 3);
  for (const f of [0, .4, 1]) { t = f * simulation.duration; render(); }
  $('param-bend').value = 0; $('param-bend').listeners.input();
  $('param-angle').value = 45; $('param-angle').listeners.input();
  assert.equal(simulation.ray.status, 'escaped');
  $('param-n2').value = 1.65; $('param-n2').listeners.input();
  for (const f of [0, .5, 1]) { t = f * simulation.duration; render(); }`,
  sandbox
);
console.log(
  'PASS optical-fiber: θc, NA and acceptance; ' +
    count +
    ' traced cases — straight-fiber guiding iff sin θ₀ ≤ NA with exact wall angle and bounce count, bend outer-wall angle sin φ = R/(R+a) and R ≥ n₂a/(n₁−n₂), reflection law, c/n timing, n₂ ≥ n₁ leak and page controls.'
);
