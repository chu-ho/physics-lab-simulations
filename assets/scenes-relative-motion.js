'use strict';
function drawRelativeMotion(s){
 const base=s.cartY;box([s.cartX,base+.35,0],[2,.35,1.2]);sphere([s.cartX-.65,base+.15,.55],.18);sphere([s.cartX+.65,base+.15,.55],.18);
 sphere(point(s),.24,'#cb626f');sphere([s.x2,s.y2,0],.24,'#427eaa');label([s.x,s.y+.65,0],'紅球','#a14859');label([s.x2,s.y2+.65,0],'藍球','#376d94');
 const names={ground:'地面系',cart:'平台系',red:'紅球系（加速）',blue:'藍球系（加速）'};label([s.cartX,base-.5,0],names[$('referenceFrame').value]||names.ground);
 if($('trail').checked&&t>0)for(let i=0;i<100;i++){const a=stateAt(t*i/100),b=stateAt(t*(i+1)/100);segment([a.x2,a.y2,0],[b.x2,b.y2,0],'#427eaa',2)}
 if($('vectors').checked)arrow([s.x2,s.y2,0],[s.x2+s.vx2*velocityScale,s.y2+s.vy2*velocityScale,0],'#427eaa','v藍′');
}
