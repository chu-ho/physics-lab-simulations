'use strict';
function drawResonanceColumn(s){const sim=simulation,S=6,top=sim.H*S,water=sim.waterHeight*S,r=.22;
for(let j=0;j<24;j++){const a=j*TAU/24,b=(j+1)*TAU/24,xy=(ang,y)=>[r*Math.cos(ang),y,r*Math.sin(ang)];polygon([xy(a,.1),xy(b,.1),xy(b,top),xy(a,top)],'#8bafba15','#6e969e35');polygon([xy(a,.1),xy(b,.1),xy(b,water),xy(a,water)],'#589ecb50','#6dacc555');}
ring([0,water,0],r,'xz','#6aa5bd',2);ring([0,top,0],r,'xz','#709ba5',2);box([0,.05,0],[.7,.1,.7],'#91a4a1');
for(let i=0;i<=40;i++){const X=params.L*i/40,q=sim.field(X,t),y=6*(sim.waterHeight+X+sim.displayGain(params)*q.u),f=q.pressure/sim.maxPressure,col=params.showPressure?(f>=0?'#c28277':'#6b9db9'):'#95ada9';segment([-.17,y,0],[.17,y,0],col,1.7);}
const cupX=1.65;box([cupX,water-.35,0],[.7,.7,.7],'#b0c5c3');polygon([[cupX-.3,water+.02,-.3],[cupX+.3,water+.02,-.3],[cupX+.3,water+.02,.3],[cupX-.3,water+.02,.3]],'#76afc3a0','#6d99a3');segment([0,.25,0],[.7,-.03,0],'#bf9c65',4);segment([.7,-.03,0],[cupX,Math.max(.05,water-.5),0],'#bf9c65',4);
const forkY=top+.5;segment([-.5,forkY-.3,0],[-.5,forkY+.6,0],'#8c909e',4);segment([.2,forkY-.3,0],[.2,forkY+.6,0],'#8c909e',4);segment([-.5,forkY-.3,0],[.2,forkY-.3,0],'#8c909e',4);label([.8,forkY+.5,0],params.f+' Hz','#7b7b94',11);
segment([-.65,water,0],[-.65,top,0],'#8eac9b',1);label([-.9,(water+top)/2,0],'L='+params.L.toFixed(3)+' m','#5c8b87',11);label([cupX,water+.4,0],'調水杯高度／水位','#5a8290',10);
if(params.markers)for(const a of sim.resonances){const y=a.waterHeight*S;segment([-.4,y,0],[-.85,y,0],'#b5995a',1.5);label([-1.2,y,0],a.n+': '+a.L.toFixed(3)+' m','#a2894d',10);}
sphere(point(s),.07,'#d6a24b');label([.9,top+1.4,0],'響應 '+format(s.responseGain)+' 倍','#6f9697',11);
}
