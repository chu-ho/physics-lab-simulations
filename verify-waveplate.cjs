'use strict';
// 雙折射波片的獨立驗證：用另寫的 2×2 複數 Jones 矩陣與實數時間取樣核對模型。
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/waveplate.js');

const def = Mechanics.defs.find(d => d.id === 'waveplate');
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const sample = (parameters, t = 0) => build(parameters).sample(t);
const near = (actual, expected, tol = 1e-9, what = '') =>
  assert.ok(Math.abs(actual - expected) <= tol, `${what} ${actual} differs from ${expected}`);
const rad = d => (d * Math.PI) / 180;

// ---- 獨立 Jones 計算：矩陣 W = R(−α)·diag(1, e^{−iΓ})·R(α) ----
const C = (re, im = 0) => ({ re, im });
const cmul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cadd = (a, b) => C(a.re + b.re, a.im + b.im);
const matVec = (m, v) => [cadd(cmul(m[0][0], v[0]), cmul(m[0][1], v[1])), cadd(cmul(m[1][0], v[0]), cmul(m[1][1], v[1]))];
const matMul = (a, b) =>
  [0, 1].map(i => [0, 1].map(j => cadd(cmul(a[i][0], b[0][j]), cmul(a[i][1], b[1][j]))));
const rot = th => [
  [C(Math.cos(th)), C(Math.sin(th))],
  [C(-Math.sin(th)), C(Math.cos(th))]
]; // 實驗室座標 → (快, 慢) 座標
const plateMatrix = (alpha, gamma) =>
  matMul(rot(-alpha), matMul([[C(1), C(0)], [C(0), C(Math.cos(gamma), -Math.sin(gamma))]], rot(alpha)));
const outJones = (thp, alpha, gamma) => matVec(plateMatrix(rad(alpha), gamma), [C(Math.cos(rad(thp))), C(Math.sin(rad(thp)))]);
const intensity = (J, tha) => {
  const u = [Math.cos(rad(tha)), Math.sin(rad(tha))];
  const a = cadd(cmul(J[0], C(u[0])), cmul(J[1], C(u[1])));
  return 100 * (a.re * a.re + a.im * a.im);
};
// 以實數時間取樣得到偏振橢圓：E(t) = Re[Ẽ e^{iωt}]
const traceEllipse = J => {
  let rmax = 0,
    rmin = Infinity,
    angAtMax = 0,
    turn = 0;
  const N = 3600;
  for (let i = 0; i < N; i++) {
    const wt = (2 * Math.PI * i) / N;
    const ey = J[0].re * Math.cos(wt) - J[0].im * Math.sin(wt),
      ez = J[1].re * Math.cos(wt) - J[1].im * Math.sin(wt),
      dey = -J[0].re * Math.sin(wt) - J[0].im * Math.cos(wt),
      dez = -J[1].re * Math.sin(wt) - J[1].im * Math.cos(wt),
      r = Math.hypot(ey, ez);
    if (r > rmax) [rmax, angAtMax] = [r, ((Math.atan2(ez, ey) * 180) / Math.PI + 360) % 180];
    rmin = Math.min(rmin, r);
    turn += ey * dez - ez * dey; // > 0：y→z（迎著來光逆時針）
  }
  return { ratio: rmin / rmax, angle: angAtMax, handed: Math.abs(turn / N) < 1e-9 ? 0 : Math.sign(turn) };
};

// 1. 相位差 Δφ = 2πΔn·d/λ（mode 1）與 mode 0 的延遲換算
near(sample({ mode: 1, thickness: 16, dn: 0.0092, wavelength: 589 }).deltaPhi, (2 * Math.PI * 0.0092 * 16e-6) / 589e-9, 1e-12, 'Δφ');
near(sample({ mode: 1, thickness: 32, dn: 0.0092, wavelength: 589 }).deltaPhi, 2 * sample({ mode: 1, thickness: 16 }).deltaPhi, 1e-12, 'Δφ ∝ d');
near(sample({ mode: 1, thickness: 50, dn: 0.01, wavelength: 500 }).waves, 1, 1e-12, 'full-wave plate');
near(sample({ mode: 0, retard: 0.5 }).deltaPhi, Math.PI, 1e-12, 'λ/2');
near(sample({ mode: 0, retard: 0.25, dn: 0.0092, wavelength: 589 }).thicknessUm, (0.25 * 0.589) / 0.0092, 1e-9, 'λ/4 thickness');

// 2. λ/4 片把 45° 線偏振變成圓偏振；−45° 入射旋向相反；任何檢偏角強度皆為 50%
for (const [thp, handed] of [[45, 1], [135, -1]]) {
  const b = build({ polarizer: thp, fastAxis: 0, mode: 0, retard: 0.25 });
  near(b.sample(0).ellipticity, 1, 1e-9, 'circular b/a');
  assert.equal(b.sample(0).handed, handed);
  assert.match(b.typeName, /^圓偏振/);
  assert.equal(traceEllipse(outJones(thp, 0, Math.PI / 2)).handed, handed);
  for (let tha = 0; tha <= 180; tha += 15) near(build({ polarizer: thp, fastAxis: 0, retard: 0.25, analyzer: tha }).sample(0).output, 50, 1e-9, 'circular I');
  // 圓偏振：|E| 在一個週期內恆定
  for (let t = 0; t <= 2; t += 0.1) near(Math.hypot(b.sample(t).Ey, b.sample(t).Ez), Math.SQRT1_2, 1e-9, '|E| const');
}
// 預設情境（45°、快軸 0°、0.25 λ）即為逆時針圓偏振
assert.equal(build({}).typeName, '圓偏振（逆時針）');

