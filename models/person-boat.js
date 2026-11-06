/* Prescribed smooth walking inside a freely translating boat. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('person-boat','人走船退與合質心','動力學','person-boat',[
 P('m','人物質量',20,100,5,60,'kg'),P('M','船體質量',20,200,10,100,'kg'),P('d','相對船體行程',1,6,.2,4,'m'),P('T','單程行走時間',1,8,.5,4,'s'),P('u','初始共同漂移速度',-2,2,.1,0,'m/s'),P('mode','行程：0 單程／1 往返',0,1,1,0),{...P('showCOM','顯示合質心',0,1,1,1),visual:true}
],[metric('boatDisplacement','船相對初始位移','m'),metric('personDisplacement','人相對初始位移','m'),metric('momentum','總水平動量','kg·m/s')],
 'm x人 + M x船 = (m+M)X質心；x人 − x船 = q；x船 = X質心 − mq/(m+M)；X質心 = u₀t',
 '人物在船內依平滑指定行程走動，不用彈簧代替人物。相對位置以五次曲線起步與停止，端點相對速度及加速度均為零；往返時不產生瞬時衝量。無水阻力及水平外力，初始合質心設在 x=0，人船初始共同速度為 u₀。船僅水平平移，浮力支撐重量；忽略船的俯仰與腳步衝擊，假設腳底摩擦足夠。人物水平合力來自船，船受等大反向內力；行走速度由內部致動器／肌肉指定，動能可改變，合質心仍等速。讀值的位移以各自初始岸上位置為零，非相對船位移；相對船位置 q 另可選圖表。人物與船的外觀尺寸是示意。原站其他雙體裝置、起始牆壁及獨立跟隨船／質心視角尚未加入。',
 ['人向右走一段路時，船與人相對岸邊各移動多少？','改變初始漂移速度，總動量及人船相對位移各會如何變化？'],p=>{
 const total=p.m+p.M,ratio=p.m/total,duration=p.T*(p.mode?2:1),boat0=ratio*p.d/2,person0=-(1-ratio)*p.d/2;
 return trajectory(duration,t=>{const back=Boolean(p.mode&&t>p.T),z=back?(t-p.T)/p.T:t/p.T,S=10*z**3-15*z**4+6*z**5,V=(30*z*z-60*z**3+30*z**4)/p.T,A=(60*z-180*z*z+120*z**3)/(p.T*p.T),sign=back?-1:1,q=back?p.d/2-p.d*S:-p.d/2+p.d*S,qd=sign*p.d*V,qdd=sign*p.d*A,com=p.u*t,xb=com-ratio*q,xp=xb+q,vb=p.u-ratio*qd,vp=vb+qd,ab=-ratio*qdd,ap=(1-ratio)*qdd,K=.5*p.m*vp*vp+.5*p.M*vb*vb;
  return{x:xp,y:1.7,z:0,vx:vp,fx:p.m*ap,x2:xb,y2:.7,z2:0,vx2:vb,fx2:p.M*ab,ax:ap,boatAcceleration:ab,q,relativeVelocity:qd,relativeAcceleration:qdd,com,comY:(p.m*1.7+p.M*.7)/total,comVelocity:p.u,boatDisplacement:xb-boat0,personDisplacement:xp-person0,momentum:p.m*vp+p.M*vb,interactionForce:p.m*ap,K,internalWork:K-.5*total*p.u*p.u};
 },{events:[{t:0,label:'人船以共同速度開始，人物平滑起步'},...(p.mode?[{t:p.T,label:'到達另一端，平滑轉為返程'}]:[]),{t:duration,label:'人物相對船停止，人船保留初始共同速度'}],bounds:{min:[Math.min(0,p.u*duration)-p.d-2,0,-1.3],max:[Math.max(0,p.u*duration)+p.d+2,3,1.3]},endLabel:'行程結束；人船繼續共同等速漂移'});
},'models/person-boat.js');
M.defs.find(d=>d.id==='person-boat').plotMetrics=[metric('q','人相對船位置','m'),metric('relativeVelocity','人相對船速度','m/s'),metric('vx','人相對岸速度','m/s'),metric('vx2','船相對岸速度','m/s'),metric('com','合質心位置','m'),metric('interactionForce','船對人物水平力','N'),metric('K','水平總動能','J'),metric('internalWork','內部致動器淨作功','J')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
