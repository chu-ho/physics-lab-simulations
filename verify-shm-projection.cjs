'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/shm-projection.js');
const d=M.defs.find(x=>x.id==='shm-projection'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
for(const A of [.5,2,4])for(const period of [1,4,8])for(const phase of [-180,-45,0,90,180])for(const m of [.2,1,5]){
 const p={...M.defaults(d),A,period,phase,m},sim=d.build(p),w=2*Math.PI/period;
 for(const f of [0,.13,.5,1,2.3,4]){const t=f*period,s=sim.sample(t),th=w*t+phase*Math.PI/180;
  near(s.q,A*Math.cos(th));near(s.qy,A*Math.sin(th));near(s.q*s.q+s.qy*s.qy,A*A);near(s.circleX,s.x);near(s.circleY-s.centerY,s.qy);near(s.circleVx,s.vx);near(s.circleVy,s.vyProjection);near(s.fx,m*s.ax);near(s.circleFy,m*s.ayProjection);near(s.ax,-w*w*s.q);near(s.ayProjection,-w*w*s.qy);near(Math.hypot(s.circleVx,s.circleVy),A*w);near(s.circleVx*s.circleAx+s.circleVy*s.circleAy,0);near(s.E,.5*m*A*A*w*w);near(s.K+s.U,s.E);
  if(t>0&&t<sim.duration){const h=1e-5,l=sim.sample(t-h),r=sim.sample(t+h);near((r.q-l.q)/(2*h),s.vx,1e-6);near((r.qy-l.qy)/(2*h),s.vyProjection,1e-6);near((r.vx-l.vx)/(2*h),s.ax,2e-6);near((r.vyProjection-l.vyProjection)/(2*h),s.ayProjection,2e-6)}
 }
 const a=sim.sample(0),b=sim.sample(period);near(a.q,b.q);near(a.qy,b.qy);near(a.vx,b.vx);near(sim.sample(period/4).q,-a.qy);near(sim.sample(period/4).qy,a.q);
 assert.deepEqual(sim.sample(-1),a);assert.deepEqual(sim.sample(sim.duration+1),sim.sample(sim.duration));
 for(const toggle of ['showX','showY','showV','showA'])assert.deepEqual(d.build({...p,[toggle]:0}).sample(.37),d.build({...p,[toggle]:1}).sample(.37));
}
console.log('PASS: shm-projection geometry, derivatives, force components, energy, phase quadrature, period and visual-toggle invariance.');
