'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'quantum-well');
const p = M.defaults(def);
const state = def.build(p);
const pure = def.build({...p, mix: 0});
assert.equal(state.waveAt(0,0).density,0);
assert.equal(state.waveAt(p.width,0).density,0);
assert.ok(Math.abs(pure.waveAt(.31,0).density-pure.waveAt(.31,3).density)<1e-12);
assert.notEqual(state.waveAt(.31,0).density,state.waveAt(.31,5).density);
for(const time of [0,2.5,5,7.5,10]){
  let integral=0;
  for(let i=0;i<1000;i++)integral+=state.waveAt(p.width*(i+.5)/1000,time).density*p.width/1000;
  assert.ok(Math.abs(integral-1)<1e-12);
}
assert.ok(Math.abs(def.build({...p,width:2*p.width}).sample(0).period/state.sample(0).period-4)<1e-12);
console.log('PASS quantum-well: boundaries, normalization, stationary density, interference and scaling');
