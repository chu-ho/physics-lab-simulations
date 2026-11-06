(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('plane-mirror','平面鏡成像與可見範圍','幾何光學','plane-mirror',[
P('width','鏡面寬度',.5,8,.1,4,'m'),P('mirrorZ','鏡面橫向位置',-3,3,.1,0,'m'),P('eyeX','眼睛離鏡距離',1,7,.1,4,'m'),P('eyeZ','眼睛橫向位置',-4,4,.1,0,'m'),P('objectX','物體離鏡距離',1,6,.1,3,'m'),{...P('rays','顯示反射與虛像延長線',0,1,1,1),visual:true}
],[metric('visibleCount','可見虛像數',''),metric('objectDistance','物距','m'),metric('imageDistance','像距','m')],
'x像 = −x物；鏡面交點 = 眼睛至虛像連線與x=0的交點',
'理想平面鏡位於x=0，高度0至4m，寬度與橫向位置可調；物體和眼睛都在鏡前。每個彩色物體是點光源，鏡後淡色點為等距虛像。眼睛到虛像的直線若通過鏡面矩形，便可看到該點的像；否則顯示不可見。實線為物體經鏡面進入眼睛的光路，虛線為鏡後反向延長線；並非光實際穿透鏡面。忽略遮擋、衍射及鏡面厚度；虛像可見性是點的判定，不表示整個延伸物體均可見。',
['鏡子變短，哪些虛像先消失？','改變物體距離，像距如何改變？'],p=>{
const eye=[p.eyeX,2,p.eyeZ],objects=[-2,0,2].map((z,j)=>[p.objectX,1+j*.6,z]),images=objects.map(o=>[-o[0],o[1],o[2]]);
const paths=objects.map((o,j)=>{const image=images[j],a=eye[0]/(eye[0]-image[0]),hit=[0,eye[1]+a*(image[1]-eye[1]),eye[2]+a*(image[2]-eye[2])],visible=Math.abs(hit[2]-p.mirrorZ)<=p.width/2+1e-12&&hit[1]>=0&&hit[1]<=4;return{object:o,image,hit,visible};});
return trajectory(4,t=>({x:eye[0],y:eye[1],z:eye[2],visibleCount:paths.filter(q=>q.visible).length,objectDistance:p.objectX,imageDistance:p.objectX,phase:t/4}),{hidePrimary:true,hideGrid:()=>true,eye,paths,bounds:{min:[-p.objectX-.5,0,Math.min(-2,p.eyeZ,p.mirrorZ-p.width/2)-.5],max:[Math.max(p.objectX,p.eyeX)+.5,5,Math.max(2,p.eyeZ,p.mirrorZ+p.width/2)+.5]},events:[{t:0,label:'鏡後等距虛像；光線在鏡面反射'}],scaleNote:'光路與點物體示意；時間游標只呈現光路進度，非光速比例。',endLabel:'光路示意完成'});
},'models/plane-mirror.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
