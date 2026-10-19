'use strict';
const colors={mint:'#168579',purple:'#8b5ac4',orange:'#cf7632',dark:'#46616a',light:'#b7c7c4'};
function box(center,size,color='#738c90',tilt=0){
 const [x,y,z]=center,[a,b,c]=size.map(v=>v/2),V=(i,j,k)=>[x+i*a*Math.cos(tilt)-j*b*Math.sin(tilt),y+i*a*Math.sin(tilt)+j*b*Math.cos(tilt),z+k*c];
 polygon([V(-1,1,-1),V(1,1,-1),V(1,1,1),V(-1,1,1)],'#b7c7c4','#526c77');polygon([V(-1,-1,1),V(1,-1,1),V(1,1,1),V(-1,1,1)],color,'#526c77');polygon([V(1,-1,1),V(1,-1,-1),V(1,1,-1),V(1,1,1)],'#46616a','#526c77');polygon([V(-1,-1,-1),V(-1,-1,1),V(-1,1,1),V(-1,1,-1)],color,'#526c77');polygon([V(-1,-1,-1),V(1,-1,-1),V(1,1,-1),V(-1,1,-1)],color,'#526c77');
}
function ring(center,radius,plane='xz',color='#526c77',width=2){for(let i=0;i<64;i++){const v=a=>plane==='xy'?[center[0]+radius*Math.sin(a),center[1]-radius*Math.cos(a),center[2]]:[center[0]+radius*Math.cos(a),center[1],center[2]+radius*Math.sin(a)];segment(v(i*TAU/64),v((i+1)*TAU/64),color,width)}}
function coil(a,b,color='#607a82'){const delta=vector(b,a),axis=norm(delta),ref=Math.abs(axis[1])<.9?[0,1,0]:[1,0,0],u=norm(cross(axis,ref)),v=cross(axis,u),N=100;let prev=a;for(let i=1;i<=N;i++){const f=i/N,r=i===N?0:.18,ang=f*TAU*10,next=a.map((x,j)=>x+delta[j]*f+r*(u[j]*Math.cos(ang)+v[j]*Math.sin(ang)));segment(prev,next,color,2);prev=next}}
function disc(center,R,angle){const [x,y,z]=center;for(let i=0;i<32;i++){const a=i*TAU/32,b=(i+1)*TAU/32;polygon([[x,y,z],[x+R*Math.cos(a),y,z+R*Math.sin(a)],[x+R*Math.cos(b),y,z+R*Math.sin(b)]],i%4<2?'#9ab5ad':'#c5d2bf','#607a82')}segment([x,y+.04,z],[x+R*Math.cos(angle),y+.04,z+R*Math.sin(angle)],'#a64f20',4);sphere([x,y+.1,z],.13)}
function inclineTrack(){const a=params.angle*Math.PI/180,c=Math.cos(a),h=12*Math.sin(a),end=12*c-5;polygon([[-5,h,-2],[end,0,-2],[end,0,2],[-5,h,2]],'#b7c7c4','#607a82');polygon([[-5,0,2],[end,0,2],[-5,h,2]],'#738c90','#607a82')}
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
 case 'cart':box([s.x,.5,0],[1.8,1,1.1]);label([s.x,1.3,0],'物塊');break;
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
 case 'collision':sphere([s.x,1,0],.5);sphere([s.x2,1,0],.5);label([s.x,1.9,0],'m₁ '+p.m1+' kg');label([s.x2,1.9,0],'m₂ '+p.m2+' kg');if($('vectors').checked)arrow([s.x2,1,0],[s.x2+s.v2*velocityScale,1,0],colors.mint,'v₂');break;
 case 'collision2d':sphere(point(s),.5);sphere([s.x2,1,s.z2],.5);label([s.x,1.9,s.z],'m₁ '+p.m1+' kg');label([s.x2,1.9,s.z2],'m₂ '+p.m2+' kg');if($('vectors').checked)arrow([s.x2,1,s.z2],[s.x2+s.vx2*velocityScale,1,s.z2+s.vz2*velocityScale],colors.mint,'v₂');break;
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
  const pivot=[0,2+p.L*Math.cos(p.angle*Math.PI/180),0];segment(pivot,point(s),'#506e78',2);sphere(pivot,.12);ring([0,2,0],p.L*Math.sin(p.angle*Math.PI/180),'xz','#607a8270',1);sphere(point(s),.3);break;
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
 case 'orbit':sphere([0,1,0],.6);sphere(point(s),.22);segment([0,1,0],point(s),'#607a8260',1,true);label([0,2,0],'中心天體');break;
 }
}
function render(){
 dirty=false;if(following)camera.target=point(stateAt(t));const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'#9bbdcd');grad.addColorStop(.6,'#d9e6df');grad.addColorStop(1,'#e9e7d4');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);updateCamera();primitives=[];
 const gridStep=nice(scale/12),N=9,cx=Math.round(camera.target[0]/gridStep)*gridStep,cz=Math.round(camera.target[2]/gridStep)*gridStep,ground=Math.min(0,...plotSamples.map(s=>s.y))-scale*.02;
 for(let i=-N;i<N;i++)for(let j=-N;j<N;j++){const x=cx+i*gridStep,z=cz+j*gridStep;polygon([[x,ground,z],[x+gridStep,ground,z],[x+gridStep,ground,z+gridStep],[x,ground,z+gridStep]],(i+j)%2?'#a7b8ae':'#c5cfc0',$('grid').checked?'#7f9c9550':null)}
 primitives.sort((a,b)=>b.depth-a.depth);for(const item of primitives)item.paint();primitives=[];
 if($('grid').checked){for(let i=-4;i<=4;i++){const x=cx+i*gridStep;label([x,ground,cz],format(x)+' m','#45636a',10)}const len=Math.min(4,scale*.1);arrow([0,ground,0],[len,ground,0],'#b66555','x');arrow([0,ground,0],[0,ground+len,0],'#657eb2','y');arrow([0,ground,0],[0,ground,len],'#5c8d74','z')}
 if($('trail').checked&&t>0&&!['rotor','lever','skater'].includes(def.kind)){const count=240;for(let i=0;i<count;i++){const a=stateAt(t*i/count),b=stateAt(t*(i+1)/count);segment(point(a),point(b),colors.orange,2.5)}}
 const s=stateAt(t);apparatus(s);const pos=point(s);
 if($('vectors').checked&&!['rotor','lever'].includes(def.kind))arrow(pos,[s.x+s.vx*velocityScale,s.y+s.vy*velocityScale,s.z+s.vz*velocityScale],colors.mint,'v');
 if($('forces').checked&&!['rotor','lever'].includes(def.kind))arrow(pos,[s.x+s.fx*forceScale,s.y+s.fy*forceScale,s.z+s.fz*forceScale],colors.purple,'ΣF');
 primitives.sort((a,b)=>b.depth-a.depth);for(const item of primitives)item.paint();
 const base=[W-42,Math.min(H-210,95)],r=19;ctx.fillStyle='#f1f6efbd';ctx.beginPath();ctx.arc(base[0],base[1],28,0,TAU);ctx.fill();for(const [a,name,color]of [[[1,0,0],'x','#a65849'],[[0,1,0],'y','#4e70ac'],[[0,0,1],'z','#467a59']]){const dx=dot(a,right)*r,dy=-dot(a,up)*r;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...base);ctx.lineTo(base[0]+dx,base[1]+dy);ctx.stroke();ctx.fillStyle=color;ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(name,base[0]+dx*1.3,base[1]+dy*1.3+3)}drawPlot();
}
