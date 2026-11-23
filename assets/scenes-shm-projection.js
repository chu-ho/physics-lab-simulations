'use strict';
function drawShmProjection(s) {
  const p = params,
    A = p.A,
    cy = s.centerY,
    r = Math.max(0.07, A * 0.055),
    c = [s.circleX, s.circleY, 0],
    px = [s.q, cy, 0],
    py = [0, cy + s.qy, 0];
  ring([0, cy, 0], A, 'xy', '#607a82', 2);
  segment([-A - 0.4, cy, 0], [A + 0.4, cy, 0], '#607a8260', 1);
  segment([0, cy - A - 0.4, 0], [0, cy + A + 0.4, 0], '#607a8260', 1);
  // Orthogonal guide lines are geometry, never displacement vectors.
  if (p.showX) {
    segment(c, px, '#168579', 1, true);
    sphere(px, r, '#168579');
    label([s.q, cy - 0.32, 0], 'x 投影', '#168579', 11);
  }
  if (p.showY) {
    segment(c, py, '#8b5ac4', 1, true);
    sphere(py, r, '#8b5ac4');
    label([-0.45, cy + s.qy, 0], 'y 投影', '#8b5ac4', 11);
  }
  sphere(c, r * 1.15, '#d58243');
  sphere([0, cy, 0], r * 0.35, '#607a82');
  label([0, cy + A + 0.55, 0], '圓周質點 · ' + p.m + ' kg', '#a65e28', 11);
  label([A + 0.35, cy - 0.4, 0], '+x', '#46616a', 11);
  label([0.25, cy + A + 0.15, 0], '+y', '#46616a', 11);
  label(
    [0, cy - A - 0.65, 0],
    'θ = ' + ((s.theta * 180) / Math.PI).toFixed(1) + '° · T = ' + p.period + ' s',
    '#46616a',
    11
  );
  // Dedicated scales preserve physical relative components at every phase.
  const vs = 0.45 / s.omega,
    as = 0.35 / (s.omega * s.omega);
  if (p.showV) {
    arrow(c, [c[0] + s.circleVx * vs, c[1] + s.circleVy * vs, 0], quantityColors.velocity, 'v圓');
    if (p.showX) arrow(px, [px[0] + s.vx * vs, px[1], 0], '#168579', 'vₓ');
    if (p.showY) arrow(py, [0, py[1] + s.vyProjection * vs, 0], '#8b5ac4', 'vᵧ');
  }
  if (p.showA) {
    arrow(c, [c[0] + s.circleAx * as, c[1] + s.circleAy * as, 0], '#c65b65', 'a圓');
    if (p.showX) arrow(px, [px[0] + s.ax * as, px[1], 0], '#c65b65', 'aₓ');
    if (p.showY) arrow(py, [0, py[1] + s.ayProjection * as, 0], '#c65b65', 'aᵧ');
  }
}
