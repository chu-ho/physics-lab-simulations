/* Prescribed-drive, ideal no-slip belt transmission. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('belt-wheels','飛輪組與皮帶傳動','圓周與轉動','belt-wheels',[
 P('rA','A 輪半徑',.4,1.8,.1,.9,'m'),P('rB','B 輪半徑',.4,1.8,.1,1.5,'m'),P('rC','C 輪半徑',.4,1.8,.1,.9,'m'),P('rD','D 輪半徑',.4,1.8,.1,1.8,'m'),P('omegaA','A 主動輪角速度',.2,4,.1,1,'rad/s')
],[metric('omegaD','D 角速度','rad/s'),metric('turnsD','D 累積圈數','圈'),metric('ratio','D／A 圈數比','')],
 'ωA rA = ωB rB；ωB = ωC；ωC rC = ωD rD；ND/NA = rA rC/(rB rD)',
 'A、B 以黃色開式皮帶連接，C、D 以藍色開式皮帶連接，B、C 剛性固定於同軸。A 由理想驅動器指定恆定角速度；忽略啟動過程、皮帶滑動與伸長。這是運動學模型，不由轉動慣量求速率，也不計算力矩、摩擦功或能量。四輪均同向，輪上色標及皮帶小標記隨實際角位移與線位移運動。觀察 A 轉完四圈；所有角速度、圈數、兩條皮帶速率皆可匯出 CSV。',
 ['A 轉一圈時 D 轉幾圈？哪些半徑比會讓 D 轉得更快？','B、C 的角速度相同，為何輪邊速率通常不同？'],p=>{
  const ratio=p.rA*p.rC/(p.rB*p.rD),omegaA=p.omegaA,omegaB=omegaA*p.rA/p.rB,omegaC=omegaB,omegaD=omegaC*p.rC/p.rD,duration=8*Math.PI/omegaA;
  return trajectory(duration,t=>{const state={x:-5,y:4,z:0,omegaA,omegaB,omegaC,omegaD,ratio,beltAB:omegaA*p.rA,beltCD:omegaC*p.rC};for(const name of ['A','B','C','D']){state['theta'+name]=state['omega'+name]*t;state['turns'+name]=state['theta'+name]/(2*Math.PI);state['edgeSpeed'+name]=state['omega'+name]*p['r'+name]}return state},{events:[1,2,3,4].map(n=>({t:n*2*Math.PI/omegaA,label:'A 完成 '+n+' 圈；D '+(n*ratio).toFixed(3)+' 圈'})),endLabel:'A 四圈觀察結束'});
 },'models/belt-wheels.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
