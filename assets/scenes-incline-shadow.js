'use strict';
function drawInclineShadow(s){
 const samples=plotSamples,e=simulation.tangent,shadow=q=>[q.shadowX,q.shadowY,q.shadowZ],xs=samples.flatMap(q=>[q.x,q.shadowX]),zs=samples.map(q=>q.shadowZ),left=Math.min(0,...xs)-2,right=Math.max(0,...xs)+2,z0=Math.min(-2,...zs)-1,z1=Math.max(2,...zs)+1,slope=Math.tan(params.slope*Math.PI/180),plane=(x,z)=>[x,x*slope,z];
 for(let i=0;i<8;i++)for(let j=0;j<5;j++){const x=left+(right-left)*i/8,X=left+(right-left)*(i+1)/8,z=z0+(z1-z0)*j/5,Z=z0+(z1-z0)*(j+1)/5;polygon([plane(x,z),plane(X,z),plane(X,Z),plane(x,Z)],'#c0d0c5')}
 for(let j=0;j<=8;j++){const x=left+(right-left)*j/8;segment(plane(x,z0),plane(x,z1),'#78938a55',1)}
 for(let j=0;j<=5;j++){const z=z0+(z1-z0)*j/5;segment(plane(left,z),plane(right,z),'#78938a55',1)}
 if($('trail').checked){let previous=simulation.sample(0);for(let j=1;j<=100;j++){const next=simulation.sample(t*j/100);segment(shadow(previous),shadow(next),'#704891',3);previous=next}}
 const q=shadow(s),r=[s.x,s.y,0],size=Math.max(.12,Math.min(.3,(right-left)*.012));
 const visible=q.map((x,i)=>x+simulation.normal[i]*size*.2);
 sphere(visible,size*.8,'#4a3b58');sphere(r,size,'#cb626f');label([q[0],q[1]+.5,q[2]],'坡面影子','#704891',11);label([r[0],r[1]+.6,0],'小球','#a14859',11);
 if(params.rays){segment(r,q,'#d69a36',2,true);const d=simulation.lightDirection;arrow(r.map((x,i)=>x-d[i]*2),r,'#b58628','平行光')}
 if($('vectors').checked)arrow(q,q.map((x,i)=>x+[s.shadowVx,s.shadowVy,s.shadowVz][i]*velocityScale),'#704891','v影');
 if($('forces').checked&&s.shadowAcceleration>1e-8){const a=[s.shadowAx,s.shadowAy,s.shadowAz],length=Math.min(2,Math.max(.5,(right-left)*.06));arrow(q,q.map((x,i)=>x+a[i]/s.shadowAcceleration*length),'#9c6ab8','a影（方向）')}
 label(plane(left,z1),'斜面 '+params.slope+'° · 影子在坡面內','#526c77',11);
}
