'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/belt-wheels.js');
const d=M.defs.find(x=>x.id==='belt-wheels'),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);
let count=0;
for(const rA of [.4,.9,1.8])for(const rB of [.4,1.5,1.8])for(const rC of [.4,.9,1.8])for(const rD of [.4,1,1.8])for(const omegaA of [.2,1,4]){
 const p={...M.defaults(d),rA,rB,rC,rD,omegaA},sim=d.build(p);
 for(const f of [0,.137,.5,1]){const t=f*sim.duration,s=sim.sample(t);near(s.omegaA,omegaA);near(s.omegaB,s.omegaC);near(s.omegaA*rA,s.omegaB*rB);near(s.omegaC*rC,s.omegaD*rD);near(s.edgeSpeedA,s.edgeSpeedB);near(s.edgeSpeedC,s.edgeSpeedD);near(s.thetaB,s.thetaC);near(s.turnsD,s.turnsA*rA*rC/(rB*rD));near(s.turnsD,s.omegaD*t/(2*Math.PI));if(t>0&&t<sim.duration){const h=1e-5;near((sim.sample(t+h).thetaD-sim.sample(t-h).thetaD)/(2*h),s.omegaD)}}
 near(sim.sample(sim.duration).turnsA,4);assert.deepEqual(sim.sample(-1),sim.sample(0));assert.deepEqual(sim.sample(sim.duration+1),sim.sample(sim.duration));count++;
}
console.log('PASS: belt-wheels '+count+' parameter sets; prescribed drive, both no-slip belts, coaxial constraint, turns ratio, angular derivatives and clipped replay.');
