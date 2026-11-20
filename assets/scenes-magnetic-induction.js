'use strict';
function drawMagneticInduction(s) {
  const [x, y] = point(s);
  const radius = simulation.radius * simulation.displayScale;
  const positive = s.emf > 0;
  const color = Math.abs(s.emf) < 0.00001 ? '#607a82' : positive ? colors.mint : colors.orange;
  const turnCount = 3 + Math.round(params.turns / 50);
  segment([-5, y, 0], [5, y, 0], '#68828c', 1, true);
  for (let turn = 0; turn < turnCount; turn++) {
    const offset = 0.04 * (turn - (turnCount - 1) / 2);
    const at = theta => [offset, y + radius * Math.cos(theta), radius * Math.sin(theta)];
    for (let i = 0; i < 48; i++) segment(at((i * TAU) / 48), at(((i + 1) * TAU) / 48), color, 2);
  }
  box([x - 0.26, y, 0], [0.52, 0.5, 0.5], params.polarity > 0 ? '#466f9b' : '#b45046');
  box([x + 0.26, y, 0], [0.52, 0.5, 0.5], params.polarity > 0 ? '#b45046' : '#466f9b');
  label([x - 0.28, y + 0.48, 0], params.polarity > 0 ? 'S' : 'N', '#355461', 13);
  label([x + 0.28, y + 0.48, 0], params.polarity > 0 ? 'N' : 'S', '#355461', 13);
  arrow([0, y + radius + 0.18, 0], [0.9, y + radius + 0.18, 0], '#466f9b', '+x');
  for (const z of [-0.17, 0.17]) {
    const terminal = [0, y - Math.sqrt(radius ** 2 - z ** 2), z];
    segment(terminal, [0, 0.35, z], color, 2);
    segment([0, 0.35, z], [1.4, 0.35, z], color, 2);
  }
  box([1.55, 0.4, 0], [0.35, 0.42, 0.5], '#9cb1b8');
  label([2.15, 0.75, 0], 'ε = ' + s.emfMilli.toFixed(2) + ' mV', color, 13);
  label([0, y + radius + 0.65, 0], params.turns + ' 匝 · Φ = ' + s.fluxMilli.toFixed(3) + ' mWb', '#355461', 12);
}
