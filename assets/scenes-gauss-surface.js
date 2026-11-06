'use strict';
function drawGaussSurface(s) {
  const center=2.45;
  for(const [i,n] of simulation.directions.entries()){
    const normalField=simulation.fieldNormal(n,s.offset);
    const point=[n[0]*params.radius,center+n[1]*params.radius,n[2]*params.radius];
    const color=normalField>=0?'#538f7b':'#aa6c9d';
    sphere(point,.027,color);
    if(i%12===0 && normalField!==0){
      const length=.14+.22*Math.min(1,Math.abs(normalField)/100);
      const tip=point.map((value,axis)=>value+Math.sign(normalField)*n[axis]*length);
      arrow(point,tip,color,'');
    }
  }
  sphere([s.offset,center,0],.13,params.charge>=0?'#d88958':'#668dba');
  label([0,5.05,0], s.onSurface?'點電荷位於球面 · 通量未定義':'淨通量 '+s.flux.toFixed(1)+' N·m²/C','#365464',13);
  label([0,.13,0], '綠色向外 · 紫色向內', '#365464', 11);
}
