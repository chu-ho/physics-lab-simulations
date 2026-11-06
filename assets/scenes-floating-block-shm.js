'use strict';function drawFloatingBlock(s){const sim=simulation,p=params,w=p.width,h=p.height,top=sim.surface,eq=sim.equilibriumY;
for(const x of [-1.85,1.85])for(const z of [-1.25,1.25])segment([x,sim.bounds.min[1],z],[x,top,z],'#70a8b4',1); polygon([[-1.85,top,-1.25],[1.85,top,-1.25],[1.85,top,1.25],[-1.85,top,1.25]],'#6cbdd549','#5296b0');
box([0,s.y,0],[w,h,w],'#bf8b4e');segment([-1.6,eq,0],[1.6,eq,0],'#4f9479',2,true);label([1.8,eq,0],'平衡位置','#4f9479',11);
for(const [y,text]of [[top+h/2,'離水界線'],[top-h/2,'全浸界線']]){segment([-1.5,y,-.8],[1.5,y,-.8],'#93989b',1,true);label([1.8,y,-.8],text,'#7e898d',10);}
label([-1.7,top+.12,1.25],'水面','#458ba4',11);segment([-.9,eq,0],[-.9,s.y,0],'#b49760',2,true);label([-1.1,(eq+s.y)/2,.1],'q='+s.q.toFixed(3)+'m','#a8844b',10);
if(p.forces){const scale=.85/Math.max(s.weight,s.buoyancy,Math.abs(s.fy),1);arrow([-.25,s.y,0],[-.25,s.y-s.weight*scale,0],'#bb675c','mg');arrow([.25,s.y,0],[.25,s.y+s.buoyancy*scale,0],'#4788b2','B');arrow([.75,s.y,0],[.75,s.y+s.fy*scale,0],'#ae8b45','合力');if(Math.abs(s.drag)>.01)arrow([-.7,s.y,0],[-.7,s.y+s.drag*scale,0],'#8b6eb0','阻尼');}
const linear=s.regime===1;label([0,sim.bounds.max[1]-.25,0],linear?(p.damping?'部分浸沒：F浮＋F重=−kq；另有阻尼':'部分浸沒：F合=−kq，簡諧運動區間'):(s.regime===0?'已離水：浮力為零，非簡諧':'完全浸沒：浮力飽和，非簡諧'),linear?'#4f9479':'#b46c49',12);label([0,sim.bounds.min[1]+.15,1.2],'m='+sim.m.toFixed(1)+'kg · k='+sim.k.toFixed(1)+'N/m · T₀='+sim.period.toFixed(3)+'s','#67828d',11);
}
