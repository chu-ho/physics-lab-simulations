'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/bike-turn.js');
const d=M.defs.find(x=>x.id==='bike-turn'),base=M.defaults(d),build=p=>d.build({...base,...p}),near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
for(const v of [1,5,10])for(const R of [3,8,15]){
 const sim=build({v,R,mu:1.5}),s=sim.sample(0);near(Math.tan(sim.equilibrium),v*v/(9.81*R));near(s.radius,R);near(s.speed,v);near(s.angularAcceleration,0);near(s.normal,base.m*9.81);near(s.friction,base.m*v*v/R);if(v*v/R<=1.5*9.81){near(sim.duration,8);near(sim.sample(8).lean,s.lean,2e-4)}else near(sim.duration,0);
}
for(const offset of [-5,5]){
 const sim=build({offset,mu:1.5});assert.ok(sim.duration>0&&sim.duration<8);const s0=sim.sample(0);assert.equal(Math.sign(s0.angularAcceleration),Math.sign(offset));
 for(let j=0;j<50;j++){const t=sim.duration*j/50,s=sim.sample(t),h=1e-5,after=sim.sample(t+h),before=sim.sample(Math.max(0,t-h));if(t>h){near((after.vx-before.vx)/(2*h),s.fx/base.m,2e-5);near((after.vy-before.vy)/(2*h),s.fy/base.m,2e-5);near((after.vz-before.vz)/(2*h),s.fz/base.m,2e-5)}near(s.normal-base.m*9.81,s.fy);assert.ok(s.normal>=-1e-5);assert.ok(s.friction<=1.5*s.normal+1e-4);const r=sim.contactRadius-base.h*Math.sin(s.phi);near(base.h*s.angularAcceleration,9.81*Math.sin(s.phi)-sim.omega**2*r*Math.cos(s.phi));near(s.x-s.contactX,-base.h*Math.sin(s.phi)*Math.cos(s.theta)); }
 const end=sim.sample(sim.duration);assert.ok(Math.abs(end.margin)<1e-4||Math.abs(end.normal)<1e-4||Math.abs(end.y-.1*base.h)<1e-6);near(sim.events.at(-1).t,sim.duration);
}
const impossible=build({mu:0});near(impossible.duration,0);assert.ok(impossible.endLabel.includes('初始接觸不可行'));
for(const v of [1,12])for(const R of [3,15])for(const offset of [-25,25])for(const roll0 of [-15,15]){const sim=build({v,R,offset,roll0});for(const t of [0,sim.duration/2,sim.duration])for(const n of Object.values(sim.sample(t)))if(typeof n==='number')assert.ok(Number.isFinite(n));assert.deepEqual(sim.sample(-1),sim.sample(0));assert.deepEqual(sim.sample(100),sim.sample(sim.duration))}
assert.equal(d.params.find(p=>p.id==='comparison').visual,true);
console.log('bike-turn: equilibrium, roll torque, F=ma, friction cone/contact termination and parameter extremes passed');
