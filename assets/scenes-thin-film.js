'use strict';
function drawThinFilm(s) {
  box([0,.6,0], [5,.6,2.6], '#87aab7');
  const thickness = params.thickness ? .14 + .42 * params.thickness / 1200 : 0;
  if (thickness) box([0,.9+thickness/2,0], [5,thickness,2.6], '#9fc7ac');
  const surface = .9 + thickness;
  const angle = params.angle * Math.PI / 180;
  const dx = 1.9 * Math.sin(angle);
  const dy = 1.9 * Math.cos(angle);
  arrow([-dx,surface+dy,0], [0,surface,0], '#a36838', '入射');
  if (s.reflectance > 1e-6) arrow([0,surface,0], [dx,surface+dy,0], '#8a529b', '反射');
  label([0,3.45,0], s.wavelength.toFixed(0) + ' nm · 反射 ' + s.reflectance.toFixed(2) + '%', '#365464', 14);
  label([0,.23,0], '膜厚 ' + params.thickness + ' nm', '#365464', 12);
}
