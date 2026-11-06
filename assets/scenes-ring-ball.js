'use strict';
function drawRingBall(s){
 const R=2.4,r=.2,tube=.12,c=[s.x2,r,s.z2];
 // A true torus cross-section: geometry agrees with the collision radius.
 for(let i=0;i<64;i++)for(let j=0;j<8;j++){
  const point=(a,b)=>[c[0]+(R+tube*Math.cos(b))*Math.cos(a),r+tube*Math.sin(b),c[2]+(R+tube*Math.cos(b))*Math.sin(a)];
  const a=i*TAU/64,b=j*TAU/8;
  polygon([point(a,b),point(a+TAU/64,b),point(a+TAU/64,b+TAU/8),point(a,b+TAU/8)],j<4?'#429f9c':'#277d80','#398e8c');
 }
 sphere([s.x,r,s.z],r,'#df7950');sphere(c,.045,'#315a64');
 label([s.x2,1,s.z2-R-.4],'自由圓環 · 2 kg','#267d7e',11);
 label([s.x,.8,s.z],(2*params.ratio).toFixed(1)+' kg 球','#a25334',11);
 if(params.showCOM){sphere([s.comX,.25,s.comZ],.07,'#8852b2');label([s.comX,.65,s.comZ],'合質心','#8852b2',11)}
 if(s.flash>0){const contact=[s.x2+(R-tube)*s.contactNX,r,s.z2+(R-tube)*s.contactNZ];sphere(contact,.08+.08*s.flash,'#ffbc49');label([contact[0],1.3,contact[2]],'碰撞 '+s.hits+' · '+s.impulse.toFixed(2)+' N·s','#a46425',11)}
 if($('vectors').checked)arrow(c,[s.x2+s.vx2*velocityScale,r,s.z2+s.vz2*velocityScale],'#37869d','v環');
}
