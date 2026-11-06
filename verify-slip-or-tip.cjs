'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/slip-or-tip.js');
const d=M.defs.find(x=>x.id==='slip-or-tip'),base=M.defaults(d),build=p=>d.build({...base,...p}),near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(const mus of [.2,.5,1.5])for(const ratio of [.3,.8,2]){
 const p={b:ratio*2,h:2,mus,muk:.1,slope:Math.atan(Math.min(mus,ratio))*180/Math.PI-1e-4};assert.equal(build(p).mode,'stable');p.slope+=.001;assert.equal(build(p).mode,mus<ratio-1e-10?'slide':'tip');
}
const sliding=build({slope:30,b:3,h:1,mus:.3,muk:.2});assert.equal(sliding.mode,'slide');
for(const t of [0,.4,1,3]){const s=sliding.sample(t),a=Math.PI/6;near(s.N,base.m*9.81*Math.cos(a));near(s.friction,-.2*s.N);near(s.fx,base.m*9.81*(Math.sin(a)-.2*Math.cos(a))*Math.cos(a));near(s.fy,-s.fx*Math.tan(a));near(s.supportAlong-s.travel,.1);near(s.E+s.heat,sliding.sample(0).E,1e-7)}
const tipping=build({slope:35,b:1,h:2,mus:2});assert.equal(tipping.mode,'tip');assert.ok(tipping.duration>0);
for(let j=0;j<=50;j++){const s=tipping.sample(tipping.duration*j/50),pivot=tipping.pivot,I=base.m*5/3;near(I*s.angularAcceleration,base.m*9.81*(s.x-pivot[0]),1e-7);near(s.E,tipping.sample(0).E,1e-6);assert.ok(s.N>=-1e-6);assert.ok(Math.abs(s.friction)<=2*s.N+1e-5);near(s.fx,s.friction*Math.cos(35*Math.PI/180)+s.N*Math.sin(35*Math.PI/180),1e-6);near(s.fy,-s.friction*Math.sin(35*Math.PI/180)+s.N*Math.cos(35*Math.PI/180)-base.m*9.81,1e-6)}
const stable=build({slope:15,b:2,h:2,mus:.5});const s=stable.sample(2);near(s.fx,0);near(s.fy,0);assert.ok(s.supportAlong<=1);near(s.supportAlong,Math.tan(Math.PI/12));
console.log('slip-or-tip: thresholds, sliding F=ma / energy, tipping torque / energy / friction cone passed');
