(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
function planeRay(objectX,depth,eyeX,height,nObject,nEye){let lo=Math.min(objectX,eyeX),hi=Math.max(objectX,eyeX);for(let j=0;j<80;j++){const x=(lo+hi)/2,f=nObject*(x-objectX)/Math.hypot(x-objectX,depth)-nEye*(eyeX-x)/Math.hypot(eyeX-x,height);if(f<0)lo=x;else hi=x;}const hitX=(lo+hi)/2;return{eyeX,hitX,slope:(eyeX-hitX)/height,incidentAngle:Math.atan2(Math.abs(hitX-objectX),depth),outgoingAngle:Math.atan2(Math.abs(eyeX-hitX),height)};}
M.WaterOptics.planeRay=planeRay;
M.register('apparent-depth','視深與實深：雙光線反向延長','幾何光學','apparent-depth',[
P('mode','觀察：0空氣看水中／1水中看空氣',0,1,1,0),P('n','水的折射率',1,1.8,.01,1.33),P('depth','物體距界面',.3,3,.1,1.5,'m'),P('objectX','物體橫向位置',-2,2,.1,0,'m'),P('eyeX','觀察者橫向位置',-4,4,.1,1.5,'m'),P('eyeHeight','觀察者距界面',.5,3,.1,1.5,'m'),P('aperture','兩取樣光線的眼端間距',.05,1,.05,.25,'m'),{...P('rays','顯示折射與反向延長',0,1,1,1),visual:true},{...P('nearAxis','顯示近軸參考像',0,1,1,1),visual:true},{...P('fish','物體：0圓點／1魚',0,1,1,1),visual:true}
],[metric('realDepth','物體距界面','m'),metric('apparentDepth','雙光線表觀距離','m'),metric('nearAxisDepth','近軸參考距離','m')],
'n物sinθ物=n眼sinθ眼；兩條出射光線反向延長相交求表觀位置',
'平面水面y=3m；觀察者是圖中兩個取樣眼端位置，與操作3D相機分開。每條光線由物體出發，數值解唯一折射點使Snell定律及眼端位置同時成立，再反向延長眼端光線求交點。眼端間距是子午平面光束取樣寬度，不宣稱完整雙眼視覺或人眼成像。斜視有限孔徑下沒有所有光線共同的唯一虛像；本題表觀位置是這兩條光線的交點，調整取樣寬度可能改變它。近軸公式d視=d實×n眼/n物只在接近法線及小角度成立，不能當成任意視角的精確視深。可反轉空氣／水的物體與眼端方向，不計玻璃、曲面、反射分支、像差完整波前或生理視覺。圖形逐步顯示光路，時間非實際光速。',
['斜視時，兩光線表觀位置與近軸參考一樣嗎？','從水中看空氣中的物體，表觀距離如何改變？'],p=>{
const level=3,side=p.mode===0?-1:1,nObject=p.mode===0?p.n:1,nEye=p.mode===0?1:p.n,object=[p.objectX,level+side*p.depth,0],eyeY=level-side*p.eyeHeight,rays=[-.5,.5].map(k=>planeRay(p.objectX,p.depth,p.eyeX+k*p.aperture,p.eyeHeight,nObject,nEye)),den=rays[1].slope-rays[0].slope,apparentDepth=(rays[1].hitX-rays[0].hitX)/den,apparentX=rays[0].hitX-apparentDepth*rays[0].slope,nearAxisDepth=p.depth*nEye/nObject,apparent=[apparentX,level+side*apparentDepth,0],nearAxis=[p.objectX,level+side*nearAxisDepth,0],minX=Math.min(p.objectX,p.eyeX-p.aperture/2)-1,maxX=Math.max(p.objectX,p.eyeX+p.aperture/2)+1;
return trajectory(4,t=>({x:object[0],y:object[1],z:0,realDepth:p.depth,apparentDepth,nearAxisDepth,apparentX,phase:t/4}),{schematic:true,hidePrimary:true,hideGrid:()=>true,level,side,nObject,nEye,object,eyeY,rays,apparent,nearAxis,bounds:{min:[minX,-1,-1],max:[maxX,7,1]},scaleNote:'兩取樣光線求交點；相機自由旋轉不會搬動圖中的觀察者，近軸公式另列比較。',endLabel:'視深光路觀察完成'});
},'models/apparent-depth.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
