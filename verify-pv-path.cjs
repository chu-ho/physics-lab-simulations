'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/pv-path.js');
const def = Mechanics.defs.find(d => d.id === 'pv-path');
const defaults = Mechanics.defaults(def);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9,
  `Expected ${expected}, got ${actual}`);

for (const isothermal of [0, 1]) {
  for (const cycle of [0, 1]) {
    for (const [v0, v1, p0, p1] of [[2, 4, 100, 150], [5, 1, 250, 50], [1, 5, 250, 50], [2, 2, 100, 200]]) {
      const sim = def.build({...defaults, v0, v1, p0, p1, isothermal, cycle});
      const final = sim.sample(sim.duration);
      const sharedEnd = sim.sample(cycle ? sim.duration / 2 : sim.duration);
      const workA = p0 * (v1 - v0);
      const workB = isothermal ? p0 * v0 * Math.log(v1 / v0) : p1 * (v1 - v0);
      const deltaU = 1.5 * (p1 * v1 - p0 * v0);
      for (const gas of [sharedEnd.left, sharedEnd.right]) {
        close(gas.v, v1);
        close(gas.p, p1);
        close(gas.deltaU, deltaU);
      }
      close(sharedEnd.workA, workA);
      close(sharedEnd.workB, workB);
      if (cycle) {
        for (const gas of [final.left, final.right]) {
          close(gas.v, v0);
          close(gas.p, p0);
          close(gas.deltaU, 0);
          close(gas.heat, gas.work);
        }
        close(final.workA, workA - workB);
        close(final.workB, workB - workA);
      }
      for (const side of ['left', 'right']) {
        let prev = sim.sample(0)[side];
        let work = 0;
        for (let i = 1; i <= 3200; i++) {
          const gas = sim.sample(sim.duration * i / 3200)[side];
          close(gas.deltaU, gas.heat - gas.work);
          assert.ok(gas.p > 0 && gas.v > 0 && gas.temperature > 0);
          work += (prev.p + gas.p) * (gas.v - prev.v) / 2;
          prev = gas;
        }
        assert.ok(Math.abs(work - final[side].work) < .03,
          'trapezoidal quadrature of P dV agrees with analytical work');
      }
    }
  }
}

console.log('PASS: P–V paths, signed work, common endpoints and closed-cycle first law.');
