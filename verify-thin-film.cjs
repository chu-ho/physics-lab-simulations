'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'thin-film');
function sample(params, wavelength) {
  return def.build({...M.defaults(def), ...params}).sample((wavelength - 380) / 40);
}
for (const polarized of [0, 1]) {
  const bare = sample({thickness: 0, polarized, substrateIndex: 1.5}, 550);
  assert.ok(Math.abs(bare.reflectance - 4) < 1e-10);
  const filmIndex = Math.sqrt(1.5);
  const coated = sample({filmIndex, substrateIndex: 1.5, thickness: 550 / (4 * filmIndex), polarized}, 550);
  assert.ok(coated.reflectance < 1e-10);
  assert.equal(coated.reflectance + coated.transmittance, 100);
}
console.log('PASS thin-film: bare interface, quarter-wave coating and energy balance');
