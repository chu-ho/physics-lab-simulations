'use strict';function drawEcho(s){
const sim=simulation,d=sim.d,c=sim.c,a=sim.scale,D=sim.pulseDuration;
box([5,-.4,0],[12,.25,4],'#b8c4b4');box([10.3,1.5,0],[.6,3.8,3.4],'#839194');label([10.2,3.7,0],'山壁','#596e72',13);
sphere([0,1.5,0],.23,'#cfac77');segment([0,.3,0],[0,1.25,0],'#486f80',5);segment([0,.9,0],[.4,1.1,0],'#486f80',3);label([0,2.15,0],'發聲者／聽者','#476e79',12);
for(let i=0;i<=5;i++){const x=2*i;segment([x,-.1,0],[x,.03,0],'#7b8c90',1);label([x,-.4,0],(d*i/5).toFixed(1)+' m','#6c8187',10);}
function arc(x,color,weight=1){for(let j=0;j<24;j++){const q=2*Math.PI*j/24,r=2*Math.PI*(j+1)/24;segment([x,1.15+.85*Math.cos(q),.85*Math.sin(q)],[x,1.15+.85*Math.cos(r),.85*Math.sin(r)],color,weight);}}
if(params.wavefronts){for(let j=0;j<9;j++){const emitted=D*j/8,age=t-emitted;if(age<0)continue;const travelled=c*age,amp=sim.envelope(emitted);if(travelled<=d)arc(travelled*a,'rgba(200,141,67,'+(.15+.7*amp).toFixed(3)+')',1.5);else if(travelled<=2*d&&params.reflection>0)arc((2*d-travelled)*a,'rgba(62,137,158,'+(.1+.8*amp*params.reflection).toFixed(3)+')',1.5);}}
if(params.packets){let previousA,previousB;for(let j=0;j<=180;j++){const x=d*j/180,u=sim.envelope(t-x/c),v=params.reflection*sim.envelope(t-(2*d-x)/c),qa=[x*a,2.3+u*.65,-.5],qb=[x*a,2.3+v*.65,.5];if(previousA){segment(previousA,qa,'#c88d43',2);segment(previousB,qb,'#3e899e',2);}previousA=qa;previousB=qb;}label([4,3.3,-.5],'原聲包絡 →','#b27a35',11);label([7,3.3,.5],'← 回聲包絡','#397e92',11);}
label([5,4.1,0],'往返 '+s.delay.toFixed(3)+' s · '+s.soundSpeed.toFixed(1)+' m/s','#426d77',13);
label([5,-.9,0],params.reflection===0?'反射振幅為零：沒有回聲':params.volumeGain===0?'音量為零：僅顯示時序':s.overlap?'原聲與回聲時間重疊':s.distinct?'空隙達到設定辨識間隔':'不重疊，但空隙小於設定辨識間隔','#7c725b',12);
label([5,-1.25,0],'空隙 '+s.gap.toFixed(3)+' s · 辨識間隔 '+params.threshold.toFixed(2)+' s（教學近似）','#7a8b8e',10);
}
