/* A simultaneous family of equal-speed projectiles, in the physical x-y plane. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('safe-parabola','安全拋物線、同時圓與頂點橢圓','運動學','safe-parabola',[
 P('v','各球初速',4,20,.5,10,'m/s'),P('h','發射高度',0,15,.5,5,'m'),P('g','重力加速度',2,15,.1,9.8,'m/s²'),P('angle','觀察球仰角',0,180,5,45,'°'),
 P('envelope','安全包絡（0隱藏／1顯示）',0,1,1,1),P('circle','同時圓（0隱藏／1顯示）',0,1,1,1),P('ellipse','頂點橢圓（0隱藏／1顯示）',0,1,1,1)
],[metric('active','尚在空中球數','顆'),metric('maxRange','包絡最大水平範圍','m'),metric('circleRadius','同時圓半徑 vt','m')],
 'y包絡=h+v₀²/(2g)−gx²/(2v₀²)；x²+(y−h+gt²/2)²=(v₀t)²；[x/(v₀²/2g)]²+[(y−h−v₀²/4g)/(v₀²/4g)]²=1',
 '在同一 x-y 平面由同一點向全圓各方向同時發射 72 顆等初速、各 1 kg 的球，無空氣阻力，全部尺寸採公尺；3D 視角只用於觀察此平面。球觸地後停留並由地面支持，不保留入射速度。同時圓指尚未碰地的自由飛行位置，其地面以下部分不繪製；落地球不再位於同時圓。頂點橢圓僅取初速向上的拋體之未來最高點；安全包絡為連續角度族的邊界，有限顆示例球未必恰好相切。',
 ['為什麼同時發射的球在落地之前都位於同一個圓上？','最高點的軌跡與安全包絡為什麼不同？提高發射高度會如何改變最大射程？'],p=>{
 const A=p.v*p.v/(2*p.g),B=A/2,maxRange=p.v/p.g*Math.sqrt(p.v*p.v+2*p.g*p.h),duration=(p.v+Math.sqrt(p.v*p.v+2*p.g*p.h))/p.g;
 const flight=angle=>{const a=angle*Math.PI/180,ux=p.v*Math.cos(a),uy=p.v*Math.sin(a),land=(uy+Math.sqrt(uy*uy+2*p.g*p.h))/p.g;return{angle,ux,uy,land,range:ux*land}};
 const family=Array.from({length:72},(_,j)=>flight(j*5)),selected=flight(p.angle);
 const at=(f,t)=>{const landed=t>=f.land,T=Math.min(t,f.land);return{x:f.ux*T,y:landed?0:Math.max(0,p.h+f.uy*T-.5*p.g*T*T),z:0,vx:landed?0:f.ux,vy:landed?0:f.uy-p.g*T,vz:0,fx:0,fy:landed?0:-p.g,fz:0,landed:+landed,angle:f.angle}};
 return trajectory(duration,t=>{const balls=family.map(f=>at(f,t));return{...at(selected,t),balls,active:balls.filter(b=>!b.landed).length,maxRange,circleRadius:p.v*t,circleY:p.h-.5*p.g*t*t,time:t}},
 {family,selected,A,B,maxRange,envelope:x=>p.h+A-p.g*x*x/(2*p.v*p.v),apex:angle=>{const a=angle*Math.PI/180;return{x:A*Math.sin(2*a),y:p.h+A*Math.sin(a)**2,z:0}},events:[{t:duration,label:'最後一顆球觸地，全部停止'}],endLabel:'全部球已觸地並停留'});
 },'models/safe-parabola.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);


