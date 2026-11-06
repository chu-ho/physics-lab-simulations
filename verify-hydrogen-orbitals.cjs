'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'hydrogen-orbitals');
for(const orbital of [0,1,2]){
  const p={...M.defaults(def),orbital,population:1200};
  const state=def.build(p);
  assert.ok(Math.abs(state.radialIntegral-1)<1e-6);
  assert.deepEqual(state.samples,def.build(p).samples);
  assert.equal(state.sample(0).count,0);
  assert.equal(state.sample(10).count,1200);
  const radialMean=state.samples.reduce((sum,s)=>sum+Math.hypot(...s.point),0)/1200;
  assert.ok(Math.abs(radialMean-state.sample(10).meanRadius)<.3);
  if(orbital===1)assert.equal(state.positionPlot.series[0].value(2),0);
  if(orbital===2){
    const meanCos2=state.samples.reduce((sum,s)=>sum+(s.point[2]/Math.hypot(...s.point))**2,0)/1200;
    assert.ok(Math.abs(meanCos2-.6)<.04);
    assert.ok(state.samples.every(s=>s.negative===(s.point[2]<0)));
  }
}
console.log('PASS hydrogen-orbitals: normalized radial distributions, 2s node, 2p angular distribution and replay');
