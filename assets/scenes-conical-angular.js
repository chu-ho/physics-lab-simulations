'use strict';
function drawConicalAngular(s,pivot){
 const origin=params.origin?[0,2,0]:pivot,center=!!params.origin;label(origin,center?'參考點：圓心':'參考點：懸點','#617988',11);
 if(params.angularView===1){const v=.9/Math.max(s.tension,params.m*params.g);arrow(point(s),[s.x+s.tensionFx*v,s.y+s.tensionFy*v,s.z+s.tensionFz*v],'#318e81','T');arrow(point(s),[s.x,s.y+s.gravityFy*v,s.z],'#b96b66','mg');}
 if(params.angularView===2){const vec=center?[s.LCx,s.LCy,s.LCz]:[s.LPx,s.LPy,s.LPz],norm=center?s.LCnorm:s.LPnorm;arrow(origin,origin.map((x,i)=>x+2*vec[i]/norm),'#8852b2','L '+norm.toFixed(2)+' kg·m²/s');}
 if(params.angularView===3){if(center)label([0,2.5,0],'合力矩 τ = 0','#a15e37',12);else{const vec=[s.tauPx,s.tauPy,s.tauPz];arrow(origin,origin.map((x,i)=>x+2*vec[i]/s.tauPnorm),'#b27c35','τ '+s.tauPnorm.toFixed(2)+' N·m');}}
}
