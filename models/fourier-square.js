/* Finite odd-harmonic series, schematic signal rather than particle motion. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('fourier-square','方波傅立葉：圓投影與逐項疊加','聲音','fourier-square',[
P('frequency','基頻',110,880,10,220,'Hz'),P('A','方波目標振幅',0,1,.05,1),P('terms','奇次諧波項數',1,6,1,6),{...P('target','顯示理想方波',0,1,1,1),visual:true}
],[metric('signal','合成訊號',''),metric('rms','合成RMS',''),metric('highestFrequency','最高部分音','Hz')],
'Sₙ(t) = (4A/π) Σⱼ₌₁ⁿ sin[(2j−1)2πft]/(2j−1)',
'六排依序加入1、3、5、7、9、11倍基頻。圓半徑是Fourier振幅，垂直投影相加得到各排部分和；不是粒子受力模型。有限項在跳躍附近有Gibbs過衝，不會精確等於理想方波；跳躍點的級數為零。圖形慢放1000倍，聲音仍為實際Hz。音訊振幅另乘0.6避免過衝削波，需自行開啟。',
['加入更多項，哪裡最接近方波？','為何跳躍附近仍有過衝？'],p=>{
const f=p.frequency,A=p.A,partials=Array.from({length:p.terms},(_,j)=>({n:2*j+1,amplitude:4*A/(Math.PI*(2*j+1))}));
const sum=(t,N=p.terms)=>partials.slice(0,N).reduce((v,q)=>v+q.amplitude*Math.sin(2*Math.PI*q.n*f*t),0);
const ideal=t=>{const q=Math.sin(2*Math.PI*f*t);return Math.abs(q)<1e-12?0:A*Math.sign(q);};
const imag=Array(2*p.terms).fill(0);for(const q of partials)imag[q.n]=4/(Math.PI*q.n);
const rms=Math.sqrt(partials.reduce((v,q)=>v+q.amplitude*q.amplitude/2,0));
return trajectory(8/f,t=>({x:0,y:0,z:0,signal:sum(t),rms,highestFrequency:(2*p.terms-1)*f,waveTime:t,plotCursor:0}),{schematic:true,hidePrimary:true,hideGrid:()=>true,minimumSceneScale:19,bounds:{min:[-8,-1,-1],max:[8,18,1]},playbackScale:.001,partials,sum,ideal,window:2/f,
positionPlot:{dynamic:true,min:0,max:2/f,key:'plotCursor',label:'時間窗τ',unit:'s',title:'方波與有限Fourier和',yUnit:'訊號',series:[{label:'部分和',color:'#d8a45b',value:(x,s)=>sum(s.waveTime+x)},{label:'理想方波',color:'#64868a',visible:()=>!!p.target,value:(x,s)=>ideal(s.waveTime+x)}]},
audio:()=>({type:'harmonics',frequency:f,gain:.6*A,real:imag.map(()=>0),imag}),scaleNote:'各排圓投影與部分和；圖形慢放1000倍。',endLabel:'八個基頻週期觀察完成'});
},'models/fourier-square.js');M.defs.find(d=>d.id==='fourier-square').defaultPlotMode='position';
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
