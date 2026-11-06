'use strict';
function drawPulledSpool(s){
 const p=params,R=p.R,r=R*p.ratio,c=[s.x,R,0],a=simulation.pullAngle;
 for(const z of [-.28,.28]){const C=[s.x,R,z];for(let j=0;j<48;j++){const q=j*TAU/48,b=(j+1)*TAU/48;polygon([C,[s.x+R*Math.cos(q),R+R*Math.sin(q),z],[s.x+R*Math.cos(b),R+R*Math.sin(b),z]],'#70b7ad','#70b7ad')}ring(C,R,'xy','#416b72',2);for(let j=0;j<6;j++){const q=s.theta+j*TAU/6;segment(C,[s.x+R*Math.cos(q),R+R*Math.sin(q),z],'#416b72',2)}}
 const front=[s.x,R,.32];for(let j=0;j<48;j++){const q=j*TAU/48,b=(j+1)*TAU/48;polygon([front,[s.x+r*Math.cos(q),R+r*Math.sin(q),.32],[s.x+r*Math.cos(b),R+r*Math.sin(b),.32]],'#ddba79','#ddba79')}ring(front,r,'xy','#947442',2);
 const q=s.theta,mark=[s.x+R*.82*Math.cos(q),R+R*.82*Math.sin(q),.35];sphere(mark,.09,'#d57557');sphere(front,.09,'#496c71');
 const start=[s.tangentX,s.tangentY,.36],end=[start[0]+3.2*Math.cos(a),start[1]+3.2*Math.sin(a),.36];segment(start,end,'#b99752',3);sphere(start,.06,'#e7a648');arrow(end,[end[0]+.55*Math.cos(a),end[1]+.55*Math.sin(a),.36],'#bd8450','F '+p.F.toFixed(0)+' N');
 if($('forces').checked){const scale=.8/Math.max(p.m*9.81,p.F,Math.abs(s.friction),1),contact=[s.x,.05,.65];if(s.valid){arrow(contact,[contact[0]+s.friction*scale,contact[1],contact[2]],'#bd6459','f '+s.friction.toFixed(2)+' N');arrow(c,[c[0],c[1]+s.normal*scale,c[2]],'#b29853','N');arrow(c,[c[0],c[1]-p.m*9.81*scale,c[2]],'#8184ae','mg')}}
 label([s.x,R*2+.55,.3],simulation.status,s.valid?'#386c69':'#b15e4b',12);label([s.x,-.35,.4],'臨界 '+s.criticalAngle.toFixed(1)+'° · r/R '+p.ratio.toFixed(2),'#527476',11);
 if(!s.valid)label([s.x,R*2+1,.3],'所需 N='+s.normal.toFixed(2)+' N，|f|='+Math.abs(s.friction).toFixed(2)+' N > 可用範圍；停止','#b15e4b',10);
}
