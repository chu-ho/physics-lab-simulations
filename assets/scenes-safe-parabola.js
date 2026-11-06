'use strict';
function drawSafeParabola(s){
 const p=params,R=simulation.maxRange,A=simulation.A,B=simulation.B,r=Math.max(.07,R*.006),source=[0,p.h,0];
 const curve=(fn,start,end,color,width=1,dashed=false)=>{let previous=fn(start);for(let j=1;j<=160;j++){const next=fn(start+(end-start)*j/160);if(previous[1]>=-1e-8&&next[1]>=-1e-8)segment(previous,next,color,width,dashed);previous=next}};
 segment([-R,0,0],[R,0,0],'#607a82',2);segment([0,0,0],source,'#607a82',2,true);label([0,p.h+Math.max(.5,A*.08),0],'共同發射點 · '+p.h+' m');
 if(p.envelope){curve(x=>[x,simulation.envelope(x),0],-R,R,'#c26f32',3);label([R*.55,simulation.envelope(R*.55)+A*.05,0],'安全包絡','#a65e28',11)}
 // Display representative complete paths, stopping precisely at each ground impact.
 if($('trail').checked)for(let j=0;j<simulation.family.length;j+=3){const f=simulation.family[j];curve(t=>[f.ux*t,p.h+f.uy*t-.5*p.g*t*t,0],0,f.land,'#16857935',1)}
 if(p.ellipse){curve(a=>[A*Math.sin(2*a),p.h+B-B*Math.cos(2*a),0],0,Math.PI,'#8b5ac4',2,true);label([-A*.75,p.h+B*1.8,0],'頂點橢圓','#8b5ac4',11)}
 if(p.circle&&s.circleRadius>0){curve(a=>[s.circleRadius*Math.cos(a),s.circleY+s.circleRadius*Math.sin(a),0],0,2*Math.PI,'#357dba',2,true);const top=s.circleY+s.circleRadius;if(top>=0)label([0,top+Math.max(.3,A*.04),0],'同時圓（自由飛行部分）','#357dba',11)}
 for(const ball of s.balls)sphere([ball.x,ball.y,0],r);
 sphere([s.x,s.y,s.z],r*1.6);label([s.x,s.y+Math.max(.4,A*.06),0],p.angle+'°'+(s.landed?' · 已觸地':''),'#a65e28',11);
}

