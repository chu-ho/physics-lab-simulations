'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  M.register('wire-magnetic-field','通電導線的磁場與磁針','電磁學','wire-magnetic-field',[
    P('current','導線電流（向上為正）',-20,20,.5,8,'A'),
    P('radius','探針到導線距離',.02,.30,.01,.08,'m'),
    P('background','背景磁場（+z）',0,60,1,25,'μT')
  ],[metric('wireField','導線磁場大小','μT'),metric('field','合磁場大小','μT'),metric('deflection','磁針相對 +z 偏角','°')],
  'B導線 = μ₀|I|/(2πr) · 正電流方向沿 +y，磁場繞線方向依右手定則',
  '無限長直導線置於均勻水平背景磁場。探針沿固定半徑繞線一圈。磁針採準靜態指向合場，忽略慣性。背景場取零且導線斷電時，磁針方向未定。',
  ['把電流反向，觀察同一位置的導線磁場如何改變。','把探針距離加倍，測試導線磁場和距離的關係。'],p=>{
    const signedWire=.2*p.current/p.radius;
    return trajectory(10,t=>{
      const theta=2*Math.PI*t/10;
      const bx=signedWire*Math.sin(theta);
      const bz=p.background-signedWire*Math.cos(theta);
      const field=Math.hypot(bx,bz);
      return {theta,bx,bz,field,wireField:Math.abs(signedWire),
        deflection:field>1e-10?Math.atan2(bx,bz)*180/Math.PI:0};
    },{hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-3,0,-3],max:[3,5.6,3]}});
  },'models/wire-magnetic-field.js');
})(globalThis.Mechanics);
