'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  M.register('parallel-capacitor', '平行板電容：接電源與斷開', '電磁學', 'parallel-capacitor', [
    P('area','板面積',10,160,5,80,'cm²'), P('distance','板間距',1,12,.2,4,'mm'),
    P('dielectric','相對介電常數',1,8,.2,1), P('supply','基準電壓',1,24,1,12,'V'),
    P('isolated','接線（0 固定電壓／1 固定電荷）',0,1,1,0)
  ], [metric('capacitance','電容','pF'),metric('charge','板上自由電荷量','pC'),metric('field','板間電場','V/m')],
  'C = ε₀εᵣA/d；Q = CV；E = V/d；U = QV/2',
  '平行板忽略邊緣場，介電質均勻填滿。斷開前採空氣及 4 mm 間距，使用同一面積及基準電壓。播放時由基準狀態逐步改為設定值。板間距在場景中放大。',
  ['把兩種接線模式都設成相同板間距與介電常數，對照電荷量。','斷開電源後插入介電質，預測電壓變化。'], p => {
    const vacuum = 8.8541878128e-12, area = p.area*1e-4;
    const initialCharge = vacuum*area/.004*p.supply;
    return trajectory(8,t=>{
      const fraction=t/8;
      const distance=(4+(p.distance-4)*fraction)*.001;
      const dielectric=1+(p.dielectric-1)*fraction;
      const capacitance=vacuum*dielectric*area/distance;
      const charge=p.isolated ? initialCharge : capacitance*p.supply;
      const voltage=charge/capacitance;
      return {distance,dielectric,capacitance:capacitance*1e12,charge:charge*1e12,
        voltage,field:voltage/distance,energy:charge*voltage/2*1e12};
    },{hidePrimary:true,hideFloor:true,schematic:true,bounds:{min:[-3,0,-2],max:[3,4,2]}});
  }, 'models/parallel-capacitor.js');
})(globalThis.Mechanics);