// 3. λ/2 片使線偏振鏡射到 2α − θₚ，b/a = 0，且在該角度最亮、垂直時消光
for (const [thp, alpha] of [[0, 30], [45, 0], [10, 50], [90, 20], [60, 75]]) {
  const b = build({ polarizer: thp, fastAxis: alpha, retard: 0.5 });
  const s = b.sample(0),
    expected = (((2 * alpha - thp) % 180) + 180) % 180;
  near(s.ellipticity, 0, 1e-9, 'λ/2 linear');
  assert.equal(b.typeName, '線偏振');
  const diff = Math.abs(s.orientation - expected);
  assert.ok(Math.min(diff, 180 - diff) < 1e-7, `λ/2 orientation ${s.orientation} vs ${expected}`);
  near(build({ polarizer: thp, fastAxis: alpha, retard: 0.5, analyzer: expected }).sample(0).output, 100, 1e-9, 'λ/2 bright');
  near(b.outputAt(expected + 90), 0, 1e-9, 'λ/2 extinction');
}

// 4. 一般情況：模型 = 獨立 Jones 矩陣 = 封閉公式；橢圓率、方位與旋向 = 時間取樣
const closed = (thp, a, g, tha) =>
  100 *
  (Math.cos(rad(tha - thp)) ** 2 - Math.sin(rad(2 * (thp - a))) * Math.sin(rad(2 * (tha - a))) * Math.sin(g / 2) ** 2);
for (const thp of [0, 20, 45, 110, 165])
  for (const alpha of [0, 15, 45, 80, 135])
    for (const retard of [0, 0.1, 0.25, 0.37, 0.5, 0.75, 0.9]) {
      const g = 2 * Math.PI * retard,
        J = outJones(thp, alpha, g),
        b = build({ polarizer: thp, fastAxis: alpha, retard }),
        s = b.sample(0);
      for (const tha of [0, 30, 90, 125, 180]) {
        near(b.outputAt(tha), intensity(J, tha), 1e-9, 'Jones I');
        near(b.outputAt(tha), closed(thp, alpha, g, tha), 1e-9, 'closed-form I');
      }
      near(b.jones.Ey[0], J[0].re, 1e-12); near(b.jones.Ey[1], J[0].im, 1e-12);
      near(b.jones.Ez[0], J[1].re, 1e-12); near(b.jones.Ez[1], J[1].im, 1e-12);
      const tr = traceEllipse(J);
      near(s.ellipticity, tr.ratio, 2e-5, 'b/a');
      if (tr.ratio < 0.99) {
        const d = Math.abs(s.orientation - tr.angle);
        assert.ok(Math.min(d, 180 - d) < 0.2, `orientation ${s.orientation} vs ${tr.angle}`);
      }
      if (tr.ratio > 1e-4) assert.equal(s.handed, tr.handed, 'handedness');
      // 能量守恆：無吸收波片，總強度不變；互相垂直的兩個檢偏角強度和 = 100%
      near(b.outputAt(37) + b.outputAt(127), 100, 1e-9, 'I(θ)+I(θ+90°)');
      // 時間取樣的出射電場 = Re[Ẽ e^{iωt}]
      for (const t of [0, 0.3, 1.1]) {
        const wt = (2 * Math.PI * t) / b.period,
          st = b.sample(t);
        near(st.Ey, J[0].re * Math.cos(wt) - J[0].im * Math.sin(wt), 1e-9, 'Ey(t)');
        near(st.Ez, J[1].re * Math.cos(wt) - J[1].im * Math.sin(wt), 1e-9, 'Ez(t)');
      }
    }

// 5. 特例：快軸與起偏方向平行或垂直時偏振態不變；Δφ = 0 或 2π 等同無波片（馬呂斯定律）
for (const retard of [0.13, 0.25, 0.5, 0.8]) {
  for (const alpha of [30, 120]) {
    const s = sample({ polarizer: 30, fastAxis: alpha, retard });
    near(s.ellipticity, 0, 1e-9, 'eigen-polarization');
    near(s.orientation, 30, 1e-7, 'eigen orientation');
  }
}
for (const retard of [0, 1])
  for (const tha of [0, 40, 95]) near(build({ polarizer: 25, fastAxis: 70, retard, analyzer: tha }).sample(0).output, 100 * Math.cos(rad(tha - 25)) ** 2, 1e-9, 'Malus');
// 偏振態分類
assert.equal(build({ polarizer: 45, fastAxis: 0, retard: 0.1 }).typeName, '橢圓偏振（逆時針）');
assert.equal(build({ polarizer: 45, fastAxis: 0, retard: 0.6 }).typeName, '橢圓偏振（順時針）');
assert.equal(build({ polarizer: 45, fastAxis: 0, retard: 0.75 }).typeName, '圓偏振（順時針）');

// 6. 拉桿邊界值皆為有限數
for (const p of def.params)
  for (const edge of [p.min, p.max])
    for (const t of [0, 7, 20]) {
      const state = sample({ [p.id]: edge }, t);
      for (const m of [...def.metrics, ...def.plotMetrics]) assert.ok(Number.isFinite(state[m.key]), `${p.id}=${edge} t=${t}: ${m.key}`);
    }
console.log('PASS waveplate: Δφ = 2πΔn·d/λ, λ/4 turns 45° linear into circular, λ/2 mirrors linear to 2α − θp, Jones matrix and closed-form intensity, ellipse/handedness by time sampling, eigen-polarizations and slider limits');
