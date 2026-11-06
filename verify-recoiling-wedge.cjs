'use strict';const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/recoiling-wedge.js');
const d=M.defs.find(d=>d.id==='recoiling-wedge'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);let count=0;
for(const massWedge of [1,6,30])for(const m of [.5,2,10])for(const angle of [10,30,70])for(const fixed of [0,1]){
 const p={...M.defaults(d),massWedge,m,angle,fixed},sim=d.build(p),first=sim.sample(0),theta=angle*Math.PI/180;count++;
 near(sim.duration,Math.sqrt(2*p.length/first.relativeAcceleration));
 for(let j=0;j<=40;j++){const t=sim.duration*j/40,s=sim.sample(t);near(s.E,first.E,2e-6);near(s.fx,m*s.ax);near(s.fy,m*s.ay);near(s.normal*Math.sin(theta),s.fx);near(s.groundNormal-massWedge*p.g-s.normal*Math.cos(theta),0);near(s.wedgeNetForce,massWedge*s.wedgeA);near(s.wedgeForce+s.supportHorizontal,s.wedgeNetForce);assert.ok(s.normal>0&&s.groundNormal>0&&s.y>=-1e-10&&s.q<=p.length+1e-10);
 if(!fixed){near(s.horizontalMomentum,0);near(s.centerX,first.centerX)}else{near(s.wedgeX,0);near(s.wedgeV,0)}
 if(j>0&&j<40){const h=1e-5,l=sim.sample(t-h),r=sim.sample(t+h);near((r.x-l.x)/(2*h),s.vx);near((r.y-l.y)/(2*h),s.vy);near((r.vx-l.vx)/(2*h),s.ax);near((r.vy-l.vy)/(2*h),s.ay)}
 }
 const last=sim.sample(sim.duration);near(last.q,p.length);near(last.y,0);assert.ok(last.relativeSpeed>0);assert.deepEqual(sim.sample(-1),first);assert.deepEqual(sim.sample(sim.duration+10),last);
}
const p=M.defaults(d),heavy=d.build({...p,massWedge:1e12}).sample(.4),fixed=d.build({...p,fixed:1}).sample(.4);near(heavy.relativeAcceleration,fixed.relativeAcceleration);near(heavy.wedgeA,0);near(heavy.normal,fixed.normal);
console.log(`PASS: recoiling-wedge ${count} configurations; exact endpoint, energy, horizontal momentum, both-body F=ma, contact forces, derivatives and fixed-wedge limit.`);
