'use strict';

(function (M) {
  const {P,M:metric,trajectory,integrated}=M.helpers;
  M.register('rutherford-scattering','拉塞福散射：集中電荷與擴散電荷','近代物理','rutherford-scattering',[
    P('energy','入射動能（遠處）',3,12,.5,6,'MeV'),
    P('impact','碰撞參數',0,75,1,25,'fm'),
    P('cloudRadius','擴散正電球半徑',60,140,5,100,'fm')
  ],[metric('nucleusAngle','集中電荷偏轉角','°'),metric('cloudAngle','擴散電荷偏轉角','°'),
    metric('rutherfordAngle','拉塞福遠場參考角','°')],
  'V集中 = kqQ/r · V均勻球內 = kqQ(3−r²/R²)/(2R) · θ遠場 = 2 arctan(kqQ/(2Eb))',
  '比較相同總正電荷的固定金靶點核與均勻正電球。入射粒子為非相對論 α 粒子。起點距靶有限，動能依位能修正，角度讀值為當前速度方向。均勻球是擴散電荷的教學比較，忽略電子屏蔽、核反沖與核力。兩條軌跡在同一縮尺下疊加。',
  ['把碰撞參數調小，預測哪種電荷分布更容易造成大角度偏轉。','提高入射動能，再比較相同碰撞參數下的偏轉角。'],p=>{
    const coupling=2*79*1.43996455;
    const start=-420;
    const duration=850;
    const potential=(r,radius)=>r>=radius?coupling/r:coupling*(3-(r/radius)**2)/(2*radius);
    const run=radius=>{
      const initialRadius=Math.hypot(start,p.impact);
      const velocity=Math.sqrt(1-potential(initialRadius,radius)/p.energy);
      return integrated(duration,[start,p.impact,velocity,0],(_,state)=>{
        const [x,z,vx,vz]=state;
        const denominator=Math.max(Math.hypot(x,z),radius)**3;
        const factor=coupling/(2*p.energy*denominator);
        return [vx,vz,factor*x,factor*z];
      },state=>{
        const [x,z,vx,vz]=state;
        return {x,z,vx,vz,angle:Math.atan2(vz,vx)*180/Math.PI,
          energy:p.energy*(vx**2+vz**2)+potential(Math.hypot(x,z),radius)};
      },.125);
    };
    const nucleus=run(0),cloud=run(p.cloudRadius);
    const rutherfordAngle=2*Math.atan2(coupling,2*p.energy*p.impact)*180/Math.PI;
    return trajectory(10,t=>{
      const concentrated=nucleus.sample(t*duration/10);
      const diffuse=cloud.sample(t*duration/10);
      return {concentrated,diffuse,nucleusAngle:concentrated.angle,cloudAngle:diffuse.angle,rutherfordAngle};
    },{nucleus,cloud,modelDuration:duration,hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-5.4,0,-5.4],max:[5.4,4.5,5.4]}});
  },'models/rutherford-scattering.js');
})(globalThis.Mechanics);
