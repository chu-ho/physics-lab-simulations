'use strict';
function drawPersonBoat(s){
 const L=params.d+2,xb=s.x2;box([xb,.55,0],[L,.3,1.4],'#558f9a');box([xb,.78,-.7],[L,.35,.12],'#75aeb0');box([xb,.78,.7],[L,.35,.12],'#75aeb0');
 for(const side of [-1,1])box([xb+side*(L/2-.1),.78,0],[.18,.4,1.5],'#75aeb0');
 const walk=Math.sin(t*7)*Math.min(.22,Math.abs(s.relativeVelocity)*.08),hip=[s.x,1.2,0],shoulder=[s.x,1.85,0];
 sphere([s.x,2.18,0],.19,'#c99368');segment(hip,shoulder,'#258e87',8);segment(hip,[s.x-.2-walk,.95,0],'#546e7f',5);segment(hip,[s.x+.2+walk,.95,0],'#546e7f',5);segment(shoulder,[s.x-.25-walk,1.4,0],'#c99368',4);segment(shoulder,[s.x+.25+walk,1.4,0],'#c99368',4);
 label([s.x,2.65,0],'人 '+params.m+' kg','#168579',11);label([xb,.25,1],'船 '+params.M+' kg','#46616a',11);
 segment([0,0,-2],[0,1.8,-2],'#879c92',3);label([0,1.9,-2],'岸邊 x=0','#647f7c',10);
 if(params.showCOM){sphere([s.com,s.comY,0],.09,'#8b5ac4');segment([s.com,.05,0],[s.com,s.comY,0],'#8b5ac4',1,true);label([s.com,s.comY+.4,0],'合質心 '+s.com.toFixed(2)+' m','#8b5ac4',11)}
 if($('vectors').checked)arrow([xb,.8,-1],[xb+s.vx2*velocityScale,.8,-1],'#437d9c','v船');
 if($('forces').checked)arrow([xb,.65,-1],[xb+s.fx2*forceScale,.65,-1],'#8b5ac4','船受內力');
}
