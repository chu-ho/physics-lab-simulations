'use strict';
const assert=require('node:assert/strict');
const M=require('./mechanics-models.js');
const def=M.defs.find(d=>d.id==='rutherford-scattering');
const defaults=M.defaults(def);
const sim=def.build(defaults);
for(let time=0;time<=10;time+=.25){
  const {concentrated,diffuse}=sim.sample(time);
  assert.ok(Math.abs(concentrated.energy-defaults.energy)<1e-6);
  assert.ok(Math.abs(diffuse.energy-defaults.energy)<1e-6);
}
const end=sim.sample(10);
assert.ok(Math.abs(end.nucleusAngle-end.rutherfordAngle)<5);
assert.ok(end.nucleusAngle>end.cloudAngle);
const central=def.build({...defaults,impact:0,energy:12,cloudRadius:140}).sample(10);
assert.equal(Math.abs(central.nucleusAngle),180);
assert.equal(central.cloudAngle,0);
console.log('PASS rutherford-scattering: conserved energy, large-angle scattering and diffuse-charge comparison');
