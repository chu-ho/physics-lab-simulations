'use strict';
function drawTwoSourceInterference(s){const sim=simulation,b=sim.base,N=Math.max(32,Math.ceil(84/params.lambda)),gain=params.gain;const height=(x,z)=>{const q=sim.field(x,z,t);return b+gain*(params.sourceView===1?q.u1:params.sourceView===2?q.u2:q.u);};
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-7+14*i/N,z=-7+14*j/N,dx=14/N,y=height(x+dx/2,z+dx/2)-b;polygon([[x,height(x,z),z],[x+dx,height(x+dx,z),z],[x+dx,height(x+dx,z+dx),z+dx],[x,height(x,z+dx),z+dx]],y>=0?'#d996666b':'#569ec276','#82b7b12b');}
const drawLines=(lines,color)=>{for(const line of lines){for(let i=1;i<line.points.length;i++)segment(line.points[i-1],line.points[i],color,2);}};
if(params.nodes)drawLines(sim.nodeLines,'#e1d9f5');if(params.antinodes)drawLines(sim.antinodeLines,'#e8bf68');
for(let n=0;n<2;n++){const src=sim.sources[n];sphere(src,.12,n?'#71c9da':'#efaa70');label([src[0],b+1.5,0],'源'+(n+1),n?'#71c9da':'#efaa70',12);if(params.fronts){const phase=n?params.phase*Math.PI/180:0;for(let m=-20;m<=20;m++){const r=(sim.omega*t-phase+2*Math.PI*m)/sim.k;if(r<=0||r>10)continue;let prev=null;for(let j=0;j<=96;j++){const ang=j*2*Math.PI/96,x=src[0]+r*Math.cos(ang),z=r*Math.sin(ang),p=[x,b+.06,z];if(Math.abs(x)<=7&&Math.abs(z)<=7){if(prev)segment(prev,p,n?'#71c9da':'#efaa70',1);prev=p;}else prev=null;}}}}
sphere(point(s),.105,'#f7d279');label([s.x,point(s)[1]+.4,s.z],'合成追蹤點','#f7d279',10);label([-6,6.3,-6],'等幅徑向相位波；白：節線／金：腹線','#bcd2cd',11);label([-6,5.8,-6],'波面：'+['兩源合成','僅源1','僅源2'][params.sourceView]+'；垂直倍率 ×'+gain,'#bcd2cd',11);
}
