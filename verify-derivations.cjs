'use strict';
// 推導分頁：每題在預設值、各參數端點與中點、以及固定種子的隨機組合下，
// 非近似的推導結果都要和模擬讀數一致；每一步都要有標題、說明與有限數字的算式。
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
const { Derivations, derivationDiff } = require('./assets/derivations.js');

let seed = 20261123;
const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const snap = (p, v) => Math.min(p.max, Math.max(p.min, p.min + Math.round((v - p.min) / p.step) * p.step));
let configurations = 0,
  checks = 0;
const ids = Object.keys(Derivations);
assert.ok(ids.length >= 5, 'at least five derivations');
for (const id of ids) {
  const def = Mechanics.defs.find(d => d.id === id);
  assert.ok(def, 'derivation for missing experiment ' + id);
  const cases = [Mechanics.defaults(def)];
  for (const p of def.params)
    for (const v of [p.min, (p.min + p.max) / 2, p.max]) cases.push({ ...Mechanics.defaults(def), [p.id]: snap(p, v) });
  for (let i = 0; i < 40; i++)
    cases.push(Object.fromEntries(def.params.map(p => [p.id, snap(p, p.min + random() * (p.max - p.min))])));
  for (const params of cases) {
    const result = Derivations[id](params, def.build(params));
    configurations++;
    assert.ok(result.steps.length >= 3, id + ' needs at least three steps');
    for (const step of result.steps) {
      assert.ok(step.title && step.text && step.math, id + ' incomplete step');
      assert.ok(!/NaN|Infinity|undefined/.test(step.math + step.text), id + ' bad number in ' + step.title);
    }
    assert.ok(result.checks.length >= 1, id + ' needs a check');
    for (const check of result.checks) {
      assert.ok(Number.isFinite(check.derived) && Number.isFinite(check.simulated), id + ' nonfinite ' + check.label);
      if (check.approx) continue;
      checks++;
      const diff = derivationDiff(check);
      assert.ok(
        diff <= check.tolerance,
        `${id} ${check.label}: derived ${check.derived} vs simulated ${check.simulated} (${diff}) at ${JSON.stringify(params)}`
      );
    }
  }
}
// 單擺：小角近似在 5° 幾乎吻合、在大角度明顯偏短，確認「近似」列真的在教差異。
const pendulum = Mechanics.defs.find(d => d.id === 'pendulum');
const period = angle => {
  const params = { ...Mechanics.defaults(pendulum), angle };
  const c = Derivations.pendulum(params, pendulum.build(params)).checks.find(c => c.approx);
  return c.simulated / c.derived - 1;
};
assert.ok(period(5) < 0.001, 'small-angle period should match at 5°');
assert.ok(period(90) > 0.15, 'large-angle period should be clearly longer');
console.log(
  `PASS derivations: ${ids.length} experiments, ${configurations} parameter configurations, ${checks} derived-vs-simulated checks, small-angle period contrast.`
);
