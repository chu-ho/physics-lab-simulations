'use strict';
function drawAirplaneDrop(s){
 const h=params.h,x=s.planeX,unit=Math.max(.8,Math.min(2.8,h*.06));
 box([x,h+.25*unit,0],[2.8*unit,.55*unit,.55*unit],'#168579');
 box([x-.2*unit,h+.25*unit,0],[.65*unit,.12*unit,3.4*unit],'#7da8a0');
 box([x-1.05*unit,h+.6*unit,0],[.55*unit,.7*unit,.14*unit],'#657f87');
 box([x-1.05*unit,h+.25*unit,0],[.55*unit,.12*unit,1.4*unit],'#657f87');
 label([x,h+1.3*unit,0],'等速飛機 '+params.v+' m/s','#168579',11);
 const radius=unit*.16;
 for(const b of s.balls){
  if(!b.released)continue;
  if($('trail').checked){let previous=[params.v*b.release,h,0];const end=Math.min(simulation.flightTime,Math.max(0,b.age));for(let j=1;j<=40;j++){const age=end*j/40,next=[params.v*(b.release+age),Math.max(0,h-.5*params.g*age*age),0];segment(previous,next,b.index%2?'#8b5ac480':'#16857980',1);previous=next}}
  // The model position is the ideal particle contact point; offset the visible sphere above the floor only.
  sphere([b.x,b.y+radius,0],radius);
  if(b.landed)segment([b.x,0,-unit*.3],[b.x,0,unit*.3],'#b76b26',2);
 }
 segment([0,0,-unit],[0,h,-unit],'#607a8270',1,true);
 label([0,h*.5,-unit],'高度 '+params.h+' m','#46616a',11);
 label([x,0,2*unit],'已落地 '+s.landed+' / '+params.count,'#46616a',11);
}

