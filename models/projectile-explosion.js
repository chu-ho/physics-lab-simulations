/* Instantaneous internal explosion of a point projectile, then independent landings. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('projectile-explosion','斜拋空中爆','動力學','projectile-explosion',[
 P('v','發射初速',4,24,.5,12,'m/s'),P('angle','發射仰角',15,75,1,45,'°'),P('h','發射高度',1,12,.5,2,'m'),P('mass','總質量',1,10,.5,4,'kg'),P('fraction','A 質量比例',.1,.9,.05,.5,''),P('progress','爆炸時刻／原飛行時間',.15,.85,.05,.5,''),P('relativeSpeed','爆後相對速率',0,20,.5,8,'m/s'),P('direction','A 相對 B 速度方向',-180,180,5,0,'°'),P('mode','爆炸模式：0相對速度／1令B瞬停',0,1,1,0,''),P('g','重力加速度',2,15,.5,10,'m/s²')
],[metric('deltaK','爆炸增加動能','J'),metric('momentumX','系統水平動量','kg·m/s'),metric('landed','已落地碎塊','塊')],
 'vA = V + (mB/M)w；vB = V − (mA/M)w；ΔK = ½(mA mB/M)|w|²',
 '無阻力、瞬時內部爆炸的兩個點質量。模式 0 指定相對速度；模式 1 令 B 在爆炸瞬間對地速度為零，由動量守恆求 A 速度，此時相對速度與方向拉桿不使用。爆炸把內能轉為動能，星芒只是事件提示，不施加額外外力。兩塊均未落地前，質心沿未爆炸拋物線；任一碎塊落地即受地面外衝量並停止，此後不可對系統套用自由拋體質心或動量守恆。落地合力為零，不解析碰撞衝量與碎裂尺寸。球與星芒大小為放大示意。',
 ['爆炸改變碎塊路徑時，空中質心路徑為何不變？','令 B 瞬間靜止後，A 的速度與質量比例有何關係？'],p=>{
 const a=p.angle*Math.PI/180,ux=p.v*Math.cos(a),uy=p.v*Math.sin(a),flight=(uy+Math.sqrt(uy*uy+2*p.g*p.h))/p.g,te=flight*p.progress;
 const origin={x:ux*te,y:p.h+uy*te-.5*p.g*te*te,vx:ux,vy:uy-p.g*te},f=p.fraction,mA=p.mass*f,mB=p.mass-mA;
 const w=p.mode>=.5?{x:origin.vx/f,y:origin.vy/f}:{x:p.relativeSpeed*Math.cos(p.direction*Math.PI/180),y:p.relativeSpeed*Math.sin(p.direction*Math.PI/180)};
 const fragments=[{mass:mA,vx:origin.vx+(1-f)*w.x,vy:origin.vy+(1-f)*w.y},{mass:mB,vx:origin.vx-f*w.x,vy:origin.vy-f*w.y}];
 fragments.forEach(b=>{b.flight=(b.vy+Math.sqrt(b.vy*b.vy+2*p.g*origin.y))/p.g;b.landTime=te+b.flight;b.landX=origin.x+b.vx*b.flight});
 const duration=Math.max(...fragments.map(b=>b.landTime)),deltaK=.5*mA*mB/p.mass*(w.x*w.x+w.y*w.y);
 const at=(b,t)=>{const age=Math.max(0,Math.min(b.flight,t-te)),landed=t>=b.landTime;return{x:origin.x+b.vx*age,y:landed?0:Math.max(0,origin.y+b.vy*age-.5*p.g*age*age),z:0,vx:landed?0:b.vx,vy:landed?0:b.vy-p.g*age,mass:b.mass,landed}};
 const events=[{t:te,label:'空中爆炸 · 動量連續、動能增加'},...fragments.map((b,i)=>({t:b.landTime,label:(i?'B':'A')+' 落地 · 地面外衝量後靜止'}))].sort((a,b)=>a.t-b.t);
 const sim=trajectory(duration,t=>{
  const exploded=t>=te,before={x:ux*t,y:p.h+uy*t-.5*p.g*t*t,z:0,vx:ux,vy:uy-p.g*t},pieces=exploded?fragments.map(b=>at(b,t)):[{...before,mass:mA,landed:false},{...before,mass:mB,landed:false}];
  const sum=k=>pieces.reduce((s,b)=>s+b.mass*b[k],0),K=pieces.reduce((s,b)=>s+.5*b.mass*(b.vx*b.vx+b.vy*b.vy),0),U=p.g*sum('y'),landed=pieces.filter(b=>b.landed).length;
  return{x:sum('x')/p.mass,y:sum('y')/p.mass,z:0,vx:sum('vx')/p.mass,vy:sum('vy')/p.mass,fy:-p.g*pieces.filter(b=>!b.landed).reduce((s,b)=>s+b.mass,0),pieces,xA:pieces[0].x,yA:pieces[0].y,vxA:pieces[0].vx,vyA:pieces[0].vy,xB:pieces[1].x,yB:pieces[1].y,vxB:pieces[1].vx,vyB:pieces[1].vy,mA,mB,elapsed:t,exploded,landed,deltaK:exploded?deltaK:0,momentumX:sum('vx'),momentumY:sum('vy'),K,U,E:K+U,referenceX:ux*t,referenceY:p.h+uy*t-.5*p.g*t*t,flash:exploded?Math.max(0,1-(t-te)/.5):0};
 },{events,explosionTime:te,origin,fragments,deltaK,at,endLabel:'兩碎塊均已落地 · 系統經歷地面外衝量'});
 const xs=[0,origin.x,...fragments.map(b=>b.landX)],ys=[0,p.h,p.h+uy*uy/(2*p.g),...fragments.map(b=>origin.y+Math.max(0,b.vy)**2/(2*p.g))];
 sim.bounds={xmin:Math.min(...xs)-2,xmax:Math.max(...xs)+2,ymin:0,ymax:Math.max(...ys)+2,zmin:-2,zmax:2};return sim;
},'models/projectile-explosion.js');
M.defs.find(d=>d.id==='projectile-explosion').plotMetrics=[metric('vxA','A 水平速度','m/s'),metric('vyA','A 鉛直速度','m/s'),metric('vxB','B 水平速度','m/s'),metric('vyB','B 鉛直速度','m/s'),metric('momentumY','系統鉛直動量','kg·m/s'),metric('K','總動能','J'),metric('U','重力位能','J'),metric('E','機械能','J')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
