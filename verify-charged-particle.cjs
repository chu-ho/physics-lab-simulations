'use strict';
const assert=require('node:assert/strict');
const M=require('./mechanics-models.js');
const def=M.defs.find(d=>d.id==='charged-particle');
const p=M.defaults(def);
const run=overrides=>def.build({...p,...overrides});
const positive=run({});
const negative=run({sign:-1});
assert.equal(run({angle:0}).sample(4).radius,0);
assert.equal(run({angle:90}).sample(4).y,0);
for(const t of [0,2.5,5,7.5,10]){
  const s=positive.sample(t);
  assert.equal(s.z,-negative.sample(t).z);
  assert.ok(Math.abs(Math.hypot(s.vx,s.vy,s.vz)-p.speed*1000)<1e-10);
  assert.ok(Math.abs(s.forceX*s.vx+s.forceZ*s.vz)<1e-20);
}
const end=positive.sample(10);
assert.ok(Math.hypot(end.x,end.z)<1e-12);
assert.ok(Math.abs(end.y-end.pitch)<1e-12);
assert.equal(run({field:2*p.field}).sample(0).radius,end.radius/2);
console.log('PASS charged-particle: speed, no magnetic work, charge reversal, pitch and radius');
