'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/circuit-rc.js');
const def = Mechanics.defs.find(d => d.id === 'circuit-rc');
const defaults = Mechanics.defaults(def);
const sim = overrides => def.build({ ...defaults, ...overrides });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} ≠ ${expected}`);

const { voltage, r1, r2, cMilli } = defaults;
const capacitance = cMilli / 1000;
const series = sim({ mode: 0 }).sample(2);
near(series.current, voltage / (r1 + r2));
near(series.i1, series.i2);
near(series.v1 + series.v2, voltage);
near(series.nodeVoltage, series.v2);
near(series.residual, 0);

const parallel = sim({ mode: 1 }).sample(2);
near(parallel.v1, voltage);
near(parallel.v2, voltage);
near(parallel.current, parallel.i1 + parallel.i2);
near(parallel.current, voltage / r1 + voltage / r2);
near(parallel.residual, 0);
assert.ok(parallel.equivalent < Math.min(r1, r2));

const charge = sim({ mode: 2 });
const discharge = sim({ mode: 3 });
const tau = r1 * capacitance;
near(charge.duration, 5 * tau);
near(charge.sample(0).nodeVoltage, 0);
near(discharge.sample(0).nodeVoltage, voltage);
near(charge.sample(tau).nodeVoltage, voltage * (1 - Math.exp(-1)));
near(discharge.sample(tau).nodeVoltage, voltage * Math.exp(-1));
for (const time of [0, tau / 10, tau, 5 * tau]) {
  const up = charge.sample(time);
  const down = discharge.sample(time);
  near(up.v1 + up.nodeVoltage, voltage);
  near(down.v1 + down.nodeVoltage, 0);
  near(up.current, -down.current);
  near(up.residual, 0);
  near(down.residual, 0);
  near(down.supplied, 0);
}
for (const mode of [0, 1, 2, 3]) {
  const open = sim({ mode, closed: 0 }).sample(2);
  near(open.current, 0);
  near(open.dissipated, 0);
  near(open.nodeVoltage, mode === 3 ? voltage : 0);
}
near(sim({ mode: 2, r1: r1 * 2 }).duration, 2 * charge.duration);
console.log('PASS: circuit KCL/KVL, equivalent resistance, RC time constants, open switch and energy balance');
