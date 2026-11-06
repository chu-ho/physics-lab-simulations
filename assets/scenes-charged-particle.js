'use strict';
function drawChargedParticle(s) {
  const scale=simulation.drawingScale;
  const point=state=>[state.x*scale,.55+state.y*scale,state.z*scale];
  const color=params.sign>0?'#bb7559':'#5585ad';
  let previous=point(simulation.sample(0));
  for(let i=1;i<=80;i++){
    const current=point(simulation.sample(t*i/80));
    segment(previous,current,color,2);
    previous=current;
  }
  sphere(point(s),.12,color);
  arrow([-2.65,.65,0],[-2.65,3.75,0],'#4a8c78','B');
  label([0,5,0], 'r = '+s.radius.toPrecision(3)+' m · '+s.speed.toFixed(0)+' km/s','#365464',13);
}
