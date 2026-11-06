'use strict';
function drawGeneratorTransformer(s) {
  if(params.mode){
    for(const y of [1.25,3.2]) box([0,y,0],[3.9,.3,.45],'#82999f');
    for(const x of [-1.8,1.8]){
      box([x,2.22,0],[.32,1.92,.45],'#82999f');
      for(let i=0;i<7;i++)box([x,1.56+i*.22,0],[.57,.08,.57],x<0?'#b88368':'#648eae');
    }
    label([-2,3.85,0],'一次側 '+s.primaryVoltage.toFixed(1)+' V','#365464',12);
    label([2,3.85,0],'二次側 '+s.output.toFixed(1)+' V','#365464',12);
  }else{
    const x=Math.sin(s.phase),z=Math.cos(s.phase);
    const corners=[[-x,1.35,-z],[x,1.35,z],[x,3.35,z],[-x,3.35,-z]];
    for(let i=0;i<4;i++)segment(corners[i],corners[(i+1)%4],'#bd8556',4);
    segment([0,1,0],[0,3.75,0],'#677f86',2);
    for(const y of [1.5,2.3,3.1])arrow([-2.7,y,-1.2],[-1.4,y,-1.2],'#4f8c7d','B');
    label([0,4.2,0],'輸出 '+s.output.toFixed(1)+' V','#365464',13);
  }
  label([0,.45,0],'磁通 '+s.fluxMilli.toFixed(2)+' mWb／匝 · 負載 '+s.power.toFixed(2)+' W','#365464',13);
}
