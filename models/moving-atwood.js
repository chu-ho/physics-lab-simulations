/* Compound Atwood machine: fixed/moving main axle, two massless movable pulleys, four masses. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers,G=9.81;
M.register('moving-atwood','會動的阿特伍機：四重物與雙動滑輪','動力學','moving-atwood',[
 P('mA','A 質量',1,8,.5,5,'kg'),P('mB','B 質量',1,8,.5,3,'kg'),P('mC','C 質量',1,8,.5,3,'kg'),P('mD','D 質量',1,8,.5,2,'kg'),
 P('supportA','頂端支點向上加速度',-9.81,5,.01,0,'m/s²')
],[metric('tension','下方兩繩張力 T','N'),metric('aA','A 絕對加速度 ↑','m/s²'),metric('aLeft','左動滑輪加速度 ↑','m/s²')],
 'aA＋aB = 2aL；aC＋aD = 2aR；aL＋aR = 2a₀；T = 4(g＋a₀)/(1/mA＋1/mB＋1/mC＋1/mD)；aᵢ = T/mᵢ − g；上繩張力 = 2T',
 '對照原站：頂端大滑輪的繩兩端各吊一個小動滑輪，小滑輪下各掛兩個重物 A/B、C/D。三輪與三繩無質量、無摩擦，繩不可伸長；四重物皆由靜止釋放。預設頂端支點固定（a₀=0），另可探索支點等加速運動。全部加速度向上為正；相對支點的速度與加速度已列入圖表。小滑輪無質量故上繩張力為下繩的兩倍；頂端支承力為 4T。重物碰地、重物碰自己的滑輪、小滑輪碰頂輪或張力失效前停止，最多觀察 8 秒或支點上升 6 m；不推演碰撞後運動。a₀=−g 是零張力自由落體的臨界極限。輪、重物大小為示意，輪的轉角不作無滑動慣量分析。',
 ['為何左右小滑輪會移動，但它們的平均高度在固定支點時不變？','A、B 質量不同時，左小滑輪的加速度是否等於 A 或 B 的加速度？','支點接近自由落體時，張力與各重物相對運動如何改變？'],p=>{
 const names=['A','B','C','D'],m=names.map(n=>p['m'+n]),a0=p.supportA,tensionRaw=4*(G+a0)/m.reduce((s,v)=>s+1/v,0),tension=Math.max(0,tensionRaw),a=m.map(v=>tension/v-G),aLeft=(a[0]+a[1])/2,aRight=(a[2]+a[3])/2;
 let duration=a0>0?Math.min(8,Math.sqrt(12/a0)):8,endLabel=duration<8?'支點上升 6 m 觀察結束':'八秒觀察結束';
 const stop=(gap,dd,label)=>{if(dd<0){const t=Math.sqrt(-2*gap/dd);if(t<duration){duration=t;endLabel=label+' · 接觸前瞬間'}}};
 if(tensionRaw<0){duration=0;endLabel='支點下降加速度超過 g，繩無法維持繃緊，停止此模型'}
 for(let i=0;i<4;i++){
  stop(4.5-.3,a[i],names[i]+' 觸地');
  stop(8.5-4.5-.85,(i<2?aLeft:aRight)-a[i],names[i]+' 接近小滑輪');
 }
 stop(12-8.5-2.75,a0-aLeft,'左小滑輪接近頂輪');stop(12-8.5-2.75,a0-aRight,'右小滑輪接近頂輪');
 stop(8.5-.65,aLeft,'左小滑輪接近地面');stop(8.5-.65,aRight,'右小滑輪接近地面');
 const initialU=G*m.reduce((s,v)=>s+v*4.5,0),supportEnd=12+.5*a0*duration**2;
 return trajectory(duration,t=>{
  const supportY=12+.5*a0*t*t,supportV=a0*t,ys=a.map(v=>4.5+.5*v*t*t),vs=a.map(v=>v*t),leftY=8.5+.5*aLeft*t*t,rightY=8.5+.5*aRight*t*t,K=m.reduce((s,v,i)=>s+.5*v*vs[i]**2,0),U=G*m.reduce((s,v,i)=>s+v*ys[i],0),state={x:-2.6,y:ys[0],z:0,vx:0,vy:vs[0],vz:0,fx:0,fy:m[0]*a[0],fz:0,ay:a[0],supportY,supportV,supportA:a0,leftY,rightY,leftV:aLeft*t,rightV:aRight*t,aLeft,aRight,tension,upperTension:2*tension,supportForce:4*tension,K,U,E:K+U,supportWork:4*tension*(supportY-12),initialE:initialU,ropeTop:2*supportY-leftY-rightY+Math.PI*2,ropeLeft:2*leftY-ys[0]-ys[1]+Math.PI*.6,ropeRight:2*rightY-ys[2]-ys[3]+Math.PI*.6};
  names.forEach((n,i)=>{state['y'+n]=ys[i];state['v'+n]=vs[i];state['a'+n]=a[i];state['f'+n]=m[i]*a[i];state['vRel'+n]=vs[i]-supportV;state['aRel'+n]=a[i]-a0});return state;
 },{events:[{t:0,label:tension===0?'零張力自由落體極限':'四重物靜止釋放'},...(duration>0?[{t:duration,label:endLabel}]:[])],endLabel,bounds:{min:[-4,0,-1.5],max:[4,Math.max(12,supportEnd)+3.6,1.5]}});
},'models/moving-atwood.js');
const d=M.defs.find(d=>d.id==='moving-atwood');
d.plotMetrics=['A','B','C','D'].flatMap(n=>[metric('y'+n,n+' 高度','m'),metric('v'+n,n+' 絕對速度 ↑','m/s'),metric('a'+n,n+' 絕對加速度 ↑','m/s²'),metric('vRel'+n,n+' 相對支點速度 ↑','m/s'),metric('aRel'+n,n+' 相對支點加速度 ↑','m/s²')]).concat([metric('aRight','右動滑輪加速度 ↑','m/s²'),metric('upperTension','上繩張力','N'),metric('supportForce','頂端支承力','N'),metric('E','四重物機械能','J'),metric('supportWork','支承外力作功','J')]);
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);


