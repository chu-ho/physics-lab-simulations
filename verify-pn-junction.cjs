'use strict';
const assert=require('node:assert/strict');
const M=require('./mechanics-models.js');
const def=M.defs.find(d=>d.id==='pn-junction');
const p=M.defaults(def);
const build=bias=>def.build({...p,bias});
const neutral=build(0).sample(8);
const forward=build(.35).sample(8);
const reverse=build(-1).sample(8);
assert.equal(neutral.current,0);
assert.ok(reverse.width>neutral.width && neutral.width>forward.width);
assert.ok(reverse.current<0 && forward.current>0);
assert.ok(Math.abs(p.acceptor*reverse.left-p.donor*reverse.right)<1e-12);
assert.ok(Math.abs(neutral.barrier-forward.barrier-.35)<1e-12);
const sim=build(.35);
for(const t of [0,4,8]){
  const s=sim.sample(t);
  const pSide=sim.bandAt(-s.left,s),middle=sim.bandAt(0,s),nSide=sim.bandAt(s.right,s);
  assert.equal(nSide.valence,0);
  assert.equal(pSide.valence,s.barrier);
  assert.ok(pSide.valence>middle.valence && middle.valence>nSide.valence);
  assert.ok(Math.abs(middle.conduction-middle.valence-1.12)<1e-12);
  assert.ok(Math.abs(sim.bandAt(-1e-9,s).valence-middle.valence)<1e-7);
}
console.log('PASS pn-junction: bias, depletion widths, charge balance and current signs');
