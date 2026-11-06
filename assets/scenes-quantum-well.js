'use strict';
function drawQuantumWell(s) {
  const lanes = [
    ['real','實部 Re ψ','#316b99',.5,1.15],
    ['imaginary','虛部 Im ψ','#925a9d',.5,2.4],
    ['density','機率密度 |ψ|²','#348772',.32,3.15]
  ];
  for(const [key,name,color,multiplier,base] of lanes){
    segment([-2.5,base,0],[2.5,base,0],'#82939a',1);
    let previous;
    for(let i=0;i<=100;i++){
      const wave=simulation.waveAt(params.width*i/100,t);
      const point=[-2.5+i/20,base+multiplier*wave[key]*Math.sqrt(params.width)**(key==='density'?2:1),0];
      if(previous)segment(previous,point,color,2);
      previous=point;
    }
    label([-2.5,base+.38,0],name,color,11);
  }
  for(const x of [-2.5,2.5]) segment([x,.4,0],[x,4.45,0],'#5a7480',2);
  label([0,4.76,0], 'L = '+params.width.toFixed(1)+' nm · '+s.physicalTime.toFixed(2)+' fs','#365464',13);
}
