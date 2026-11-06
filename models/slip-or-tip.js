/* Finite rectangular rigid body released on a fixed inclined plane. */
(function(M){
'use strict';
const {P,M:metric,trajectory,rad}=M.helpers;
M.register('slip-or-tip','滑下或倒下','靜力學','slip-or-tip',[
 P('slope','固定坡角',0,70,1,35,'°'),P('b','沿坡底寬',.5,3,.1,1,'m'),P('h','法向塊高',.5,4,.1,2,'m'),P('m','塊體質量',1,10,.5,3,'kg'),P('mus','靜摩擦係數',0,2,.05,.8,''),P('muk','動摩擦係數上限',0,1.5,.05,.5,'')
],[metric('slipAngle','滑動臨界角','°'),metric('tipAngle','翻倒臨界角','°'),metric('thetaDeg','塊體轉角','°')],
 '滑動：tan α > μs；翻倒：tan α > b/h；I角 θ̈ = mg x質心／角',
 '均勻矩形塊由靜止釋放，坡角在單次播放中固定。兩個臨界角表示緩慢提高坡角時的首次失穩次序；等號是臨界平衡。若兩門檻都超過，依較早失穩者選分支，並驗證所選接觸是否可行；這不是任意放置後的多接觸完整剛體求解。滑動分支保持底面貼坡；動摩擦取 min(設定上限, μs)。翻倒分支繞坡下角無滑動旋轉，只在正向支持力及靜摩擦錐內有效；接觸失效或另一側面接坡時停止，不捏造後續碰撞。重力、支持及摩擦是實際分力；合力箭頭作用於質心。',
 ['改變 b/h 與 μs，哪一種失穩先發生？','滑動時支持力作用點為何由動摩擦決定？'],p=>{
 const a=rad(p.slope),c=Math.cos(a),s=Math.sin(a),g=9.81,k=Math.min(p.muk,p.mus),I=p.m*(p.b*p.b+p.h*p.h)/3,ratio=p.b/p.h,eps=1e-10;
 const mode=Math.tan(a)<=Math.min(p.mus,ratio)+eps?'stable':p.mus<ratio-eps?'slide':'tip',slipAngle=Math.atan(p.mus)*180/Math.PI,tipAngle=Math.atan(ratio)*180/Math.PI;
 const coord=(u,v)=>[u*c+v*s,5-u*s+v*c];
 const tip=q=>{const [theta,w]=q,u=-p.b/2*Math.cos(theta)+p.h/2*Math.sin(theta),v=p.b/2*Math.sin(theta)+p.h/2*Math.cos(theta),dd=p.m*g*(u*c+v*s)/I,au=dd*v-w*w*u,av=-dd*u-w*w*v;return{theta,w,u,v,dd,au,av,N:p.m*(av+g*c),F:p.m*(au-g*s)}};
 const step=(q,dt)=>{const f=x=>[x[1],tip(x).dd],k1=f(q),k2=f(q.map((v,i)=>v+dt*k1[i]/2)),k3=f(q.map((v,i)=>v+dt*k2[i]/2)),k4=f(q.map((v,i)=>v+dt*k3[i]));return q.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6)};
 const feasible=q=>{const z=tip(q);return Math.min(z.N,p.mus*z.N-Math.abs(z.F),Math.PI/2-z.theta)};
 let duration=4,reason=mode==='stable'?'固定坡角下保持平衡':mode==='slide'?'觀察結束；尚未遇到坡底':'觀察結束；單角接觸仍有效',table=[[0,0]],dt=.001;
 if(mode==='tip'){
  if(feasible([0,0])<0){duration=0;reason='起始角接觸不符合摩擦錐；停止於釋放前，需多接觸模型'}
  else for(let j=1;j<=4000;j++){const next=step(table[j-1],dt);if(feasible(next)<0){let lo=0,hi=dt;for(let n=0;n<45;n++){const mid=(lo+hi)/2;if(feasible(step(table[j-1],mid))>=0)lo=mid;else hi=mid}duration=(j-1)*dt+lo;const last=step(table[j-1],lo);table.push(last);reason=last[0]>Math.PI/2-1e-6?'另一側面接坡前；未模擬碰撞':'角接觸失效前；未模擬滑動／離地';break}table.push(next)}
 }
 const sample=t=>{let u=0,v=p.h/2,du=0,dv=0,au=0,av=0,N=p.m*g*c,F=-p.m*g*s,theta=0,w=0,dd=0,support=p.h/2*Math.tan(a),travel=0;
  if(mode==='slide'){au=g*(s-k*c);travel=.5*au*t*t;du=au*t;u=travel;F=-k*N;support=p.h*k/2}
  if(mode==='tip'){const j=Math.min(Math.floor(t/dt),table.length-1),q=step(table[j],Math.max(0,t-j*dt)),z=tip(q);({theta,w,dd,N,F,au,av}=z);u=p.b/2+z.u;v=z.v;du=w*z.v;dv=-w*z.u;support=p.b/2}
  const [x,y]=coord(u,v),K=mode==='tip'?.5*I*w*w:.5*p.m*(du*du+dv*dv),U=p.m*g*y;
  return{x,y,z:0,vx:du*c+dv*s,vy:-du*s+dv*c,fx:p.m*(au*c+av*s),fy:p.m*(-au*s+av*c),theta,thetaDeg:theta*180/Math.PI,omega:w,angularAcceleration:dd,along:u,normal:v,travel,N,friction:F,supportAlong:mode==='slide'?travel+support:support,projectionAlong:u+v*Math.tan(a),slipAngle,tipAngle,modeCode:mode==='stable'?0:mode==='slide'?1:2,K,U,E:K+U,heat:mode==='slide'?k*N*travel:0};
 };
 return trajectory(duration,sample,{mode,coord,pivot:coord(p.b/2,0),events:[{t:0,label:mode==='stable'?'臨界內／邊界平衡':mode==='slide'?'滑動分支':'繞坡下角翻倒分支'},{t:duration,label:reason}],endLabel:reason});
},'models/slip-or-tip.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
