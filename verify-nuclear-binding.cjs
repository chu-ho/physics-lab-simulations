'use strict';
const assert=require('node:assert/strict');
const M=require('./mechanics-models.js');
const def=M.defs.find(d=>d.id==='nuclear-binding');
const defaults=M.defaults(def);
for(const mode of [0,1]){
  const sim=def.build({...defaults,mode});
  const b=sim.balance;
  assert.equal(b.protonsBefore,b.protonsAfter);
  assert.equal(b.nucleonsBefore,b.nucleonsAfter);
  assert.equal(sim.sample(0).shownRelease,0);
  const q=sim.sample(6).shownRelease;
  const expected=mode?173.3:17.59;
  assert.ok(Math.abs(q-expected)<.15, 'unexpected Q: '+q);
  const sum=indexes=>indexes.reduce((total,index)=>total+sim.nuclides[index].binding,0);
  assert.ok(Math.abs(sum(sim.reaction.after)-sum(sim.reaction.before)-q)<1e-8);
}
assert.ok(Math.abs(def.build(defaults).sample(0).bindingPerA-8.79)<.01);
console.log('PASS nuclear-binding: nuclide counts, reaction Q values and binding-energy balance');
