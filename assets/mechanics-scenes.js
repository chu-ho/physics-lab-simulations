'use strict';
const colors={mint:'#168579',purple:'#8b5ac4',orange:'#cf7632',dark:'#46616a',light:'#b7c7c4'};
function box(center,size,color='#738c90',tilt=0){
 const [x,y,z]=center,[a,b,c]=size.map(v=>v/2),V=(i,j,k)=>[x+i*a*Math.cos(tilt)-j*b*Math.sin(tilt),y+i*a*Math.sin(tilt)+j*b*Math.cos(tilt),z+k*c];
 polygon([V(-1,1,-1),V(1,1,-1),V(1,1,1),V(-1,1,1)],'#b7c7c4','#526c77');polygon([V(-1,-1,1),V(1,-1,1),V(1,1,1),V(-1,1,1)],color,'#526c77');polygon([V(1,-1,1),V(1,-1,-1),V(1,1,-1),V(1,1,1)],'#46616a','#526c77');polygon([V(-1,-1,-1),V(-1,-1,1),V(-1,1,1),V(-1,1,-1)],color,'#526c77');polygon([V(-1,-1,-1),V(1,-1,-1),V(1,1,-1),V(-1,1,-1)],color,'#526c77');
}
function ring(center,radius,plane='xz',color='#526c77',width=2){for(let i=0;i<64;i++){const v=a=>plane==='xy'?[center[0]+radius*Math.sin(a),center[1]-radius*Math.cos(a),center[2]]:[center[0]+radius*Math.cos(a),center[1],center[2]+radius*Math.sin(a)];segment(v(i*TAU/64),v((i+1)*TAU/64),color,width)}}
function coil(a,b,color='#607a82',radius=.18){const delta=vector(b,a),axis=norm(delta),ref=Math.abs(axis[1])<.9?[0,1,0]:[1,0,0],u=norm(cross(axis,ref)),v=cross(axis,u),N=100;let prev=a;for(let i=1;i<=N;i++){const f=i/N,r=i===N?0:radius,ang=f*TAU*10,next=a.map((x,j)=>x+delta[j]*f+r*(u[j]*Math.cos(ang)+v[j]*Math.sin(ang)));segment(prev,next,color,2);prev=next}}
function disc(center,R,angle){const [x,y,z]=center;for(let i=0;i<32;i++){const a=i*TAU/32,b=(i+1)*TAU/32;polygon([[x,y,z],[x+R*Math.cos(a),y,z+R*Math.sin(a)],[x+R*Math.cos(b),y,z+R*Math.sin(b)]],i%4<2?'#9ab5ad':'#c5d2bf','#607a82')}segment([x,y+.04,z],[x+R*Math.cos(angle),y+.04,z+R*Math.sin(angle)],'#a64f20',4);sphere([x,y+.1,z],.13)}
function inclineTrack(){const a=params.angle*Math.PI/180,c=Math.cos(a),h=12*Math.sin(a),end=12*c-5;polygon([[-5,h,-2],[end,0,-2],[end,0,2],[-5,h,2]],'#b7c7c4','#607a82');polygon([[-5,0,2],[end,0,2],[-5,h,2]],'#738c90','#607a82')}
let opticsCache=null;
function spectralColor(lambda){if(lambda<440)return[(440-lambda)/60,0,1];if(lambda<490)return[0,(lambda-440)/50,1];if(lambda<510)return[0,1,(510-lambda)/20];if(lambda<580)return[(lambda-510)/70,1,0];if(lambda<645)return[1,(645-lambda)/65,0];return[1,0,0]}
function texturedScreen(texture,corner,width,height,horizontal=[0,0,1]){
 const mesh=6,tri=(world,uv)=>{const p=world.map(project);if(p.some(x=>!x))return;primitives.push({depth:p.reduce((s,q)=>s+q.d,0)/3,paint:()=>{const [u,v,w]=uv,[a,b,c]=p,D=u[0]*(v[1]-w[1])+v[0]*(w[1]-u[1])+w[0]*(u[1]-v[1]),coef=key=>[(a[key]*(v[1]-w[1])+b[key]*(w[1]-u[1])+c[key]*(u[1]-v[1]))/D,(a[key]*(w[0]-v[0])+b[key]*(u[0]-w[0])+c[key]*(v[0]-u[0]))/D,(a[key]*(v[0]*w[1]-w[0]*v[1])+b[key]*(w[0]*u[1]-u[0]*w[1])+c[key]*(u[0]*v[1]-v[0]*u[1]))/D],X=coef('x'),Y=coef('y');ctx.save();ctx.beginPath();const mx=(a.x+b.x+c.x)/3,my=(a.y+b.y+c.y)/3,expand=p=>{const dx=p.x-mx,dy=p.y-my,k=1+.8/Math.max(1,Math.hypot(dx,dy));return[mx+dx*k,my+dy*k]};ctx.moveTo(...expand(a));ctx.lineTo(...expand(b));ctx.lineTo(...expand(c));ctx.closePath();ctx.clip();ctx.transform(X[0],Y[0],X[1],Y[1],X[2],Y[2]);ctx.drawImage(texture,0,0);ctx.restore()}})};
 const world=(u,v)=>[corner[0]+horizontal[0]*width*u,corner[1]-height*v+horizontal[1]*width*u,corner[2]+horizontal[2]*width*u],uv=(u,v)=>[u*texture.width,v*texture.height];
 for(let i=0;i<mesh;i++)for(let j=0;j<mesh;j++){const u=i/mesh,v=j/mesh,U=(i+1)/mesh,V=(j+1)/mesh;tri([world(u,v),world(U,v),world(U,V)],[uv(u,v),uv(U,v),uv(U,V)]);tri([world(u,v),world(U,V),world(u,V)],[uv(u,v),uv(U,V),uv(u,V)])}
}
function opticsTexture(){if(opticsCache?.simulation===simulation)return opticsCache.texture;const texture=document.createElement('canvas');texture.width=512;texture.height=256;const g=texture.getContext('2d'),image=g.createImageData(texture.width,texture.height),color=spectralColor(params.lambda);for(let y=0;y<texture.height;y++)for(let x=0;x<texture.width;x++){const z=(2*x/(texture.width-1)-1)*params.span*.001,Y=(1-2*y/(texture.height-1))*params.span*.001,light=simulation.intensity(z,Y)**.42,i=(y*texture.width+x)*4;for(let c=0;c<3;c++)image.data[i+c]=5+Math.round(245*color[c]*light);image.data[i+3]=255}g.putImageData(image,0,0);opticsCache={simulation,texture};return texture}
function bungeeMarkers(ruler){
 const markers=simulation.markers||[],bounds=sceneBounds(),titles={taut:'繩索首次拉直',elastic:params.c?'彈力＝重力（不含阻尼）':'彈力＝重力／合力為零',balance:'總拉力＝重力／合力為零',lowest:'首次最低點 · v = 0',rebound:'首次反彈最高點',ground:'抵達地面'};
 const compact=W<580||bounds.bottom-bounds.top<markers.length*36;
 const cards=[];
 markers.forEach((event,i)=>{const color=t>=event.t?event.color:'#738c90';segment([-1,event.y,0],[ruler+3,event.y,0],color,t>=event.t?2:1,true);segment([-.5,event.y,0],[.5,event.y,0],event.color,3);if(compact)label([ruler+4,event.y,0],String(i+1),color,11);else{const pos=project([ruler+3,event.y,0]);if(pos)cards.push({event,color,pos,y:pos.y-16})}});
 if(!cards.length)return;cards.sort((a,b)=>a.y-b.y);const top=bounds.top+2,bottom=bounds.bottom-32;
 for(let i=0;i<cards.length;i++)cards[i].y=Math.max(cards[i].y,i?cards[i-1].y+36:top);
 const overflow=Math.max(0,cards[cards.length-1].y-bottom);for(const card of cards)card.y-=overflow;
 primitives.push({depth:-Infinity,paint:()=>{const width=Math.min(255,W*.36),x=W-width-14;ctx.textAlign='left';for(const card of cards){const {event,color,pos,y}=card;ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pos.x,pos.y);ctx.lineTo(x,y+16);ctx.stroke();ctx.fillStyle='#edf5efed';ctx.fillRect(x,y,width,32);ctx.fillStyle=color;ctx.fillRect(x,y,3,32);ctx.font='600 11px system-ui';ctx.fillText(titles[event.key],x+9,y+12);ctx.font='10px system-ui';ctx.fillText((t>=event.t?'已達':'預測')+' · '+event.y.toFixed(2)+' m · '+event.t.toFixed(2)+' s',x+9,y+26)}}});
}
function apparatus(s){
 const p=params,k=def.kind,r=Math.min(1.1,Math.max(.3,scale*.014));
 switch(k){
 case 'sun-earth-moon':drawSunEarthMoon(s);break;
 case 'two-charges':drawTwoCharges(s);break;
 case 'bike-turn':drawBikeTurn(s);break;
 case 'projectile-explosion':drawProjectileExplosion(s);break;
 case 'recoiling-wedge':drawRecoilingWedge(s);break;
 case 'half-circle':drawHalfCircle(s);break;
 case 'pulled-spool':drawPulledSpool(s);break;
 case 'vertical-spring-pair':drawVerticalSpringPair(s);break;
 case 'damped-vertical':drawDampedVertical(s);break;
 case 'basic-waves':drawBasicWaves(s);break;
 case 'standing-waves':drawStandingWaves(s);break;
 case 'longitudinal-tube':drawLongitudinalTube(s);break;
 case 'resonance-column':drawResonanceColumn(s);break;
 case 'vacuum-bell':drawVacuumBell(s);break;
 case 'sound-speed':drawSoundSpeed(s);break;
 case 'echo':drawEcho(s);break;
 case 'doppler':drawDoppler(s);break;
 case 'diffraction-amplitudes':drawDiffractionAmplitudes(s);break;
 case 'optical-grating':drawOpticalGrating(s);break;
 case 'aperture-pattern':drawAperturePattern(s);break;
 case 'rgb-lights':drawRGBLights(s);break;
 case 'pv-path':drawPVPath(s);break;
 case 'magnetic-induction':drawMagneticInduction(s);break;
 case 'circuit-rc':drawCircuitRC(s);break;
 case 'blackbody-radiation':drawBlackbodyRadiation(s);break;
 case 'hydrogen-spectrum':drawHydrogenSpectrum(s);break;
 case 'radioactive-decay':drawRadioactiveDecay(s);break;
 case 'thin-film':drawThinFilm(s);break;
 case 'matter-wave':drawMatterWave(s);break;
 case 'parallel-capacitor':drawParallelCapacitor(s);break;
 case 'gauss-surface':drawGaussSurface(s);break;
 case 'quantum-well':drawQuantumWell(s);break;
 case 'hydrogen-orbitals':drawHydrogenOrbitals(s);break;
 case 'pn-junction':drawPnJunction(s);break;
 case 'rlc-resonance':drawRlcResonance(s);break;
 case 'eddy-current':drawEddyCurrent(s);break;
 case 'carnot-engine':drawCarnotEngine(s);break;
 case 'wire-magnetic-field':drawWireMagneticField(s);break;
 case 'charged-particle':drawChargedParticle(s);break;
 case 'generator-transformer':drawGeneratorTransformer(s);break;
 case 'rutherford-scattering':drawRutherfordScattering(s);break;
 case 'nuclear-binding':drawNuclearBinding(s);break;
 case 'optical-polarizers':drawOpticalPolarizers(s);break;
 case 'hydrostatic-buoyancy':drawHydrostaticBuoyancy(s);break;
 case 'photoelectric':drawPhotoelectric(s);break;
 case 'electroscope':drawElectroscope(s);break;case 'floating-block-shm':drawFloatingBlock(s);break;
case 'moon-earth':drawMoonEarth(s);break;
case 'pendulum-angle-comparison':drawPendulumComparison(s);break;
 case 'celestial-sphere':drawCelestialSphere(s);break;
 case 'dolly-zoom':drawDollyZoom(s);break;
 case 'sun-earth':drawSunEarth(s);break;
 case 'rainbow':drawRainbow(s);break;
 case 'optical-instruments':drawOpticalInstruments(s);break;
 case 'optical-parallax':drawOpticalParallax(s);break;
 case 'half-lens':drawHalfLens(s);break;
 case 'dancing-image':drawDancingImage(s);break;
 case 'eye-lens':drawEyeLens(s);break;
 case 'fresnel':drawFresnel(s);break;
 case 'sphere-lens':drawSphereLens(s);break;
 case 'apparent-depth':drawApparentDepth(s);break;
 case 'straw-cup':drawStrawCup(s);break;
 case 'layered-refraction':drawLayeredRefraction(s);break;
 case 'refraction-cart':drawRefractionCart(s);break;
 case 'image-drawing':drawImageDrawing(s);break;
 case 'conic-mirror':drawConicMirror(s);break;
 case 'double-mirror':drawDoubleMirror(s);break;
 case 'shared-mirror':drawSharedMirror(s);break;
 case 'plane-mirror':drawPlaneMirror(s);break;
 case 'fourier-square':drawFourierSquare(s);break;
 case 'sound-elements':drawSoundElements(s);break;
 case 'violin-fourier':drawViolinFourier(s);break;
 case 'string-interface':drawStringInterface(s);break;
 case 'wave-polarization':drawWavePolarization(s);break;
 case 'wave-function':drawWaveFunction(s);break;
 case 'string-wave-energy':drawStringWaveEnergy(s);break;
 case 'two-source-interference':drawTwoSourceInterference(s);break;
 case 'adiabatic-pistons':drawAdiabaticPistons(s);break;
 case 'equipartition':drawEquipartition(s);break;
 case 'maxwell-distribution':drawMaxwellDistribution(s);break;
 case 'ideal-gas':drawIdealGas(s);break;
 case 'thermal-lattice':drawThermalLattice(s);break;
 case 'joule-experiment':drawJouleExperiment(s);break;
 case 'rough-bounce':drawRoughBounce(s);break;
 case 'ball-rod':drawBallRod(s);break;
 case 'spring-atwood':drawSpringAtwood(s);break;
 case 'coupled-oscillators':drawCoupledOscillators(s);break;
 case 'resonance-bank':drawResonanceBank(s);break;
 case 'falling-spring':drawFallingSpring(s);break;
 case 'spring-wire-cut':drawSpringWireCut(s);break;
 case 'wall-spring-pair':drawWallSpringPair(s);break;
 case 'projectile-cone':drawProjectileCone(s);break;
 case 'intercontinental':drawIntercontinental(s);break;
 case 'binary-stars':drawBinaryStars(s);break;
 case 'hole-table':drawHoleTable(s);break;
 case 'noninertial':drawNoninertial(s);break;
 case 'ring-ball':drawRingBall(s);break;
 case 'person-boat':drawPersonBoat(s);break;
 case 'conveyor-friction':drawConveyorFriction(s);break;
 case 'block-stack':drawBlockStack(s);break;
 case 'self-pull':drawSelfPull(s);break;
 case 'moving-atwood':drawMovingAtwood(s);break;
 case 'slip-or-tip':drawSlipOrTip(s);break;
 case 'vertical-spring':drawVerticalSpring(s);break;
 case 'belt-wheels':drawBeltWheels(s);break;
 case 'incline-shadow':drawInclineShadow(s);break;
 case 'optimal-projectile':drawOptimalProjectile(s);break;
 case 'shm-projection':drawShmProjection(s);break;
 case 'airplane-drop':drawAirplaneDrop(s);break;
 case 'safe-parabola':drawSafeParabola(s);break;
 case 'shoot-monkey':drawShootMonkey(s);break;
 case 'relative-motion':drawRelativeMotion(s);break;
 case 'cart':box([s.x,.5,0],[1.8,1,1.1]);label([s.x,1.3,0],'物塊');break;
 case 'massive-spring':{
  box([-4.3,1,0],[.3,2,2]);const n=s.nodes.length-1;let previous=[-4,.5,0];
  for(let j=0;j<n;j++)for(let h=1;h<=12;h++){const f=h/12,x=-4+4*(j+f)/n+s.nodes[j]*(1-f)+s.nodes[j+1]*f,a=(j+f)*TAU,next=[x,.5+.16*Math.sin(a),.16*Math.cos(a)];segment(previous,next,'#577b81',2);previous=next}
  for(let j=1;j<n;j++)sphere([-4+4*j/n+s.nodes[j],.5,0],.045);box([s.x,.5,0],[.8,1,1]);label([-2,1.5,0],'分布彈簧質量 '+p.ms+' kg');label([s.x,1.4,0],'末端 '+p.m+' kg');break;
 }
 case 'bicycle':{
  const rear=[s.x-.8,p.R,0],front=[s.x+.8,p.R,0];for(const wheel of [rear,front]){ring(wheel,p.R,'xy','#35525d',3);for(let j=0;j<4;j++){const a=-s.theta+j*Math.PI/2;segment(wheel,[wheel[0]+p.R*Math.sin(a),wheel[1]-p.R*Math.cos(a),0],'#657e85',1)}sphere(wheel,.04)}
  const seat=[s.x-.25,p.R+.65,0],pedal=[s.x-.1,p.R-.05,0],steer=[s.x+.65,p.R+.65,0];for(const [a,b]of [[rear,seat],[seat,pedal],[pedal,rear],[seat,steer],[steer,pedal],[front,steer]])segment(a,b,'#168579',3);segment([seat[0]-.2,seat[1],0],[seat[0]+.15,seat[1],0],'#35525d',4);segment(steer,[steer[0]+.15,steer[1]+.1,0],'#35525d',3);sphere([s.x-.05,p.R+1.35,0],.12);segment([s.x-.15,p.R+1.12,0],seat,'#b76b26',4);segment([s.x-.15,p.R+1.12,0],steer,'#b76b26',3);segment(seat,pedal,'#46616a',3);
  for(const [wheel,F,name,color,z]of [[rear,s.rearF,'後輪','#8b5ac4',1.2],[front,s.frontF,'前輪','#b25842',-1.2]]){const pos=[wheel[0],.03,z];if(Math.abs(F)>1e-8)arrow(pos,[pos[0]+Math.sign(F)*.8,pos[1],pos[2]],color,name);label([pos[0],-.08,z],name+' '+format(F)+' N',color,10)}break;
 }
 case 'double-slit':{
  const color=spectralColor(p.lambda).map(c=>Math.round(c*255)),beam='rgb('+color.join(',')+')',gap=p.d*.004,a=p.a*.004,h=p.b*.004,beta=p.rotation*Math.PI/180,sin=Math.sin(beta),cos=Math.cos(beta),tilt=p.laserAngle*Math.PI/180,yaw=p.screenYaw*Math.PI/180,sp=(u,v)=>[simulation.screenX+u*Math.sin(yaw),v,u*Math.cos(yaw)],ap=(u,v,x=-2)=>[x,4+u*sin+v*cos,u*cos-v*sin],holes=[[-gap/2-a/2,-gap/2+a/2],[gap/2-a/2,gap/2+a/2]],rect=(u0,u1,v0,v1,fill='#425965',x=-2)=>polygon([ap(u0,v0,x),ap(u0,v1,x),ap(u1,v1,x),ap(u1,v0,x)],fill,'#29444c');
  rect(-4,holes[0][0],-3,3);rect(holes[0][1],holes[1][0],-3,3);rect(holes[1][1],4,-3,3);for(const [z0,z1]of holes){rect(z0,z1,-3,-h/2);rect(z0,z1,h/2,3);}if(p.medium){rect(holes[0][0],holes[0][1],-h/2,h/2,'#b5b0d4bb',-1.97);rect(holes[1][0],holes[1][1],-h/2,h/2,'#9dd4c3bb',-1.97);label(ap(0,h/2+.5),'兩片相位差 Δφ='+(simulation.platePhase*180/Math.PI).toFixed(1)+'°','#72a99a',10);}
  box([-6,4,-4*Math.tan(tilt)],[1,.5,.5]);segment([-5.5,4,-3.5*Math.tan(tilt)],[-2,4,0],beam,3);texturedScreen(opticsTexture(),sp(-4,7),8,6,[Math.sin(yaw),0,Math.cos(yaw)]);for(const u of [-gap/2,gap/2])segment(ap(u,0,-1.99),sp(s.probe_mm/p.span*4,4),beam,1,true);segment(sp(s.probe_mm/p.span*4,1),sp(s.probe_mm/p.span*4,7),'#ffffff90',1);label(ap(0,3.6),'雙狹縫 · 面內旋轉 '+p.rotation+'°');label([simulation.screenX,7.4,0],'屏距 '+p.L.toFixed(1)+' m · λ '+p.lambda+' nm');label([-5.5,5,0],'入射傾角 '+p.laserAngle.toFixed(2)+'°','#628e9a',10);label([simulation.screenX,1,0],'掃描 '+s.probe_mm.toFixed(2)+' mm','#355461',11);break;
 }
 case 'two-carts':box([s.x,.5,0],[1.8,1,1.1]);box([s.x2,.5,2.5],[1.8,1,1.1],'#8f9db6');label([s.x,1.4,0],'後車');label([s.x2,1.4,2.5],'前車');break;
 case 'ball':sphere(point(s),r);segment([0,0,0],[0,Math.max(p.h,plotSamples.reduce((a,s)=>Math.max(a,s.y),0))+1,0],'#607a8270',1,true);break;
 case 'fall':sphere(point(s),r);segment([0,0,0],[0,plotSamples[plotSamples.length-1].y,0],'#607a8280',1,true);label([0,1,0],'釋放點');break;
 case 'bungee':{
  const anchor=[0,p.h,0],size=Math.max(1.5,Math.min(5,scale*.045)),py=s.y+size;
  box([-4,p.h-.25,0],[8,.5,4]);box([-6,p.h/2,-1.5],[.6,p.h,.6]);box([-6,p.h/2,1.5],[.6,p.h,.6]);
  segment([-7,p.h+.8,-2],[-.5,p.h+.8,-2],'#526c77',3);segment([-7,p.h+.8,2],[-.5,p.h+.8,2],'#526c77',3);
  if(s.drop<p.L){const side=Math.min(1.5,(p.L-s.drop)/4);let lo=Math.max(0,s.drop),hi=p.L;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(Math.hypot(side,mid)+Math.hypot(side,mid-s.drop)>p.L)hi=mid;else lo=mid}const bottom=[side,p.h-(lo+hi)/2,0];segment(anchor,bottom,'#607a82',2);segment(bottom,point(s),'#607a82',2)}else segment(anchor,point(s),s.tension>0?'#168579':'#607a82',3);
  sphere([s.x,py+size*.65,s.z],size*.22);segment([0,py+size*.35,0],[0,py-size*.45,0],'#c8793b',5);
  segment([-size*.5,py+size*.1,0],[size*.5,py+size*.1,0],'#c8793b',3);segment([0,py-size*.45,0],[-size*.25,s.y,0],'#46616a',3);segment([0,py-size*.45,0],[size*.25,s.y,0],'#46616a',3);
  label([-3,p.h+size,0],'跳台 '+p.h+' m');label([0,0,2],'地面');label([size*4,s.y+size,0],s.drop<p.L?(s.vy>0?'向上運動 · 繩索鬆弛':'自由落下 · 繩索鬆弛'):s.vy>0?'向上反彈':s.tension>p.m*p.g?'繩索拉緊 · 減速下落':'繩索伸長');
  const ruler=Math.max(5,size*2);segment([ruler,0,0],[ruler,p.h,0],'#607a8290',1);
  const tick=nice(p.h/8);for(let y=0;y<=p.h;y+=tick){segment([ruler-.5,y,0],[ruler+.5,y,0],'#607a82',1);label([ruler+2,y,0],y.toFixed(0)+' m','#355461',10)}
  if(!simulation.markers.some(e=>e.key==='elastic')&&simulation.elasticHeight>=0){segment([-1,simulation.elasticHeight,0],[ruler+3,simulation.elasticHeight,0],'#16857980',1,true);label([ruler+8,simulation.elasticHeight,0],'純彈力平衡高度 '+simulation.elasticHeight.toFixed(2)+' m（參考）','#168579',10)}
  bungeeMarkers(ruler);break;
 }
 case 'river':{
  const end=plotSamples[plotSamples.length-1],left=Math.min(-4,end.x-3),right=Math.max(5,end.x+3);polygon([[left,.01,0],[right,.01,0],[right,.01,p.width],[left,.01,p.width]],'#75b5c5bb','#4c94a4');for(let x=left;x<right;x+=Math.max(3,(right-left)/8)){segment([x,.04,2],[x+Math.sign(p.u)*1.5,.04,2],'#337e9690',2);segment([x,.04,p.width-2],[x+Math.sign(p.u)*1.5,.04,p.width-2],'#337e9690',2)}label([left,0,0],'此岸');label([left,0,p.width],'對岸');box(point(s),[1.4,.5,.8]);if($('vectors').checked){arrow(point(s),[s.x+p.u*velocityScale,s.y,s.z],'#357dba','水流');arrow(point(s),[s.x-p.v*Math.sin(p.angle*Math.PI/180)*velocityScale,s.y,s.z+p.v*Math.cos(p.angle*Math.PI/180)*velocityScale],'#9a5cb6','船／水')}break;
 }
 case 'incline':inclineTrack();box(point(s),[.9,.8,1],'#738c90',-p.angle*Math.PI/180);break;
 case 'rolling':inclineTrack();sphere(point(s),p.R);segment(point(s),[s.x+p.R*Math.cos(s.theta),s.y+p.R*Math.sin(s.theta),s.z],'#a64f20',3);break;
 case 'pulley':ring([0,8,0],2,'xy');segment([-2,s.y,0],[-2,8,0],'#506e78',2);segment([2,8,0],[2,s.y2,0],'#506e78',2);box([-2,s.y,0],[1.2,1.3,1.2]);box([2,s.y2,0],[1.2,1.3,1.2]);box([0,8.1,-.8],[5,.3,1]);label([-2,s.y+.9,0],p.m1+' kg');label([2,s.y2+.9,0],p.m2+' kg');break;
 case 'table-pulley':box([-2,5.4,0],[11,.4,5]);segment([s.x,6,0],[3,6,0],'#506e78',2);segment([3,6,0],[3,s.y2,0],'#506e78',2);ring([3,5.8,0],.2,'xy');box(point(s),[1,.8,1]);box([3,s.y2,0],[.8,.8,.8]);break;
 case 'elevator':box([0,s.floor,0],[4,.3,3]);segment([-2,s.floor,-1.5],[-2,s.floor+7,-1.5],'#607a82',3);segment([2,s.floor,-1.5],[2,s.floor+7,-1.5],'#607a82',3);box([0,s.floor+.25,0],[1.8,.2,1.2],'#8ee0c0');sphere([0,s.y+.1,0],.3);segment([0,s.y-.25,0],[0,s.y-.7,0],'#46616a',4);label([1,s.floor+1,0],'N = '+format(s.N)+' N');break;
 case 'track':for(let i=0;i<100;i++){const x=-6+i*.12,y=p.h*x*x/36,n=x+.12,ny=p.h*n*n/36;polygon([[x,y,-1.3],[n,ny,-1.3],[n,ny,1.3],[x,y,1.3]],i%2?'#a7b8ae':'#c5cfc0','#607a82')}sphere(point(s),.3);break;
 case 'collision':if(p.contactMode){coil([s.x+.5,1,0],[s.x+1.5-s.compression,1,0],'#a17d4d');label([(s.x+s.x2)/2,2.4,0],s.phase===1?'彈簧接觸 · δ='+s.compression.toFixed(3)+' m':'彈性彈簧模式','#92683c',11);}sphere([s.x,1,0],.5);sphere([s.x2,1,0],.5);label([s.x,1.9,0],'m₁ '+p.m1+' kg');label([s.x2,1.9,0],'m₂ '+p.m2+' kg');if($('vectors').checked)arrow([s.x2,1,0],[s.x2+s.v2*velocityScale,1,0],colors.mint,'v₂');break;
 case 'collision2d':sphere([s.x+.45*Math.cos(s.theta1),1.2,s.z-.45*Math.sin(s.theta1)],.07,'#467bb3');sphere([s.x2+.45*Math.cos(s.theta2),1.2,s.z2-.45*Math.sin(s.theta2)],.07,'#468d72');sphere(point(s),.5);sphere([s.x2,1,s.z2],.5);label([s.x,1.9,s.z],'m₁ '+p.m1+' kg');label([s.x2,1.9,s.z2],'m₂ '+p.m2+' kg');if($('vectors').checked)arrow([s.x2,1,s.z2],[s.x2+s.vx2*velocityScale,1,s.z2+s.vz2*velocityScale],colors.mint,'v₂');break;
 case 'pair-spring':box(point(s),[.8,1,1]);box([s.x2,.5,0],[.8,1,1]);coil([s.x+.4,.5,0],[s.x2-.4,.5,0]);segment([s.com,0,-1.4],[s.com,0,1.4],'#a64f20',2);label([s.com,.1,1.5],'質心');if($('vectors').checked)arrow([s.x2,.5,0],[s.x2+s.v2*velocityScale,.5,0],colors.mint,'v₂');if($('forces').checked)arrow([s.x2,.5,0],[s.x2-s.fx*forceScale,.5,0],colors.purple,'內力₂');break;
 case 'skater':{const c=Math.cos(s.theta),sn=Math.sin(s.theta),x=s.radius*c,z=s.radius*sn,vx=s.rdot*c-s.radius*s.omega*sn,vz=s.rdot*sn+s.radius*s.omega*c;disc([0,.2,0],Math.max(p.r0,p.r1)+.4,s.theta);segment([-x,1,-z],[x,1,z],'#526c77',4);sphere([x,1,z],.3);sphere([-x,1,-z],.3);box([0,.7,0],[.5,1.2,.5]);label([0,2,0],'L = '+format(s.angular));if($('vectors').checked){arrow([x,1,z],[x+vx*velocityScale,1,z+vz*velocityScale],colors.mint,'v₁');arrow([-x,1,-z],[-x-vx*velocityScale,1,-z-vz*velocityScale],colors.mint,'v₂')}break;}
 case 'massive-pulley':{const R=p.R;ring([0,8,0],R,'xy','#526c77',4);segment([0,8,0],[R*Math.sin(s.theta),8-R*Math.cos(s.theta),0],'#a64f20',3);segment([-R,s.y,0],[-R,8,0],'#506e78',2);segment([R,8,0],[R,s.y2,0],'#506e78',2);box([-R,s.y,0],[1,1.2,1]);box([R,s.y2,0],[1,1.2,1]);label([-R,s.y+.9,0],p.m1+' kg');label([R,s.y2+.9,0],p.m2+' kg');sphere([0,8,0],.12);break;}
 case 'ballistic':{
  const pivot=[0,1+p.L,0];segment(pivot,point(s),'#506e78',3);box(point(s),[.8,.8,.8]);sphere(pivot,.15);if(s.bulletX!==null)sphere([s.bulletX,1,0],.14);else sphere([s.x-.2,s.y,0],.14);break;
 }
 case 'rocket':box(point(s),[1.5,.7,.7]);if(t<p.burn){const x=s.x-1.5;polygon([[s.x-.75,s.y-.25,0],[x-.6*Math.sin(t*40)**2,s.y,0],[s.x-.75,s.y+.25,0]],'#ffb36b')}label([s.x,s.y+.9,0],format(s.mass)+' kg');break;
 case 'circle':ring([0,1,0],p.R);segment([0,1,0],point(s),'#607a8270',1,true);sphere(point(s),.3);sphere([0,1,0],.1);break;
 case 'banked':{
  const h=Math.tan(p.angle*Math.PI/180);for(let i=0;i<64;i++){const a=i*TAU/64,b=(i+1)*TAU/64,V=(r,a)=>[r*Math.cos(a),1+(r-p.R)*h-.3,r*Math.sin(a)];polygon([V(p.R-.8,a),V(p.R+.8,a),V(p.R+.8,b),V(p.R-.8,b)],i%2?'#a7b8ae':'#c5cfc0','#607a82')}box(point(s),[.6,.5,.8]);break;
 }
 case 'conical':{
  const pivot=[0,2+p.L*Math.cos(p.angle*Math.PI/180),0];segment(pivot,point(s),'#506e78',2);sphere(pivot,.12);ring([0,2,0],p.L*Math.sin(p.angle*Math.PI/180),'xz','#607a8270',1);sphere(point(s),.3);drawConicalAngular(s,pivot);break;
 }
 case 'vertical-circle':ring([0,p.R+.3,0],p.R,'xy','#526c77',3);sphere(point(s),.3);break;
 case 'rotor':disc([0,1,0],p.R,s.theta);segment([0,0,0],[0,2,0],'#526c77',4);if($('forces').checked){const pos=[p.R*Math.cos(s.theta),1,p.R*Math.sin(s.theta)];arrow(pos,[pos[0]-p.F*Math.sin(s.theta)*forceScale,1,pos[2]+p.F*Math.cos(s.theta)*forceScale],colors.purple,'F切向')}break;
 case 'lever':{
  box([(p.L2-p.L1)/2,3,0],[p.L1+p.L2+.4,.2,.4]);polygon([[-.7,0,0],[.7,0,0],[0,2.9,0]],'#738c90','#46616a');box([-p.L1,2.5,0],[.7,.8,.8]);box([p.L2,2.5,0],[.7,.8,.8]);label([-p.L1,3.7,0],p.m1+' kg × '+p.L1+' m');label([p.L2,3.7,0],p.m2+' kg × '+p.L2+' m');if($('forces').checked){arrow([-p.L1,2.5,0],[-p.L1,2.5-p.m1*p.g*forceScale,0],colors.purple,'m₁g');arrow([p.L2,2.5,0],[p.L2,2.5-p.m2*p.g*forceScale,0],colors.purple,'m₂g')}label([0,4.4,0],Math.abs(s.net)<1e-8?'平衡':'保持水平需外加 '+format(-s.net)+' N·m');break;
 }
 case 'spring':{
  const left=Math.min(-5,...plotSamples.map(s=>s.x-2));box([left-.3,1,0],[.3,2,2]);coil([left,.5,0],[s.x-.5,.5,0]);box([s.x,.5,0],[1,1,1]);segment([0,0,-2],[0,0,2],'#607a8270',1,true);label([0,.1,-2],'平衡位置');break;
 }
 case 'pendulum':{
  const pivot=[0,1+p.L,0];segment(pivot,point(s),'#506e78',3);sphere(pivot,.15);sphere(point(s),.3);segment(pivot,[0,1,0],'#607a8260',1,true);break;
 }
 case 'orbit':sphere([0,1,0],.6);sphere(point(s),.22);segment([0,1,0],point(s),'#607a8260',1,true);label([0,2,0],'中心天體 · N='+p.N.toFixed(1));break;
 }
}
function render(){
 dirty=false;if(following)camera.target=point(stateAt(t));const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#9bbdcd');grad.addColorStop(.6,'#d9e6df');grad.addColorStop(1,'#e9e7d4');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);updateCamera();primitives=[];
 const showGrid=$('grid').checked&&!(simulation.hideGrid&&simulation.hideGrid(params));const gridStep=nice(scale/12),N=9,cx=Math.round(camera.target[0]/gridStep)*gridStep,cz=Math.round(camera.target[2]/gridStep)*gridStep,ground=stateAt(t).groundY??(Math.min(0,...plotSamples.map(s=>point(s)[1]))-scale*.02);
 const hideFloor=typeof simulation.hideFloor==='function'?simulation.hideFloor(params):!!simulation.hideFloor;
 if(!hideFloor)for(let i=-N;i<N;i++)for(let j=-N;j<N;j++){const x=cx+i*gridStep,z=cz+j*gridStep;polygon([[x,ground,z],[x+gridStep,ground,z],[x+gridStep,ground,z+gridStep],[x,ground,z+gridStep]],(i+j)%2?'#a7b8ae':'#c5cfc0',showGrid?'#7f9c9550':null)}
 primitives.sort((a,b)=>b.depth-a.depth);for(const item of primitives)item.paint();primitives=[];
 if(showGrid){for(let i=-4;i<=4;i++){const x=cx+i*gridStep;label([x,ground,cz],format(x)+' '+(simulation.displayLengthUnit||'m'),'#45636a',10)}const len=Math.min(4,scale*.1);arrow([0,ground,0],[len,ground,0],'#b66555','x');arrow([0,ground,0],[0,ground+len,0],'#657eb2','y');arrow([0,ground,0],[0,ground,len],'#5c8d74','z')}
 const hidePrimary=simulation.hidePrimary||def.kind==='belt-wheels'||(def.kind==='shm-projection'&&!params.showX);
 if($('trail').checked&&t>0&&!hidePrimary&&!['rotor','lever','skater'].includes(def.kind)){const count=240;for(let i=0;i<count;i++){const a=stateAt(t*i/count),b=stateAt(t*(i+1)/count);segment(point(a),point(b),colors.orange,2.5)}}
 const s=stateAt(t);apparatus(s);if(typeof drawAnnotations==='function')drawAnnotations();const pos=point(s);
 if($('vectors').checked&&!hidePrimary&&!['rotor','lever'].includes(def.kind))arrow(pos,[pos[0]+s.vx*velocityScale,pos[1]+s.vy*velocityScale,pos[2]+s.vz*velocityScale],colors.mint,'v');
 if($('forces').checked&&!hidePrimary&&!['rotor','lever'].includes(def.kind))arrow(pos,[pos[0]+s.fx*forceScale,pos[1]+s.fy*forceScale,pos[2]+s.fz*forceScale],colors.purple,'ΣF');
 primitives.sort((a,b)=>b.depth-a.depth);for(const item of primitives)item.paint();
 const base=[W-42,Math.min(H-210,95)],r=19;ctx.fillStyle='#f1f6efbd';ctx.beginPath();ctx.arc(base[0],base[1],28,0,TAU);ctx.fill();for(const [a,name,color]of [[[1,0,0],'x','#a65849'],[[0,1,0],'y','#4e70ac'],[[0,0,1],'z','#467a59']]){const dx=dot(a,right)*r,dy=-dot(a,up)*r;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...base);ctx.lineTo(base[0]+dx,base[1]+dy);ctx.stroke();ctx.fillStyle=color;ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(name,base[0]+dx*1.3,base[1]+dy*1.3+3)}drawPlot();
}
