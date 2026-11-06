/* Simultaneously released target and projectile, solved analytically. */
(function(M){
'use strict';
const {P,M:metric,trajectory,rad,clamp}=M.helpers;
M.register('shoot-monkey','射猴子：共同自由落體','運動學','shoot-monkey',[
 P('D','目標水平距離',5,40,1,20,'m'),P('H','目標初始高度',3,25,1,15,'m'),P('h','槍口高度',.5,3,.1,1.5,'m'),P('v','子彈初速',2,40,1,20,'m/s'),P('offset','相對初始瞄準線偏角',-30,30,1,0,'°'),P('g','重力加速度',1,15,.01,9.81,'m/s²')
],[metric('separation','兩質點距離','m'),metric('closestAir','空中最小距離','m'),metric('aimAngle','發射仰角','°')],
 '撞前：r猴 − r彈 = (D, H − h) − v₀t；命中後完全非彈性黏合：v共同 = (v彈 + v猴)/2；ΔK = v₀²/4。',
 '子彈發射時猴子同時由靜止釋放，無空氣阻力。偏角 0° 代表瞄準猴子初始位置，不是固定仰角。以質點中心重合且尚未觸地判定命中；外觀圖示、貼附子彈與撞擊光圈只作辨識，猴子質點標於腳下，半徑不當碰撞範圍。兩質點質量均取 1 kg；命中採完全非彈性碰撞，子彈嵌入猴子，瞬時總動量守恆但動能損失 v₀²/4 J，之後共同自由拋體至地面。未命中則各自自由落下。觸地後由地面支撐而停止，不反彈；讀值「空中最小距離」比較碰前兩者仍在空中的時段。重力箭頭各對應 1 kg 物體的 N；碰撞與觸地瞬間採事件後速度，未繪出瞬時衝量。',
 ['為什麼偏角為零時，不必瞄準猴子下方？','初速很小時，即使瞄準正確也能在觸地前相遇嗎？'],p=>{
 const aimAngle=Math.atan2(p.H-p.h,p.D)*180/Math.PI+p.offset,theta=rad(aimAngle),ux=p.v*Math.cos(theta),uy=p.v*Math.sin(theta),dy=p.H-p.h;
 const freeBulletGround=(uy+Math.sqrt(uy*uy+2*p.g*p.h))/p.g,freeMonkeyGround=Math.sqrt(2*p.H/p.g),airEnd=Math.min(freeBulletGround,freeMonkeyGround),closestTime=clamp((p.D*ux+dy*uy)/(p.v*p.v),0,airEnd),closestAir=Math.hypot(p.D-ux*closestTime,dy-uy*closestTime);
 const candidate=(p.D*ux+dy*uy)/(p.v*p.v),hitTime=candidate>=0&&candidate<airEnd-1e-10&&Math.hypot(p.D-ux*candidate,dy-uy*candidate)<1e-8?candidate:null;
 const hitY=hitTime===null?0:p.H-.5*p.g*hitTime*hitTime,sharedVx=ux/2,sharedVy=hitTime===null?0:uy/2-p.g*hitTime,sharedGround=hitTime===null?null:hitTime+(sharedVy+Math.sqrt(sharedVy*sharedVy+2*p.g*hitY))/p.g;
 const bulletGround=sharedGround===null?freeBulletGround:sharedGround,monkeyGround=sharedGround===null?freeMonkeyGround:sharedGround,duration=Math.max(bulletGround,monkeyGround),events=[{t:0,label:'同時發射與釋放'}];
 if(hitTime!==null)events.push({t:hitTime,label:'命中！完全非彈性黏合，動能損失 '+(p.v*p.v/4).toFixed(2)+' J'},{t:sharedGround,label:'子彈與猴子共同觸地並停止'});
 else events.push({t:bulletGround,label:'子彈觸地並停止'},{t:monkeyGround,label:'猴子觸地並停止'},{t:closestTime,label:'兩者仍在空中時的最接近位置'});
 events.sort((a,b)=>a.t-b.t);
 return trajectory(duration,t=>{
  if(hitTime!==null&&t>=hitTime){const elapsed=Math.min(t,sharedGround)-hitTime,grounded=t>=sharedGround,x=p.D+sharedVx*elapsed,y=grounded?0:Math.max(0,hitY+sharedVy*elapsed-.5*p.g*elapsed*elapsed),vx=grounded?0:sharedVx,vy=grounded?0:sharedVy-p.g*elapsed;return{x,y,vx,vy,fy:grounded?0:-p.g,x2:x,y2:y,z2:0,vx2:vx,vy2:vy,vz2:0,fx2:0,fy2:grounded?0:-p.g,fz2:0,separation:0,closestAir,aimAngle,bulletGrounded:+grounded,monkeyGrounded:+grounded,met:1,collided:1,impactAge:t-hitTime,impactLoss:p.v*p.v/4}}
  const tb=Math.min(t,bulletGround),tm=Math.min(t,monkeyGround),grounded=t>=bulletGround,monkeyOnGround=t>=monkeyGround,x=ux*tb,y=grounded?0:Math.max(0,p.h+uy*tb-.5*p.g*tb*tb),y2=monkeyOnGround?0:Math.max(0,p.H-.5*p.g*tm*tm);
  return{x,y,vx:grounded?0:ux,vy:grounded?0:uy-p.g*t,fy:grounded?0:-p.g,x2:p.D,y2,z2:0,vx2:0,vy2:monkeyOnGround?0:-p.g*t,vz2:0,fx2:0,fy2:monkeyOnGround?0:-p.g,fz2:0,separation:Math.hypot(p.D-x,y2-y),closestAir,aimAngle,bulletGrounded:+grounded,monkeyGrounded:+monkeyOnGround,met:0,collided:0,impactAge:-1,impactLoss:0};
 },{events,hitTime,closestTime,closestAir,bulletGround,monkeyGround,freeBulletGround,freeMonkeyGround,aimAngle,endLabel:'兩物體皆已觸地；可拖曳時間回看碰撞與落點。'});
},'models/shoot-monkey.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
