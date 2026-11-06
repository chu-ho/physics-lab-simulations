'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  const charge=1.602176634e-19;
  const epsilon=11.7*8.8541878128e-12;
  const thermalVoltage=.025852;
  M.register('pn-junction','矽 PN 接面：偏壓與耗盡區','近代物理','pn-junction',[
    P('acceptor','P 側受體濃度',1,10,.5,2,'10¹⁶ cm⁻³'),
    P('donor','N 側施體濃度',1,10,.5,4,'10¹⁶ cm⁻³'),
    P('bias','終點偏壓 Vₚ−Vₙ',-1.5,.45,.05,.35,'V')
  ],[metric('barrier','接面電位障壁','V'),metric('width','耗盡區寬度','μm'),metric('current','理想二極體電流','μA')],
  'Vᵦᵢ = Vₜ ln(NₐN_d/nᵢ²) · W² = (2ε/q)(1/Nₐ+1/N_d)(Vᵦᵢ−V) · I = Iₛ expm1(V/Vₜ)',
  '300 K 突變矽接面，採一維耗盡近似與固定 1 pA 飽和電流的理想二極體。電流曲線不含崩潰、串聯電阻與高注入效應。能帶隨靜電位彎曲，矽能隙取 1.12 eV，能量零點取 N 側價帶頂。圖中能帶不含準費米能階及少數載子輸運。',
  ['改為反偏壓，預測耗盡區寬度。','把 P 側濃度降到 N 側以下，觀察哪側耗盡區較寬。'],p=>{
    const na=p.acceptor*1e22, nd=p.donor*1e22;
    const builtIn=thermalVoltage*Math.log(na*nd/1e32);
    const stateAt=bias=>{
      const barrier=builtIn-bias;
      const width=Math.sqrt(2*epsilon/charge*(1/na+1/nd)*barrier)*1e6;
      return {bias,barrier,width,left:width*nd/(na+nd),right:width*na/(na+nd),
        current:1e-6*Math.expm1(bias/thermalVoltage)};
    };
    const bandAt=(x,state)=>{
      const {left,right,barrier,width}=state;
      const offset=x<0
        ? barrier*(1-Math.max(0,x+left)**2/(left*width))
        : barrier*Math.max(0,right-x)**2/(right*width);
      return {valence:offset,conduction:offset+1.12};
    };
    return trajectory(8,t=>stateAt(t*p.bias/8),{
      bandAt,hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-3.8,0,-1.2],max:[3.8,7.4,1.2]},
      positionPlot:{
        key:'bias',label:'偏壓',unit:'V',min:-1.5,max:.45,
        title:'理想二極體 I–V',menuLabel:'電流—電壓',yUnit:'μA',
        series:[{label:'電流',color:'#8ee0c0',value:v=>stateAt(v).current}]
      }
    });
  },'models/pn-junction.js');
})(globalThis.Mechanics);
