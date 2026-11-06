/* Event-resolved Coulomb friction on a prescribed infinite horizontal belt. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('conveyor-friction','輸送帶與摩擦力','動力學','conveyor-friction',[
P('mode','帶速模式（0 等加速／1 週期）',0,1,1,1,''),P('vB0','輸送帶初速',-3,3,.1,0,'m/s'),P('v0','箱子初速',-3,3,.1,0,'m/s'),P('aB','等加速度',-3,3,.1,1,'m/s²'),P('amplitude','週期帶速振幅',0,5,.1,3,'m/s'),P('period','週期',2,8,.2,4,'s'),P('m','箱子質量',.5,10,.5,2,'kg'),P('mus','靜摩擦係數',0,1.2,.05,.6,''),P('muk','動摩擦係數上限',0,1,.05,.4,''),P('g','重力加速度',1,15,.1,9.8,'m/s²')
],[metric('vB','帶速','m/s'),metric('vx','箱速','m/s'),metric('friction','摩擦力','N')],
'黏住：v = vb，f = m ab，|ab| ≤ μs g；滑動：f = μk mg sign(vb−v)；W驅動 = ΔK + Q',
'水平無限長輸送帶，由理想馬達指定等加速度或正弦帶速 vb = vb0 + A sin(2πt/T)。箱子一直貼帶，無鉗子抬升／放下；忽略帶與滾輪慣量。動摩擦係數取 min(設定上限, μs)。速度追上後判斷靜摩擦能否維持；否則重新滑動。各滑動段解析運動，捕獲與脫離事件二分定位；週期事件以不大於週期 1/1000 的小區間搜尋，不把跨越捕獲當持續滑動。熱量為摩擦相對滑移耗散，驅動功僅計馬達經接觸傳給箱子及熱的部分。皮帶示意窗可延伸，沒有帶端落地。觀察 8 秒。',
['等加速時帶速和箱速相同，為何仍可能需要靜摩擦？','週期帶速反向時摩擦何時轉向？追上輸送帶一定會黏住嗎？'],p=>{
const duration=8,w=2*Math.PI/p.period,muk=Math.min(p.muk,p.mus),ak=muk*p.g,limit=p.mus*p.g,dt=Math.min(.005,p.period/1000),vb=t=>p.vB0+(p.mode?p.amplitude*Math.sin(w*t):p.aB*t),ab=t=>p.mode?p.amplitude*w*Math.cos(w*t):p.aB,xb=t=>p.vB0*t+(p.mode?p.amplitude*(1-Math.cos(w*t))/w:.5*p.aB*t*t),segments=[],events=[];
let t=0,x=0,v=p.v0,Q=0,W=0,guard=0;
function root(fn,lo,hi){for(let k=0;k<45;k++){const mid=(lo+hi)/2;if(fn(mid)>0)hi=mid;else lo=mid}return(lo+hi)/2}
while(t<duration-1e-10&&guard++<1000){
 const relative=vb(t)-v,stick=Math.abs(relative)<1e-8&&Math.abs(ab(Math.min(duration,t+1e-8)))<=limit+1e-10,sign=Math.abs(relative)>1e-8?Math.sign(relative):Math.sign(ab(Math.min(duration,t+1e-8)))||1,a=stick?0:ak*sign;
 let end=duration,type='';
 if(stick){const f=z=>Math.abs(ab(z))-limit;let prev=t;for(let z=Math.min(t+dt,duration);z<=duration+1e-10;z=Math.min(z+dt,duration)){if(f(z)>1e-10){end=root(f,prev,z);type='超過靜摩擦；開始滑動';break}if(z>=duration)break;prev=z}}
 else {const f=z=>-sign*(vb(z)-v-a*(z-t));let prev=t;for(let z=Math.min(t+dt,duration);z<=duration+1e-10;z=Math.min(z+dt,duration)){if(f(z)>1e-10){end=root(f,prev,z);type='相對速度歸零；重新判斷黏住';break}if(z>=duration)break;prev=z}}
 if(end<=t+1e-11){end=Math.min(duration,t+1e-8)}
 const seg={t0:t,t1:end,x0:x,v0:v,Q0:Q,W0:W,stick,a};segments.push(seg);const h=end-t,nv=stick?vb(end):v+a*h,nx=stick?x+xb(end)-xb(t):x+v*h+.5*a*h*h,dK=.5*p.m*(nv*nv-v*v),dW=stick?dK:p.m*a*(xb(end)-xb(t));Q+=stick?0:dW-dK;W+=dW;x=nx;v=nv;t=end;
 if(type&&end<duration-1e-10){events.push({t:end,label:type});if(!stick)v=vb(t)}
}
if(guard>=1000)throw Error('conveyor friction event loop did not converge');
function state(t){let lo=0,hi=segments.length-1;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(segments[mid].t1<=t)lo=mid+1;else hi=mid}const q=segments[lo],h=t-q.t0,v=q.stick?vb(t):q.v0+q.a*h,x=q.stick?q.x0+xb(t)-xb(q.t0):q.x0+q.v0*h+.5*q.a*h*h,a=q.stick?ab(t):q.a,F=p.m*a,K=.5*p.m*v*v,dK=K-.5*p.m*q.v0*q.v0,dW=q.stick?dK:F*(xb(t)-xb(q.t0)),heat=q.Q0+(q.stick?0:dW-dK);return{x,y:1.65,z:0,vx:v,fx:F,ax:a,vB:vb(t),aB:ab(t),beltX:xb(t),relativeSpeed:vb(t)-v,friction:F,K,Q:heat,W:q.W0+dW,E:K+heat,sticking:q.stick?1:0,muk}}
const points=Array.from({length:161},(_,i)=>state(duration*i/160).x),min=Math.min(-6,...points)-2,max=Math.max(6,...points)+2;
return trajectory(duration,state,{events,segments,beltVelocity:vb,beltAcceleration:ab,beltPosition:xb,bounds:{min:[min,0,-1.6],max:[max,3.5,1.6]},endLabel:'8 秒輸送帶觀察結束'});
},'models/conveyor-friction.js');
const d=M.defs.find(d=>d.id==='conveyor-friction');d.plotMetrics=[metric('vB','帶速','m/s'),metric('vx','箱速','m/s'),metric('relativeSpeed','相對速度','m/s'),metric('friction','摩擦力','N'),metric('Q','累積熱量','J'),metric('W','驅動功','J'),metric('K','動能','J')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
