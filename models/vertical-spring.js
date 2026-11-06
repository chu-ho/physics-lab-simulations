/* Vertical bilateral Hooke spring; potential zeros are explicit. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('vertical-spring','鉛直彈簧與等效簡諧位能','振動','vertical-spring',[
 P('m','懸掛質量',.5,4,.5,2,'kg'),P('k','彈簧常數',8,40,1,20,'N/m'),P('A','相對平衡點振幅',.2,2,.1,1,'m'),P('g','重力加速度',1,15,.01,9.81,'m/s²'),
 {...P('showReference','顯示原長與平衡參考',0,1,1,1),visual:true},{...P('showHorizontal','顯示水平等效振子',0,1,1,1),visual:true}
],[metric('q','平衡點向下位移','m'),metric('U','合成位能 Us＋Ug','J'),metric('E','總機械能','J')],
 'δ = mg/k；q̈ = −(k/m)q；Us = ½k(δ＋q)²；Ug = −mg(δ＋q)；Us＋Ug = ½kq² − ½kδ²',
 '無質量、可拉伸也可壓縮的雙向 Hooke 彈簧，無阻尼。q 向下為正，y 向上；由最低端 q=A 靜止釋放。Us 以原長為零，Ug 以物塊位於原長位置為零，故合成位能可為負；相對平衡點等效位能 Ueq=½kq² 只差常數。水平等效振子與鉛直振子同 m、k、振幅及相位，其能量 Ueq＋K 與鉛直總能相差常數。每組參數自動取原長 L₀=A＋0.6 m、支點高度 L₀＋δ＋A＋1.2 m，確保彈簧長度始終為正且物塊不觸地；架高不改變振動方程。比較時只改 g，週期不變。實際彈簧線圈及物塊尺寸為示意。',
 ['為何彈力等於重力時速率最大，而不是停住？','Us 與 Ug 各自改變，合成位能為何只與 ½kq² 相差常數？','增加重力會改變平衡位置、週期與原長位能零點嗎？'],p=>{
 const delta=p.m*p.g/p.k,L0=p.A+.6,equilibriumY=p.A+1.2,naturalY=equilibriumY+delta,topY=naturalY+L0,omega=Math.sqrt(p.k/p.m),period=2*Math.PI/omega,offset=-.5*p.k*delta**2;
 return trajectory(4*period,t=>{
  const q=p.A*Math.cos(omega*t),qdot=-p.A*omega*Math.sin(omega*t),extension=delta+q,Us=.5*p.k*extension**2,Ug=-p.m*p.g*extension,K=.5*p.m*qdot**2,Ueq=.5*p.k*q*q,U=Us+Ug;
  return{x:0,y:equilibriumY-q,z:0,vy:-qdot,fy:p.k*q,q,qdot,ay:omega*omega*q,extension,springLength:L0+extension,springForce:p.k*extension,gravityForce:-p.m*p.g,K,Us,Ug,U,Ueq,E:K+U,Eeq:K+Ueq,offset,delta,L0,naturalY,equilibriumY,topY,period,omega,horizontalX:q,horizontalV:qdot,horizontalF:-p.k*q};
 },{L0,delta,naturalY,equilibriumY,topY,period,offset,bounds:{min:[Math.min(-3.8,-L0-.7),0,-1],max:[3.8,topY+.8,4.2]},events:Array.from({length:16},(_,i)=>({t:(i+1)*period/4,label:i%2===0?(i%4===1?'最高點 · v = 0':'最低點 · v = 0'):'通過平衡點 · 速率最大'})),endLabel:'四個週期觀察結束'});
},'models/vertical-spring.js');
const d=M.defs.find(d=>d.id==='vertical-spring');
d.plotMetrics=[metric('K','動能 K','J'),metric('Us','彈性位能 Us','J'),metric('Ug','重力位能 Ug','J'),metric('Ueq','平衡點等效位能','J'),metric('Eeq','水平等效總能','J'),metric('qdot','向下速度','m/s'),metric('period','週期','s')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);

