'use strict';
// 電動勢、歐姆定律與電功率：KVL、能量收支、串並聯等效、R=r 最大功率傳輸、斷路端電壓。
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'emf-power');
const base = M.defaults(def);
const run = overrides => def.build({ ...base, ...overrides });
const near = (a, b, tol = 1e-10) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} ≠ ${b}`);

let cases = 0;
for (const mode of [0, 1, 2])
  for (const emf of [1.5, 6, 12])
    for (const internal of [0, 0.7, 4])
      for (const load of [0.5, 3, 20]) {
        const sim = run({ mode, emf, internal, load });
        const outside = [load, 2 * load, load / 2][mode];
        for (const t of [0, 3.7, 10]) {
          const s = sim.sample(t);
          // 歐姆定律與 KVL：ε = I(R外 + r)，端電壓 = IR外 = ε − Ir
          near(s.current * (outside + internal), emf);
          near(s.terminalVoltage, s.current * outside);
          near(s.terminalVoltage + s.current * internal, emf);
          // 功率收支：εI = I²R外 + I²r，且燈泡功率總和 = 負載功率
          near(s.totalPower, s.loadPower + s.internalPower);
          near((mode === 0 ? 1 : 2) * s.bulbPower, s.loadPower);
          near(s.bulbPower, s.bulbVoltage ** 2 / load);
          // 能量累積：W = Pt，電荷 Q = It
          near(s.supplied, s.loadEnergy + s.internalEnergy);
          near(s.charge, s.current * t);
          near(s.loadEnergy, s.loadPower * t);
          assert.ok(s.terminalVoltage <= emf + 1e-12 && s.efficiency <= 100 + 1e-9);
        }
        cases++;
      }

// 串聯每燈電流相同、並聯每燈電壓相同；同燈泡下並聯每燈較亮（r>0）
const one = run({ mode: 0 }).sample(1),
  series = run({ mode: 1 }).sample(1),
  parallel = run({ mode: 2 }).sample(1);
near(series.bulbCurrent, series.current);
near(parallel.bulbVoltage, parallel.terminalVoltage);
assert.ok(parallel.bulbPower > series.bulbPower && one.bulbPower > series.bulbPower);
// 理想電源（r=0）時並聯每燈功率與單燈相同
near(run({ mode: 2, internal: 0 }).sample(0).bulbPower, run({ mode: 0, internal: 0 }).sample(0).bulbPower);

// 最大功率傳輸：以細密掃描找出負載功率最大值，應在 R外 = r，且等於 ε²/4r，效率 50%
for (const internal of [0.6, 1, 2.5, 4]) {
  let bestLoad = 0,
    bestPower = -1;
  for (let R = 0.5; R <= 20 + 1e-9; R += 0.001) {
    const s = run({ mode: 0, internal, load: R }).sample(0);
    if (s.loadPower > bestPower) [bestLoad, bestPower] = [R, s.loadPower];
  }
  near(bestLoad, internal, 1e-3);
  near(bestPower, base.emf ** 2 / (4 * internal), 1e-6);
  near(run({ mode: 0, internal, load: internal }).sample(0).efficiency, 50);
  near(run({ mode: 0, internal }).maximumLoadPower, base.emf ** 2 / (4 * internal));
}
// 功率—外電阻曲線與模型讀值一致
const curve = run({ mode: 1, load: 3.2 });
const s = curve.sample(4);
const [loadCurve, lossCurve, totalCurve] = curve.positionPlot.series;
near(loadCurve.value(s.external), s.loadPower);
near(lossCurve.value(s.external), s.internalPower);
near(totalCurve.value(s.external), s.totalPower);
assert.ok(curve.positionPlot.min <= s.external && s.external <= curve.positionPlot.max);

// 斷路：電流為零，端電壓等於電動勢，沒有能量轉換
for (const mode of [0, 1, 2]) {
  const open = run({ mode, closed: 0 }).sample(6);
  near(open.current, 0);
  near(open.terminalVoltage, base.emf);
  near(open.supplied, 0);
  near(open.bulbPower, 0);
}
// 短路極限：外電阻趨近零時電流趨近 ε/r
near(run({ mode: 2, load: 0.5, internal: 4 }).sample(0).current, base.emf / 4.25);

for (const p of def.params) assert.ok(p.value >= p.min && p.value <= p.max);
for (const key of [...def.metrics, ...def.plotMetrics].map(m => m.key))
  for (const t of [0, 5, 10]) assert.ok(Number.isFinite(run({ internal: 0 }).sample(t)[key]), key);
console.log(`PASS emf-power: KVL/Ohm in ${cases} cases, power balance, series/parallel bulbs, max power at R=r, open circuit`);
