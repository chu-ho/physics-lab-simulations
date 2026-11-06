'use strict';
function drawBikeTurn(s){
 const R=simulation.contactRadius,h=params.h,a=s.theta,C=Math.cos(a),S=Math.sin(a),center=[s.contactX,0,s.contactZ],inward=[-C,0,-S],tangent=[-S,0,C];
 function pos(along,up,inside=0){return[center[0]+tangent[0]*along+inward[0]*inside,up,center[2]+tangent[2]*along+inward[2]*inside]}
 for(const rad of [R-.7,R,R+.7])ring([0,.015,0],rad,'xz',rad===R?'#d4a14a':'#88a8a1',rad===R?2:1);
 for(let j=0;j<24;j++){const q=j*TAU/24;segment([(R-.65)*Math.cos(q),.02,(R-.65)*Math.sin(q)],[(R+.65)*Math.cos(q),.02,(R+.65)*Math.sin(q)],'#afc1b9',1)}
 const co=Math.cos(s.phi),si=Math.sin(s.phi),point=(along,height)=>pos(along,height*co,height*si),wheelRadius=.25;
 for(const along of [-.55,.55]){
  const hub=point(along,wheelRadius);for(let j=0;j<30;j++){const q=j*TAU/30,b=(j+1)*TAU/30,pt=u=>{const z=point(along+wheelRadius*Math.cos(u),wheelRadius+wheelRadius*Math.sin(u));return z};segment(pt(q),pt(b),'#426468',3)}
  sphere(hub,.045,'#bf9655');for(let j=0;j<6;j++){const q=j*TAU/6-s.theta*R/wheelRadius;segment(hub,point(along+wheelRadius*Math.cos(q),wheelRadius+wheelRadius*Math.sin(q)),'#789493',1)}
 }
 const rear=point(-.55,wheelRadius),front=point(.55,wheelRadius),seat=point(-.1,.56),handle=point(.38,.68);
 for(const pair of [[rear,seat],[seat,front],[rear,front],[seat,handle],[handle,front]])segment(...pair,'#399b8c',4);
 const hip=point(-.08,h*.72),head=point(.16,h*1.02),hand=point(.42,.73),foot=point(.15,.32);
 segment(hip,head,'#4687b0',7);segment(hip,foot,'#4687b0',5);segment(head,hand,'#4687b0',4);sphere(head,.12,'#d4ab83');sphere([s.x,s.y,s.z],.075,'#dc7958');
 sphere(center,.055,'#b46654');segment(center,[s.x,s.y,s.z],'#c7795b',1);
 if(params.comparison){const eq=simulation.equilibrium;segment(center,pos(0,h*Math.cos(eq),h*Math.sin(eq)),'#b89a48',2);label(pos(0,h*Math.cos(eq)+.25,h*Math.sin(eq)),'平衡 '+s.equilibriumLean.toFixed(1)+'°','#9a7934',10)}
 label(pos(-.15,Math.max(.3,s.y)+.6,h*si),s.lean.toFixed(1)+'° · μ需 '+s.requiredMu.toFixed(2),'#46676a',11);
 if($('forces').checked){const base=[s.x,s.y,s.z],scale=.9/(params.m*9.81);arrow(base,[base[0],base[1]+scale*s.normal,base[2]],'#a27b40','N');arrow(base,[base[0]+scale*s.fx,base[1],base[2]+scale*s.fz],'#a55d50','f');arrow(base,[base[0],base[1]-.9,base[2]],'#767eaa','mg')}
 label([0,.1,0],'指定圓形接觸軌跡；紅點為等效質心','#4c7172',10);
 if(t>=simulation.duration-1e-7&&simulation.duration<8)label(pos(0,2.2,0),'接觸失效；停止於失效前瞬間','#b0604c',12);
}
