/* Event-driven frictionless inner collisions of a free circular ring and a finite ball. */
(function(M){
'use strict';
const {P,M:metric,trajectory}=M.helpers;
M.register('ring-ball','環球碰撞與自由圓環','動力學','ring-ball',[
 P('ratio','球／環質量比',.1,5,.1,1,''),P('v','球初速',1,5,.2,3,'m/s'),P('offset','入射偏心位置／有效半徑',-.75,.75,.05,.35,''),P('e','恢復係數',.4,1,.05,1,''),{...P('showCOM','顯示合質心',0,1,1,1),visual:true}
],[metric('hits','碰撞次數','次'),metric('ringSpeed','環心速率','m/s'),metric('K','系統動能','J')],
 'J = (1+e)(v球−V環)·n /(1/m+1/M)；v球′=v球−Jn/m；V環′=V環+Jn/M',
 '球位於光滑水平面上的自由圓環內。環質量固定 2 kg、環中心線半徑 2.4 m、管半徑 0.12 m；球半徑 0.20 m，因此球心到環心最多 2.08 m。重力與支撐力抵銷，無水平外力、無摩擦與切向衝量。每次接觸用二次方程精確求時，再聯立兩物體法向衝量；圓形環的法線通過環心，故環不自轉，偏心入射的角動量仍由兩物體的軌道運動保存。恢復係數小於 1 時能量耗散，線動量與角動量仍守恆。顯示 6 秒；若達 128 次碰撞或下一接觸間隔小於 0.1 微秒，精確停在最後已解碰撞，避免以穿環或黏住近似後續。球自轉不影響光滑碰撞而不計。原站獨立跟隨環／質心視角尚未加入。',
 ['球和環等質量、正向碰撞時，球為何會先停下？','改變偏心位置或恢復係數，環和球的軌跡、動能如何改變？'],p=>{
 const mass=2*p.ratio,ringMass=2,R=2.4,tube=.12,r=.2,D=R-tube-r,total=mass+ringMass;
 let duration=6,capped=false;
 const initial={t:0,bx:-.55*D,bz:p.offset*D,rx:0,rz:0,bvx:p.v,bvz:0,rvx:0,rvz:0,hits:0,loss:0,impulse:0,nx:0,nz:0};
 const phases=[initial],collisions=[];let a=initial;
 while(a.t<duration){
  const qx=a.bx-a.rx,qz=a.bz-a.rz,wx=a.bvx-a.rvx,wz=a.bvz-a.rvz,A=wx*wx+wz*wz,B=qx*wx+qz*wz,C=qx*qx+qz*qz-D*D;
  if(A<1e-20)break;
  // On a solved contact, the zero root is discarded in favour of the next outgoing crossing.
  const dt=Math.abs(C)<1e-9?-2*B/A:(-B+Math.sqrt(Math.max(0,B*B-A*C)))/A;
  if(a.t+dt>duration)break;
  if(dt<1e-7||collisions.length>=128){duration=a.t;capped=true;break}
  const time=a.t+dt,bx=a.bx+a.bvx*dt,bz=a.bz+a.bvz*dt,rx=a.rx+a.rvx*dt,rz=a.rz+a.rvz*dt,nx=(bx-rx)/D,nz=(bz-rz)/D,closing=wx*nx+wz*nz,J=(1+p.e)*closing/(1/mass+1/ringMass);
  const next={t:time,bx,bz,rx,rz,bvx:a.bvx-J*nx/mass,bvz:a.bvz-J*nz/mass,rvx:a.rvx+J*nx/ringMass,rvz:a.rvz+J*nz/ringMass,hits:a.hits+1,loss:a.loss+.5*(mass*ringMass/total)*(1-p.e*p.e)*closing*closing,impulse:J,nx,nz};
  collisions.push({t:time,nx,nz,impulse:J,before:{...a,bx,bz,rx,rz,t:time},after:next});phases.push(next);a=next;
 }
 const at=t=>{let lo=0,hi=phases.length;while(lo+1<hi){const mid=(lo+hi)>>1;if(phases[mid].t<=t)lo=mid;else hi=mid}const a=phases[lo],dt=t-a.t,bx=a.bx+a.bvx*dt,bz=a.bz+a.bvz*dt,rx=a.rx+a.rvx*dt,rz=a.rz+a.rvz*dt,K=.5*mass*(a.bvx*a.bvx+a.bvz*a.bvz)+.5*ringMass*(a.rvx*a.rvx+a.rvz*a.rvz);
  return{x:bx,y:r,z:bz,vx:a.bvx,vz:a.bvz,x2:rx,y2:r,z2:rz,vx2:a.rvx,vz2:a.rvz,ringSpeed:Math.hypot(a.rvx,a.rvz),ballSpeed:Math.hypot(a.bvx,a.bvz),hits:a.hits,K,E:K,loss:a.loss,momentumX:mass*a.bvx+ringMass*a.rvx,momentumZ:mass*a.bvz+ringMass*a.rvz,angularMomentum:mass*(bx*a.bvz-bz*a.bvx)+ringMass*(rx*a.rvz-rz*a.rvx),comX:(mass*bx+ringMass*rx)/total,comZ:(mass*bz+ringMass*rz)/total,omega:0,clearance:D-Math.hypot(bx-rx,bz-rz),lastContactTime:a.t,contactNX:a.nx,contactNZ:a.nz,impulse:a.impulse,flash:a.hits?Math.max(0,1-(t-a.t)/.25):0};
 };
 const points=[...phases.map(x=>at(x.t)),at(duration)],sim=trajectory(duration,at,{events:[{t:0,label:'球在自由圓環內開始運動'},...collisions.map((c,i)=>({t:c.t,label:'第 '+(i+1)+' 次內壁碰撞 · J='+c.impulse.toFixed(2)+' N·s'}))],endLabel:capped?'精確停在最後已解碰撞；密集接觸後續不近似':'6 秒觀察結束；系統仍繼續運動',collisions,geometry:{R,tube,r,D},mass,ringMass,capped});
 sim.bounds={xmin:Math.min(...points.map(s=>s.x2-R-tube))-1,xmax:Math.max(...points.map(s=>s.x2+R+tube))+1,ymin:0,ymax:2,zmin:Math.min(...points.map(s=>s.z2-R-tube))-1,zmax:Math.max(...points.map(s=>s.z2+R+tube))+1};sim.bounds={min:[sim.bounds.xmin,sim.bounds.ymin,sim.bounds.zmin],max:[sim.bounds.xmax,sim.bounds.ymax,sim.bounds.zmax]};return sim;
},'models/ring-ball.js');
M.defs.find(d=>d.id==='ring-ball').plotMetrics=[metric('ballSpeed','球速率','m/s'),metric('momentumX','系統 x 動量','kg·m/s'),metric('momentumZ','系統 z 動量','kg·m/s'),metric('angularMomentum','水平平面角動量','kg·m²/s'),metric('loss','累積碰撞耗能','J'),metric('clearance','球心距接觸邊界','m')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
