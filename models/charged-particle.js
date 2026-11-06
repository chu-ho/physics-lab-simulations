'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  M.register('charged-particle','帶電粒子在均勻磁場中','電磁學','charged-particle',[
    P('sign','電荷符號（−1／＋1）',-1,1,2,1),
    P('mass','粒子質量',1,40,1,4,'u'),
    P('field','磁通密度',5,100,1,30,'mT'),
    P('speed','初始速率',2,60,1,20,'km/s'),
    P('angle','初速與磁場夾角',0,90,1,65,'°')
  ],[metric('radius','迴旋半徑','m'),metric('pitch','每圈軸向位移','m'),metric('periodMicroseconds','迴旋週期','μs')],
  'F = q v × B · r = mv⊥/(|q|B) · T = 2πm/(|q|B)',
  '非相對論、均勻磁場沿 +y，無電場與碰撞。速度平行磁場時走直線，週期讀值為同條件下垂直分量非零時的迴旋週期。播放十秒代表一個迴旋週期。場景依參數取景，尺寸以讀值為準。',
  ['把夾角調至 0°、中間值、90°，比較直線、螺旋與圓周。','反轉電荷後，比較繞轉方向、軸向位移與速率。'],p=>{
    const mass=p.mass*1.66053906892e-27;
    const omega=p.sign*1.602176634e-19*p.field*1e-3/mass;
    const angle=p.angle*Math.PI/180;
    const transverse=p.speed*1e3*Math.sin(angle);
    const axial=p.angle===90?0:p.speed*1e3*Math.cos(angle);
    const period=2*Math.PI/Math.abs(omega);
    const radius=transverse/Math.abs(omega);
    const pitch=axial*period;
    const drawingScale=4/Math.max(2*radius,pitch);
    return trajectory(10,t=>{
      const physicalTime=period*t/10;
      const phase=omega*physicalTime;
      return {x:transverse*Math.sin(phase)/omega,y:axial*physicalTime,
        z:transverse*(1-Math.cos(phase))/omega,vx:transverse*Math.cos(phase),vy:axial,vz:transverse*Math.sin(phase),
        radius,pitch,periodMicroseconds:period*1e6,speed:p.speed,
        forceX:-mass*omega*transverse*Math.sin(phase),forceZ:mass*omega*transverse*Math.cos(phase)};
    },{drawingScale,hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-3,0,-4.4],max:[3,5.2,4.4]},
      scaleNote:'磁場箭頭指向 +y。顏色標示電荷正負，軌跡取景會隨參數調整。'});
  },'models/charged-particle.js');
  M.defs.at(-1).plotMetrics=[metric('speed','速率','km/s'),metric('forceX','磁力 x 分量','N'),metric('forceZ','磁力 z 分量','N')];
})(globalThis.Mechanics);
