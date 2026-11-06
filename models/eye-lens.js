(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
function transfer(direction,offset,f,mirror){const axial=Math.abs(direction[0]);if(axial<1e-10)return null;const dx=(mirror?-1:1)*Math.sign(direction[0]),dy=direction[1]/axial-(Number.isFinite(f)?offset[0]/f:0),dz=direction[2]/axial-(Number.isFinite(f)?offset[1]/f:0),length=Math.hypot(dx,dy,dz);return[dx/length,dy/length,dz/length];}
function symbol(y,z,size){const a=y/size,b=z/size;if(a>=0&&a<=.8&&Math.abs(b)<.095||a>=.8&&a<=1.2&&Math.abs(b)<.42*(1.2-a)/.4)return[210,161,76];if(a>=.05&&a<=.27&&Math.abs(b)<.35)return b<0?[188,87,102]:[73,135,171];return null;}
function apertureHit(origin,direction,radius){if(Math.abs(direction[0])<1e-9)return null;const t=-origin[0]/direction[0];if(t<=1e-7)return null;const point=origin.map((x,j)=>x+t*direction[j]),r=Math.hypot(point[1]-2,point[2]);return r<=radius?{t,point,r}:null;}
M.ThinOptics={transfer,symbol,apertureHit};
M.register('eye-lens','眼看透鏡成像：有限口徑外觀','幾何光學','eye-lens',[
P('kind','元件：0凸透鏡／1凹透鏡／2透明板／3凹面鏡／4凸面鏡／5平面鏡',0,5,1,0),P('u','物體至元件距離',.5,8,.1,3,'m'),P('f','焦距絕對值（平面模式忽略）',.5,4,.1,2,'m'),P('aperture','元件半口徑',.5,2,.1,1.4,'m'),P('size','圖案尺寸',.4,1.2,.1,.5,'m'),{...P('ghost','顯示鏡外成像位置參考',0,1,1,0),visual:true}
],[metric('objectDistance','物距','m'),metric('imageVergence','像距倒數（0無限遠）','1/m'),metric('opticalPower','元件近軸光焦度','1/m')],
'有限口徑近軸追跡：u出=u入−y/f；反射時翻轉軸向；1/v=1/f−1/u',
'從目前3D相機逆向追跡到x=0的有限圓形元件，再以近軸薄元件斜率變換連接物體與背景；鏡孔之外直接看見原物，不用整張放大貼圖冒充透鏡視野。凸／凹透鏡、透明薄板、凹／凸面鏡及平面鏡六模式；面鏡反射面朝向x<0的物體，背面不成像。透明板是零厚度、無偏移極限，平面鏡用精確平面反射。曲面元件外形只為符號，近軸斜率規則不是大角度精確曲面折射；焦距及半口徑獨立可調，未處理像差、折射率／曲率關係、厚度或繞射。圖案由程式幾何生成，含上下及左右不對稱色塊以辨識倒像。鏡外成像參考僅為數學構圖，不表示該位置真的有發光物體。物在焦點時像無有限位置。初次開啟由透鏡後方觀察；切換面鏡後請轉到物體側，可按立體視角。時間供靜態觀察，非物體運動。',
['鏡孔之外的原物與透過鏡孔看到的像相同嗎？','凸透鏡的物體移過焦點時，看見的像如何改變？'],p=>{
const mirror=p.kind>=3,plane=p.kind===2||p.kind===5,mapped=p.kind===0?0:p.kind===1?1:p.kind===3?3:2,base=plane?null:M.ParaxialOptics.solve(mapped,p.u,p.f,p.size),f=plane?Infinity:base.f,vergence=plane?-1/p.u:base.vergence,travelSign=mirror?-1:1,image=plane?{distance:-p.u,x:-travelSign*p.u,y:2,magnification:1,real:false}:base.image?{...base.image,y:2+base.image.y}:null;
return trajectory(4,()=>({x:-p.u,y:2,z:0,objectDistance:p.u,imageVergence:vergence,opticalPower:plane?0:1/f,imageUnbounded:image?0:1}),{schematic:true,hidePrimary:true,hideGrid:()=>true,mirror,plane,f,image,center:[0,2,0],objectX:-p.u,bounds:{min:[-p.u-.5,0,-2.2],max:[2,4.2,2.2]},scaleNote:'有限鏡孔外觀為近軸薄元件模型；面鏡正面在物體側，背面為灰色。',endLabel:'透鏡外觀觀察完成'});
},'models/eye-lens.js');M.defs.find(d=>d.id==='eye-lens').initialView={yaw:Math.PI/2,pitch:0};
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
