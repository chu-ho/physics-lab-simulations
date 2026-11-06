'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  M.register('rlc-resonance', '串聯 RLC 共振與相位', '電磁學', 'rlc-resonance', [
 P('resistance','電阻',5,100,1,20,'Ω'),P('inductance','電感',10,100,1,50,'mH'),
 P('capacitance','電容',10,100,1,50,'μF'),P('frequency','驅動頻率',20,600,1,100,'Hz'),
 P('voltage','電源峰值',1,20,1,10,'V')
 ],[metric('rms','電流有效值','A'),metric('phaseDeg','電壓領先電流相位','°'),metric('resonance','共振頻率','Hz')],
 'Z = R + i(ωL−1/ωC) · f₀ = 1/(2π√LC) · I有效 = V峰/(√2|Z|)',
 '理想串聯 RLC 的正弦穩態，忽略啟動暫態。動畫在 9 秒內顯示三個週期。正相位代表電流落後電壓。',
 ['掃描頻率並找出電流峰值，觀察此時相位差。','改變電阻，對照峰值與峰形寬度。'],p=>{
   const l=p.inductance*1e-3,c=p.capacitance*1e-6;
   const resonance=1/(2*Math.PI*Math.sqrt(l*c));
   const reactance=f=>2*Math.PI*f*l-1/(2*Math.PI*f*c);
   const rmsAt=f=>p.voltage/(Math.SQRT2*Math.hypot(p.resistance,reactance(f)));
   const phase=Math.atan2(reactance(p.frequency),p.resistance);
   const peak=Math.SQRT2*rmsAt(p.frequency);
   return trajectory(9,t=>{
     const angle=2*Math.PI*t/3;
     const current=peak*Math.sin(angle-phase);
     const derivative=peak*2*Math.PI*p.frequency*Math.cos(angle-phase);
     const voltageC=-peak*Math.cos(angle-phase)/(2*Math.PI*p.frequency*c);
     return {frequency:p.frequency,resonance,rms:rmsAt(p.frequency),phaseDeg:phase*180/Math.PI,
       voltage:p.voltage*Math.sin(angle),current,voltageR:p.resistance*current,voltageL:l*derivative,voltageC};
   },{hidePrimary:true,hideFloor:true,schematic:true,bounds:{min:[-4,0,-1],max:[4,5,1]},
     positionPlot:{key:'frequency',label:'驅動頻率',unit:'Hz',min:20,max:600,title:'共振曲線',
       menuLabel:'共振曲線',yUnit:'A',series:[{label:'電流有效值',color:'#8ee0c0',value:rmsAt}]}
   });
 }, 'models/rlc-resonance.js');
  const definition=M.defs.at(-1);
  definition.defaultPlotMode='position';
  definition.plotMetrics=[
    metric('current','瞬時電流','A'),metric('voltage','交流源電壓','V'),
    metric('voltageR','電阻電壓','V'),metric('voltageL','電感電壓','V'),metric('voltageC','電容電壓','V')
  ];
})(globalThis.Mechanics);
