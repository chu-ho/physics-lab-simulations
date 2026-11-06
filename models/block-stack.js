(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('block-stack','堆木塊與最大懸伸','靜力學','block-stack',[
 P('n','木塊層數',2,10,1,6,''),P('L','木塊長度',1,4,.1,2,'m'),P('spread','初始最佳偏移比例',0,1,.05,.65,''),P('layer','推移第幾層（由上數）',1,10,1,1,''),P('push','指定單塊推移',-1,1,.05,.8,'倍木長'),
 ...Array.from({length:10},(_,i)=>P('offset'+(i+1),'第 '+(i+1)+' 層額外偏移',-.5,.5,.05,0,'倍木長'))
],[metric('overhang','右側懸伸','m'),metric('margin','最小支持餘裕','m'),metric('criticalLayer','最危險界面（由上數）','')],
'上方 j 塊質心 x̄ⱼ = Σxᵢ/j；支持接觸須包住 x̄ⱼ；最大懸伸 = (L/2)Σ₁ⁿ1/j',
'均勻、等長等重的木塊，忽略厚度造成的接觸變形。每層可獨立設定初始水平偏移；層數以外的控制忽略，選層超過層數時選最底塊。播放是緩慢推移單塊的靜力掃描，不是真實滑動或倒塌動力。所有界面逐一比較上方子堆質心與實際接觸重疊區；到第一個臨界即停止。若初始配置已無靜力支持，直接停止於初始狀態。理論最大懸伸指右側、等長木塊理想最優配置；不是任意配置的可推距離。',
['推頂塊與推底塊時，哪個界面先失去支持？','增加層數時最大懸伸如何增加？為何每次增加量逐漸變小？'],p=>{
 const n=Math.round(p.n),L=p.L,h=.3,LH=Array.from({length:n},(_,i)=>1/(i+1)).reduce((a,b)=>a+b,0),chosen=Math.min(n,Math.max(1,Math.round(p.layer)))-1;
 const initial=Array(n);initial[n-1]=-L/2+p.spread*L/(2*n);for(let i=n-2;i>=0;i--)initial[i]=initial[i+1]+p.spread*L/(2*(i+1));for(let i=0;i<n;i++)initial[i]+=L*(p['offset'+(i+1)]||0);
 const requested=L*p.push;
 function inspect(centers){return centers.map((_,i)=>{const com=centers.slice(0,i+1).reduce((a,b)=>a+b,0)/(i+1),left=Math.max(centers[i]-L/2,i<n-1?centers[i+1]-L/2:-4*L),right=Math.min(centers[i]+L/2,i<n-1?centers[i+1]+L/2:0);return{layer:i+1,com,left,right,margin:Math.min(com-left,right-com)}})}
 const start=inspect(initial),shifted=initial.map((v,i)=>v+(i===chosen?requested:0)),end=inspect(shifted);let fraction=1,criticalLayer=0;
 // Each contact inequality is linear in the scan fraction. Test both upper and supporting faces separately.
 for(let i=0;i<n;i++){const count=i+1,com=initial.slice(0,count).reduce((a,b)=>a+b,0)/count,dc=chosen<=i?requested/count:0;
  const bounds=[[initial[i]-L/2,chosen===i?requested:0,1],[initial[i]+L/2,chosen===i?requested:0,-1],i<n-1?[initial[i+1]-L/2,chosen===i+1?requested:0,1]:[-4*L,0,1],i<n-1?[initial[i+1]+L/2,chosen===i+1?requested:0,-1]:[0,0,-1]];
  for(const [b,db,sign]of bounds){const value=sign*(com-b),slope=sign*(dc-db);if(value< -1e-10){fraction=0;criticalLayer=i+1}else if(slope< -1e-14){const f=Math.max(0,value/-slope);if(f<=fraction&&f<=1){fraction=f;criticalLayer=i+1}}}
 }
 const duration=8*fraction,invalid=start.some(q=>q.margin< -1e-10),hasCritical=criticalLayer>0;
 return trajectory(duration,t=>{const travel=requested*t/8,centers=initial.map((v,i)=>v+(i===chosen?travel:0)),interfaces=inspect(centers),weak=interfaces.reduce((a,b)=>a.margin<=b.margin?a:b),overhang=Math.max(...centers.map(x=>x+L/2));return{x:centers[chosen],y:1+(n-chosen-.5)*h,z:0,centers,interfaces,travel,overhang,margin:weak.margin,criticalLayer:weak.layer,maxOverhang:L*LH/2,selectedLayer:chosen+1,atCritical:hasCritical&&t>=duration-1e-9?1:0,invalid:invalid?1:0}},
 {n,L,h,chosen,initial,inspect,criticalLayer,criticalFraction:fraction,requested,maxOverhang:L*LH/2,bounds:{min:[-4*L,0,-1.2],max:[Math.max(L,...initial)+L,1+n*h+1.4,1.2]},events:hasCritical?[{t:duration,label:invalid?'初始配置失去靜力支持':'第 '+criticalLayer+' 界面首先臨界'}]:[],endLabel:invalid?'初始配置已失去靜力支持':hasCritical?'達到第一個失穩臨界；未模擬倒塌':'完成指定靜力推移'});
},'models/block-stack.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
