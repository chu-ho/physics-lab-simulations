'use strict';
const assert = require('node:assert/strict');
const Mechanics = require('./mechanics-models.js');
require('./models/magnetic-induction.js');
const def = Mechanics.defs.find(d => d.id === 'magnetic-induction');
const defaults = Mechanics.defaults(def);
const sim = (overrides = {}) => def.build({ ...defaults, ...overrides });
const near = (actual, expected, tolerance = 1e-12) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
};

const forward = sim();
const midpoint = forward.duration / 2;
const center = forward.sample(midpoint);
near(center.x, 0);
near(center.emf, 0);
near(center.flux, 2 * Math.PI * 1e-7 * 120 / forward.radius);
const time = midpoint + .3;
const reference = forward.sample(time);
const dt = 1e-5;
const fluxDerivative = (forward.sample(time + dt).flux - forward.sample(time - dt).flux) / (2 * dt);
near(reference.emf, -defaults.turns * fluxDerivative, 1e-10);
assert.ok(reference.emf > 0);
near(forward.sample(midpoint - .3).emf, -reference.emf);
near(sim({ speed: -.5 }).sample(forward.duration - time).emf, -reference.emf);
near(sim({ speed: 1 }).sample(time / 2).emf, 2 * reference.emf);
near(sim({ turns: 200 }).sample(time).emf, 2 * reference.emf);
near(sim({ polarity: -1 }).sample(time).emf, -reference.emf);
near(sim({ speed: 0 }).sample(time).emf, 0);
for (const index of [0, 2]) {
  const peakTime = forward.events[index].t;
  const peak = Math.abs(forward.sample(peakTime).emf);
  assert.ok(peak > Math.abs(forward.sample(peakTime - .1).emf));
  assert.ok(peak > Math.abs(forward.sample(peakTime + .1).emf));
}
console.log('PASS: magnetic induction flux, Faraday derivative, signed reversals and extrema');
