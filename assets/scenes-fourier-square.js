'use strict';function drawFourierSquare(s){const sim=simulation,p=params,theta=2*Math.PI*p.frequency*t;
for(let row=0;row<6;row++){const y=16-row*3,N=Math.min(row+1,p.terms),active=row<p.terms;let c=[-5,y,0];
if(active){const q=sim.partials[row],r=q.amplitude;ring([-7,y,0],r,'xy','#719ca1',1);const v=[-7+r*Math.cos(q.n*theta),y+r*Math.sin(q.n*theta),0];segment([-7,y,0],v,'#719ca1',2);sphere(v,.055,'#719ca1');label([-7,y+1.4,0],'sin('+q.n+'θ)/'+q.n,'#719ca1',10);}
for(let j=0;j<N;j++){const q=sim.partials[j],next=[c[0]+q.amplitude*Math.cos(q.n*theta),c[1]+q.amplitude*Math.sin(q.n*theta),0];ring(c,q.amplitude,'xy','#68848b',1);segment(c,next,'#b8925b',1);c=next;}
segment(c,[-1,y+sim.sum(t,N),0],'#829ca1',1,true);segment([-1,y,0],[7,y,0],'#69858a',1);let last;
for(let k=0;k<=400;k++){const tau=sim.window*k/400,x=-1+8*k/400,pos=[x,y+sim.sum(t+tau,N),0];if(last)segment(last,pos,active?'#dfa956':'#5e7478',2);last=pos;if(p.target&&k%2===0&&k<400){const a=sim.ideal(t+tau),b=sim.ideal(t+sim.window*(k+1)/400);segment([x,y+a,0],[-1+8*(k+1)/400,y+b,0],'#69858a',1);}}
label([3,y+1.35,0],active?'前'+N+'項部分和':'未加入此項','#b1bfc0',11);
}label([0,18,0],'奇次諧波圓投影 → 逐項疊加 → 方波','#d9b074',14);}
