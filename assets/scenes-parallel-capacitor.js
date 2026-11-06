'use strict';
function drawParallelCapacitor(s) {
  const gap=.45+s.distance*160;
  const side=3*Math.sqrt(params.area/160);
  const left=-gap/2, right=gap/2;
  box([left,1.75,0],[.12,side,side],'#d88b68');
  box([right,1.75,0],[.12,side,side],'#6996c2');
  for(const z of [-.24,0,.24]) arrow([left+.08,1.75,z],[right-.08,1.75,z],'#417563','');
  label([left,3.45,0], '+Q', '#a15b36', 13);
  label([right,3.45,0], '−Q', '#3a628a', 13);
  label([0,.2,0], s.voltage.toFixed(2)+' V · '+s.energy.toFixed(1)+' pJ', '#365464', 13);
}
