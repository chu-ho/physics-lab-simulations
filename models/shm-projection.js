/* Uniform circular motion and its two simultaneous diameter projections. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('shm-projection','圓周運動與簡諧投影','振動','shm-projection',[
 P('A','圓半徑／投影振幅',.5,4,.1,2,'m'),P('period','圓周運動週期',1,8,.1,4,'s'),P('phase','初相位',-180,180,5,30,'°'),P('m','質點質量',.2,5,.2,1,'kg'),
 {...P('showX','顯示水平投影',0,1,1,1),visual:true},{...P('showY','顯示垂直投影',0,1,1,1),visual:true},{...P('showV','顯示圓周與投影速度',0,1,1,0),visual:true},{...P('showA','顯示圓周與投影加速度',0,1,1,0),visual:true}
],[metric('q','水平投影位移','m'),metric('vx','水平投影速度','m/s'),metric('ax','水平投影加速度','m/s²')],
 'θ = ωt + φ；x = A cosθ；y = A sinθ；ω = 2π/T；aₓ = −ω²x，aᵧ = −ω²y',
 '等速率圓周運動在兩條直徑的正交投影，同步顯示水平與垂直簡諧運動；觀察四個週期。投影是幾何關係，並非另有兩顆受彈簧拉動的真實球。讀值與共用速度／合力箭頭以水平投影為主，水平位移、速度、加速度皆可切換圖表；垂直投影位移 qy、速度 vyProjection、加速度 ayProjection 可由 CSV 讀取。圓周質點質量 m，向心合力為 −mω²r；投影的 m a 是此向心力的分量／假想同質量粒子的有效力。K、U、E 為投影等效簡諧系統的動能、勢能與總能，U 不代表圓周質點具有額外的真實勢能。圖形圓心抬高以便觀察，q、qy 均相對圓心量測；不另疊加重力。速度和加速度箭頭使用各自固定比例，勿比較兩者箭長的單位。',
 ['圓周速率固定，為何水平投影速度仍會改變？','初相位或週期改變時，兩個投影間的四分之一週期關係會改變嗎？'],p=>{
  const omega=2*Math.PI/p.period,phi=p.phase*Math.PI/180,centerY=p.A+1.5;
  return trajectory(4*p.period,t=>{
   const theta=omega*t+phi,q=p.A*Math.cos(theta),qy=p.A*Math.sin(theta),vx=-p.A*omega*Math.sin(theta),vyProjection=p.A*omega*Math.cos(theta),ax=-omega*omega*q,ayProjection=-omega*omega*qy;
   return{x:q,y:centerY,z:0,vx,fx:p.m*ax,q,qy,ax,vyProjection,ayProjection,circleX:q,circleY:centerY+qy,circleVx:vx,circleVy:vyProjection,circleAx:ax,circleAy:ayProjection,circleFx:p.m*ax,circleFy:p.m*ayProjection,theta,omega,speed:p.A*omega,centerY,K:.5*p.m*vx*vx,U:.5*p.m*omega*omega*q*q,E:.5*p.m*(p.A*omega)**2};
  },{centerY,omega,amplitude:p.A,period:p.period,events:Array.from({length:4},(_,i)=>({t:(i+1)*p.period,label:'完成 '+(i+1)+' 個週期'})),endLabel:'四個週期觀察結束'});
 },'models/shm-projection.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);

