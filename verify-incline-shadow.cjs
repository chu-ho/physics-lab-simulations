'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/incline-shadow.js');const d=M.defs.find(x=>x.id==='incline-shadow'),base=M.defaults(d),near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
let count=0;
for(const slope of [0,30,45])for(const lightTilt of [-60,0,60])for(const azimuth of [-90,0,90])for(const v of [0,12]){
 const p={...base,slope,lightTilt,azimuth,v},sim=d.build(p),n=sim.normal,D=sim.lightDirection,dot=(u,w)=>u.reduce((a,x,i)=>a+x*w[i],0);assert.ok(Math.abs(dot(n,D))>=.5-1e-12);
 for(const fraction of [0,.2,.7,1]){const t=sim.duration*fraction,s=sim.sample(t),r=[s.x,s.y,s.z],q=[s.shadowX,s.shadowY,s.shadowZ];near(dot(n,q),0);for(let i=0;i<3;i++)near(q[i]-r[i],s.rayDistance*D[i]);near(dot(n,[s.shadowVx,s.shadowVy,s.shadowVz]),0);near(dot(n,[s.shadowAx,s.shadowAy,s.shadowAz]),0);near(s.E,sim.sample(0).E);assert.ok(s.normalHeight>=-1e-8);assert.ok(Object.values(s).every(Number.isFinite));}
 const t=sim.duration*.43,h=1e-4,a=sim.sample(t-h),s=sim.sample(t),b=sim.sample(t+h);for(const axis of ['X','Y','Z']){near((b['shadow'+axis]-a['shadow'+axis])/(2*h),s['shadowV'+axis.toLowerCase()],1e-6);near((b['shadowV'+axis.toLowerCase()]-a['shadowV'+axis.toLowerCase()])/(2*h),s['shadowA'+axis.toLowerCase()],1e-6)}
 const end=sim.sample(sim.duration);near(end.normalHeight,0);near(end.shadowX,end.x);near(end.shadowY,end.y);near(end.shadowZ,end.z);near(sim.sample(-1).y,p.h);near(sim.sample(sim.duration+1).x,end.x);count++;
}
// Vertical illumination: light tilt relative to inward normal equals negative slope.
for(const slope of [0,20,45]){const sim=d.build({...base,slope,lightTilt:-slope,azimuth:0}),s=sim.sample(sim.duration*.5);near(sim.lightDirection[0],0);near(s.shadowAx,0);near(s.shadowAy,0);near(s.shadowAz,0);near(s.shadowX,s.x);near(s.shadowY,s.x*Math.tan(slope*Math.PI/180));}
assert.throws(()=>d.build({...base,lightTilt:90}),RangeError);console.log(`PASS: incline-shadow ${count} configurations, line-plane projection, analytic derivatives, vertical light, energy, landing and degenerate-light rejection.`);

