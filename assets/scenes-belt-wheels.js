'use strict';
function drawBeltWheels(s){
 const p=params,centers={A:[-5,4,0],B:[0,4,0],C:[0,4,.85],D:[5,2,.85]},colors={A:'#2b9b91',B:'#a4b95b',C:'#c985a1',D:'#d9a854'};
 function wheel(c,r,th,color,name){
  const back=[c[0],c[1],c[2]-.22],at=(a,z)=>[c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),z];
  for(let i=0;i<40;i++){const a=i*TAU/40,b=(i+1)*TAU/40;polygon([at(a,back[2]),at(b,back[2]),at(b,c[2]),at(a,c[2])],color,'#68817a');polygon([c,at(a,c[2]),at(b,c[2])],color,color)}
  ring(c,r,'xy','#46616a',2);
  for(let i=0;i<6;i++){const a=th+i*TAU/6;segment(c,at(a,c[2]+.015),'#496979',2)}
  const mark=at(th,c[2]+.035);sphere(mark,.1,'#f7f6e6');segment(c,mark,'#e87942',4);sphere(c,.13,'#46616a');
  label([c[0],c[1]+r+.35,c[2]],name+' · '+s['omega'+name].toFixed(2)+' rad/s','#36555c',12);
  label([c[0],c[1]-r-.35,c[2]],s['turns'+name].toFixed(2)+' 圈','#36555c',11);
 }
 // Exact external tangents and wrap arcs; arc-length traversal gives belt markers constant linear speed.
 function belt(c1,c2,r1,r2,speed,color){
  const dx=c2[0]-c1[0],dy=c2[1]-c1[1],d=Math.hypot(dx,dy),phi=Math.atan2(dy,dx),alpha=Math.acos((r1-r2)/d),z=c1[2]+.05;
  const pos=(c,r,a)=>[c[0]+r*Math.cos(a),c[1]+r*Math.sin(a),z],points=[];
  for(let i=0;i<=64;i++)points.push(pos(c1,r1,phi+alpha+(TAU-2*alpha)*i/64));
  points.push(pos(c2,r2,phi-alpha));for(let i=1;i<=64;i++)points.push(pos(c2,r2,phi-alpha+2*alpha*i/64));points.push(points[0]);
  const lengths=[0];for(let i=1;i<points.length;i++){segment(points[i-1],points[i],color,3);lengths.push(lengths[i-1]+Math.hypot(...points[i].map((v,j)=>v-points[i-1][j])))}
  const total=lengths[lengths.length-1],travel=s.turnsA*TAU/p.omegaA*speed;
  for(let j=0;j<12;j++){const q=((travel+j*total/12)%total+total)%total;let i=1;while(lengths[i]<q)i++;const f=(q-lengths[i-1])/(lengths[i]-lengths[i-1]);sphere(points[i-1].map((v,k)=>v+f*(points[i][k]-v)),.055,'#f9f5dc')}
 }
 segment([0,4,-.6],[0,4,1.35],'#526c77',7);label([0,6.5,.9],'B、C 固定同軸','#46616a',11);
 wheel(centers.A,p.rA,s.thetaA,colors.A,'A');wheel(centers.B,p.rB,s.thetaB,colors.B,'B');wheel(centers.C,p.rC,s.thetaC,colors.C,'C');wheel(centers.D,p.rD,s.thetaD,colors.D,'D');
 belt(centers.A,centers.B,p.rA,p.rB,s.beltAB,'#b5a02d');belt(centers.C,centers.D,p.rC,p.rD,s.beltCD,'#357daf');
 label([-3,6.4,0],'AB 帶速 '+s.beltAB.toFixed(2)+' m/s','#8b7b23',11);label([3,5.9,.85],'CD 帶速 '+s.beltCD.toFixed(2)+' m/s','#357daf',11);
}
