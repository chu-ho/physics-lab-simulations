'use strict';
function drawDoppler(s){const sim=simulation,source=sim.map(s.sourceX,0),observer=point(s);
segment(sim.map(sim.sourceX0,0),sim.map(sim.sourceX0+params.sourceV*sim.duration,0),'#b89b6b55',1,true);segment(sim.map(sim.observerX0,params.offset),sim.map(sim.observerX0+params.observerV*sim.duration,params.offset),'#6daab055',1,true);
if(params.fronts){const dt=sim.waveCycles/params.frequency;for(let j=0;j<=Math.floor(t/dt);j++){const q=sim.wavefront(j*dt,t);let prev=null;for(let i=0;i<=96;i++){const a=i*TAU/96,pos=sim.map(q.x+q.radius*Math.cos(a),q.radius*Math.sin(a));if(pos[0]>=-5.7&&pos[0]<=5.7&&Math.abs(pos[2])<=sim.sceneZLimit){if(prev)segment(prev,pos,'#a67d3c',2);prev=pos;}else prev=null;}}}
sphere(source,.14,'#d1a25f');sphere(observer,.14,'#6da9b3');label([source[0],2.6,source[2]],'聲源 '+params.sourceV+' m/s','#ac884a',11);label([observer[0],2.9,observer[2]],'觀察者 '+params.observerV+' m/s','#50868f',11);
if(params.analysis&&s.heard){const a=sim.map(s.convectedCenterX,0);sphere(a,.055,'#a786b1');segment(a,observer,'#a786b1',1.5,true);label([a[0],1.4,a[2]],'平流後發射中心','#97759f',10);label([0,3.7,0],'發射 τ='+format(s.retardedTime)+' s · 傳播 '+format(s.propagationDelay)+' s','#97759f',11);}
label([0,4.5,0],s.heard?'f源='+params.frequency+' Hz → f收='+format(s.observedFrequency)+' Hz':'第一個波面尚未抵達','#668a93',12);label([0,1,0],'風 '+params.wind+' m/s · c='+format(sim.c)+' m/s','#668a93',11);label([0,.5,0],'每'+sim.waveCycles+'個週期取一波面；不改變真實頻率','#7e959b',10);
}
