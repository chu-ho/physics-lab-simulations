'use strict';
function drawMovingAtwood(s){
 const c='#54747c',rope='#c69337',left='#218f83',right='#9875ba';
 function wheel(x,y,r,color){
  ring([x,y,0],r,'xy',color,4);sphere([x,y,0],.13,c);
  for(let k=0;k<6;k++){const a=k*TAU/6;segment([x,y,0],[x+r*Math.cos(a),y+r*Math.sin(a),0],color,2)}
 }
 function wrap(x,y,r){for(let k=0;k<32;k++){const a=k*Math.PI/32,b=(k+1)*Math.PI/32;segment([x+r*Math.cos(a),y+r*Math.sin(a),.08],[x+r*Math.cos(b),y+r*Math.sin(b),.08],rope,3)}}
 box([0,s.supportY+2.5,0],[3,.22,1],c);segment([0,s.supportY+2.4,0],[0,s.supportY,0],c,5);
 wheel(0,s.supportY,2,c);wrap(0,s.supportY,2);
 segment([-2,s.supportY,.08],[-2,s.leftY,.08],rope,3);segment([2,s.supportY,.08],[2,s.rightY,.08],rope,3);
 wheel(-2,s.leftY,.6,left);wheel(2,s.rightY,.6,right);wrap(-2,s.leftY,.6);wrap(2,s.rightY,.6);
 const ns=['A','B','C','D'],xs=[-2.6,-1.4,1.4,2.6];
 ns.forEach((n,i)=>{const x=xs[i],y=s['y'+n],py=i<2?s.leftY:s.rightY,color=i<2?left:right;segment([x,py,.08],[x,y+.28,.08],rope,3);box([x,y,0],[.52,.56,.55],color);label([x,y-.5,.1],n+' '+params['m'+n]+' kg',color,11);label([x,y-.88,.1],s['a'+n].toFixed(2)+' m/s²',c,10)});
 label([-2,s.leftY+1.05,.1],'左動滑輪',left,11);label([2,s.rightY+1.05,.1],'右動滑輪',right,11);
 label([0,s.supportY+3.1,0],'支點 a₀='+s.supportA.toFixed(2)+' m/s²（↑正）',c,12);
 label([0,s.supportY-.7,.25],'上繩 2T='+s.upperTension.toFixed(2)+' N',c,11);
 label([0,1,.4],'兩下繩 T='+s.tension.toFixed(2)+' N',rope,12);
 label([0,.45,.4],'三輪無質量 · 四物體絕對加速度↑正',c,10);
}
