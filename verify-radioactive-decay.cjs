'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'radioactive-decay');
const sample = (params, t) => def.build({...M.defaults(def), ...params}).sample(t);
assert.equal(sample({},0).remaining,100);
assert.equal(sample({},5).expected,50);
assert.equal(sample({},10).expected,25);
assert.deepEqual(sample({},7),sample({},7));
let previous = 100;
for (let time=0;time<=25;time+=.25) {
 const state=sample({},time);
 assert.ok(state.remaining<=previous);
 assert.equal(state.remaining+state.decayed,100);
 previous=state.remaining;
}
console.log('PASS radioactive-decay');
