'use strict';
const assert=require('node:assert/strict');
const M=require('./mechanics-models.js');
const def=M.defs.find(d=>d.id==='rlc-resonance');
const defaults=M.defaults(def);
const at=f=>def.build({...defaults,frequency:f});
const f0=at(100).sample(0).resonance;
assert.ok(Math.abs(at(f0).sample(0).phaseDeg)<1e-10);
assert.ok(at(f0).sample(0).rms>at(f0*1.2).sample(0).rms);
assert.ok(at(f0*.8).sample(0).phaseDeg<0);
for(const t of [0,1,2,3]){
 const s=at(80).sample(t);
 assert.ok(Math.abs(s.voltage-s.voltageR-s.voltageL-s.voltageC)<1e-10);
}
console.log('PASS rlc-resonance');
