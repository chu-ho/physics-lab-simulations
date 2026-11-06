'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  M.register('gauss-surface', '球形高斯面：通量與包圍電荷', '電磁學', 'gauss-surface', [
    P('radius','高斯面半徑',.6,2.2,.1,1.4,'m'),P('charge','點電荷',-5,5,.5,3,'nC'),
    P('offset','點電荷偏移量',0,3.5,.1,2.6,'m')
  ], [metric('flux','精確淨通量','N·m²/C'),metric('estimate','數值積分通量','N·m²/C'),metric('enclosed','包圍電荷','nC')],
  'Φ = ∮ E·dA = Q內 / ε₀',
  '球面使用 256 個等面積方向近似積分。點電荷靠近球面時積分誤差會增大。恰在球面時場奇異，該點標示為未定義。播放將電荷從球心移至設定位置。',
  ['電荷偏離球心但仍在球內時，比較局部場箭頭和總通量。','把電荷移出球面，觀察穿入與穿出的場如何抵銷。'], p => {
    const epsilon=8.8541878128e-12;
    const directions=Array.from({length:256},(_,i)=>{
      const x=1-2*(i+.5)/256, azimuth=i*Math.PI*(3-Math.sqrt(5));
      const radius=Math.sqrt(1-x*x);
      return [x,radius*Math.cos(azimuth),radius*Math.sin(azimuth)];
    });
    const fieldNormal=(normal,offset)=>{
      const dx=p.radius*normal[0]-offset;
      const distance=Math.hypot(dx,p.radius*normal[1],p.radius*normal[2]);
      return p.charge*1e-9*(p.radius-offset*normal[0])/(4*Math.PI*epsilon*distance**3);
    };
    return trajectory(10,t=>{
      const offset=p.offset*t/10;
      const onSurface=p.charge!==0 && Math.abs(offset-p.radius)<1e-8;
      const enclosed=offset<p.radius?p.charge:0;
      const estimate=directions.reduce((total,n)=>total+fieldNormal(n,offset),0)*4*Math.PI*p.radius**2/directions.length;
      return {offset,enclosed,flux:enclosed*1e-9/epsilon,estimate,onSurface};
    },{directions,fieldNormal,hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-2.4,0,-2.4],max:[3.8,5.3,2.4]}});
  }, 'models/gauss-surface.js');
})(globalThis.Mechanics);
