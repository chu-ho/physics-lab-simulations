(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('dolly-zoom','希區考克變焦：主體不變、背景改變','幾何光學','dolly-zoom',[
P('mode','比較：0只移動／1移動加變焦／2只變焦',0,2,1,1),P('automatic','自動前後移動',0,1,1,1),P('reference','基準主體距離',2,8,.1,4,'m'),P('distance','手動距離／變焦驅動',1,10,.1,4,'m'),P('amplitude','自動最大位移',0,3,.1,1.5,'m'),P('period','前後週期',2,8,.5,4,'s'),P('f0','基準焦距',15,100,1,35,'mm'),P('radius','主環與背景環半徑',.5,1.5,.1,1,'m'),P('spacing','背景環間隔',1,3,.1,1.5,'m'),P('count','圓環數',3,12,1,9),{...P('view','視圖：0攝影機畫面／1自由3D構圖',0,1,1,0),visual:true,refit:true},{...P('frustum','顯示3D取景範圍',0,1,1,1),visual:true}
],[metric('distance','目前主體距離','m'),metric('focalMM','目前焦距','mm'),metric('subjectImageMM','主環感光面像高','mm')],
'保持主體像高：f/d=f₀/d₀；聚焦像距v=fd/(d−f)，像高H像=vH/d',
'攝影機朝+x，主環在x=0，等大背景環依序在後方；每一環皆為3D空間的固定物體，不用整幅背景縮放冒充移動透視。攝影機畫面由感光面中央投影得到，3:2片幅高度24mm，焦點隨主體距離調整；因此以聚焦像距v而非近似f作投影距離。移動加變焦時f=f0*d/d0，v/d也固定，主環中心線直徑的像高精確不變；背景環因不同深度而相對改變。只移動保持f0；只變焦保持攝影機距離d0，改焦距但不改透視深度比。自動移動為正弦往返，振幅若超過基準距離80%會限制以免接近／穿過主體。操作3D相機只改自由構圖視角，與攝影機畫面分開。省略景深模糊、像差、畸變及真實鏡頭內對焦呼吸；地板與圓環為程式幾何示意。',
['只變焦與移動加變焦，背景對主體的比例都會改變嗎？','為何主體大小不變時，背景仍像在靠近或遠離？'],p=>{
const f0=p.f0*.001,d0=p.reference,A=Math.min(p.amplitude,.8*d0),sensorHeight=.024,sensorWidth=.036,rings=Array.from({length:p.count},(_,j)=>({x:j*p.spacing,color:j%2?'#bd7e92':'#cdb568'}));
function optics(t){const phase=2*Math.PI*t/p.period,driver=p.automatic?d0+A*Math.sin(phase):p.distance,driverV=p.automatic?A*2*Math.PI/p.period*Math.cos(phase):0,d=p.mode===2?d0:driver,f=p.mode===0?f0:f0*driver/d0,v=f*d/(d-f),heights=rings.map(r=>2*p.radius*v/(d+r.x)),ratios=rings.map(r=>d/(d+r.x));return{d,f,v,heights,ratios,velocity:p.mode===2?0:driverV};}
const far=rings.at(-1).x,maxDistance=p.automatic?d0+A:Math.max(d0,p.distance),minX=-maxDistance-1,halfY=Math.max(...Array.from({length:33},(_,j)=>{const q=optics(2*p.period*j/32);return q.d*sensorHeight/(2*q.v);})),halfZ=halfY*1.5;
return trajectory(2*p.period,t=>{const q=optics(t);return{x:-q.d,y:2,z:0,vx:-q.velocity,distance:q.d,focalMM:q.f*1000,subjectImageMM:q.heights[0]*1000,backgroundRelative:q.ratios.at(-1),backgroundImageMM:q.heights.at(-1)*1000,subjectFrameFraction:q.heights[0]/sensorHeight};},{schematic:true,hidePrimary:true,hideGrid:()=>true,optics,rings,sensorHeight,sensorWidth,A,bounds:{min:[minX,Math.min(0,2-halfY-.3),-Math.max(2,halfZ+.3)],max:[far+1,Math.max(4.5,2+halfY+.3),Math.max(2,halfZ+.3)]},scaleNote:'固定3D圓環與24×36mm感光面投影；主環像高量測中心線直徑，不含環管厚度。',endLabel:'兩個前後移動週期完成'});
},'models/dolly-zoom.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
