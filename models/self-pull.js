/* Person and platform share a vertical translation only while contact is compressive. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers,G=9.81;
M.register('self-pull','把自己拉起來：內力與外力','靜力學','self-pull',[
 P('m','人的質量',20,100,5,60,'kg'),P('platformMass','平台質量',10,80,5,20,'kg'),P('pull','手施加的恆定拉力',0,1600,10,900,'N'),P('mode','裝置：0 下方動滑輪／1 頂端定滑輪比較',0,1,1,0),P('stroke','手相對身體的可用拉繩行程',.2,1,.1,.6,'m')
],[metric('tension','繩張力','N'),metric('normal','人台間支持力','N'),metric('ay','共同加速度','m/s²')],
 '下方動滑輪：平台受 2T 向上、人受 T 向下；(m＋M)a=T−(m＋M)g。頂端定滑輪比較：整體受 2T 向上；N=m(g＋a)−T。',
 '主模式依原站可辨識的「頂端固定繩、腳邊動滑輪、手握另一端」重建：動滑輪固定在可升平台，繩無質量、不可伸長、滑輪無摩擦無質量，人向上拉繩，繩向下拉人。平台與人合看，手與輪的一部分作用互抵，外繩只提供 T 的淨向上力。原站另有彈簧、人1、人2按鈕，其全部操作尚未對齊；本頁的平台連接是明示理想化，非宣稱完整復刻。模式1另加天花板定滑輪、繩端固定平台的比較裝置，與主模式不同。人台無相對運動假設只在 N≥0 有效；所需 N<0 時於初始狀態停止，須另做人物離台模型。N為人的腳與平台之間的力，groundN為整個裝置與地面的力。低於離地門檻時保持接地，恆力等於門檻也不會由靜止自行升起。拉繩行程耗盡即停在終止前瞬間，不模擬後續收手或落下。機械能來自人肌肉作功，並非無外力自升；主模式每升高h，手相對身體向上拉繩h，肌肉作功Th；定滑輪比較模式手相對身體向下拉繩2h，作功2Th。共用合力箭頭代表人台整體的合力，主點位於人物示意位置。圖示人與輪大小為示意。',
 ['為什麼主模式平台有2T向上，整體卻只有T向上？','兩種裝置的離地拉力門檻為何不同？','定滑輪比較中，人是否可能先離開平台，令共同加速度公式失效？'],p=>{
  const mass=p.m+p.platformMass,T=p.pull,mult=p.mode===0?1:2,freeA=mult*T/mass-G,ay=Math.max(0,freeA),groundN=Math.max(0,mass*G-mult*T),normal=p.m*(G+ay)+(p.mode===0?T:-T),valid=normal>=-1e-9;
  const moving=ay>1e-10&&valid,duration=moving?Math.sqrt(2*p.stroke/(mult*ay)):4,stop=valid?(moving?'拉繩行程耗盡 · 保留終止前速度':'仍接地 · 拉力未超過離地門檻'):'初始即需要負支持力 · 人台同動不適用';
  const end=valid?duration:0;
  return trajectory(end,t=>{
   const h=moving?.5*ay*t*t:0,v=moving?ay*t:0,actualA=valid?ay:0,K=.5*mass*v*v,U=mass*G*h,work=mult*T*h;
   // Main: H−yp + ye−yp + πr = constant; comparison: H−yp + H−ye + πr = constant.
   const platformY=.45+h,pulleyY=p.mode===0?1.05+h:5.3,ropeEndY=p.mode===0?2.55+2*h:2.55-h;
   return{x:0,y:1.65+h,z:0,vy:v,fy:mass*actualA,ay:actualA,h,tension:T,normal:valid?Math.max(0,normal):0,requiredNormal:normal,groundN,contactValid:valid?1:0,platformY,pulleyY,ropeEndY,ropeLength:p.mode===0?5.3-pulleyY+ropeEndY-pulleyY+Math.PI*.3:5.3-platformY+5.3-ropeEndY+Math.PI*.3,handStroke:mult*h,threshold:mass*G/mult,personRopeForce:p.mode===0?-T:T,platformRopeForce:p.mode===0?2*T:T,personNet:valid?p.m*actualA:0,platformNet:valid?p.platformMass*actualA:0,K,U,E:K+U,work,handWork:mult*T*h,externalAnchorWork:0,unsupportedNormal:Math.min(0,normal)};
  },{bounds:{min:[-2.5,0,-1],max:[2.5,6,1]},threshold:mass*G/mult,events:[{t:0,label:valid?(moving?'超過門檻 · 開始離地':'地面支持力補足平衡'):'人台接觸假設失效 · 不進行共同運動'},...(moving?[{t:end,label:stop}]:[])],endLabel:stop});
 },'models/self-pull.js');
const d=M.defs.find(d=>d.id==='self-pull');d.plotMetrics=[metric('groundN','地面支持力','N'),metric('h','平台上升高度','m'),metric('K','動能','J'),metric('U','重力位能增量','J'),metric('work','系統機械能輸入','J'),metric('requiredNormal','同動所需支持力','N')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);

