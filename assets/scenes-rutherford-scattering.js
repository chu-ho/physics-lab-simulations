'use strict';
function drawRutherfordScattering(s) {
  const point=state=>[state.x/100,1.3,state.z/100];
  sphere([0,1.3,0],.075,'#a66447');
  const radius=params.cloudRadius/100;
  for(let i=0;i<48;i++){
    const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
    segment([radius*Math.cos(a),1.3,radius*Math.sin(a)],
      [radius*Math.cos(b),1.3,radius*Math.sin(b)],'#9bafa7',1);
  }
  for(const [sim,state,color] of [[simulation.nucleus,s.concentrated,'#b66d45'],[simulation.cloud,s.diffuse,'#328977']]){
    let previous=point(sim.sample(0));
    for(let i=1;i<=100;i++){
      const current=point(sim.sample(simulation.modelDuration*t*i/1000));
      segment(previous,current,color,2);
      previous=current;
    }
    sphere(point(state),.085,color);
  }
  label([0,4,0],'集中電荷 '+s.nucleusAngle.toFixed(1)+'° · 擴散電荷 '+s.cloudAngle.toFixed(1)+'°','#365464',13);
  label([0,.25,0],'橘色：點核 · 綠色：均勻正電球','#365464',12);
}
