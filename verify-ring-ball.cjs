'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/ring-ball.js');
const def=M.defs.find(d=>d.id==='ring-ball'),near=(a,b,tol=2e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);let count=0;
for(const ratio of [.1,.5,1,2,5])for(const offset of [-.75,-.35,0,.35,.75])for(const v of [1,3,5])for(const e of [.4,.7,1]){
 const p={...M.defaults(def),ratio,offset,v,e},sim=def.build(p),s0=sim.sample(0),mu=sim.mass*sim.ringMass/(sim.mass+sim.ringMass);
 assert.ok(sim.duration>0&&sim.duration<=6);assert.ok(sim.collisions.length>0);
 for(let i=0;i<=180;i++){
  const t=sim.duration*i/180,s=sim.sample(t);near(s.momentumX,s0.momentumX);near(s.momentumZ,0);near(s.angularMomentum,s0.angularMomentum,1e-6);near(s.K+s.loss,s0.K,1e-6);assert.ok(s.clearance>-1e-7);near(s.omega,0);near(s.comX,s0.comX+s0.momentumX/(sim.mass+sim.ringMass)*t);near(s.comZ,s0.comZ);if(e===1)near(s.K,s0.K,1e-6);
 }
 for(const c of sim.collisions){const a=c.before,b=c.after,nx=c.nx,nz=c.nz,wn=(a.bvx-a.rvx)*nx+(a.bvz-a.rvz)*nz,wp=(b.bvx-b.rvx)*nx+(b.bvz-b.rvz)*nz;
  near(Math.hypot(b.bx-b.rx,b.bz-b.rz),sim.geometry.D);assert.ok(wn>0);near(wp,-e*wn);near((a.bvx-a.rvx)*(-nz)+(a.bvz-a.rvz)*nx,(b.bvx-b.rvx)*(-nz)+(b.bvz-b.rvz)*nx);near(c.impulse,(1+e)*mu*wn);
  // Radial normal passes through the ring centre: the ring receives no spin impulse.
  near((b.bx-b.rx)*nz-(b.bz-b.rz)*nx,0);near(b.loss-a.loss,.5*mu*(1-e*e)*wn*wn);
 }
 const first=sim.collisions[0],D=sim.geometry.D;
 near(first.t,(Math.sqrt(D*D-(offset*D)**2)+.55*D)/v); // Independent ray/circle intersection.
 if(offset===0){near(first.after.bvx,(sim.mass-e*sim.ringMass)/(sim.mass+sim.ringMass)*v);near(first.after.rvx,(1+e)*sim.mass/(sim.mass+sim.ringMass)*v)}
 count++;
}
console.log('PASS: ring-ball '+count+' configurations; exact multi-contact geometry, impulse restitution/tangent, free-ring momentum, angular momentum, elastic energy, dissipated energy, COM and independent head-on solution.');
