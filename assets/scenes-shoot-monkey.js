'use strict';
function drawShootMonkey(s){
 const p=params,r=Math.max(.18,Math.min(.45,p.D*.012)),mx=s.x2,target=[mx,s.y2,0];
 box([-.6,p.h/2,0],[.5,p.h,.7]);
 const a=simulation.aimAngle*Math.PI/180;
 segment([0,p.h,0],[Math.cos(a)*1.5,p.h+Math.sin(a)*1.5,0],'#46616a',6);
 segment([0,p.h,0],[p.D,p.H,0],'#cf7632',1,true);
 segment([p.D+1,0,-.8],[p.D+1,p.H+1,-.8],'#607a82',3);
 segment([p.D+1,p.H+1,-.8],[p.D,p.H+1,0],'#607a82',3);
 if(t===0)segment([p.D,p.H+1,0],[p.D,p.H,0],'#607a82',2);
 sphere([s.x,s.y,0],s.collided?r*.7:Math.max(.28,r),'#168579');
 sphere([mx,s.y2+.55,0],.45,'#99664a');sphere([mx,s.y2+1.2,0],.38,'#b8865e');
 for(const side of [-1,1]){sphere([mx+side*.4,s.y2+1.23,0],.16,'#99664a');segment([mx,s.y2+.7,0],[mx+side*.7,s.y2+.25,0],'#815d46',4);segment([mx,s.y2+.25,0],[mx+side*.35,s.y2,0],'#815d46',4)}
 segment([mx-.2,s.y2,0],[mx+.2,s.y2,0],'#cf7632',2);
 if(!s.collided)label([s.x,s.y+r*2,0],'子彈','#168579',11);
 label([mx,s.y2+1.85,0],s.collided?'命中後共同運動 · 子彈已嵌入':'猴子（質點標於腳下）','#a65b29',11);
 label([p.D,p.H+1.5,0],'初始瞄準位置 · '+p.H+' m','#526c77',11);
 if($('trail').checked){let prev=[p.D,p.H,0];for(let i=1;i<=60;i++){const q=simulation.sample(t*i/60),next=[q.x2,q.y2,0];segment(prev,next,'#cf763270',1,true);prev=next}}
 if($('vectors').checked&&!s.monkeyGrounded&&!s.collided)arrow(target,[mx+s.vx2*velocityScale,s.y2+s.vy2*velocityScale,0],'#cf7632','v猴');
 if($('forces').checked&&!s.monkeyGrounded&&!s.collided)arrow(target,[mx,s.y2+s.fy2*forceScale,0],'#8b5ac4','重力猴');
 if(s.collided&&s.impactAge<.4){const u=s.impactAge/.4,R=.35+u*1.8,shade=u<.55?'#edb335':'#cf7632';for(let i=0;i<20;i++){const a=i*Math.PI/10,b=(i+1)*Math.PI/10;segment([mx+R*Math.cos(a),s.y2+R*Math.sin(a),.06],[mx+R*Math.cos(b),s.y2+R*Math.sin(b),.06],shade,3*(1-u)+.5)}for(let i=0;i<10;i++){const a=i*Math.PI/5,inner=.2+u*.8,outer=inner+.55*(1-u);segment([mx+inner*Math.cos(a),s.y2+inner*Math.sin(a),.1],[mx+outer*Math.cos(a),s.y2+outer*Math.sin(a),.1],shade,3);sphere([mx+R*1.1*Math.cos(a),s.y2+R*1.1*Math.sin(a),Math.sin(i)*u*.5],.055*(1-u)+.015,shade)}label([mx,s.y2+2.5,0],'命中！','#a65b29',13)}
 if(simulation.hitTime!==null){const hit=simulation.sample(simulation.hitTime);if(!s.collided)label([hit.x,hit.y+r*3,0],'預測命中 '+simulation.hitTime.toFixed(2)+' s','#8b5ac4',11)}
 else label([p.D/2,p.H+2,0],'空中不相遇 · 最小距離 '+simulation.closestAir.toFixed(2)+' m','#a65b29',11);
}
