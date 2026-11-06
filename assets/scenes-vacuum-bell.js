'use strict';function drawVacuumBell(s){
box([0,.15,0],[4,.3,3.7],'#71868b');
// Wire meridians and hoops leave the bell visible from every viewing angle.
for(let j=0;j<12;j++){const a=2*Math.PI*j/12;let prev;for(let k=0;k<=24;k++){const h=.35+4.1*k/24,r=h<3?1.7:1.7*Math.sqrt(Math.max(0,1-Math.pow((h-3)/1.5,2))),q=[r*Math.cos(a),h,r*Math.sin(a)];if(prev)segment(prev,q,'#9dbcc2',1);prev=q;}}
for(const h of [.45,1.4,2.4,3.3,4]){const r=h<3?1.7:1.7*Math.sqrt(Math.max(0,1-Math.pow((h-3)/1.5,2)));for(let i=0;i<48;i++){const a=i*2*Math.PI/48,b=(i+1)*2*Math.PI/48;segment([r*Math.cos(a),h,r*Math.sin(a)],[r*Math.cos(b),h,r*Math.sin(b)],'#bed0d3',1);}}
segment([0,4.4,0],[0,3.4,0],'#7d898b',3);box([0,3.35,0],[.65,.35,.5],'#b49051');
ring([s.x,2.25,0],.78,'xy','#c69e54',3);sphere([s.x,2.25,0],.14,'#c69e54');segment([.4,3.25,0],[.95+Math.sin(t*6*Math.PI)*.16,2.4,0],'#8b7760',4);sphere([.95+Math.sin(t*6*Math.PI)*.16,2.4,0],.13,'#d3ad59');
box([2.9,.65,0],[1.1,1,.9],'#6d8e95');segment([1.5,.4,0],[2.9,.4,0],'#6d8e95',5);label([2.9,1.5,0],['抽氣中','進氣中','閥門封閉'][s.mode],'#516b72',12);
if(params.particles)for(const a of s.atoms)sphere([a.x,a.y,a.z],.035,'#78a5ae');
if(params.waves){const alpha=Math.max(.03,s.airAmplitude);for(let j=0;j<5;j++){const r=.85+((t*.7+j*.54)%2.7);for(let i=0;i<48;i++){const a=i*2*Math.PI/48,b=(i+1)*2*Math.PI/48;segment([s.x+r*Math.cos(a),2.25+r*.53*Math.sin(a),.1],[s.x+r*Math.cos(b),2.25+r*.53*Math.sin(b),.1],'rgba(176,132,65,'+(alpha*.65).toFixed(3)+')',1);}}}
label([0,4.95,0],'罩內壓力 '+s.pressure.toFixed(2)+' kPa','#426d77',13);label([0,-.25,0],'鈴體持續振動 · 傳聲振幅 '+(s.acousticAmplitude*100).toFixed(1)+'%','#977343',11);label([0,-.6,0],'室溫聲速約343m/s；波圈及振動為慢動作示意','#778b8f',10);
}
