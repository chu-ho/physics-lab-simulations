'use strict';
function drawLongitudinalTube(s){const sim=simulation,L=params.L,b=sim.base;
for(const z of [-.65,.65])for(const y of [b-.55,b+.55])segment([-L/2,y,z],[L/2,y,z],'#7d9ca377',1);
for(const a of s.sections){const x=a.X-L/2+a.u*params.gain,q=Math.max(-1,Math.min(1,a.pressure/sim.pressureScale)),f=Math.abs(q),rgb=q>=0?[Math.round(132+90*f),Math.round(169-70*f),Math.round(171-80*f)]:[Math.round(132-50*f),Math.round(169-20*f),Math.round(171+50*f)],col=params.pressure?'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''):'#8babae';segment([x,b-.5,-.55],[x,b+.5,-.55],col,1.5);segment([x,b-.5,.55],[x,b+.5,.55],col,1.5);segment([x,b+.5,-.55],[x,b+.5,.55],col,1);}
const closed=params.mode===2||params.mode===4;if(closed){box([L/2+.05,b,0],[.1,1.3,1.4],'#799399');label([L/2,b+1,0],'閉口 ξ=0','#53717c',11);}else if(params.mode===3||params.mode===5)label([L/2,b+1,0],'開口 p′=0','#53717c',11);
if(params.mode>=4)label([-L/2,b+1,0],'開口 p′=0','#53717c',11);
if(params.pressure){segment([-L/2,4,0],[L/2,4,0],'#82969d55',1,true);let prev=null;for(let i=0;i<=160;i++){const X=L*i/160,pos=[X-L/2,4+.65*sim.field(X,t).pressure/sim.pressureScale,0];if(prev)segment(prev,pos,'#bc7c92',2);prev=pos;}label([-L/2,4.65,0],'壓力擾動（獨立比例）','#ae7086',11);}
if(params.markers){for(const X of sim.nodes){segment([X-L/2,.7,0],[X-L/2,1,0],'#66a88b',2);label([X-L/2,.4,0],'位移節','#528a73',10);}for(const X of sim.antinodes){label([X-L/2,.05,0],'位移腹','#a27c47',10);}}
const pos=point(s);segment([pos[0],b-.62,-.7],[pos[0],b+.62,-.7],'#d3a844',3);sphere(pos,.075,'#d3a844');label([pos[0],b-.85,0],'追蹤質點','#ab8532',10);
}
