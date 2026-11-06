/* Single-sided vertical semicircular track, with contact loss and first encounter events. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('half-circle','鉛直半圓軌道','動力學','half-circle',[
P('R','軌道半徑',.5,5,.1,2,'m'),P('v0','最低點初速',0,20,.1,10,'m/s'),P('g','重力加速度',1,15,.1,9.8,'m/s²'),P('m','質點質量',.2,5,.1,1,'kg')],[metric('normal','軌道正向力','N'),metric('speed','質點速率','m/s'),metric('height','質點高度','m')],
'v² = v₀² − 2gR(1−cosθ)；N = m(v²/R + g cosθ) ≥ 0；到頂保持接觸需 v₀ ≥ √(5gR)',
'無摩擦單面軌道，質點從最低點向右上行。N 降到零且繼續上行即脫離，之後作自由拋體；低初速沿軌回轉，不使用負的速率平方。到達頂端則由軌道末端飛出。模型在首次觸地或再次遇到半圓軌道前瞬間停止，保留入射速度，不推演碰撞、再接觸或反彈。球大小只是質點示意，不參與接觸幾何。高度與軌跡為真實比例；初速設於半圓最低點，不包含左側助跑。',
['初速接近 √(5gR) 時，頂端的正向力如何變化？','未到頂就脫離與沿軌回轉的初速範圍有何不同？','改變質量會影響脫離位置嗎？'],p=>{
 const R=p.R,g=p.g,q=p.v0*p.v0/(g*R),critical=Math.sqrt(5*g*R),dt=.001*Math.sqrt(R/g),rows=[[0,0,p.v0/R]],events=[{t:0,label:'最低點出發 · 臨界初速 '+critical.toFixed(2)+' m/s'}];
 const rk=(a,h)=>{const f=z=>[z[1],-g/R*Math.sin(z[0])],k1=f(a),k2=f(a.map((v,i)=>v+h*k1[i]/2)),k3=f(a.map((v,i)=>v+h*k2[i]/2)),k4=f(a.map((v,i)=>v+h*k3[i]));return a.map((v,i)=>v+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6)};
 const detach=q>2&&q<5,target=detach?Math.acos((2-q)/3):Math.PI;
 let endType='rest',exitT=0,exitA=[0,0],turned=false;
 if(p.v0>0)for(let i=0;i<30000;i++){
 const a=rows[rows.length-1],b=rk(a.slice(1),dt);let boundary=null;
 if(!turned&&a[2]>0&&b[1]<=0){let l=0,h=dt;for(let j=0;j<45;j++){const mid=(l+h)/2;if(rk(a.slice(1),mid)[1]>0)l=mid;else h=mid}events.push({t:a[0]+(l+h)/2,label:'沿軌最高點 · 速率為零後回轉'});turned=true;}
 if(!turned&&b[0]>=target)boundary={key:0,value:target,type:detach?'detach':'top',ascending:true};
 if(turned&&b[0]<=0)boundary={key:0,value:0,type:'bottom',ascending:false};
 if(boundary){let l=0,h=dt;for(let j=0;j<45;j++){const mid=(l+h)/2,v=rk(a.slice(1),mid)[0];if(boundary.ascending?v<boundary.value:v>boundary.value)l=mid;else h=mid}const h0=(l+h)/2;exitT=a[0]+h0;exitA=rk(a.slice(1),h0);exitA[0]=boundary.value;rows.push([exitT,...exitA]);endType=boundary.type;break;}
 rows.push([a[0]+dt,...b]);
 }
 const onTrack=(theta,omega)=>{const sn=Math.sin(theta),c=Math.cos(theta),v=R*omega,normal=Math.max(0,p.m*(v*v/R+g*c));return{x:R*sn,y:R*(1-c),z:0,vx:v*c,vy:v*sn,vz:0,fx:-normal*sn,fy:normal*c-p.m*g,fz:0,theta,omega,normal,speed:Math.abs(v),height:R*(1-c),phase:0}};
 const exit=onTrack(...exitA);let flightTime=0,stopType=endType==='rest'?'rest':'ground';
 if(endType==='detach'||endType==='top'){
 flightTime=(exit.vy+Math.sqrt(exit.vy*exit.vy+2*g*exit.y))/g;
 const ry=exit.y-R,A=exit.vx*exit.vx+exit.vy*exit.vy-g*ry,B=-g*exit.vy,C=g*g/4,D=B*B-4*C*A;
 if(D>=-1e-8){const root=Math.sqrt(Math.max(0,D));for(const tau of [(-B-root)/(2*C),(-B+root)/(2*C)])if(tau>1e-6&&tau<flightTime-1e-8){const x=exit.x+exit.vx*tau,y=exit.y+exit.vy*tau-.5*g*tau*tau;if(x>=-1e-8&&y>=-1e-8&&y<=2*R+1e-8){flightTime=tau;stopType='track';}}}
 events.push({t:exitT,label:endType==='detach'?'N = 0 · 脫離軌道':'抵達頂端 · 由軌道末端飛出'});
 }
 const duration=exitT+flightTime;
 if(duration>0)events.push({t:duration,label:stopType==='track'?'首次再次遇到軌道 · 碰撞前停止':endType==='bottom'?'沿軌回到底端 · 停於離軌前瞬間':'首次觸地 · 碰撞前停止'});
 const sample=t=>{let s;if(t<=exitT){let lo=0,hi=rows.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(rows[mid][0]<=t)lo=mid;else hi=mid}const a=rows[lo];s=onTrack(...rk(a.slice(1),Math.max(0,t-a[0])));}else{const tau=t-exitT,y=exit.y+exit.vy*tau-.5*g*tau*tau,vy=exit.vy-g*tau;s={...exit,x:exit.x+exit.vx*tau,y,vx:exit.vx,vy,fx:0,fy:-p.m*g,normal:0,speed:Math.hypot(exit.vx,vy),height:y,phase:1};}s.K=.5*p.m*s.speed*s.speed;s.U=p.m*g*s.y;s.E=s.K+s.U;return s;};
 let minX=-R,maxX=R,maxY=2*R;for(let i=0;i<=100;i++){const s=sample(duration*i/100);minX=Math.min(minX,s.x);maxX=Math.max(maxX,s.x);maxY=Math.max(maxY,s.y)}
 return trajectory(duration,sample,{R,critical,exitT,exitState:exit,exitType:endType,stopType,events:events.sort((a,b)=>a.t-b.t),endLabel:duration?events[events.length-1].label:'初速為零 · 保持靜止',bounds:{min:[minX-1,0,-1.5],max:[maxX+1,maxY+1,1.5]}});
},'models/half-circle.js');
M.defs.find(d=>d.id==='half-circle').plotMetrics=[metric('K','動能','J'),metric('U','重力位能','J'),metric('E','機械能','J')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
