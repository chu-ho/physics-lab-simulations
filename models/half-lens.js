(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
function fraction(h){h=Math.max(-1,Math.min(1,h));return(h*Math.sqrt(Math.max(0,1-h*h))+Math.asin(h)+Math.PI/2)/Math.PI;}
function pupil(cut,N=192){const area=fraction(cut),points=[];if(area===0)return points;for(let j=0;j<N;j++){const target=area*(j+.5)/N;let lo=-1,hi=cut;for(let k=0;k<36;k++){const mid=(lo+hi)/2;if(fraction(mid)<target)lo=mid;else hi=mid;}const y=(lo+hi)/2,z=(2*((j*.6180339887498949)%1)-1)*Math.sqrt(Math.max(0,1-y*y));points.push({y,z,weight:area/N});}return points;}
M.ApertureOptics={fraction,pupil};
M.register('half-lens','透鏡遮一半：完整像與光量','幾何光學','half-lens',[
P('cover','由上向下遮擋高度',0,100,1,50,'%直徑'),P('shape','物體：0點／1十字取樣／2三色點',0,2,1,1),P('f','凸透鏡焦距',.5,2,.1,1,'m'),P('ratio','物距／焦距',1.2,4,.1,2.5),P('radius','透鏡半口徑',.6,1.8,.1,1.2,'m'),P('screenRatio','屏距／理想像距',.5,1.5,.05,1),{...P('rays','顯示抽樣光線',0,1,1,0),visual:true},{...P('screen','顯示屏幕底板',0,1,1,1),visual:true},{...P('exposure','固定顯示曝光',1,12,1,1),visual:true}
],[metric('openPercent','未遮擋面積／相對光量','%'),metric('magnification','理想像橫向放大率',''),metric('screenDistance','目前屏距','m')],
'開孔面積比例 F(h)=[h√(1−h²)+asin h+π/2]/π；1/f=1/u+1/v',
'理想近軸凸透鏡、均勻孔徑照明與幾何光學；遮板緊貼透鏡，從上向下遮擋，50%直徑恰為半面積。每個物點都使用整個未遮擋孔徑，不把物體分半。以圓弓形面積CDF抽樣開孔，任何非零開孔都有光線；每條光線權重是實際開孔面積比例除以樣本數，沒有依目前亮度重新歸一。光線由同一薄元件規則到屏幕，屏在理想像距時所有開孔光線仍聚到完整像點，只改變光量；離焦時出現孔徑形狀的光斑。點／十字／三色物以離散物點取樣，不冒稱連續物體的完整光學場。固定顯示曝光及gamma只用於看清光斑，亮度比例以數值為準；不含繞射、像差、距離衰減或反射損耗。屏幕像素光量是幾何取樣的顯示，不是繞射點擴散函數。',
['遮住上半透鏡，為何屏上不是只剩下半個像？','屏幕離開理想成像平面後，遮擋形狀如何出現在光斑中？'],p=>{
const u=p.ratio*p.f,v=p.f*u/(u-p.f),m=-v/u,R=p.radius,cut=1-2*p.cover/100,open=fraction(cut),samples=pupil(cut),screenX=v*p.screenRatio,half=Math.max(1.2,Math.abs(1-p.screenRatio)*R+p.screenRatio*Math.abs(m)*.6+.3),cy=Math.max(half,R)+.4;
const objects=p.shape===0?[{y:.45,z:0,color:[.82,.64,.29]}]:p.shape===1?[...Array.from({length:5},(_,j)=>({y:(j-2)*.25,z:0,color:[.82,.64,.29]})),...[-2,-1,1,2].map(j=>({y:0,z:j*.25,color:[.82,.64,.29]}))]:[{y:.4,z:-.35,color:[.78,.3,.35]},{y:.4,z:.35,color:[.3,.68,.47]},{y:-.4,z:0,color:[.3,.49,.78]}];
const rays=[],bins=new Map(),N=32,step=2*half/N;for(const [id,o]of objects.entries())for(const q of samples){const hit=[0,cy+q.y*R,q.z*R],object=[-u,cy+o.y,o.z],incoming=hit.map((x,j)=>x-object[j]),norm=Math.hypot(...incoming),dir=M.ThinOptics.transfer(incoming.map(x=>x/norm),[hit[1]-cy,hit[2]],p.f,false),end=[screenX,hit[1]+screenX*dir[1]/dir[0],hit[2]+screenX*dir[2]/dir[0]],iy=Math.min(N-1,Math.max(0,Math.floor((end[1]-cy+half)/step+1e-9))),iz=Math.min(N-1,Math.max(0,Math.floor((end[2]+half)/step+1e-9))),key=iy*N+iz;
if(!bins.has(key))bins.set(key,{iy,iz,energy:[0,0,0]});const bin=bins.get(key);for(let j=0;j<3;j++)bin.energy[j]+=q.weight*o.color[j];rays.push({id,object,hit,end,weight:q.weight,color:o.color});}
return trajectory(4,()=>({x:-u,y:cy,z:0,openPercent:100*open,magnification:m,screenDistance:screenX,relativeFlux:open,pointCount:objects.length}),{schematic:true,minimumSceneScale:5.5,hidePrimary:true,hideGrid:()=>true,u,v,m,R,cut,open,samples,screenX,half,cy,objects,rays,bins:[...bins.values()],pixelStep:step,bounds:{min:[-u-.5,0,-half-.5],max:[screenX+.5,2*Math.max(half,R)+.8,half+.5]},scaleNote:'50%遮擋直徑＝半面積；屏上光量相對未遮擋，固定曝光顯示非校準亮度。',endLabel:'遮擋與成像觀察完成'});
},'models/half-lens.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
