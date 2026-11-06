(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers,add=(...args)=>M.register(...args,'models/wave-optics.js');
const sinc=x=>Math.abs(x)<1e-8?1:Math.sin(x)/x;
add('double-slit','雙狹縫干涉與有限縫長繞射','波動光學','double-slit',[
 {...P('screenYaw','屏幕水平轉角',-60,60,1,0,'°'),refit:true},P('L','狹縫至螢幕距離',2,6,.1,3,'m'),P('lambda','波長',380,750,5,550,'nm'),P('a','單縫寬度',20,120,5,50,'μm'),P('d','兩縫中心距離',200,600,10,300,'μm'),P('b','單縫長度',50,200,5,150,'μm'),P('span','螢幕觀察半寬／半高',5,30,1,15,'mm'),{...P('rotation','狹縫面內旋轉',0,180,1,0,'°'),refit:true},P('laserAngle','雷射入射水平傾角',-.3,.3,.01,0,'°'),P('medium','兩縫加入薄相位片',0,1,1,0),P('index','正縫距側薄片折射率',1,2,.01,1.5),P('thickness','正縫距側薄片厚度',0,2,.01,.55,'μm'),P('indexMinus','負縫距側薄片折射率',1,2,.01,1),P('thicknessMinus','負縫距側薄片厚度',0,2,.01,.55,'μm')
],[metric('intensity','掃描點相對光強','I/I₀'),metric('spacing','沿縫距方向正屏近軸條紋距','mm'),metric('verticalWidth','沿縫長方向正屏近軸中央帶全寬','mm')],
 'I/I₀=sinc²(πaqᵤ/λ)sinc²(πbqᵥ/λ)cos²(πdqᵤ/λ−φ/2)，φ=2π[(n₊−1)t₊−(n₋−1)t₋]/λ',
 '兩個相同矩形狹縫、單色平面波，使用純量 Fraunhofer 遠場近似；狹縫可在孔徑面內旋轉，雷射可在水平面小角度斜入射，qᵤ/qᵥ為出射與入射單位方向差在縫寬／縫長軸上的投影。兩條狹縫可各加薄相位片，各自設定折射率與厚度，φ=2π(n−1)t/λ；忽略薄片吸收、反射、傾斜厚度校正及振幅改變。狹縫寬度、長度與間距皆為真實數值。旋轉0度時干涉沿水平，有限縫長繞射沿垂直；旋轉後兩個方向隨孔徑一起轉動。屏幕可繞垂直軸旋轉，光強以屏上實際點指向孔徑的方向計算；條紋間距及中央帶全寬讀值為未轉屏時各自局部軸的近軸參考。圖中的孔洞及屏面橫向尺寸有示意放大，不可從 3D 圖直接量測微米尺寸。時間拉桿是掃描屏幕的教學動畫，不是光飛行時間；下方圖表的橫軸為屏上水平位置 mm。',
 ['螢幕距離或波長加倍，條紋間距如何改變？','改變縫寬與縫長，分別改變哪個方向的繞射包絡？'],p=>{
  const lambda=p.lambda*1e-9,a=p.a*1e-6,d=p.d*1e-6,b=p.b*1e-6,screenX=2+p.L*1.2,beta=p.rotation*Math.PI/180,sin=Math.sin(beta),cos=Math.cos(beta),incidentSin=Math.sin(p.laserAngle*Math.PI/180),phasePlus=p.medium?2*Math.PI*(p.index-1)*p.thickness*1e-6/lambda:0,phaseMinus=p.medium?2*Math.PI*(p.indexMinus-1)*p.thicknessMinus*1e-6/lambda:0,platePhase=phasePlus-phaseMinus;
  const yaw=(p.screenYaw||0)*Math.PI/180;
  function screenPoint(z,Y=0){return[p.L+z*Math.sin(yaw),Y,z*Math.cos(yaw)];}
  function components(z,Y=0){const [X,y,Z]=screenPoint(z,Y),r=Math.hypot(X,Z,y),qU=(Z/r-incidentSin)*cos+y/r*sin,qV=y/r*cos-(Z/r-incidentSin)*sin,envelope=sinc(Math.PI*a*qU/lambda)*sinc(Math.PI*b*qV/lambda),geometricPhase=2*Math.PI*d*qU/lambda;return{qU,qV,envelope,geometricPhase};}
  function amplitudes(z,Y=0){const q=components(z,Y),minus=phaseMinus+q.geometricPhase/2,plus=phasePlus-q.geometricPhase/2;return{real:q.envelope*(Math.cos(minus)+Math.cos(plus))/2,imag:q.envelope*(Math.sin(minus)+Math.sin(plus))/2,...q};}
  function intensity(z,Y=0){const q=components(z,Y);return q.envelope*q.envelope*Math.cos((q.geometricPhase-platePhase)/2)**2}
  return trajectory(8,t=>{const probe=(2*t/8-1)*p.span;return{x:screenX+probe/p.span*4*Math.sin(yaw),y:4,z:probe/p.span*4*Math.cos(yaw),probe_mm:probe,intensity:intensity(probe*.001),spacing:lambda*p.L/d*1000,verticalWidth:2*lambda*p.L/b*1000}},{intensity,amplitudes,components,screenPoint,platePhase,phasePlus,phaseMinus,screenX,bounds:{min:[-6.8,Math.min(0,4-4*Math.abs(sin)-3*Math.abs(cos)-.3),-Math.max(4.5,4*Math.abs(cos)+3*Math.abs(sin)+.3)],max:[screenX+4*Math.abs(Math.sin(yaw))+.5,Math.max(8,4+4*Math.abs(sin)+3*Math.abs(cos)+.6),Math.max(4.5,4*Math.abs(cos)+3*Math.abs(sin)+.3)]},plotAxis:{key:'probe_mm',label:'屏上水平位置',unit:'mm'},schematic:true});
 });
M.optics={sinc};
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
