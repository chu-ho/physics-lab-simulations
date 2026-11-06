'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  M.register('hydrostatic-buoyancy','靜水壓與浮力平衡','靜力學','hydrostatic-buoyancy',[
    P('fluid','液體密度',600,1400,50,1000,'kg/m³'),
    P('block','方塊密度',200,1800,50,700,'kg/m³'),
    P('height','方塊高度',.2,.8,.05,.5,'m'),
    P('depth','手持時方塊底面深度',-.3,1.4,.05,.25,'m'),
    P('equilibrium','模式（0 手持／1 平衡）',0,1,1,0)
  ],[metric('buoyancy','浮力','N'),metric('weight','重力','N'),metric('support','額外向上支持力','N')],
  'p表 = ρgh · F浮 = ρ液gV浸沒 · 平衡時 F浮 + F支持 = mg',
  '均勻方塊底面積 0.09 m²，靜止不可壓縮液體，自由液面取表壓零。沉底時假設方塊由疏水支架托住，液體仍接觸底面。手持的額外支持力可為負，表示須向下施力。平衡模式直接顯示終態，忽略釋放後振盪、液面變化和表面張力。',
  ['逐步把方塊壓入液體，比較上下表面壓差和浮力。','切換平衡模式，觀察液體與方塊密度比如何決定浸沒比例。'],p=>{
    const area=.09,g=9.81;
    let depth=p.depth;
    if(p.equilibrium){
      if(p.block<p.fluid)depth=p.height*p.block/p.fluid;
      else if(p.block===p.fluid)depth=Math.max(p.height,p.depth);
      else depth=1.4;
    }
    const submerged=Math.max(0,Math.min(p.height,depth));
    const bottomPressure=p.fluid*g*Math.max(0,depth);
    const topPressure=p.fluid*g*Math.max(0,depth-p.height);
    const buoyancy=(bottomPressure-topPressure)*area;
    const weight=p.block*g*area*p.height;
    return trajectory(5,()=>({
      depth,submergedFraction:100*submerged/p.height,bottomPressure,topPressure,buoyancy,weight,
      support:weight-buoyancy
    }),{hidePrimary:true,hideFloor:true,schematic:true,bounds:{min:[-3,0,-2],max:[3,5,2]}});
  },'models/hydrostatic-buoyancy.js');
  M.defs.at(-1).plotMetrics=[metric('bottomPressure','底面表壓','Pa'),metric('topPressure','頂面表壓','Pa'),
    metric('submergedFraction','浸沒比例','%')];
})(globalThis.Mechanics);
