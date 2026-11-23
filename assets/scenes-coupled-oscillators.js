'use strict';
function drawCoupledOscillators(s) {
  const A = simulation.anchor;
  box([-A, 0.8, 0], [0.3, 1.6, 1.3]);
  box([A, 0.8, 0], [0.3, 1.6, 1.3]);
  coil([-A + 0.15, 0.5, 0], [s.x - 0.25, 0.5, 0]);
  coil([s.x + 0.25, 0.5, 0], [s.x2 - 0.25, 0.5, 0], '#a38456');
  coil([s.x2 + 0.25, 0.5, 0], [A - 0.15, 0.5, 0]);
  sphere(point(s), 0.28, '#3a9da8');
  sphere([s.x2, 0.5, 0], 0.28, '#4da68a');
  label([s.x, 1.3, 0], '左 E=' + s.energy1.toFixed(2) + ' J', '#458993', 11);
  label([s.x2, 1.3, 0], '右 E=' + s.energy2.toFixed(2) + ' J', '#4b937d', 11);
  if ($('vectors').checked) arrow([s.x2, 0.5, 0], [s.x2 + s.v2 * velocityScale, 0.5, 0], quantityColors.velocity, 'v₂');
  if ($('forces').checked) arrow([s.x2, 0.5, 0], [s.x2 + s.fx2 * forceScale, 0.5, 0], '#986aaf', 'F₂');
}
