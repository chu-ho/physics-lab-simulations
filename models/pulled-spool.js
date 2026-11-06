/* Bottom-wound cord, counterclockwise angular coordinates; no slip only while feasible. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('pulled-spool','線軸向左滾？向右滾？','動力學','pulled-spool',[
P('m','線軸質量',1,10,.5,3,'kg'),P('R','外圈半徑',.5,1.5,.1,1,'m'),P('ratio','內外半徑比 r/R',.1,.9,.05,.5,''),P('beta','慣量係數 I/(mR²)',.2,1,.05,.5,''),P('F','繩子拉力',0,80,1,10,'N'),P('angle','拉繩仰角',0,90,1,40,'°'),P('mu','靜摩擦係數',0,1.5,.05,.5,'')
],[metric('ax','水平加速度','m/s²'),metric('friction','地面摩擦力（右正）','N'),metric('criticalAngle','不滾動臨界仰角','°')],
'ma = F cosθ + f；Iα = rF + Rf；a = −Rα；a = F(cosθ−r/R)/[m(1+β)]',
'繩從內圈下側繞出，切點隨仰角改變；拉力使線軸受逆時針力矩。線軸從靜止開始，外圈純滾動，正向力 N=mg−F sinθ，I=βmR²。由平動與轉動聯立求摩擦力，靜摩擦不一定與運動方向相反。cosθ=r/R 時，地面接觸點的拉力力矩為零，線軸維持靜止。只有 N>0 且 |f|≤μsN 才播放純滾動；初值不符時停在起始位置並顯示所需正向力／摩擦，這些是不可行純滾動的診斷值，不是打滑或離地後的受力解。本題未模擬打滑、離地或繩長耗盡。觀察最多 5 秒或質心位移 6 公尺。',
['仰角跨過 arccos(r/R) 時，線軸為什麼改變滾動方向？','降低地面摩擦係數後，哪些拉力與角度已不能維持純滾動？'],p=>{
const theta=p.angle*Math.PI/180,r=p.R*p.ratio,I=p.beta*p.m*p.R*p.R,N=p.m*9.81-p.F*Math.sin(theta),a=p.F*(Math.cos(theta)-p.ratio)/(p.m*(1+p.beta)),f=p.m*a-p.F*Math.cos(theta),limit=p.mu*Math.max(0,N),valid=N>1e-10&&Math.abs(f)<=limit+1e-10;
const duration=valid?Math.min(5,Math.abs(a)>1e-12?Math.sqrt(12/Math.abs(a)):5):0,criticalAngle=Math.acos(p.ratio)*180/Math.PI;
const status=!valid?(N<=1e-10?'接觸失壓：未模擬離地':'摩擦不足：未模擬打滑'):Math.abs(a)<1e-10?'臨界仰角：線軸維持靜止':a>0?'線軸向右純滾動':'線軸向左純滾動';
return trajectory(duration,t=>{const x=valid?.5*a*t*t:0,v=valid?a*t:0;return{x,y:p.R,z:0,vx:v,vy:0,vz:0,fx:valid?p.m*a:0,fy:0,fz:0,ax:valid?a:0,theta:-x/p.R,omega:-v/p.R,alpha:valid?-a/p.R:0,friction:f,normal:N,frictionLimit:limit,requiredMu:N>0?Math.abs(f)/N:0,requiredAcceleration:a,criticalAngle,valid:valid?1:0,K:.5*(p.m+I/(p.R*p.R))*v*v,pullWork:p.F*(Math.cos(theta)-p.ratio)*x,tangentX:x+r*Math.sin(theta),tangentY:p.R-r*Math.cos(theta)}} ,{events:[{t:0,label:status}],endLabel:valid?'觀察結束：'+status:status,status,radius:p.R,innerRadius:r,inertia:I,pullAngle:theta,rollingValid:valid,bounds:{min:[-8,0,-2],max:[10,7,2]}});
},'models/pulled-spool.js');
const d=M.defs.find(x=>x.id==='pulled-spool');d.plotMetrics=[...d.metrics,metric('normal','所需正向力','N'),metric('frictionLimit','靜摩擦上限','N')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
