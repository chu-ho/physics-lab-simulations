'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');
if(!M.defs.some(d=>d.id==='airplane-drop'))require('./models/airplane-drop.js');
const d=M.defs.find(d=>d.id==='airplane-drop'),defaults=Object.fromEntries(d.params.map(p=>[p.id,p.value]));
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} ≠ ${b}`);
let cases=0;
for(const h of [10,24,60])for(const v of [2,6,15])for(const count of [1,10,20])for(const interval of [.1,.3,1])for(const g of [1,9.81,15]){
 const p={...defaults,h,v,count,interval,g},sim=d.build(p),T=Math.sqrt(2*h/g);
 close(sim.duration,(count-1)*interval+T);assert.equal(sim.events.length,2*count);
 for(let j=1;j<sim.events.length;j++)assert.ok(sim.events[j].t>=sim.events[j-1].t);
 for(const t of [0,T/3,T,sim.duration*.7,sim.duration]){
  const s=sim.sample(t);close(s.planeX,v*t);assert.equal(s.balls.length,count);
  for(const b of s.balls){assert.ok(b.y>=0);if(!b.released)continue;const age=t-b.index*interval;
   if(!b.landed){close(b.x,s.planeX);close(b.y,h-g*age**2/2);close(b.vy,-g*age);close(.5*(b.vx**2+b.vy**2)+g*b.y,.5*v*v+g*h,1e-6)}
   else{close(b.x,v*(b.index*interval+T));close(b.y,0);close(b.vx,0);close(b.vy,0)}
  }
 }
 const end=sim.sample(sim.duration);assert.equal(end.landed,count);assert.equal(end.fy,0);assert.equal(end.K,0);assert.deepEqual(sim.sample(-2),sim.sample(0));assert.deepEqual(sim.sample(sim.duration+2),end);assert.deepEqual(sim.sample(T/3),sim.sample(T/3));
 const last=count-1,release=last*interval,epsilon=1e-7;if(last){assert.equal(sim.sample(release-epsilon).balls[last].released,false);assert.equal(sim.sample(release).balls[last].released,true)}
 const before=sim.sample(sim.duration-epsilon).balls[last],after=end.balls[last];assert.equal(before.landed,false);assert.ok(before.y>0);assert.equal(after.landed,true);close(before.x,after.x,1e-5);
 cases++;
}
console.log(`飛機投彈：${cases} 組獨立解析、能量、同步水平位置、釋放／碰撞邊界及回放檢查通過。`);
