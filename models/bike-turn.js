/* Reduced roll dynamics: point mass on massless strut, circular prescribed contact. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
const display=P('comparison','顯示平衡傾角對照',0,1,1,1,'');display.visual=true;
M.register('bike-turn','過彎傾身與失去接觸','圓周與轉動','bike-turn',[
P('m','人車總質量',40,120,5,70,'kg'),P('v','平衡對照質心速率',1,12,.5,5,'m/s'),P('R','平衡對照質心半徑',3,15,.5,8,'m'),P('h','接觸至質心距離',.7,1.5,.1,1,'m'),P('mu','靜摩擦係數',0,1.5,.05,.7,''),P('offset','初傾角相對平衡值',-25,25,1,0,'°'),P('roll0','初傾倒角速度',-15,15,1,0,'°/s'),display
],[metric('lean','向內傾角','°'),metric('requiredMu','所需摩擦係數',''),metric('rollRate','傾倒角速度','°/s')],
'tan φeq = v²/(gR)；φ̈ = [g sinφ − ω²(Rc−h sinφ) cosφ]/h；|f| ≤ μs N',
'水平彎道的簡化傾倒模型：人車合質量集中在長 h 的無質量支架頂端，輪地接觸點由理想轉向約束沿半徑 Rc=R+h sinφeq 的圓以角速度 ω=v/R 前進。平衡時質心半徑 R、速率 v；偏離平衡後實際質心速率會改變。由支架拉格朗日方程積分傾角，並由質心加速度求正向力與水平摩擦（含切向分量）。這不是含輪胎、輪軸陀螺及轉向回正的完整單車模型；沒有自動平衡控制。接觸失壓、摩擦圓超限或質心降至 0.1h 時精確停止，只顯示失效前瞬間，不模擬失效後滑出或撞地。初值已不滿足接觸條件時立即停止。平衡對照為幾何虛線，未加入穩定控制力。觀察最多 8 秒。',
['為什麼提高速率，需要更大的向內傾角與摩擦係數？','初始傾角略大或略小於平衡值，為什麼這個無轉向控制的模型不能自行回正？'],p=>{
const g=9.81,eq=Math.atan(p.v*p.v/(g*p.R)),omega=p.v/p.R,Rc=p.R+p.h*Math.sin(eq),initial=[eq+p.offset*Math.PI/180,p.roll0*Math.PI/180],dt=1/1000,rows=[{t:0,q:initial}],events=[];
const derivative=q=>[q[1],(g*Math.sin(q[0])-omega*omega*(Rc-p.h*Math.sin(q[0]))*Math.cos(q[0]))/p.h];
function step(q,h){const a=derivative(q),b=derivative(q.map((x,i)=>x+h*a[i]/2)),c=derivative(q.map((x,i)=>x+h*b[i]/2)),d=derivative(q.map((x,i)=>x+h*c[i]));return q.map((x,i)=>x+h*(a[i]+2*b[i]+2*c[i]+d[i])/6)}
function values(q,t){const phi=q[0],rate=q[1],dd=derivative(q)[1],si=Math.sin(phi),co=Math.cos(phi),r=Rc-p.h*si,dr=-p.h*co*rate,ar=-r*omega*omega-p.h*co*dd+p.h*si*rate*rate,at=2*dr*omega,ay=-p.h*co*rate*rate-p.h*si*dd,N=p.m*(g+ay),fr=p.m*ar,ft=p.m*at,F=Math.hypot(fr,ft),a=omega*t,C=Math.cos(a),S=Math.sin(a);return{x:r*C,y:p.h*co,z:r*S,vx:dr*C-r*omega*S,vy:-p.h*si*rate,vz:dr*S+r*omega*C,fx:fr*C-ft*S,fy:p.m*ay,fz:fr*S+ft*C,phi,lean:phi*180/Math.PI,rollRate:rate*180/Math.PI,angularAcceleration:dd,normal:N,friction:F,radialForce:fr,tangentialForce:ft,requiredMu:F/Math.max(1e-12,N),margin:p.mu*N-F,equilibriumLean:eq*180/Math.PI,contactX:Rc*C,contactZ:Rc*S,theta:a,radius:r,radialAcceleration:ar,tangentialAcceleration:at,ay,speed:Math.hypot(dr,r*omega),K:.5*p.m*(dr*dr+r*r*omega*omega+p.h*p.h*si*si*rate*rate),U:p.m*g*p.h*co}}
function gap(q,t){const s=values(q,t);return Math.min(s.normal/(p.m*g),s.margin/(p.m*g)+1e-10,Math.cos(q[0])-.1)}
function reason(q,t){const s=values(q,t);return s.normal<1e-6?'正向力歸零：接觸失壓':Math.cos(q[0])<=.10000001?'到達車身觸地界限':'所需摩擦達上限：失去純滾接觸'}
let duration=8,endLabel='8 秒傾倒觀察結束';
if(gap(initial,0)<-1e-10){duration=0;endLabel='初始接觸不可行：'+reason(initial,0);events.push({t:0,label:endLabel})}
else for(let t=0;t<8-1e-12;){const q=rows[rows.length-1].q,h=Math.min(dt,8-t),next=step(q,h);if(gap(next,t+h)<0){let lo=0,hi=h;for(let k=0;k<45;k++){const mid=(lo+hi)/2;if(gap(step(q,mid),t+mid)>=0)lo=mid;else hi=mid}duration=t+lo;const last=step(q,lo);rows.push({t:duration,q:last});endLabel=reason(last,duration)+'；停止於失效前瞬間';events.push({t:duration,label:endLabel});break}t+=h;rows.push({t,q:next})}
function sample(t){let lo=0,hi=rows.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(rows[mid].t<=t)lo=mid;else hi=mid-1}const q=step(rows[lo].q,Math.max(0,t-rows[lo].t));return values(q,t)}
const extent=Rc+p.h+1;return trajectory(duration,sample,{events,endLabel,bounds:{min:[-extent,0,-extent],max:[extent,3,extent]},equilibrium:eq,contactRadius:Rc,omega,rollDerivative:derivative});
},'models/bike-turn.js');
const d=M.defs.find(d=>d.id==='bike-turn');d.plotMetrics=[...d.metrics,metric('normal','正向力','N'),metric('friction','水平摩擦力','N'),metric('margin','摩擦餘裕','N')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
