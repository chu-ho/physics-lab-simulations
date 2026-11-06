'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/relative-motion.js');
const d=M.defs.find(d=>d.id==='relative-motion'),p=M.defaults(d),s=d.build(p),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const t of [0,s.duration*.2,s.duration*.8,s.duration]){
 const w=s.sample(t),red=s.inFrame(t,'red'),blue=s.inFrame(t,'blue'),cart=s.inFrame(t,'cart');
 near(red.x,0);near(red.y,0);near(red.vx,0);near(red.vy,0);near(red.fy,0);near(red.x2,(p.vx2-p.vx1)*t);near(red.y2,(p.vy2-p.vy1)*t);near(blue.x2,0);near(blue.y2,0);near(cart.x,p.vx1*t);near(cart.vx,p.vx1);near(cart.fy,-p.g);
 near(w.x2-w.x,red.x2);near(w.y2-w.y,red.y2);near(w.relativeAy,0);near(w.groundY,red.groundY+w.y);
}
near(s.sample(s.duration).y,1);near(s.sample(-1).x,0);near(s.sample(s.duration+5).x,s.sample(s.duration).x);
for(const u of [-4,8]){const other=d.build({...p,u});near(other.sample(1).relativeX,s.sample(1).relativeX);near(other.sample(1).relativeY,s.sample(1).relativeY);}
console.log('PASS: relative-motion frame translations, cancellation of gravity, landing boundary and platform invariance.');
