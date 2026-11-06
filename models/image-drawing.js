/* Paraxial thin-element imaging; signed distance along outgoing propagation. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
function solve(kind,u,focalMagnitude,height){const mirror=kind>=2,f=(kind===1||kind===2?-1:1)*focalMagnitude,vergence=1/f-1/u,atInfinity=Math.abs(vergence)<1e-12,travelSign=mirror?-1:1,image=atInfinity?null:{distance:1/vergence,x:travelSign/vergence,y:-height/(u*vergence),magnification:-1/(u*vergence),real:vergence>0};return{mirror,f,vergence,atInfinity,travelSign,image};}
M.ParaxialOptics={solve};
M.register('image-drawing','成像作圖：透鏡與面鏡','幾何光學','image-drawing',[
P('kind','元件：0凸透鏡／1凹透鏡／2凸面鏡／3凹面鏡',0,3,1,0),P('u','物距',.5,8,.1,3,'m'),P('f','焦距絕對值',.5,4,.1,2,'m'),P('height','物高',.2,1.5,.1,.8,'m'),{...P('parallel','平行主軸光線',0,1,1,1),visual:true},{...P('focal','焦點光線',0,1,1,1),visual:true},{...P('central','中心光線',0,1,1,1),visual:true},{...P('topRay','元件上端光線',0,1,1,0),visual:true},{...P('bottomRay','元件下端光線',0,1,1,0),visual:true},{...P('showImage','顯示成像',0,1,1,1),visual:true}
],[metric('objectDistance','物距','m'),metric('focalLength','有號焦距','m'),metric('imageVergence','像距倒數（0為無限遠）','1/m')],
'1/f = 1/u + 1/v；m = −v/u；虛像v<0，實像v>0',
'理想薄透鏡／近軸面鏡模型，以出射傳播方向定義有號像距：透鏡實像在右，面鏡實像在左。凸透鏡及凹面鏡f>0，凹透鏡及凸面鏡f<0；物體皆在左側。中心光線對透鏡直行，對面鏡按近軸反射。元件半口徑2m，焦點光線若超出口徑則不顯示；上下端光線可另外開啟。這是高斯近軸教學作圖，斜率較大時不代表精確折射／球面鏡光路；元件外形僅為符號，不計厚度、像差及繞射。物在正焦點時像在無限遠，不給有限像距或放大率；近焦點的有限像若超出視窗會以文字列值。虛線為出射線反向延長，非實際光傳播。時間只逐步呈現作圖線段，非光速。',
['物體移過正焦點時，像如何改變？','面鏡與透鏡的實像各在哪一側？'],p=>{
const optics=solve(p.kind,p.u,p.f,p.height),{f,travelSign,image}=optics,aperture=2,rays=[];
function add(key,hit,color){if(!Number.isFinite(hit)||Math.abs(hit)>aperture+1e-10)return;const slope=(hit-p.height)/p.u-hit/f;rays.push({key,hit,slope,color});}
add('parallel',p.height,'#c5a052');if(Math.abs(f-p.u)>1e-10)add('focal',p.height*f/(f-p.u),'#9c77b7');add('central',0,'#539e9c');add('topRay',aperture,'#7699bc');add('bottomRay',-aperture,'#ba7e7b');
const extent=Math.max(8,2*p.u,2*p.f),vertical=3.5;
return trajectory(4,t=>({x:-p.u,y:4+p.height,z:0,objectDistance:p.u,focalLength:f,imageVergence:optics.vergence,imageUnbounded:optics.atInfinity?1:0,imageKind:image?(image.real?1:-1):0,phase:t/4}),{schematic:true,hidePrimary:true,hideGrid:()=>true,optics,rays,aperture,extent,vertical,bounds:{min:[-extent,0,-.5],max:[extent,8.5,.5]},scaleNote:'近軸薄元件作圖；光路逐步呈現，像在視窗外時保留數值。',endLabel:'成像作圖完成'});
},'models/image-drawing.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
