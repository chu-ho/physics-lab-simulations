'use strict';
function drawPnJunction(s){
  box([-1.4,1.15,0],[2.8,.7,1.8],'#db9f92');
  box([1.4,1.15,0],[2.8,.7,1.8],'#95b0d3');
  const left=1.8*s.left,right=1.8*s.right;
  box([(right-left)/2,1.55,0],[left+right,.14,1.8],'#d6c39d');
  label([-2,2.05,0],'P 側','#98584f',12);
  label([2,2.05,0],'N 側','#486f9a',12);
  label([-left/2,1.72,0],'−','#98584f',12);
  label([right/2,1.72,0],'+','#486f9a',12);
  arrow([right,2.45,0],[-left,2.45,0],'#458976','耗盡區電場');
  for(const [band,color,name] of [['conduction','#4f7fa1','導帶 Ec'],['valence','#9d678f','價帶 Ev']]){
    let previous;
    for(let i=0;i<=100;i++){
      const x=-2.8+5.6*i/100;
      const energy=simulation.bandAt(x/1.8,s)[band];
      const point=[x,4.35+.69*energy,0];
      if(previous)segment(previous,point,color,2);
      previous=point;
    }
    label([2.9,previous[1],0],name,color,11);
  }
  label([0,7.05,0],'電子能量 · P 側至 N 側','#365464',12);
  label([0,3.9,0],'耗盡區 '+s.width.toFixed(3)+' μm','#365464',14);
  label([0,3.32,0],'障壁 '+s.barrier.toFixed(3)+' V · 偏壓 '+s.bias.toFixed(2)+' V','#365464',12);
}
