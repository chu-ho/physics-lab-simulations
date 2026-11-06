'use strict';
const assert=require('node:assert/strict');
const M=require('./mechanics-models.js');
const def=M.defs.find(d=>d.id==='carnot-engine');
const defaults=M.defaults(def);
const sim=def.build(defaults), initial=sim.sample(0), end=sim.sample(12);
assert.ok(Math.abs(end.volume-initial.volume)<1e-12);
assert.ok(Math.abs(end.pressure-initial.pressure)<1e-12);
assert.ok(Math.abs(end.work/sim.heatIn-end.efficiency/100)<1e-12);
assert.equal(sim.sample(4).heat,sim.sample(5).heat);
assert.ok(Math.abs(sim.sample(4).temperature*sim.sample(4).volume**.4-sim.sample(5).temperature*sim.sample(5).volume**.4)<1e-8);
let area=0;
for(let i=1;i<=1200;i++){
 const a=sim.sample((i-1)/100),b=sim.sample(i/100);
 area+=(b.volume-a.volume)*(b.pressure+a.pressure)/2;
}
assert.ok(Math.abs(area-end.work)<.001);
console.log('PASS carnot-engine');
