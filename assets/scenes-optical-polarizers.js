'use strict';
function drawOpticalPolarizers(s) {
  const height=2;
  const plate=(x,degrees,color)=>{
    for(let i=0;i<32;i++){
      const a=i*Math.PI/16,b=(i+1)*Math.PI/16;
      segment([x,height+Math.cos(a),Math.sin(a)],[x,height+Math.cos(b),Math.sin(b)],color,2);
    }
    const angle=degrees*Math.PI/180;
    const y=.84*Math.cos(angle),z=.84*Math.sin(angle);
    segment([x,height-y,-z],[x,height+y,z],color,4);
    label([x,3.3,0],degrees.toFixed(0)+'°',color,12);
  };
  const beam=(from,to,power)=>{
    if(power>1e-8)segment([from,height,0],[to,height,0],'#c18848',1+5*Math.sqrt(power/100));
  };
  beam(-4.35,-2.6,100);
  beam(-2.6,0,s.afterFirst);
  beam(0,2.6,s.beforeAnalyzer);
  beam(2.6,4.35,s.output);
  plate(-2.6,0,'#507e9a');
  if(params.middle)plate(0,params.middleAngle,'#498e7a');
  plate(2.6,s.analyzerAngle,'#926b9e');
  label([0,4.1,0],'入射 100% · 輸出 '+s.output.toFixed(2)+'%','#365464',14);
}
