'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('./mechanics-models.js');require('./models/optimal-projectile.js');
const d=M.defs.find(d=>d.id==='optimal-projectile'),near=(a,b,e=1e-7)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);let configurations=0;
for(const v of [4,12,24])for(const h of [0,.5,15])for(const g of [2,9.8,15])for(const slope of [-30,0,30])for(const angle of [-80,0,40,90,170]){
 const p={...M.defaults(d),v,h,g,slope,angle},s=d.build(p);configurations++;
 for(const f of [s.selected,s.optimal,...s.scan]){assert.ok(f.land>=0&&Number.isFinite(f.land));near(h+f.uy*f.land-.5*g*f.land*f.land,f.x*Math.tan(s.beta),1e-6);for(const k of [.1,.5,.9]){const q=s.at(f,f.land*k);assert.ok(q.y-q.x*Math.tan(s.beta)>-1e-7)}assert.ok(f.range<=s.optimalRange+1e-6);const end=s.at(f,f.land);near(end.vx,0);near(end.vy,0);near(end.fy,0)}
 // Independent dense angular search, not the same closed-form optimum.
 let dense=-Infinity;for(let deg=-90;deg<=90;deg+=.2){const a=deg*Math.PI/180,w=v*Math.sin(a)-v*Math.cos(a)*Math.tan(s.beta),T=Math.max(0,(w+Math.sqrt(w*w+2*g*h))/g),r=v*Math.cos(a)*T/Math.cos(s.beta);dense=Math.max(dense,r)}assert.ok(s.optimalRange>=dense-1e-7&&s.optimalRange-dense<.01);
 if(h===0)near(s.optimalAngle,45+slope/2);if(h===0&&slope===0)near(s.optimalRange,v*v/g);
 if(h===0&&angle<=slope&&angle<90)near(s.selected.land,0);if(angle>90&&s.selected.land>0)assert.ok(s.selected.range<0);
 assert.deepEqual(s.sample(-2),s.sample(0));assert.deepEqual(s.sample(s.duration+2),s.sample(s.duration));
 for(const t of [0,s.duration*.4,s.duration]){const q=s.sample(t);for(const [k,n] of Object.entries(q))assert.ok(Number.isFinite(n),k);for(const [x,y] of [[q.x,q.y],[q.x2,q.y2]]){assert.ok(x>=s.bounds.xmin-1e-7&&x<=s.bounds.xmax+1e-7);assert.ok(y>=s.bounds.ymin-1e-7&&y<=s.bounds.ymax+1e-7)}}
}
for(const p of [M.defaults(d),{...M.defaults(d),h:0,slope:30,angle:-80},{...M.defaults(d),h:15,slope:-30,angle:170}]){const simulation=d.build(p),point=a=>assert.ok(a.length===3&&a.every(Number.isFinite)),c={params:p,simulation,$:()=>({checked:true}),segment(a,b){point(a);point(b)},sphere:point,label:point};vm.createContext(c);vm.runInContext(fs.readFileSync('assets/scenes-optimal-projectile.js','utf8'),c);for(const t of [0,simulation.duration/2,simulation.duration])c.drawOptimalProjectile(simulation.sample(t))}
console.log(`最佳斜拋：${configurations} 組參數，獨立角度掃描、斜面落點、零飛行、負射程、狀態與場景通過。`);
