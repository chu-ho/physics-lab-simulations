'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/person-boat.js');const d=M.defs.find(d=>d.id==='person-boat'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);let count=0;
for(const m of [20,60,100])for(const mass of [20,100,200])for(const dist of [1,4,6])for(const T of [1,4,8])for(const mode of [0,1]){
 const p={...M.defaults(d),m,M:mass,d:dist,T,mode,u:.7},sim=d.build(p),start=sim.sample(0),end=sim.sample(sim.duration);
 for(let i=0;i<=60;i++){const t=sim.duration*i/60,s=sim.sample(t);near((m*s.x+mass*s.x2)/(m+mass),p.u*t);near(s.momentum,(m+mass)*p.u);near(s.x-s.x2,s.q);near(s.fx+s.fx2,0);near(s.fx,m*s.ax);near(s.fx2,mass*s.boatAcceleration);near(s.internalWork,s.K-.5*(m+mass)*p.u*p.u);assert.ok(Math.abs(s.q)<=dist/2+1e-8);
  if(t>1e-5&&t<sim.duration-1e-5&&Math.abs(t-T)>1e-5){const h=1e-6,L=sim.sample(t-h),R=sim.sample(t+h);near((R.x-L.x)/(2*h),s.vx,1e-6);near((R.vx-L.vx)/(2*h),s.ax,1e-6)}
 }
 near(start.relativeVelocity,0);near(end.relativeVelocity,0);near(start.relativeAcceleration,0);near(end.relativeAcceleration,0);near(end.vx,p.u);near(end.vx2,p.u);
 near(end.boatDisplacement-p.u*sim.duration,mode?0:-m/(m+mass)*dist);near(end.personDisplacement-p.u*sim.duration,mode?0:mass/(m+mass)*dist);count++;
}
console.log('PASS: person-boat '+count+' configurations; relative travel, COM, momentum, action/reaction, velocity/acceleration, endpoint smoothness and return trip.');
