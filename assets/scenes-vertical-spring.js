'use strict';
function drawVerticalSpring(s){
 const mint='#168579',gray='#738c90',purple='#8b5ac4',top=s.topY;
 box([0,top+.18,0],[7,.3,1.1],gray);
 coil([0,top,0],[0,s.y+.28,0],mint);box([0,s.y,0],[.65,.55,.65],mint);
 label([0,top+.62,0],'鉛直雙向彈簧 · L₀='+s.L0.toFixed(2)+' m',mint,12);
 segment([-.7,s.equilibriumY,.5],[.8,s.equilibriumY,.5],purple,1,true);
 label([1.25,s.equilibriumY,.5],'平衡點 q=0',purple,11);
 label([1.15,s.y,0],'q='+s.q.toFixed(2)+' m',mint,11);
 if(params.showReference){
  coil([-3,top,0],[-3,s.naturalY,0],gray);segment([-3.4,s.naturalY,0],[-2.6,s.naturalY,0],gray,2);
  label([-3,s.naturalY-.35,0],'原長 · Us=Ug=0',gray,10);
  coil([3,top,0],[3,s.equilibriumY+.28,0],purple);box([3,s.equilibriumY,0],[.65,.55,.65],purple);
  label([3,s.equilibriumY-.55,0],'靜態平衡 δ='+s.delta.toFixed(2)+' m',purple,10);
 }
 if(params.showHorizontal){
  const y=.55,z=3.2;
  box([-s.L0-.15,y,z],[.3,1,.8],gray);coil([-s.L0,y,z],[s.q-.3,y,z],purple);box([s.q,y,z],[.6,.6,.6],purple);
  segment([-params.A-.5,.15,z],[params.A+.6,.15,z],gray,2);segment([0,.1,z],[0,1,z],purple,1,true);
  label([0,1.45,z],'水平等效振子 · Ueq=½kq²',purple,11);
 }
 label([0,.05,-1],'自動架高 · 最低質心 1.20 m；彈簧原長隨振幅調整',gray,10);
}
