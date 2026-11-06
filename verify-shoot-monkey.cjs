'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');
require('./models/shoot-monkey.js');
const d=M.defs.find(d=>d.id==='shoot-monkey'),make=o=>{const p={...M.defaults(d),...o};return{p,sim:d.build(p)}},near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
for(const v of [15,20,40]){const {p,sim}=make({v}),expected=Math.hypot(p.D,p.H-p.h)/v;near(sim.hitTime,expected);const s=sim.sample(sim.hitTime),a=sim.aimAngle*Math.PI/180;near(s.x,p.D);near(s.y,s.y2);assert.ok(s.y>0);assert.equal(s.collided,1);
 const before=sim.sample(expected-1e-8),ux=v*Math.cos(a),uy=v*Math.sin(a);near(s.vx+s.vx2,ux);near(s.vy+s.vy2,uy-2*p.g*expected);near(s.impactLoss,v*v/4);const Kbefore=.5*(ux*ux+(uy-p.g*expected)**2+(-p.g*expected)**2),Kafter=.5*(s.vx*s.vx+s.vy*s.vy+s.vx2*s.vx2+s.vy2*s.vy2);near(Kbefore-Kafter,s.impactLoss);near(before.x,s.x,1e-6);near(before.y,s.y,1e-6);
 for(const dt of [.01,.1,.2])if(expected+dt<sim.duration){const q=sim.sample(expected+dt);near(q.x,q.x2);near(q.y,q.y2);near(q.vx,q.vx2);near(q.vy,q.vy2);near(q.x,p.D+s.vx*dt);near(q.y,s.y+s.vy*dt-.5*p.g*dt*dt);near(q.impactAge,dt);near(q.fy,-p.g);near(q.fy2,-p.g)}
 const replay=sim.sample(expected-.01);assert.equal(replay.collided,0);assert.equal(replay.impactLoss,0);assert.equal(replay.impactAge,-1);assert.deepEqual(sim.sample(sim.hitTime),s);
}
for(const offset of [-20,-1,1,20]){const {sim}=make({offset});assert.equal(sim.hitTime,null);assert.ok(sim.closestAir>0)}
{const {sim}=make({v:2});assert.equal(sim.hitTime,null);assert.ok(sim.monkeyGround<Math.hypot(20,13.5)/2);assert.ok(sim.closestAir>0)}
for(const H of [3,15,25])for(const h of [.5,3])for(const v of [2,20,40])for(const offset of [-30,0,30])for(const g of [1,9.81,15]){
 const {p,sim}=make({H,h,v,offset,g}),a=sim.aimAngle*Math.PI/180;
 for(let j=0;j<=50;j++){const t=sim.duration*j/50,s=sim.sample(t);for(const [k,x]of Object.entries(s))if(typeof x==='number')assert.ok(Number.isFinite(x),k);assert.ok(s.y>=0&&s.y2>=0);if(!s.collided&&t<Math.min(sim.bulletGround,sim.monkeyGround)){near(s.x2-s.x,p.D-p.v*Math.cos(a)*t);near(s.y2-s.y,p.H-p.h-p.v*Math.sin(a)*t);near(s.fy,-p.g);near(s.fy2,-p.g)}if(s.collided){near(s.x,s.x2);near(s.y,s.y2);near(s.vx,s.vx2);near(s.vy,s.vy2)}else {near(s.impactLoss,0);assert.equal(s.impactAge,-1)}}
 const end=sim.sample(sim.duration);near(end.vx,0);near(end.vy,0);near(end.vy2,0);near(end.fy,0);near(end.fy2,0);assert.deepEqual(sim.sample(.4),sim.sample(.4));assert.ok(sim.events.every((e,i,a)=>i===0||a[i-1].t<=e.t));
 const before=sim.sample(Math.max(0,sim.bulletGround-1e-7)),after=sim.sample(sim.bulletGround);assert.ok(Math.abs(before.x-after.x)<1e-4);near(after.y,0);
}
{const {sim}=make({offset:12}),h=1e-5,t=sim.closestTime;if(t>h&&t<Math.min(sim.monkeyGround,sim.bulletGround)-h){const L=sim.sample(t-h).separation,C=sim.sample(t).separation,R=sim.sample(t+h).separation;assert.ok(C<=L+1e-10&&C<=R+1e-10)}}
{const {sim}=make({D:10,H:3,h:3,g:10,v:10/Math.sqrt(.6)});assert.equal(sim.hitTime,null);near(sim.closestAir,0);near(sim.bulletGround,sim.monkeyGround)}
console.log('射猴子：解析命中、完全非彈性動量與能量損失、位置連續、共同拋體、低速／偏角不命中、觸地與回放驗證通過。');

