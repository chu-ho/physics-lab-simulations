'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/moving-atwood.js');
const d=M.defs.find(d=>d.id==='moving-atwood'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`),names=['A','B','C','D'];
let count=0;
for(const masses of [[5,3,3,2],[1,1,1,1],[1,8,8,1],[8,1,1,1],[1,1,1,8],[8,8,8,8]])for(const supportA of [-9.81,-6,0,5]){
 const p={...M.defaults(d),...Object.fromEntries(names.map((n,i)=>['m'+n,masses[i]])),supportA},sim=d.build(p),first=sim.sample(0);assert.ok(sim.duration>0&&sim.duration<=8);count++;
 for(let j=0;j<=50;j++){
  const t=sim.duration*j/50,s=sim.sample(t);near(s.ropeTop,first.ropeTop);near(s.ropeLeft,first.ropeLeft);near(s.ropeRight,first.ropeRight);near(s.aA+s.aB,2*s.aLeft);near(s.aC+s.aD,2*s.aRight);near(s.aLeft+s.aRight,2*supportA);near(s.upperTension,2*s.tension);near(s.supportForce,2*s.upperTension);assert.ok(s.tension>=0);near(s.E-first.E,s.supportWork,2e-6);
  names.forEach((n,i)=>{near(s.tension-masses[i]*9.81,masses[i]*s['a'+n]);near(s['f'+n],masses[i]*s['a'+n]);near(s['vRel'+n],s['v'+n]-s.supportV);near(s['aRel'+n],s['a'+n]-supportA);assert.ok(s['y'+n]>=.3-1e-8);assert.ok((i<2?s.leftY:s.rightY)-s['y'+n]>=.85-1e-8)});
  assert.ok(s.supportY-s.leftY>=2.75-1e-8);assert.ok(s.supportY-s.rightY>=2.75-1e-8);
  if(j>0&&j<50){const h=1e-5,l=sim.sample(t-h),r=sim.sample(t+h);names.forEach(n=>{near((r['y'+n]-l['y'+n])/(2*h),s['v'+n],2e-6);near((r['v'+n]-l['v'+n])/(2*h),s['a'+n],2e-6)})}
 }
 assert.deepEqual(sim.sample(-1),first);assert.deepEqual(sim.sample(sim.duration+1),sim.sample(sim.duration));
 if(supportA===-9.81){near(first.tension,0);names.forEach(n=>{near(first['a'+n],-9.81);near(first['aRel'+n],0)});near(sim.duration,Math.sqrt(2*(4.5-.3)/9.81))}
 if(supportA===0){near(first.aLeft,-first.aRight);near(sim.sample(sim.duration).E,first.E,2e-6)}
}
const eq=d.build({...M.defaults(d),mA:2,mB:2,mC:2,mD:2});near(eq.duration,8);near(eq.sample(3).aA,0);near(eq.sample(3).tension,19.62);
const bad=d.build({...M.defaults(d),supportA:-10});near(bad.duration,0);near(bad.sample(2).tension,0);assert.ok(bad.endLabel.includes('無法維持'));
console.log(`PASS: moving-atwood ${count} configurations; three ropes, four F=ma, massless-pulley tension balance, fixed/moving support work, free-fall limit, derivative consistency and contact stops.`);
