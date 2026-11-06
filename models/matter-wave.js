'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  M.register('matter-wave', '電子雙縫與物質波', '近代物理', 'matter-wave', [
    P('voltage','加速電壓',40,400,5,150,'V'), P('spacing','雙縫間距',.5,3,.1,1.5,'nm'),
    P('whichPath','路徑資訊（0 無／1 有）',0,1,1,0), P('seed','重播種子',1,99,1,17)
  ], [metric('wavelength','德布羅意波長','nm'),metric('count','探測事件','次'),metric('fringe','近軸條紋間距','mm')],
  'λ = h/√(2mₑeV)；相干雙縫 P ∝ sinc²(πa sinθ/λ) cos²(πd sinθ/λ)',
  '非相對論電子、遠場、等寬雙縫，單縫寬度取 0.25 nm。取得完整路徑資訊時，以兩路機率相加移除交叉項。屏幕只計入中心左右 120 mm；分布在可見窗口內歸一化。圖示僅顯示落點。',
  ['改變加速電壓，預測條紋間距如何變化。','比較有無路徑資訊時的累積落點。'], p => {
    const wavelength = 1.2264 / Math.sqrt(p.voltage);
    const density = mm => {
      const sine = mm / Math.hypot(1000, mm);
      const phase = Math.PI * .25 * sine / wavelength;
      const envelope = phase === 0 ? 1 : (Math.sin(phase)/phase)**2;
      return envelope * (p.whichPath ? 1 : Math.cos(Math.PI*p.spacing*sine/wavelength)**2);
    };
    const cells = 480;
    const cumulative = [];
    let total = 0;
    for(let i=0;i<cells;i++) {
      total += density(-120+(i+.5)*240/cells);
      cumulative.push(total);
    }
    let seed = p.seed;
    const random = () => {
      seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
      return (seed+.5)/4294967296;
    };
    const hits = Array.from({length:480}, () => {
      const target = random()*total;
      const cell = cumulative.findIndex(value => value >= target);
      return [-120+(cell+random())*240/cells,random()-.5];
    });
    return trajectory(12,t=>({wavelength, count:Math.floor(t*40), fringe:1000*wavelength/p.spacing, screenCenter:0}), {
      hits, density, hidePrimary:true,hideFloor:true,schematic:true,
      positionPlot:{
        key:'screenCenter',label:'屏幕橫向位置',unit:'mm',min:-120,max:120,
        title:'電子探測機率密度',menuLabel:'機率密度',yUnit:'1/mm',
        scopeLabel:'可見範圍內的理論機率密度',
        series:[{label:'理論分布',color:'#8ee0c0',value:x=>density(x)/(total*240/cells)}]
      },
      bounds:{min:[-3,0,-1],max:[3,4,1]}
    });
  }, 'models/matter-wave.js');
  M.defs.find(d => d.id === 'matter-wave').defaultPlotMode = 'position';
})(globalThis.Mechanics);
