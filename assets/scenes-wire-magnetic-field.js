'use strict';
function drawWireMagneticField(s) {
  const radius=.5+5.5*params.radius;
  const y=1.6;
  segment([0,.3,0],[0,4.45,0],'#a87b52',5);
  if(params.current!==0){
    const direction=Math.sign(params.current);
    arrow([0,2.8-.7*direction,0],[0,2.8+.7*direction,0],'#aa623d','I');
  }
  for(let i=0;i<48;i++){
    const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
    segment([radius*Math.cos(a),y,radius*Math.sin(a)],[radius*Math.cos(b),y,radius*Math.sin(b)],'#8ca9a8',1);
  }
  const position=[radius*Math.cos(s.theta),y,radius*Math.sin(s.theta)];
  sphere(position,.11,'#597f8b');
  if(s.field>1e-10){
    const tip=[position[0]+.75*s.bx/s.field,y,position[2]+.75*s.bz/s.field];
    arrow(position,tip,'#327d69','合磁場');
  }
  label([0,5,0],'導線 '+s.wireField.toFixed(1)+' μT · 合場 '+s.field.toFixed(1)+' μT','#365464',13);
  label([0,.2,0],s.field>1e-10?'磁針偏角 '+s.deflection.toFixed(0)+'°':'合場為零，磁針方向未定','#365464',12);
}
