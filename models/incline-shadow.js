/* Parallel-light projection of ballistic motion onto an inclined plane. */
(function(M){
'use strict';
const {P,M:metric,trajectory,rad}=M.helpers;
M.register('incline-shadow','斜面上的投影','運動學','incline-shadow',[
 P('slope','坡面仰角',0,45,1,30,'°'),P('h','發射點離坡面垂直高度',2,10,.5,5,'m'),P('v','初速（0 為釋放）',0,12,.5,5,'m/s'),P('angle','發射仰角',50,90,1,70,'°'),P('lightTilt','光線偏離坡面法線',-60,60,1,25,'°'),P('azimuth','光線沿坡／側向角',-90,90,1,0,'°'),{...P('rays','顯示投影光線',0,1,1,1,''),visual:true},P('g','重力加速度',2,12,.5,10,'m/s²')
],[metric('shadowAlong','影子沿坡座標','m'),metric('shadowSpeed','影子速率','m/s'),metric('shadowAcceleration','影子加速度大小','m/s²')],
 'Q = r − (n·r)/(n·d) d；v影 = v − (n·v)/(n·d) d；a影 = g − (n·g)/(n·d) d',
 '平行光沿 d 方向照射，影子是光線與無限斜面 y = x tan(坡角) 的交點。小球為 1 kg 無阻力質點，至第一次接觸斜面前結束，不模擬反彈；初速設 0 可觀察釋放。光線偏離向內法線限於 ±60°，保證 |n·d| ≥ 0.5，避免光線近平行造成無限遠投影。影子無質量，紫色箭頭表示其運動學加速度，並非影子的受力；合力箭頭只屬於小球。坡面為有限顯示區，物理計算使用無限平面。',
 ['光線沿鉛直方向照射時，影子為何可能等速運動或停住？','同樣的重力，改變光線方向後影子的加速度如何改變？'],p=>{
 const a=rad(p.slope),b=rad(p.lightTilt),c=rad(p.azimuth),n=[-Math.sin(a),Math.cos(a),0],e=[Math.cos(a),Math.sin(a),0],d=n.map((v,i)=>-v*Math.cos(b)+e[i]*Math.sin(b)*Math.cos(c)+(i===2?Math.sin(b)*Math.sin(c):0)),dot=(u,v)=>u.reduce((q,x,i)=>q+x*v[i],0),den=dot(n,d);
 if(!Number.isFinite(den)||Math.abs(den)<.49)throw new RangeError('光線不得近平行坡面；偏角須在 ±60° 內');
 const projection=r=>{const distance=-dot(n,r)/den;return {point:r.map((x,i)=>x+distance*d[i]),distance}},projectVector=v=>{const k=dot(n,v)/den;return v.map((x,i)=>x-k*d[i])},vx=p.v*Math.cos(rad(p.angle)),vy=p.v*Math.sin(rad(p.angle)),relative=vy-vx*Math.tan(a),T=(relative+Math.sqrt(relative*relative+2*p.g*p.h))/p.g,acc=projectVector([0,-p.g,0]);
 return trajectory(T,t=>{const r=[vx*t,p.h+vy*t-.5*p.g*t*t,0],v=[vx,vy-p.g*t,0],q=projection(r),sv=projectVector(v);return {x:r[0],y:r[1],z:0,vx,vy:v[1],fy:-p.g,shadowX:q.point[0],shadowY:q.point[1],shadowZ:q.point[2],shadowVx:sv[0],shadowVy:sv[1],shadowVz:sv[2],shadowAx:acc[0],shadowAy:acc[1],shadowAz:acc[2],shadowAlong:dot(q.point,e),shadowSpeed:Math.hypot(...sv),shadowAcceleration:Math.hypot(...acc),rayDistance:Math.max(0,q.distance),normalHeight:dot(n,r),K:.5*dot(v,v),U:p.g*r[1],E:.5*dot(v,v)+p.g*r[1]};},{normal:n,tangent:e,lightDirection:d,projectPoint:projection,projectVector,events:[{t:T,label:'小球與影子在坡面相遇'}],endLabel:'首次接觸坡面 · 碰撞前瞬間'});
},'models/incline-shadow.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);

