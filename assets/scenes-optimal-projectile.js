'use strict';
function drawOptimalProjectile(s){
 const sim=simulation,p=params,R=Math.max(1,sim.optimalRange),radius=Math.max(.08,R*.008),lo=Math.min(0,sim.selected.x)-R*.08,hi=Math.max(sim.optimal.x,sim.selected.x)+R*.08,up=Math.max(.4,R*.035);
 for(const z of [-1,0,1])segment([lo,sim.slopeAt(lo),z],[hi,sim.slopeAt(hi),z],'#607a82',z===0?3:1);
 for(let i=0;i<=12;i++){const x=lo+(hi-lo)*i/12;segment([x,sim.slopeAt(x),-1],[x,sim.slopeAt(x),1],'#607a8240',1)}
 segment([0,0,0],[0,p.h,0],'#607a82',2,true);label([0,p.h+up,0],'發射高度 '+p.h.toFixed(1)+' m','#526c77',11);
 for(const [f,color,name] of [[sim.selected,'#168579','選定'],[sim.optimal,'#8b5ac4','最佳']]){
  if($('trail').checked){let last=[0,p.h,0];for(let i=1;i<=100;i++){const T=f.land*i/100,next=[f.ux*T,p.h+f.uy*T-.5*p.g*T*T,0];segment(last,next,color+'88',2);last=next}}
  segment([f.x,f.y,-.5],[f.x,f.y,.5],color,3);sphere([f.x,f.y,0],radius*.45,color);label([f.x,f.y+up*(name==='最佳'?2:1),0],name+' '+f.angle.toFixed(1)+'° · '+f.range.toFixed(2)+' m',color,11);
 }
 sphere([s.x,s.y,0],radius,'#168579');sphere([s.x2,s.y2,0],radius*.85,'#8b5ac4');
 label([sim.optimal.x*.5,sim.slopeAt(sim.optimal.x*.5)-up,0],'坡角 '+p.slope+'° · 射程沿面量度','#526c77',11);
}
