'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/em-wave.js');

const def = Mechanics.defs.find(d => d.id === 'em-wave');
const defaults = Mechanics.defaults(def);
const build = parameters => def.build({ ...defaults, ...parameters });
const sample = (parameters, t = 0) => build(parameters).sample(t);
const near = (actual, expected, rel = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= rel * Math.max(1e-12, Math.abs(expected)), `${actual} differs from ${expected}`);
const c = 299792458, eps0 = 8.8541878128e-12, mu0 = 4e-7 * Math.PI; // mu0 近似值，獨立於模型的 1/(ε0c²)

// 1. c = fλ、週期；頻率加倍則波長減半
near(sample({ frequency: 100 }).wavelength, c / 1e8);
near(sample({ frequency: 200 }).wavelength, sample({ frequency: 100 }).wavelength / 2);
near(sample({ frequency: 100 }).period, 10);
near(sample({ frequency: 300 }).wavelength * 300e6, c);

// 2. 場在每個時空點：E ⊥ B ⊥ x，|E|/|B| = c，E×B 指向 +x
for (const polarization of [0, 1, 2])
  for (const angle of [0, 35, 90, 135]) {
    const b = build({ polarization, angle, amplitude: 40 });
    for (const x of [0, 1.7, 5.25, 12])
      for (const t of [0, 3.3, 11.1]) {
        const f = b.field(x, t * b.timeScale);
        const E = [0, f.Ey, f.Ez], B = [0, f.By, f.Bz];
        assert.ok(Math.abs(E[1] * B[1] + E[2] * B[2]) < 1e-18 * 40, 'E·B = 0');
        if (Math.hypot(E[1], E[2]) > 1e-9) near(Math.hypot(E[1], E[2]) / Math.hypot(B[1], B[2]), c, 1e-9);
        const Sx = (E[1] * B[2] - E[2] * B[1]) / mu0; // (E×B)_x
        assert.ok(Sx >= -1e-12, 'Poynting vector along +x');
      }
  }

// 3. 行進：場在 (x, t) 與 (x + cΔt, t + Δt) 相同；空間週期為 λ
const wave = build({ polarization: 0, angle: 30 });
for (const [x, t] of [[1, 0], [4, 3e-9], [7, 8e-9]]) {
  const dt = 0.37e-9, a = wave.field(x, t), b = wave.field(x + c * dt, t + dt);
  near(b.Ey, a.Ey, 1e-6); near(b.Bz, a.Bz, 1e-6);
  const s = wave.field(x + wave.lambda, t);
  near(s.Ey, a.Ey, 1e-6);
}

// 4. 振幅與偏振：B₀ = E₀/c；線偏振的 E 沿所選方向；圓偏振 |E| 恆定且轉向正確
near(sample({ amplitude: 60, probe: 0 }).B, (60 / c) * 1e9, 1e-9); // x=0, t=0 時 η=0，E 最大
near(sample({ amplitude: 120 }, 0).E, 2 * sample({ amplitude: 60 }, 0).E);
const lin = build({ polarization: 0, angle: 90, probe: 0 }); // η = ωt
const peak = lin.field(0, 0);
assert.ok(Math.abs(peak.Ey) < 1e-9);
near(peak.Ez, 60, 1e-9);
assert.ok(Math.abs(peak.Bz) < 1e-12);
near(peak.By, -60 / c, 1e-9); // E 沿 z 時 B = x̂×E/c 沿 −y
for (const polarization of [1, 2]) {
  const cp = build({ polarization, probe: 2 });
  for (let t = 0; t <= 20; t += 1.7) near(cp.sample(t).E, 60, 1e-9);
  // 在觀察點，Ez 在 η = π/2 的符號 = 逆時針為正
  const quarter = (Math.PI / 2) / (2 * Math.PI * 100e6);
  const probeX = 0; // η = ωt
  const f = build({ polarization, probe: probeX }).field(probeX, quarter);
  assert.equal(Math.sign(f.Ez), polarization === 1 ? 1 : -1);
}

// 5. 能流：時間平均 S = ½ε₀cE₀²（線偏振）、ε₀cE₀²（圓偏振，|E| = E₀）
for (const [polarization, factor] of [[0, 0.5], [1, 1], [2, 1]]) {
  const b = build({ polarization, amplitude: 80 });
  let sum = 0;
  const N = 2000, T = 1e-8;
  for (let i = 0; i < N; i++) sum += b.sample(((i + 0.5) / N) * (T / b.timeScale)).poynting;
  near(sum / N, factor * eps0 * c * 80 * 80, 1e-3);
}
near(sample({}).ratio, c / 1e8, 1e-9);

// 6. 邊界值皆為有限數
for (const p of def.params)
  for (const edge of [p.min, p.max])
    for (const t of [0, 10, 20]) {
      const state = sample({ [p.id]: edge }, t);
      for (const m of [...def.metrics, ...def.plotMetrics])
        assert.ok(Number.isFinite(state[m.key]), `${p.id}=${edge} t=${t}: ${m.key}`);
    }
console.log('PASS em-wave: c = fλ, E/B = c, E⊥B⊥k and E×B direction, travelling-wave shift, polarization, mean Poynting flux and slider limits');
