/* Simultaneous projectiles observed in translating reference frames. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers,add=(...a)=>M.register(...a,'models/relative-motion.js');
add('relative-motion','雙球與移動參考系','運動學','relative-motion',[
 P('u','平台水平速度',-4,8,.5,3,'m/s'),P('vx1','紅球相對平台水平初速',-4,8,.5,1,'m/s'),P('vy1','紅球向上初速',3,12,.5,8,'m/s'),P('vx2','藍球相對平台水平初速',-4,8,.5,3,'m/s'),P('vy2','藍球向上初速',3,12,.5,10,'m/s'),P('g','重力加速度',2,12,.5,10,'m/s²')
],[metric('x2','藍球座標 x′','m'),metric('y2','藍球座標 y′','m'),metric('vx2','藍球水平速度 vₓ′','m/s')],
 'r′ = r − r參考；v′ = v − v參考；a藍／紅 = g − g = 0',
 '兩個 1 kg 質點同時由平台上 1 m 高處拋出，平台等速水平行駛。無阻力，於任一球首次回到平台高度前結束，不模擬碰撞或週期反彈。切換地面、平台、紅球、藍球參考系會保留時間及播放狀態。球參考系隨自由落體加速，合力箭頭顯示含慣性力的有效合力；地面與平台系為真實合力。曲線、座標、速度及 CSV 均使用選定參考系，所有參考系的軸保持平行。',
 ['從紅球觀察藍球，路徑為什麼是直線？','改變平台速度時，兩球的相對運動會改變嗎？'],p=>{
 const T=2*Math.min(p.vy1,p.vy2)/p.g;
 const sim=trajectory(T,t=>({x:(p.u+p.vx1)*t,y:1+p.vy1*t-.5*p.g*t*t,vx:p.u+p.vx1,vy:p.vy1-p.g*t,fy:-p.g,x2:(p.u+p.vx2)*t,y2:1+p.vy2*t-.5*p.g*t*t,z2:0,vx2:p.u+p.vx2,vy2:p.vy2-p.g*t,cartX:p.u*t,cartY:0,groundY:0,relativeX:(p.vx2-p.vx1)*t,relativeY:(p.vy2-p.vy1)*t,relativeVx:p.vx2-p.vx1,relativeVy:p.vy2-p.vy1,relativeAx:0,relativeAy:0}),{endLabel:'首球回到發射高度 · 接觸前瞬間'});
 sim.inFrame=(time,frame)=>{const s=sim.sample(time),offset=frame==='red'?[s.x,s.y,s.vx,s.vy,-p.g]:frame==='blue'?[s.x2,s.y2,s.vx2,s.vy2,-p.g]:frame==='cart'?[s.cartX,0,p.u,0,0]:[0,0,0,0,0];const [x,y,vx,vy,ay]=offset;return{...s,x:s.x-x,y:s.y-y,vx:s.vx-vx,vy:s.vy-vy,fy:-p.g-ay,x2:s.x2-x,y2:s.y2-y,vx2:s.vx2-vx,vy2:s.vy2-vy,cartX:s.cartX-x,cartY:-y,groundY:-y,worldOriginX:-x,worldOriginY:-y,frameAccelerationY:ay}};
 return sim;
});
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
