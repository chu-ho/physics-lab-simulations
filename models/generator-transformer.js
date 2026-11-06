'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  M.register('generator-transformer','發電機與理想變壓器','電磁學','generator-transformer',[
    P('mode','裝置（0 發電機／1 變壓器）',0,1,1,0),
    P('frequency','轉動或交流頻率',10,60,1,30,'Hz'),
    P('turns','發電線圈／一次側匝數',50,500,10,200,'匝'),
    P('secondary','二次側匝數',50,500,10,100,'匝'),
    P('field','發電機均勻磁場',.1,1,.05,.4,'T'),
    P('input','變壓器一次側電壓峰值',2,24,1,12,'V'),
    P('load','負載電阻',10,100,1,40,'Ω')
  ],[metric('fluxMilli','每匝磁通量','mWb'),metric('output','輸出電壓','V'),metric('current','負載電流','A')],
  'ε = −N dΦ/dt · 發電機 Φ = BA cos(ωt) · 理想變壓器 |V₂/V₁| = N₂/N₁',
  '發電機採勻速轉動的剛性線圈，面積 0.004 m²，外力抵消電磁反扭矩。變壓器假設磁通完全耦合、無損耗並使用同名端電壓約定。兩者均接純電阻，忽略內阻與自感暫態。播放放慢並顯示兩個交流週期。',
  ['找出磁通量極大及過零時的輸出電壓。','切換至變壓器，把二次側匝數加倍，預測電壓比與固定負載下的輸入功率。'],p=>{
    const omega=2*Math.PI*p.frequency;
    const ratio=p.secondary/p.turns;
    const peakFlux=p.mode?p.input/(p.turns*omega):p.field*.004;
    const outputPeak=(p.mode?p.secondary:p.turns)*omega*peakFlux;
    return trajectory(10,t=>{
      const phase=2*Math.PI*t/5;
      const output=outputPeak*Math.sin(phase);
      const current=output/p.load;
      const power=output*current;
      return {phase,fluxMilli:1000*peakFlux*Math.cos(phase),output,current,power,
        primaryVoltage:p.mode?p.input*Math.sin(phase):0,
        primaryCurrent:p.mode?ratio*current:0,
        torque:p.mode?0:power/omega};
    },{hidePrimary:true,hideFloor:true,schematic:true,bounds:{min:[-4,0,-1.7],max:[4,5,1.7]}});
  },'models/generator-transformer.js');
  M.defs.at(-1).plotMetrics=[metric('power','負載瞬時功率','W'),metric('primaryVoltage','一次側電壓','V'),
    metric('primaryCurrent','一次側電流','A'),metric('torque','發電機所需外力矩','N·m')];
})(globalThis.Mechanics);
