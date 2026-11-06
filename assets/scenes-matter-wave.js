'use strict';
function drawMatterWave(s) {
  box([0,1.8,.13],[5.7,2.35,.2],'#dde6e8');
  for (let i=0;i<s.count;i++) {
    const [x,y]=simulation.hits[i];
    sphere([x/45,1.8+y*2,.01],.018,'#2e727c');
  }
  label([0,3.45,0], '電子落點 · '+s.count+' 次', '#365464', 14);
  label([0,.35,0], params.whichPath ? '完整路徑資訊' : '兩路相干', '#365464', 13);
}
