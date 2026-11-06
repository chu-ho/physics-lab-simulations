'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('./mechanics-models.js');require('./models/projectile-explosion.js');
const d=M.defs.find(x=>x.id==='projectile-explosion'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);let n=0;
for(const angle of [15,45,75])for(const fraction of [.1,.5,.9])for(const progress of [.15,.5,.85])for(const direction of [-180,-90,0,90,180])for(const mode of [0,1]){
 const p={...M.defaults(d),angle,fraction,progress,direction,mode},s=d.build(p),te=s.explosionTime,o=s.origin,a=p.angle*Math.PI/180,ux=p.v*Math.cos(a),uy=p.v*Math.sin(a),f=s.fragments;
 assert.ok(o.y>0);near(f.reduce((q,b)=>q+b.mass*b.vx,0),p.mass*ux);near(f.reduce((q,b)=>q+b.mass*b.vy,0),p.mass*(uy-p.g*te));
 const postK=f.reduce((q,b)=>q+.5*b.mass*(b.vx*b.vx+b.vy*b.vy),0),preK=.5*p.mass*(ux*ux+(uy-p.g*te)**2);near(postK-preK,s.deltaK,1e-6);assert.ok(s.deltaK>=0);
 if(mode){near(f[1].vx,0);near(f[1].vy,0)}else near(s.deltaK,.5*p.mass*fraction*(1-fraction)*p.relativeSpeed**2,1e-6);
 for(const b of f){const start=s.at(b,te);near(start.x,o.x);near(start.y,o.y);near(start.vx,b.vx);near(start.vy,b.vy);near(o.y+b.vy*b.flight-.5*p.g*b.flight*b.flight,0,1e-6);const end=s.at(b,b.landTime);near(end.y,0);near(end.vx,0);near(end.vy,0);assert.ok(end.landed);assert.ok(s.at(b,b.landTime-1e-6).y>0)}
 const first=Math.min(...f.map(b=>b.landTime));for(const t of [0,te,te+(first-te)*.25,first-1e-7]){const q=s.sample(t);near(q.x,ux*t);near(q.y,p.h+uy*t-.5*p.g*t*t);near(q.momentumX,p.mass*ux);near(q.momentumY,p.mass*(uy-p.g*t));near(q.E,.5*p.mass*p.v*p.v+p.mass*p.g*p.h+(t>=te?s.deltaK:0),1e-5)}
 for(const t of [0,te,s.duration*.3,s.duration*.8,s.duration]){const q=s.sample(t);assert.deepEqual(q,s.sample(t));for(const v of Object.values(q))if(typeof v==='number')assert.ok(Number.isFinite(v));for(const b of q.pieces){assert.ok(b.y>=0);assert.ok(b.x>=s.bounds.xmin&&b.x<=s.bounds.xmax);assert.ok(b.y<=s.bounds.ymax)}}
 const end=s.sample(s.duration);assert.equal(end.landed,2);near(end.fy,0);near(end.momentumX,0);near(end.momentumY,0);assert.deepEqual(s.sample(-1),s.sample(0));assert.deepEqual(s.sample(s.duration+1),end);n++;
}
for(const v of [4,24])for(const mass of [1,10])for(const h of [1,12])for(const g of [2,15])for(const relativeSpeed of [0,20]){const p={...M.defaults(d),v,mass,h,g,relativeSpeed},s=d.build(p);for(let i=0;i<=100;i++){const q=s.sample(s.duration*i/100);assert.ok(q.y>=0&&Number.isFinite(q.E))}n++}
for(const mode of [0,1]){const p={...M.defaults(d),mode},simulation=d.build(p),point=a=>assert.ok(a.length===3&&a.every(Number.isFinite)),c={params:p,simulation,$:()=>({checked:true}),sphere:point,label:point,segment(a,b){point(a);point(b)}};vm.createContext(c);vm.runInContext(fs.readFileSync('assets/scenes-projectile-explosion.js','utf8'),c);for(const t of [0,simulation.explosionTime,simulation.explosionTime+.1,simulation.duration])c.drawProjectileExplosion(simulation.sample(t))}
console.log(`斜拋空中爆：${n} 組參數，瞬時動量、內能轉換、位置連續、空中質心、精確落地與場景通過。`);
