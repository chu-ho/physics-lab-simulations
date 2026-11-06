'use strict';

(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  M.register('quantum-well', '量子方井：定態與疊加', '近代物理', 'quantum-well', [
    P('width', '方井寬度', .5, 3, .1, 1, 'nm'),
    P('level', '基準量子數', 1, 4, 1, 1),
    P('mix', '較高能階的機率權重', 0, 1, .05, .5),
    P('phase', '初始相對相位', 0, 360, 5, 0, '°')
  ], [
    metric('lowerEnergy','基準能階','eV'),
    metric('upperEnergy','相鄰能階','eV'),
    metric('period','相對相位週期','fs')
  ], 'φₙ(x)=√(2/L) sin(nπx/L) · Eₙ=n²π²ℏ²/(2mₑL²)',
  '單電子一維無限深方井。播放將一個相對相位週期放慢至十秒。波函數已扣除基準能階的共同相位，實部和虛部採同一相位基準。機率密度單位為 1/nm。',
  ['把較高能階權重設為零，觀察機率密度是否隨時間改變。','調整井寬，預測能階差與疊加週期如何改變。'], p => {
    const base = .376030163 / p.width ** 2;
    const lowerEnergy = base*p.level**2;
    const upperEnergy = base*(p.level+1)**2;
    const period = 4.135667696 / (upperEnergy-lowerEnergy);
    const amplitude = Math.sqrt(2/p.width);
    const phaseAt = time => p.phase*Math.PI/180 - 2*Math.PI*time/10;
    const waveAt = (x,time) => {
      if(x<=0 || x>=p.width) return {real:0,imaginary:0,density:0};
      const first = amplitude*Math.sqrt(1-p.mix)*Math.sin(p.level*Math.PI*x/p.width);
      const second = amplitude*Math.sqrt(p.mix)*Math.sin((p.level+1)*Math.PI*x/p.width);
      const phase = phaseAt(time);
      const real = first+second*Math.cos(phase);
      const imaginary = second*Math.sin(phase);
      return {real,imaginary,density:real**2+imaginary**2};
    };
    return trajectory(10,t=>({lowerEnergy,upperEnergy,period,physicalTime:t*period/10}),{
      waveAt, hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-3,0,-1],max:[3,5,1]},
      scaleNote:'實部與虛部共用振幅刻度。機率密度使用獨立垂直刻度。'
    });
  },'models/quantum-well.js');
})(globalThis.Mechanics);
