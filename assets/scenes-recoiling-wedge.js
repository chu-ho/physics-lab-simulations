'use strict';
function drawRecoilingWedge(s){
 const w=simulation.width,h=simulation.height,x=s.wedgeX,left=x-w/2,right=x+w/2,z=.8;
 const front=[[left,0,z],[right,0,z],[left,h,z]],back=[[left,0,-z],[right,0,-z],[left,h,-z]];
 polygon(back,'#709baf');polygon([back[0],front[0],front[2],back[2]],'#507b94');polygon([back[2],front[2],front[1],back[1]],'#b3d5d3');polygon(front,'#79aeb7');
 for(let i=0;i<3;i++){segment(front[i],front[(i+1)%3],'#4b7886',1.5);segment(back[i],front[i],'#4b7886',1)}
 segment([-w/2,0,1.05],[-w/2,h,1.05],'#83928a',1,true);label([-w/2,h+.45,1.05],'原坡頂','#687b7c',10);
 sphere([s.x,s.y+.15,0],.15,'#e5a348');label([s.x,s.y+.65,0],'質點 '+params.m+' kg','#8b6233',11);
 label([x,Math.max(.4,h*.27),z+.1],'M = '+params.massWedge+' kg','#365f72',11);
 label([x,-.38,.3],params.fixed?'固定支架提供水平外力':'光滑水平導引 · X = '+s.wedgeX.toFixed(2)+' m','#527b75',11);
 if($('forces').checked){const a=[s.x,s.y+.15,.35],sn=Math.sin(simulation.angle),c=Math.cos(simulation.angle);arrow(a,[a[0]+sn,a[1]+c,.35],'#218e80','N '+s.normal.toFixed(1)+' N');arrow(a,[a[0],a[1]-1,.35],'#b96363','mg');const b=[x,h*.25,-1];arrow(b,[x-sn,h*.25-c,-1],'#758eab','−N');}
 label([x,h+1,0],params.fixed?'固定斜面比較':'斜面反衝 · 水平動量守恆','#52747b',12);
}
