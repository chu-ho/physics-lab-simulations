'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/self-pull.js');const d=M.defs.find(x=>x.id==='self-pull'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
for(const mode of [0,1])for(const m of [20,60,100])for(const platformMass of [10,40,80])for(const pull of [0,100,600,1000,1600]){
 const p={...M.defaults(d),mode,m,platformMass,pull},sim=d.build(p),s0=sim.sample(0),mass=m+platformMass;
 near(sim.threshold,mass*9.81/(mode===0?1:2));
 for(let i=0;i<=20;i++){const s=sim.sample(sim.duration*i/20);assert.ok(s.normal>=0&&s.groundN>=0);near(s.tension,pull);near(s.ropeLength,s0.ropeLength);if(!s.contactValid){near(sim.duration,0);near(s.h,0);assert.ok(s.requiredNormal<0);continue;}
  near(s.platformRopeForce+s.personRopeForce+s.groundN-mass*9.81,mass*s.ay);near(s.normal+s.personRopeForce-m*9.81,m*s.ay);near(s.platformRopeForce-s.normal+s.groundN-platformMass*9.81,platformMass*s.ay);near(s.E,s.work);near(s.handStroke,(mode===0?1:2)*s.h);assert.ok(s.h<=p.stroke+1e-8);
  if(mode===0){near(s.ropeEndY-s0.ropeEndY,2*s.h);near(s.work,s.handWork);}else{near(s.ropeEndY-s0.ropeEndY,-s.h);near(s.work,s.handWork);}
 }
 if(s0.contactValid&&pull>sim.threshold){near(sim.sample(sim.duration).handStroke,p.stroke);assert.ok(sim.sample(sim.duration).vy>0);}else near(sim.sample(sim.duration).h,0);
}
console.log('PASS self-pull: force partitions, nonnegative contact, exact rope length, lift thresholds, stroke stop and mechanical energy input.');

