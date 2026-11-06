/* Exact impact with y=x tan(beta); optimise forward distance using its envelope. */
(function(M){
'use strict';
const {P,M:metric,trajectory,rad}=M.helpers;
M.register('optimal-projectile','斜拋幾度拋最遠','運動學','optimal-projectile',[
 P('v','初速',4,24,.5,12,'m/s'),P('h','發射點高於落面',0,15,.5,3,'m'),P('slope','落面坡角',-30,30,1,0,'°'),P('angle','對水平發射仰角',-80,170,1,40,'°'),P('g','重力加速度',2,15,.1,9.8,'m/s²')
],[metric('optimalAngle','最佳向前仰角','°'),metric('range','選定沿面有號射程','m'),metric('optimalRange','最大向前沿面射程','m')],
 'h+(v sinθ−v cosθ tanβ)t−gt²/2=0；x*=v²/g[√(sec²β+2gh/v²)−tanβ]；tanθ*=v²/(gx*)；沿面射程=x/cosβ。',
 '無空氣阻力，質點質量取 1 kg。坡面通過原點並向正、負 x 無限延伸；發射點為 (0,h)，仰角由水平正向量起。薄荷色是選定角度，紫色是同初速、同高度的最大向前射程解，兩球同時發射。射程沿坡面量度，向後落點記負值；最佳解限制向前發射（−90° 至 90°）。h=0 且初速未朝坡面上方時飛行時間為零，不假造穿地飛行。觸地後各球停留，合力為零，未解析瞬時碰撞衝量。角度掃描是完整解析落點資訊，不代表同時發射更多球。',
 ['平地同高時為何最佳角是45°，增加高度後仍然如此嗎？','坡面上升時最佳角如何改變？向後發射的有號射程如何記錄？'],p=>{
 const beta=rad(p.slope),tan=Math.tan(beta),cos=Math.cos(beta),v2=p.v*p.v;
 const flight=angle=>{const a=rad(angle),ux=p.v*Math.cos(a),uy=p.v*Math.sin(a),w=uy-ux*tan,D=Math.sqrt(w*w+2*p.g*p.h);let land=p.h===0?Math.max(0,2*w/p.g):w<0?2*p.h/(D-w):(w+D)/p.g;if(land<1e-13)land=0;const x=ux*land;return{angle,ux,uy,land,x,y:x*tan,range:x/cos}};
 const optimalX=v2/p.g*(Math.sqrt(1+tan*tan+2*p.g*p.h/v2)-tan),optimalAngle=Math.atan2(v2,p.g*optimalX)*180/Math.PI,optimal=flight(optimalAngle),selected=flight(p.angle),scan=Array.from({length:181},(_,i)=>flight(i-90));
 const at=(f,t)=>{const T=Math.min(t,f.land),landed=t>=f.land;return{x:f.ux*T,y:landed?f.y:p.h+f.uy*T-.5*p.g*T*T,z:0,vx:landed?0:f.ux,vy:landed?0:f.uy-p.g*T,vz:0,fx:0,fy:landed?0:-p.g,fz:0,landed:+landed}};
 const duration=Math.max(selected.land,optimal.land),events=[{t:selected.land,label:'選定角度觸地並停止'},{t:optimal.land,label:'最佳角度觸地並停止'}].sort((a,b)=>a.t-b.t);
 const points=[{x:0,y:p.h},...[...scan,selected,optimal].flatMap(f=>[{x:f.x,y:f.y},{x:f.ux*Math.min(f.land,Math.max(0,f.uy/p.g)),y:p.h+f.uy*Math.min(f.land,Math.max(0,f.uy/p.g))-.5*p.g*Math.min(f.land,Math.max(0,f.uy/p.g))**2}]),{x:selected.x,y:selected.y}];
 return trajectory(duration,t=>{const a=at(selected,t),b=at(optimal,t);return{...a,x2:b.x,y2:b.y,z2:0,vx2:b.vx,vy2:b.vy,vz2:0,fy2:b.fy,landed2:b.landed,range:selected.range,optimalRange:optimal.range,optimalAngle,rangeDeficit:optimal.range-selected.range}},
 {selected,optimal,scan,beta,slopeAt:x=>x*tan,at,events,optimalX,optimalAngle,optimalRange:optimal.range,bounds:{xmin:Math.min(0,...points.map(a=>a.x)),xmax:Math.max(...points.map(a=>a.x)),ymin:Math.min(0,...points.map(a=>a.y)),ymax:Math.max(...points.map(a=>a.y)),zmin:-1,zmax:1},endLabel:'兩球已觸地；可回放比較最佳角與選定角。'});
},'models/optimal-projectile.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
