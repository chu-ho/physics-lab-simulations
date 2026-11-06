/* Reproducible Fourier synthesis; no calibrated pressure or perceptual loudness model. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('sound-elements','聲音三要素：音高、振幅與音色','聲音','sound-elements',[
P('frequency','基頻（含220／440／880）',110,880,10,440,'Hz'),P('amplitude','訊號振幅／音量',0,100,1,60,'%'),P('timbre','音色：0純音／1鋸齒／2奇次／3噪音／4自訂',0,4,1,0),...Array.from({length:8},(_,j)=>({...P('h'+(j+1),'自訂：第'+(j+1)+'諧波相對振幅',0,1,.05,j===0?1:0),preservePlayback:true,preserveAudio:true,setOnInput:{timbre:4}})),{...P('spectrum','顯示頻譜',0,1,1,1),visual:true},{...P('components','顯示前三條部分音',0,1,1,0),visual:true}
],[metric('fundamental','基頻／噪音重複率','Hz'),metric('rms','訊號RMS',''),metric('meanSquare','訊號均方（相對能量）','')],
'u(τ)=AΣ[aₙcos(nωτ)+bₙsin(nωτ)]；RMS=A√[Σ(aₙ²+bₙ²)/2]',
'原站Flash只依截圖與說明重建教學功能；sound A／B的原始錄音與頻譜不可得，這裡使用明示係數的合成音色，不宣稱還原原聲。以無因次訊號比較音高、振幅與音色；不是實際聲壓、分貝或校準的人耳響度。選擇音色4即可獨立調整第1至第8諧波的相對振幅；全零為靜音。自訂及預設的係數依絕對值和歸一，避免削波；相同振幅上界不表示相同RMS或人耳響度。噪音是固定seed的64條120–6000Hz隨機相位部分音，100ms重複，僅為可重現帶限噪音示意，非理想白噪音。音訊與圖形採同一Fourier係數；播放速度只慢放圖形，不改真實音高，因此音訊相位不追隨慢放游標。主圖及下方專用圖以τ為觀察窗，避免把稀疏的長時間樣本誤當聲波；第三軸分開頻譜與波形，非物理z。音訊須先按開啟聲音並播放。',
['相同基頻換音色，週期是否改變？','相同振幅上界，為何RMS與聽感不必相同？'],p=>{
let real=[],imag=[],seed=6401;const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
const noise=p.timbre===3,f=noise?10:p.frequency,A=p.amplitude/100;
if(noise){real=Array(601).fill(0);imag=Array(601).fill(0);const used=new Set();while(used.size<64){const n=12+Math.floor(rand()*589);if(used.has(n))continue;used.add(n);const phase=2*Math.PI*rand();real[n]=Math.sin(phase)/64;imag[n]=Math.cos(phase)/64;}}
else {let h=p.timbre===4?Array.from({length:8},(_,j)=>p['h'+(j+1)]):p.timbre===0?[1]:p.timbre===1?Array.from({length:8},(_,j)=>1/(j+1)):[1,0,1/3,0,1/5,0,1/7];const sum=h.reduce((a,b)=>a+Math.abs(b),0);imag=[0,...h.map(v=>sum?v/sum:0)];real=Array(imag.length).fill(0);}
const partials=imag.map((v,n)=>({n,frequency:n*f,real:real[n]||0,imag:v,amplitude:Math.hypot(real[n]||0,v)})).filter(q=>q.n&&q.amplitude>0),power=partials.reduce((a,q)=>a+q.amplitude*q.amplitude/2,0),window=noise?.006:4/f;
function signal(tau){let u=0,du=0;for(const q of partials){const w=2*Math.PI*q.frequency,theta=w*tau;u+=q.real*Math.cos(theta)+q.imag*Math.sin(theta);du+=w*(-q.real*Math.sin(theta)+q.imag*Math.cos(theta));}return{u:A*u,du:A*du};}
const positionPlot={dynamic:true,scopeLabel:'— 目前時刻起的時間窗　● 目前時刻',min:0,max:window,key:'plotCursor',label:'觀察窗時間τ',unit:'s',title:'目前聲音波形（密集觀察窗）',yUnit:'訊號',series:[{label:'合成訊號',color:'#e0b36c',value:(tau,s)=>signal(s.waveTime+tau).u}]};
return trajectory(.1,t=>{const q=signal(t);return{x:0,y:2+q.u,z:0,vx:0,vy:q.du,fx:0,fy:0,fundamental:f,rms:A*Math.sqrt(power),meanSquare:A*A*power,signal:q.u,waveTime:t,plotCursor:0,peakBound:A,partialCount:partials.length,highestFrequency:partials.at(-1)?.frequency||0};},{schematic:true,hidePrimary:true,hideGrid:()=>true,minimumSceneScale:13,bounds:{min:[-6,0,-1],max:[6,5,5]},playbackScale:.001,signal,partials,window,real,imag,positionPlot,audio:(s,q)=>({frequency:f,gain:q.amplitude/100,type:'harmonics',real,imag,noiseSeed:noise?6401:undefined}),events:[{t:0,label:noise?'64條帶限隨機相位部分音；100ms重複':['純音','八次諧波組合','奇次諧波組合','帶限噪音','自訂八條諧波'][p.timbre]}],scaleNote:'水平為時間τ；圖形慢放1000倍，音訊維持實際Hz。RMS不是校準響度。',endLabel:'100ms訊號觀察完成'});
},'models/sound-elements.js');const d=M.defs.find(d=>d.id==='sound-elements');d.defaultPlotMode='position';d.plotMetrics=[metric('peakBound','振幅上界',''),metric('partialCount','部分音數','')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
