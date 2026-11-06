/* Finite one-sided mirror segments. All coordinates here are horizontal [x,z]. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers,eps=1e-9;
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function reflect(p,v){const a=2*dot(p,v);return[a*v[0]-p[0],a*v[1]-p[1]];}
function intersection(p,target,v,L){const d=target.map((x,j)=>x-p[j]),den=cross(d,v);if(Math.abs(den)<eps)return null;const t=-cross(p,v)/den,r=cross(p,d)/cross(v,d);if(t<=eps||r<=eps||r>L+eps)return null;return{t,r,point:p.map((x,j)=>x+t*d[j])};}
function trace(eye,object,word,mirrors,L){let image=object;const images=[object];for(const k of word){image=reflect(image,mirrors[k]);images.push(image);}let current=eye,points=[eye];for(let j=word.length-1;j>=0;j--){const k=word[j],target=images[j+1],hit=intersection(current,target,mirrors[k],L);if(!hit||hit.t>=1-eps)return null;const other=intersection(current,target,mirrors[1-k],L);if(other&&other.t<hit.t-eps)return null;const n=k===0?[0,1]:[mirrors[1][1],-mirrors[1][0]];if(dot(current,n)<=eps)return null;points.push(hit.point);current=hit.point;}for(const mirror of mirrors){const h=intersection(current,object,mirror,L);if(h&&h.t<1-eps)return null;}points.push(object);return{image,points,word,parity:word.length%2};}
M.MirrorGeometry={reflect,intersection,trace};
M.register('double-mirror','雙鏡成多像：反射次數與可見光路','幾何光學','double-mirror',[
P('angle','兩鏡夾角',30,150,5,90,'°'),P('length','鏡面長度',2,8,.1,6,'m'),P('objectR','物體離交線距離',.5,4,.1,2,'m'),P('objectAngle','物體角位置／夾角',10,90,1,45,'%'),P('eyeR','眼睛離交線距離',.5,4,.1,3,'m'),P('eyeAngle','眼睛角位置／夾角',10,90,1,60,'%'),{...P('selected','查看第幾個可見像',1,24,1,1),visual:true},{...P('rays','顯示所選像的光路',0,1,1,1),visual:true}
],[metric('imageCount','可見虛像數',''),metric('oddCount','奇數次反射像',''),metric('evenCount','偶數次反射像','')],
'每次反射：r′ = 2(r·ê)ê − r；逐段有限鏡面追跡判定可見性',
'鏡面為兩個有限、向夾角內側反射的垂直矩形；光源及眼睛同高，使用水平截面光路。枚舉最多12次交替反射，逐段檢查最近鏡面、反射正面及有限長度，排除交線上的退化光路，並合併重合像。顯示的是此眼睛位置實際能接收的像，不直接套用360°/夾角的數像公式。角度範圍30至150度，光路上限12次；不模擬衍射、遮擋與反射能量損失。奇數次反射改變手性，偶數次保持；每個像的紅藍非對稱標記也依同一反射序列變換。虛線只表示鏡後反向延長，非光穿透鏡子。時間僅用於光路示意慢放。',
['90度和60度夾角，能看到的像有何差異？','鏡子縮短或移動眼睛，哪些光路會消失？'],p=>{
const a=p.angle*Math.PI/180,mirrors=[[1,0],[Math.cos(a),Math.sin(a)]],polar=(r,k)=>[r*Math.cos(a*k/100),r*Math.sin(a*k/100)],object=polar(p.objectR,p.objectAngle),eye=polar(p.eyeR,p.eyeAngle),images=[];
for(let depth=1;depth<=12;depth++)for(let start=0;start<2;start++){const word=Array.from({length:depth},(_,j)=>(start+j)%2),q=trace(eye,object,word,mirrors,p.length);if(q&&Math.hypot(q.image[0]-object[0],q.image[1]-object[1])>1e-7&&!images.some(v=>Math.hypot(v.image[0]-q.image[0],v.image[1]-q.image[1])<1e-7))images.push(q);}
const all=[[0,0],...mirrors.map(v=>v.map(x=>x*p.length)),object,eye,...images.map(q=>q.image)],minX=Math.min(...all.map(q=>q[0]))-.6,maxX=Math.max(...all.map(q=>q[0]))+.6,minZ=Math.min(...all.map(q=>q[1]))-.6,maxZ=Math.max(...all.map(q=>q[1]))+.6;
return trajectory(4,t=>({x:object[0],y:1.5,z:object[1],imageCount:images.length,oddCount:images.filter(q=>q.parity).length,evenCount:images.filter(q=>!q.parity).length,phase:t/4}),{hidePrimary:true,hideGrid:()=>true,mirrors,object,eye,images,reflect,bounds:{min:[minX,0,minZ],max:[maxX,3,maxZ]},scaleNote:'有限鏡面、同高點物體；最多12次反射，選像滑桿超過數量時顯示最後一像。',endLabel:'反射光路示意完成'});
},'models/double-mirror.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
