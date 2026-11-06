'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/vertical-spring.js');
const d=M.defs.find(d=>d.id==='vertical-spring'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
for(const m of [.5,2,4])for(const k of [8,20,40])for(const A of [.2,1,2])for(const g of [1,9.81,15]){
 const p={...M.defaults(d),m,k,A,g},sim=d.build(p),T=2*Math.PI*Math.sqrt(m/k),a=sim.sample(0);
 near(sim.period,T);near(sim.delta,m*g/k);near(a.y,1.2);near(a.vy,0);
 for(let i=0;i<=64;i++){
  const t=i*T/16,s=sim.sample(t);near(s.fy,m*s.ay);near(s.springForce+s.gravityForce,s.fy);near(s.U,s.Us+s.Ug);near(s.U-s.Ueq,-m*m*g*g/(2*k));near(s.E-s.Eeq,s.offset);near(s.E,a.E);near(s.Eeq,.5*k*A*A);near(s.K+s.U,s.E);near(s.y-s.naturalY,-s.extension);near(s.springLength,s.topY-s.y);assert.ok(s.springLength>0);assert.ok(s.y>=1.2-1e-9);
  if(t>0&&t<sim.duration){const h=1e-5,l=sim.sample(t-h),r=sim.sample(t+h);near((r.y-l.y)/(2*h),s.vy,2e-6);near((r.vy-l.vy)/(2*h),s.ay,2e-5)}
 }
 const eq=sim.sample(T/4),upper=sim.sample(T/2);near(eq.fy,0);near(eq.springForce,m*g);near(Math.abs(eq.vy),A*Math.sqrt(k/m));near(eq.Ueq,0);near(upper.q,-A);near(upper.vy,0);near(upper.y,1.2+2*A);near(sim.sample(T).q,A);
 assert.deepEqual(sim.sample(-1),a);assert.deepEqual(sim.sample(sim.duration+2),sim.sample(sim.duration));
 for(const key of ['showReference','showHorizontal'])assert.deepEqual(d.build({...p,[key]:0}).sample(.1),d.build({...p,[key]:1}).sample(.1));
}
console.log('PASS: vertical-spring force balance, derivatives, equilibrium, period, signed potentials, constant energy offset, energy conservation, extrema, clearance and visual invariance.');
