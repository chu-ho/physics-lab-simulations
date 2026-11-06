'use strict';
function drawBlackbodyRadiation(s) {
  sphere([-1.5,1.4,0], .7, '#db9054');
  sphere([1.5,1.4,0], .7, '#6aafa2');
  label([-1.5,2.4,0], params.temperature + ' K', '#99562c', 14);
  label([1.5,2.4,0], params.reference + ' K', '#287768', 14);
  label([0,3.35,0], '掃描波長 ' + s.wavelength.toFixed(0) + ' nm', '#365464', 13);
  label([0,.32,0], '主要峰值 ' + s.peak.toFixed(0) + ' nm', '#365464', 13);
}
