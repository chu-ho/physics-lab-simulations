/* Sequential releases from a steadily moving aircraft; SI, no drag. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('airplane-drop','飛機投彈','運動學','airplane-drop',[
 P('h','飛行高度',10,60,2,24,'m'),P('v','飛機水平速率',2,15,.5,6,'m/s'),P('count','投放球數',1,20,1,10,'顆'),P('interval','投放間隔',.1,1,.1,.3,'s'),P('g','重力加速度',1,15,.01,9.81,'m/s²')
],[metric('y','首球高度','m'),metric('landed','已落地球數','顆'),metric('flightTime','單球落地時間','s')],
 'τᵢ = t − iΔt；xᵢ = v(iΔt + min(τᵢ,T))；yᵢ = h − ½gτᵢ²；T = √(2h/g)',
 '飛機沿 +x 等速飛行，小球釋放時繼承水平速度，無空氣阻力，每球質量取 1 kg。首球在 t = 0 釋放，其餘依設定間隔釋放；各球到 y = 0 完全非彈性停止，碰撞後速度及合力讀值皆為零（地面支持力抵銷重力），不模擬碰撞瞬間衝量。所有球均落地時結束。小球與飛機大小為放大示意。球數拉桿可選 1、10、20 等數量；原站 x1/x10/x20 按鈕的確切行為尚未互動確認，不宣稱操作完全相同。',
 ['同一時刻仍在空中的小球，是否都在飛機正下方？','飛機速率和投放高度各自如何影響單球的落地距離？'],p=>{
 const count=Math.max(1,Math.round(p.count)),flightTime=Math.sqrt(2*p.h/p.g),duration=(count-1)*p.interval+flightTime;
 const events=Array.from({length:count},(_,i)=>[{t:i*p.interval,label:'第 '+(i+1)+' 球釋放'},{t:i*p.interval+flightTime,label:'第 '+(i+1)+' 球落地'}]).flat().sort((a,b)=>a.t-b.t);
 return trajectory(duration,t=>{
  const balls=Array.from({length:count},(_,i)=>{const release=i*p.interval,age=t-release,released=age>=0,landed=released&&t>=release+flightTime,fall=Math.max(0,Math.min(flightTime,age));return {index:i,release,age,released,landed,x:released?p.v*(release+fall):p.v*t,y:landed?0:p.h-.5*p.g*fall*fall,z:0,vx:released&&!landed?p.v:0,vy:released&&!landed?-p.g*fall:0}}),first=balls[0];
  return {x:first.x,y:first.y,z:0,vx:first.vx,vy:first.vy,fy:first.landed?0:-p.g,planeX:p.v*t,balls,landed:balls.filter(b=>b.landed).length,released:balls.filter(b=>b.released).length,flightTime,K:.5*(first.vx**2+first.vy**2),U:p.g*first.y,E:.5*(first.vx**2+first.vy**2)+p.g*first.y};
 },{events,flightTime,endLabel:'全部小球已落地 · 碰撞後靜止'});
},'models/airplane-drop.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);

