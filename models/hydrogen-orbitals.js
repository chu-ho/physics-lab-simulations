'use strict';

(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  const orbitals = ['1s', '2s', '2p_z'];
  const radialDensity = [
    r => 4*r*r*Math.exp(-2*r),
    r => r*r*(2-r)**2*Math.exp(-r)/8,
    r => r**4*Math.exp(-r)/24
  ];
  M.register('hydrogen-orbitals','氫原子軌域：1s、2s 與 2p','近代物理','hydrogen-orbitals',[
    P('orbital','軌域（0：1s／1：2s／2：2p_z）',0,2,1,2),
    P('population','採樣點數',100,1200,100,800),
    P('seed','重播種子',1,99,1,23)
  ],[metric('count','累積取樣','點'),metric('meanRadius','理論平均半徑','a₀'),metric('energy','能階','eV')],
  '取樣密度為 |ψ|² · 徑向機率密度為 r²|R(r)|²',
  '理想氫原子定態。徑向取樣在 0 至 40 個玻爾半徑上積分，圖中點代表獨立位置取樣。藍、橘表示實波函數相位符號。動畫逐步顯示樣本，定態的機率分布不隨時間演化。',
  ['旋轉點雲，比較 2s 的球形節面與 2p_z 的平面節點。','比較 2s 和 2p_z 的徑向機率圖，找出 2s 的徑向節點。'],p=>{
    const density=radialDensity[p.orbital];
    const step=.025;
    const cumulative=[];
    let integral=0;
    for(let i=0;i<1600;i++){
      integral+=density((i+.5)*step)*step;
      cumulative.push(integral);
    }
    let seed=p.seed;
    const random=()=>{
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      return (seed+.5)/4294967296;
    };
    const samples=Array.from({length:p.population},()=>{
      const target=random()*integral;
      const radius=(cumulative.findIndex(value=>value>=target)+random())*step;
      const uniform=2*random()-1;
      const cos=p.orbital===2?Math.cbrt(uniform):uniform;
      const angle=2*Math.PI*random();
      const plane=radius*Math.sqrt(1-cos*cos);
      const z=radius*cos;
      const negative=p.orbital===2?z<0:p.orbital===1&&radius>2;
      return {point:[plane*Math.cos(angle),plane*Math.sin(angle),z],negative};
    });
    const meanRadius=[1.5,6,5][p.orbital];
    const energy=p.orbital===0?-13.5984:-13.5984/4;
    return trajectory(10,t=>({count:Math.floor(t*p.population/10),meanRadius,energy}),{
      samples,orbital:orbitals[p.orbital],radialIntegral:integral,hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-4,-1,-4],max:[4,7,4]},
      scaleNote:'三種軌域採相同的空間示意比例，可用縮放查看 1s。',
      positionPlot:{
        key:'meanRadius',label:'半徑',unit:'a₀',min:0,max:24,
        title:'徑向機率密度',menuLabel:'徑向機率',yUnit:'1/a₀',
        scopeLabel:'● 理論平均半徑',
        series:[{label:'徑向機率密度',color:'#8ee0c0',value:density}]
      }
    });
  },'models/hydrogen-orbitals.js');
  M.defs.find(d=>d.id==='hydrogen-orbitals').defaultPlotMode='position';
})(globalThis.Mechanics);

