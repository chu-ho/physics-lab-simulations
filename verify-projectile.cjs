'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {domHarness}=require('./verify-mechanics.cjs'),html=fs.readFileSync('index.html','utf8'),{sandbox,ids}=domHarness(html);
ids.gravity.value='9.81';sandbox.window=sandbox;
vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],sandbox);
vm.runInContext(`
let count=0;
for(const v of [1,15,30])for(const angle of [0,30,45,90])for(const h of [0,10,20])for(const azimuth of [-180,-90,0,90,180])for(const g of [1.62,9.81]){
 const q=model(v,angle,h,g,azimuth),end=sample(q,q.T);
 if(!Number.isFinite(q.T)||Math.abs(end.y)>1e-7)throw Error('landing');
 const E0=.5*v*v+g*h;
 for(let i=0;i<=10;i++){const s=sample(q,q.T*i/10),E=.5*(s.vx*s.vx+s.vy*s.vy+s.vz*s.vz)+g*s.y;if(Math.abs(E-E0)>1e-7)throw Error('energy')}
 count++;
}
render();console.log('PASS: '+count+' original projectile cases; landing, energy and rendering.');
`,sandbox);
assert.ok(!html.includes('id="displacement"'));
