'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');
require('./models/safe-parabola.js');
const d=M.defs.find(d=>d.id==='safe-parabola'),near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
for(const v of [4,10,20])for(const h of [0,5,15])for(const g of [2,9.8,15]){
 const p={...M.defaults(d),v,h,g},sim=d.build(p);
 near(sim.envelope(sim.maxRange),0);near(sim.envelope(-sim.maxRange),0);
 // Each upward trajectory touches the continuous envelope where t=v/(g sinθ).
 for(const deg of [5,20,45,80,90,120,175]){const a=deg*Math.PI/180,t=v/(g*Math.sin(a)),x=v*Math.cos(a)*t,y=h+v*Math.sin(a)*t-.5*g*t*t;near(sim.envelope(x),y,1e-6);if(deg!==90)near(Math.tan(a)-g*x/(v*v*Math.cos(a)**2),-g*x/(v*v),1e-6);const apex=sim.apex(deg);near((apex.x/sim.A)**2+((apex.y-h-sim.B)/sim.B)**2,1)}
 for(const f of sim.family){near(h+f.uy*f.land-.5*g*f.land*f.land,0,1e-6);assert.ok(f.land>=0);for(const fraction of [0,.25,.75,1]){const t=sim.duration*fraction,s=sim.sample(t),b=s.balls[sim.family.indexOf(f)];assert.ok(b.y>=0);if(!b.landed){near(b.x*b.x+(b.y-s.circleY)**2,s.circleRadius*s.circleRadius,1e-6);assert.ok(b.y<=sim.envelope(b.x)+1e-6)}else{near(b.vx,0);near(b.vy,0);near(b.fy,0);near(b.x,f.range)}}}
 near(sim.sample(sim.duration).active,0);assert.deepEqual(sim.sample(-1),sim.sample(0));assert.deepEqual(sim.sample(sim.duration+10),sim.sample(sim.duration));assert.deepEqual(sim.sample(.4),sim.sample(.4));
 for(const key of ['envelope','circle','ellipse']){const other=d.build({...p,[key]:0});assert.deepEqual(other.sample(.4),sim.sample(.4))}
}
// Exercise the real scene function at every display combination and time boundary.
const vm=require('node:vm'),fs=require('node:fs');
for(let mask=0;mask<8;mask++){
 const p={...M.defaults(d),envelope:mask&1,circle:mask>>1&1,ellipse:mask>>2&1},simulation=d.build(p);let count=0;
 const point=a=>{assert.equal(a.length,3);assert.ok(a.every(Number.isFinite));count++},context={params:p,simulation,$:()=>({checked:true}),segment(a,b){point(a);point(b)},label:point,sphere:point};
 vm.createContext(context);vm.runInContext(fs.readFileSync('assets/scenes-safe-parabola.js','utf8'),context);
 for(const t of [0,simulation.duration/2,simulation.duration])context.drawSafeParabola(simulation.sample(t));assert.ok(count>200);
}
console.log('安全拋物線：27 組參數之相切、同時圓、頂點橢圓、落點、停留及重播檢查通過。');


