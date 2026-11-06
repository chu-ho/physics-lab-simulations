'use strict';
function drawRlcResonance(s) {
  const nodes=[[-3,1,0],[-3,3,0],[3,3,0],[3,1,0],[-3,1,0]];
  for(let i=1;i<nodes.length;i++)segment(nodes[i-1],nodes[i],'#56727c',2);
  box([-1.9,3,0],[.95,.35,.45],'#c49372');
  box([0,3,0],[.95,.35,.45],'#79a791');
  box([1.9,3,0],[.95,.35,.45],'#9db1c7');
  for(const [x,name,value] of [[-1.9,'R',s.voltageR],[0,'L',s.voltageL],[1.9,'C',s.voltageC]]){
    label([x,3.58,0],name+' '+value.toFixed(1)+' V','#365464',12);
  }
  label([0,.54,0],'交流源 '+s.voltage.toFixed(1)+' V · '+s.current.toFixed(2)+' A','#365464',13);
  label([0,4.6,0],'相位差 '+s.phaseDeg.toFixed(1)+'° · 共振 '+s.resonance.toFixed(1)+' Hz','#365464',13);
  if(Math.abs(s.current)>.001){
    const sign=Math.sign(s.current);
    arrow([-sign,1.27,0],[sign,1.27,0],'#458976','I');
  }
}
