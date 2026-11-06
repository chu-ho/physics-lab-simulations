(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
function sphereHit(o,d,center,radius){const q=o.map((v,j)=>v-center[j]),A=d.reduce((v,x)=>v+x*x,0),B=2*q.reduce((v,x,j)=>v+x*d[j],0),C=q.reduce((v,x)=>v+x*x,0)-radius*radius,D=B*B-4*A*C;if(D<0)return null;for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)])if(t>1e-7){const point=o.map((x,j)=>x+t*d[j]);return{t,point,normal:point.map((x,j)=>(x-center[j])/radius)};}return null;}
M.WaterOptics.sphereHit=sphereHit;
M.register('sphere-lens','球形透鏡：內外觀察與全反射','幾何光學','sphere-lens',[
P('mode','觀察：0外看內／1內看外',0,1,1,0),P('n','球內折射率',1,1.8,.01,1.5),P('viewer','內部觀察位置／半徑',0,95,1,50,'%'),P('fishPosition','魚橫向位置／半徑',-50,50,1,-20,'%'),{...P('math','顯示內視角度參考',0,1,1,0),visual:true}
],[metric('maxIncidence','內視首界面最大入射角','°'),metric('criticalAngle','內向外臨界角','°'),metric('tirFraction','首界面全反射方向比例','%')],
'sinθ入最大=r觀察/R；n球 sinθ入>1 時全反射',
'均勻透明球、外部折射率1，從目前視角逆向追蹤球面折射、全反射與魚物件。外看內使用實際3D相機位置；內看外把眼睛移到球心右方指定半徑比例，拖曳只改內視朝向、縮放改視角寬度。內視方向仍沿用目前相機朝向，可旋轉查看不同外界方向。最大入射角及全反射方向比例皆以此內部參考眼點計算；方向比例是均勻立體角的首界面比例，不是畫面像素比例或反射能量。球心觀察每條光線都垂直球面，不會全反射；離心距離r>R/n後有無法連接外界的方向。光線最多追蹤8次球面交互作用，未連接物件或外界的方向以深色顯示。魚為程式幾何示意，只在外看內模式顯示，內視相當於眼睛本身位於球內；不含玻璃殼、Fresnel部分反射、色散或波動效應。球形界面精確計算，不用薄透鏡近似。時間軸供靜態觀察，非魚游動動畫。',
['魚在球心看外面會遇到全反射嗎？','離球心多遠後，某些方向無法看到球外？'],p=>{
const radius=1.5,center=[0,1.7,0],r=p.viewer/100,viewer=[r*radius,center[1],0],fish=[p.fishPosition/100*radius,center[1],0],maxIncidence=Math.asin(r)*180/Math.PI,criticalAngle=Math.asin(1/p.n)*180/Math.PI,tirFraction=p.n*r>1?100*Math.sqrt(1-1/(p.n*r)**2):0;
return trajectory(4,()=>({x:fish[0],y:fish[1],z:0,maxIncidence,criticalAngle,tirFraction}),{schematic:true,hidePrimary:true,hideGrid:()=>true,radius,center,viewer,fish,bounds:{min:[-2,0,-2],max:[2,3.7,2]},scaleNote:p.mode?'內看外：拖曳改朝向、縮放改視野；讀值為全立體角首界面參考。':'外看內：自由移動視角；內視參考數值仍由內部位置拉桿決定。',endLabel:'球形折射外觀觀察完成'});
},'models/sphere-lens.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
