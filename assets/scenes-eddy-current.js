'use strict';
function drawEddyCurrent(s) {
  const y=s.height*9+.45;
  for(const [index,ring] of simulation.rings.entries()){
    const height=ring*9+.45;
    const current=s.currents[index];
    const color=Math.abs(current)<.05?'#96a8ad':current>0?'#4c9582':'#b37855';
    for(let i=0;i<24;i++){
      const a=i*Math.PI/12,b=(i+1)*Math.PI/12;
      segment([.7*Math.cos(a),height,.7*Math.sin(a)],[.7*Math.cos(b),height,.7*Math.sin(b)],color,2);
    }
  }
  box([0,y+.13,0],[.43,.26,.43],'#cb7866');
  box([0,y-.13,0],[.43,.26,.43],'#6791b8');
  label([0,5.35,0],s.physicalTime.toFixed(3)+' s · 焦耳熱 '+s.heat.toFixed(3)+' J','#365464',13);
  label([0,.13,0],'綠／橘表示環電流相反方向','#365464',11);
}
