'use strict';
function drawProjectileExplosion(s){
 const radius=Math.max(.18,Math.min(.6,params.v*.025)),te=simulation.explosionTime;
 if($('trail').checked){
  let old=simulation.sample(0);for(let i=1;i<=50;i++){const q=simulation.sample(Math.min(s.elapsed,te)*i/50);segment([old.x,old.y,0],[q.x,q.y,0],'#607d8b80',1);old=q}
  if(s.exploded)simulation.fragments.forEach((b,j)=>{let prev=simulation.at(b,te);for(let i=1;i<=60;i++){const q=simulation.at(b,te+(Math.min(s.elapsed,b.landTime)-te)*i/60);segment([prev.x,prev.y,0],[q.x,q.y,0],j?'#8069ba99':'#158a7c99',1.5);prev=q}});
 }
 if(!s.exploded){sphere([s.x,s.y+radius,0],radius);label([s.x,s.y+radius*3,0],'未爆炸物體','#355b67',11)}
 else s.pieces.forEach((b,i)=>{sphere([b.x,b.y+radius,0],radius,i?'#8d75c3':'#199a87');label([b.x,b.y+radius*3,0],(i?'B':'A')+' '+b.mass.toFixed(2)+' kg'+(b.landed?' · 已落地':''),i?'#76579e':'#167a6d',11);if(b.landed)segment([b.x,0,-radius*2],[b.x,0,radius*2],i?'#76579e':'#167a6d',2)});
 const o=simulation.origin;segment([o.x,0,-radius*3],[o.x,o.y,-radius*3],'#be863c80',1,true);label([o.x,o.y+radius*4,0],'爆炸 '+te.toFixed(2)+' s','#a36a2e',11);
 if(s.flash>0)for(let k=0;k<12;k++){const a=k*Math.PI/6,r=radius*(2+5*(1-s.flash));segment([o.x+Math.cos(a)*r*.4,o.y+Math.sin(a)*r*.4,0],[o.x+Math.cos(a)*r,o.y+Math.sin(a)*r,0],'#dc942c',2)}
 segment([s.x-radius*.7,s.y,0],[s.x+radius*.7,s.y,0],'#d55c4f',2);segment([s.x,s.y-radius*.7,0],[s.x,s.y+radius*.7,0],'#d55c4f',2);label([s.x,s.y+radius*5,0],s.landed?'質心 · 已受地面外衝量':'質心 · 沿原拋物線','#b25346',11);
}

