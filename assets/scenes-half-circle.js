'use strict';
function drawHalfCircle(s){
 const R=params.R;for(let j=0;j<100;j++){const a=j*Math.PI/100,b=(j+1)*Math.PI/100;segment([R*Math.sin(a),R*(1-Math.cos(a)),0],[R*Math.sin(b),R*(1-Math.cos(b)),0],'#708d9b',5)}
 segment([0,0,-.5],[0,2*R,-.5],'#9aaba7',1,true);label([-.25,R,-.5],'R = '+R.toFixed(1)+' m','#64817f',11);label([0,2*R+.5,0],'到頂臨界 v₀ = '+simulation.critical.toFixed(2)+' m/s','#57847d',12);
 sphere([s.x,s.y,0],.13,'#e6a251');label([s.x,s.y+.4,0],s.phase?'自由拋體':s.omega<0?'沿軌回轉':'接觸軌道','#97652f',11);
 if($('forces').checked){const a=[s.x,s.y,.2];arrow(a,[s.x,s.y-.7,.2],'#b96b66','mg');if(s.normal>1e-7){const sn=Math.sin(s.theta),c=Math.cos(s.theta);arrow(a,[s.x-.8*sn,s.y+.8*c,.2],'#318e81','N '+s.normal.toFixed(1)+' N')}}
 if(simulation.exitType==='detach'){const e=simulation.exitState;sphere([e.x,e.y,.05],.055,'#b377b4');label([e.x+.3,e.y,.05],'N=0 脫離點','#a16da6',10)}
}
