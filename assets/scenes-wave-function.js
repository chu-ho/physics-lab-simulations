'use strict';
function drawWaveFunction(s){const sim=simulation,b=sim.base,Z=sim.timeToZ,pt=(x,tau)=>[x,b+sim.field(x,tau).u,Z(tau)];
// Surface coordinates are x, displacement and DISPLAY TIME, never physical z.
if(params.surface){const nx=48,nt=24;for(let j=0;j<nt;j++)for(let i=0;i<nx;i++){const x=-6+12*i/nx,x1=x+12/nx,a=sim.duration*j/nt,c=sim.duration*(j+1)/nt;polygon([pt(x,a),pt(x1,a),pt(x1,c),pt(x,c)],'#68a3a31c','#6c9d9b38');}}
segment([-6,b,1],[6,b,1],'#879f9c',1);label([6.2,b,1],'x (m)','#b7cdc7',11);segment([-6,b,1],[-6,b,9],'#879f9c',1);label([-6.2,b+.4,9.4],'時間 τ (s)，非物理z','#b7cdc7',11);
for(let j=0;j<=4;j++){const tau=sim.period*j,z=Z(tau);segment([-6.15,b,z],[-5.85,b,z],'#879f9c',1);label([-6.4,b-.35,z],format(tau)+' s','#b7cdc7',10);}
if(params.showYX){let a=null,c=null;for(let i=0;i<=144;i++){const x=-6+12*i/144,q=sim.field(x,t).u,pos=[x,b+q,0],other=[x,b+q,Z(t)];if(a)segment(a,pos,'#e4b96c',2.4);if(c)segment(c,other,'#e4b96c',2.4);if(i%6===0)sphere(pos,.035,'#e4b96c');a=pos;c=other;}label([-5.5,b+1.25,0],'y-x：目前 t = '+format(t)+' s','#e4b96c',11);}
if(params.showYT){let a=null;for(let i=0;i<=192;i++){const tau=sim.duration*i/192,pos=pt(params.track,tau);if(a)segment(a,pos,'#69c7ca',2.6);a=pos;}sphere(pt(params.track,t),.095,'#69c7ca');label([params.track,b+1.3,9.3],'y-t：固定 x = '+format(params.track)+' m','#69c7ca',11);}
sphere(point(s),.09,'#e4b96c');label([s.x,s.y+.3,0],'追蹤質點；實際z=0','#e4b96c',10);
}
