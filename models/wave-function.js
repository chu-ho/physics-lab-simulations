/* Analytic travelling transverse wave and a separate x-time display surface. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('wave-function','橫波波函數：空間、時間與曲面','波動','wave-function',[
P('A','振幅',.1,1,.05,.5,'m'),P('lambda','波長',2,8,.5,4,'m'),P('c','波速大小',.5,4,.25,2,'m/s'),P('direction','傳播方向：−1左／1右',-1,1,2,1),P('phase','初相位',0,360,15,0,'°'),P('track','追蹤質點平衡位置',-5,5,.25,1,'m'),{...P('showYX','顯示固定時間 y-x',0,1,1,1),visual:true},{...P('showYT','顯示固定位置 y-t',0,1,1,1),visual:true},{...P('surface','顯示波函數曲面',0,1,1,1),visual:true}
],[metric('displacement','追蹤點位移','m'),metric('frequency','頻率','Hz'),metric('period','週期','s')],
'y(x,t)=A sin(kx−sωt+φ)，k=2π/λ，ω=kc，s=±1',
'均勻無限長理想繩的解析橫波。質點僅沿實際y方向振動，不隨波沿x前進；主質點的物理z恆為0。曲面的第三顯示軸是時間τ，不是物理z位置，以固定4個週期的時間窗比較所有時刻。金色y-x曲線在前方物理平面，曲面上同色截線表示目前t；青色y-t曲線固定追蹤x並沿時間軸延伸。切片開關只改顯示，不改時間與播放。曲面垂直座標加2m作排版基準，位移讀值仍是相對平衡位置的SI值。速度與合力箭頭仍在物理x-y平面；合力以1kg示意質量乘解析加速度，不是有限繩段質量。',
['固定時間觀察空間波形，與固定位置觀察時間振動，有何差別？','向左傳波時，波形平移方向與質點速度方向是否相同？'],p=>{
const k=2*Math.PI/p.lambda,omega=k*p.c,phi=p.phase*Math.PI/180,period=p.lambda/p.c,duration=4*period,base=2,s=p.direction;
const field=(x,t)=>{const q=M.Waves.harmonic(x+phi/k,s*t,p.A,p.lambda,p.c);return{...q,ut:s*q.ut};};
return trajectory(duration,t=>{const q=field(p.track,t);return{x:p.track,y:base+q.u,z:0,vx:0,vy:q.ut,vz:0,fx:0,fy:q.utt,fz:0,displacement:q.u,frequency:1/period,period,particleAcceleration:q.utt,slope:q.ux,phase:k*p.track-s*omega*t+phi};},{field,base,period,omega,k,timeToZ:tau=>1+8*tau/duration,hideGrid:()=>true,bounds:{min:[-6.5,0,-1],max:[6.5,4.5,10]},scaleNote:'第三顯示軸為時間τ（s），不是物理z。箭頭、CSV位置仍是實際x-y運動；前方曲線是目前t。',events:[{t:0,label:s===1?'向右行波：形狀沿+x傳播':'向左行波：形狀沿−x傳播'},{t:period,label:'經過一週期；波形前進一波長'}],endLabel:'四週期觀察完成'});
},'models/wave-function.js');M.defs.find(d=>d.id==='wave-function').plotMetrics=[metric('particleAcceleration','追蹤點加速度','m/s²'),metric('slope','追蹤點空間斜率',''),metric('phase','追蹤點相位','rad')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
