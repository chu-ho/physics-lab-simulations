'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/photoelectric.js');

const def = Mechanics.defs.find(d => d.id === 'photoelectric');
const defaults = Mechanics.defaults(def);
const sample = (parameters, t = 0) => def.build({ ...defaults, ...parameters }).sample(t);
const near = (actual, expected, error = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= error, `${actual} differs from ${expected}`);
const base = sample({});

near(base.maxEnergy, 2.2492344656);
near(base.stoppingVoltage, base.maxEnergy);
near(base.current, .2 * defaults.flux * 1.602176634);
const below = sample({ frequency: 300, flux: 20 });
assert.equal(below.emittedRate, 0);
assert.equal(below.current, 0);
assert.equal(sample({ frequency: base.cutoffFrequency }).current, 0);
const higherFrequency = sample({ frequency: 1500 });
assert.ok(higherFrequency.maxEnergy > base.maxEnergy);
near(higherFrequency.current, base.current);
const brighter = sample({ flux: 2 * defaults.flux });
near(brighter.current, 2 * base.current);
near(brighter.maxEnergy, base.maxEnergy);
near(sample({ flux: 0 }).current, 0);
const powerLow = sample({ intensityMode: 1, frequency: 1000 });
const powerHigh = sample({ intensityMode: 1, frequency: 1500 });
near(powerLow.incidentPower, defaults.power);
near(powerHigh.incidentPower, defaults.power);
near(powerHigh.current, powerLow.current * 2 / 3);
near(sample({ retarding: base.stoppingVoltage / 2 }).current, base.current / 2);
near(sample({ retarding: base.stoppingVoltage }).current, 0);
near(sample({ retarding: -2 }).current, base.current);
near(sample({ sweep: 1 }, 0).voltage, -2);
near(sample({ sweep: 1 }, 12).voltage, 8);
near(sample({ sweep: 1 }, 12).current, 0);
const diagram = def.build(defaults).positionPlot;
near(diagram.series[0].value(base.stoppingVoltage / 2), base.current / 2);
near(diagram.series[0].value(base.stoppingVoltage), 0);
for (const p of def.params) {
  for (const edge of [p.min, p.max]) {
    for (const t of [0, 6, 12]) {
      const state = sample({ [p.id]: edge }, t);
      for (const metric of [...def.metrics, ...def.plotMetrics]) {
        assert.ok(Number.isFinite(state[metric.key]), `${p.id} at ${edge}, t=${t}: ${metric.key}`);
      }
    }
  }
}
console.log('PASS photoelectric: threshold, energy, flux and power, stopping voltage, sweep and slider limits');
