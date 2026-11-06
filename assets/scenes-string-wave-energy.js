'use strict';
function drawStringWaveEnergy(s){const sim=simulation,L=params.lambda,b=sim.base,vs=.4/(params.A*sim.omega*(params.mode===2?2:1)),ts=.65/sim.tension;let prev=null;for(let i=0;i<=128;i++){const x=-L+2*L*i/128,q=sim.field(x,t),pos=[x,b+q.u,0];if(prev)segment(prev,pos,'#5a9e9f',2);if(i%4===0){sphere(pos,.045,'#5a9e9f');if(params.showV)arrow(pos,[x,b+q.u+q.ut*vs,0],'#4b88b4','');}prev=pos;}
const ends=[sim.probeX-sim.probeLength/2,sim.probeX+sim.probeLength/2],a=ends.map(x=>{const q=sim.field(x,t);return{x,pos:[x,b+q.u,0],q};});segment(a[0].pos,a[1].pos,'#d49d48',4);sphere(point(s),.075,'#d49d48');label([s.x,s.y+.45,0],'追蹤短繩段質心','#a57b38',11);
if(params.showTension)for(let i=0;i<2;i++){const q=a[i],sign=i?1:-1;arrow(q.pos,[q.x+sign*sim.tension*ts,q.pos[1]+sign*sim.tension*q.q.ux*ts,0],'#a078b5',i?'T右':'T左');}
label([0,3.2,0],params.mode===2?'駐波：平均能流=0':params.mode===1?'← 左行波':'右行波 →','#5a828e',12);label([0,.8,0],'兩波長總能 '+format(s.integratedEnergy)+' J','#a078b5',11);label([0,.4,0],'下方圖表：動能／彈性位能／總能密度','#627f88',11);
}
