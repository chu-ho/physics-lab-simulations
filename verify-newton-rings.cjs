'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/newton-rings.js');

const def = Mechanics.defs.find(d => d.id === 'newton-rings');
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const sample = (parameters, t = 0) => build(parameters).sample(t);
const near = (actual, expected, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} differs from ${expected}`);

// 獨立計算：兩道反射光的 Fresnel 振幅 r 與 −r，相位差 4πnt/λ（SI 單位）
const reflect = (n, t, lambda) => {
  const r = (1.52 - n) / (1.52 + n);
  return 4 * r * r * Math.sin((2 * Math.PI * n * t) / lambda) ** 2;
};
const sagExact = (R, r) => R - Math.sqrt(R * R - r * r);

// 1. 牛頓環：中心暗點，rₘ = √(mλR/n)，半徑比 1:2:3（m = 1, 4, 9）
for (const [R, lambda, n] of [
  [2, 589, 1],
  [5, 450, 1.33],
  [1, 700, 1.5]
]) {
  const b = build({ mode: 0, R, lambda, n });
  near(b.display(0), 0);
  for (const m of [1, 4, 9, 16]) {
    const rm = Math.sqrt((m * lambda * 1e-9 * R) / n) * 1e3; // mm
    if (rm <= b.span) {
      near(sample({ mode: 0, R, lambda, n, m }).rDark, rm, 1e-12);
      assert.ok(b.display(rm) < 1e-20, 'dark ring at r_m');
      // 精確球面厚度下，r_m 處的反射率仍接近零（近似誤差 ~ r²/R²）
      const exact = reflect(n, sagExact(R, rm * 1e-3), lambda * 1e-9) / reflect(n, (lambda * 1e-9) / (4 * n), lambda * 1e-9);
      assert.ok(exact < 1e-6, 'parabolic approximation is accurate: ' + exact);
    }
  }
  const r1 = sample({ mode: 0, R, lambda, n, m: 1 }).rDark;
  near(sample({ mode: 0, R, lambda, n, m: 4 }).rDark, 2 * r1);
  near(sample({ mode: 0, R, lambda, n, m: 9 }).rDark, 3 * r1);
}
// 外圈越密：間距 r_{m+1} − r_m 遞減；亮環在 2nt = (m+½)λ
const spacings = [1, 2, 5, 10].map(m => sample({ mode: 0, m }).spacing);
assert.ok(spacings.every((d, i) => i === 0 || d < spacings[i - 1]), 'rings get denser outward');
near(build({ mode: 0 }).display(Math.sqrt(1.5 * 589e-9 * 2) * 1e3), 1, 1e-12);
// 注入水：半徑縮為 1/√1.33
near(sample({ mode: 0, n: 1.33 }).rDark, sample({ mode: 0, n: 1 }).rDark / Math.sqrt(1.33), 1e-12);
// 暗環清單與視窗計數
const ringList = build({ mode: 0 }).darks;
near(ringList[0], 0);
assert.equal(ringList.length, Math.floor((5 ** 2 * 1e-6) / (589e-9 * 2)) + 1);
assert.equal(sample({ mode: 0 }).darkCount, ringList.length);

// 2. 楔形膜：xₘ = mλ/(2nα)、等距條紋 Δx = λ/(2nα)
for (const [wedge, lambda, n] of [
  [0.2, 589, 1],
  [1, 400, 1.5],
  [0.05, 700, 1.33]
]) {
  const dx = (lambda * 1e-9) / (2 * n * wedge * 1e-3) * 1e3; // mm
  for (const m of [1, 3, 7]) {
    const s = sample({ mode: 1, wedge, lambda, n, m });
    near(s.rDark, m * dx, 1e-12);
    near(s.spacing, dx, 1e-9);
  }
  const b = build({ mode: 1, wedge, lambda, n });
  near(b.display(0), 0);
  near(b.display(dx / 2), 1, 1e-12);
}

// 3. 透射光：與反射亮暗互補，中心為亮；暗紋在 2nt = (m − ½)λ
const tr = build({ mode: 0, view: 1 });
near(tr.display(0), 1);
for (const r of [0.3, 1.1, 2.7, 4.4]) near(tr.display(r) + build({ mode: 0 }).display(r), 1, 1e-12);
near(sample({ mode: 0, view: 1, m: 1 }).rDark, Math.sqrt(0.5 * 589e-9 * 2) * 1e3, 1e-12);
near(sample({ mode: 1, view: 1, m: 2 }).rDark, (1.5 * 589e-9) / (2 * 0.2e-3) * 1e3, 1e-12);
assert.equal(tr.darks[0] > 0, true, 'transmitted center is not dark');

// 4. 反射率與能量：R + T = 100%；n 接近玻璃時反射幾乎消失
for (const t of [0, 2.5, 7.3, 10]) {
  const s = sample({ mode: 0 }, t);
  near(s.reflectance + s.transmittance, 100, 1e-12);
  near(s.reflectance / 100, reflect(1, s.thickness * 1e-9, 589e-9), 1e-12);
}
near(build({ n: 1 }).peakReflectance, 100 * 4 * ((0.52 / 2.52) ** 2), 1e-12);
assert.ok(build({ n: 1.5 }).peakReflectance < 0.02, 'index-matched film barely reflects');

// 5. 掃描：探針由 0 到視窗邊緣，2nt/λ 與膜厚一致；圖表曲線即畫面亮度
near(sample({ mode: 0 }, 0).probe, 0);
near(sample({ mode: 0 }, 10).probe, 5);
near(sample({ mode: 1 }, 10).probe, 20);
const mid = sample({ mode: 0, R: 3, lambda: 500, n: 1.2 }, 6);
near(mid.thickness, ((mid.probe * 1e-3) ** 2 / (2 * 3)) * 1e9, 1e-12);
near(mid.pathRatio, (2 * 1.2 * mid.thickness) / 500, 1e-12);
const curve = build({ mode: 1 }).positionPlot.series[0].value;
near(curve(sample({ mode: 1 }, 4).probe), sample({ mode: 1 }, 4).intensity, 1e-12);

// 6. 邊界值皆為有限數
for (const p of def.params)
  for (const edge of [p.min, p.max])
    for (const t of [0, 5, 10]) {
      const state = sample({ [p.id]: edge }, t);
      for (const m of [...def.metrics, ...def.plotMetrics])
        assert.ok(Number.isFinite(state[m.key]), `${p.id}=${edge} t=${t}: ${m.key}`);
    }
console.log(
  'PASS newton-rings: dark center and r_m = √(mλR/n) (1:2:3 ratios, exact-sphere check), wedge spacing λ/(2nα), complementary transmission, Fresnel reflectance, scan and slider limits'
);
