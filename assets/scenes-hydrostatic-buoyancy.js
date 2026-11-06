'use strict';
function drawHydrostaticBuoyancy(s) {
  const surface=3;
  const bottom=surface-1.7*s.depth;
  const height=1.7*params.height;
  const half=.43;
  const water=[[-2,surface,-1.45],[2,surface,-1.45],[2,surface,1.45],[-2,surface,1.45]];
  for(let i=0;i<4;i++){
    segment(water[i],water[(i+1)%4],'#518ea8',2);
    const point=water[i];
    segment(point,[point[0],.48,point[2]],'#9fb8c3',1);
  }
  box([0,bottom+height/2,0],[2*half,height,2*half],'#bd936e');
  if(params.equilibrium && params.block>params.fluid){
    for(const x of [-.28,.28])box([x,bottom-.09,0],[.12,.18,.64],'#8c9c9d');
  }
  if(s.buoyancy>0)arrow([-.6,bottom,0],[-.6,bottom+.65,0],'#438d76','浮力');
  arrow([.62,bottom+height,0],[.62,bottom+height-.65,0],'#a35f58','重力');
  label([-2.15,surface,0],'液面','#365464',12);
  label([0,4.85,0],'浸沒 '+s.submergedFraction.toFixed(0)+'% · 浮力 '+s.buoyancy.toFixed(1)+' N','#365464',13);
  label([0,.2,0],'底面 '+s.bottomPressure.toFixed(0)+' Pa · 頂面 '+s.topPressure.toFixed(0)+' Pa','#365464',12);
}
