'use strict';
function drawSelfPull(s){
 const mode=params.mode,h=s.h,top=5.3,r=.3,py=s.pulleyY,platform=s.platformY;
 box([0,platform,0],[2.4,.3,1.4],'#bb965a');
 segment([-1.8,0,-.6],[-1.8,top+.3,-.6],'#83979c',7);segment([-1.8,top+.3,-.6],[1.8,top+.3,-.6],'#83979c',7);segment([1.8,top+.3,-.6],[1.8,0,-.6],'#83979c',7);
 const wheelX=mode===0?-.7:.7,z=.25;
 ring([wheelX,py,z],r,'xy','#4d7a82',4);sphere([wheelX,py,z],.065,'#4d7a82');
 if(mode===0){
  segment([wheelX,platform+.15,z],[wheelX,py,z],'#6e8388',5);
  segment([wheelX-r,top,z],[wheelX-r,py,z],'#b78732',3);segment([wheelX+r,py,z],[wheelX+r,s.ropeEndY,z],'#b78732',3);
  for(let i=0;i<24;i++){const a=Math.PI+i*Math.PI/24,b=Math.PI+(i+1)*Math.PI/24;segment([wheelX+r*Math.cos(a),py+r*Math.sin(a),z],[wheelX+r*Math.cos(b),py+r*Math.sin(b),z],'#b78732',3)}
  label([-1.1,top+.1,.4],'繩端固定天花板','#46616a',11);
 }else{
  segment([wheelX-r,platform+.15,z],[wheelX-r,py,z],'#b78732',3);segment([wheelX+r,py,z],[wheelX+r,s.ropeEndY,z],'#b78732',3);
  for(let i=0;i<24;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24;segment([wheelX+r*Math.cos(a),py+r*Math.sin(a),z],[wheelX+r*Math.cos(b),py+r*Math.sin(b),z],'#b78732',3)}
  segment([wheelX,py,z],[wheelX,top+.3,z],'#6e8388',5);
 }
 const x=.45,feet=platform+.15,waist=feet+.85,head=feet+1.65;
 segment([x-.18,feet,0],[x-.13,waist,0],'#486a85',9);segment([x+.18,feet,0],[x+.13,waist,0],'#486a85',9);box([x,waist+.3,0],[.45,.65,.35],'#36a99a');sphere([x,head,0],.22,'#e6ba8f');
 const hand=[mode===0?-.4:1,s.ropeEndY,z];segment([x,waist+.5,0],hand,'#d3a579',7);sphere(hand,.08,'#e6ba8f');
 label([0,5.9,0],mode===0?'腳邊動滑輪 · 手向上拉':'比較裝置：天花板定滑輪','#365e63',13);
 label([0,.1,1],'離地門檻 T > '+s.threshold.toFixed(1)+' N','#365e63',11);
 label([0,4.8,1],s.contactValid?(s.h>0?'平台已離地':'平台接地'):'人台同動不適用：停止','#a36536',12);
 if($('forces').checked){const scale=.0015;arrow([x,waist+.4,.7],[x,waist+.4+s.personRopeForce*scale,.7],'#a67334','人受繩力 '+s.personRopeForce.toFixed(0)+' N');arrow([-.7,platform,.7],[-.7,platform+s.platformRopeForce*scale,.7],'#36877a','平台繩力 '+s.platformRopeForce.toFixed(0)+' N');}
}
