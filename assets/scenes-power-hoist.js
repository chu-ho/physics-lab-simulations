'use strict';
function drawPowerHoist(s) {
  const H = params.h;
  box([0, -0.1, 0], [7, 0.2, 6], '#9fb3a9');
  for (const [z, y, v, P, avg, tag, color] of [
    [-1.6, s.yA, s.vA, s.PA, s.avgPA, 'A', '#4b91bd'],
    [1.6, s.yB, s.vB, s.PB, s.avgPB, 'B', '#cf7632']
  ]) {
    box([-1.4, (H + 1.5) / 2, z], [0.3, H + 1.5, 0.3], '#6f8b90');
    box([0, H + 1.5, z], [3, 0.25, 0.4], '#6f8b90');
    segment([-0.3, H + 1.5, z], [-0.3, 0.5 + y + 0.6, z], '#46616a', 2);
    box([-0.3, 0.25 + y, z], [0.8, 0.5, 0.8], color);
    segment([-1.4, 0, z + 0.3], [-1.4, H, z + 0.3], '#b8c4c0', 1, true);
    label([-0.3, y + 1, z], tag + ' ' + P.toFixed(0) + ' W', color, 12);
    label([1.5, H + 1.9, z], tag + '：平均功率 ' + avg.toFixed(0) + ' W　v ' + v.toFixed(2) + ' m/s', color, 11);
  }
  label(
    [0, H + 3, 0],
    '每台作功 W = ' + (s.W / 1000).toFixed(2) + ' kJ　拉力 F = ' + s.F.toFixed(0) + ' N',
    '#426566',
    12
  );
  label(
    [0, -0.7, 0],
    '機械效率 ' + (s.effMech * 100).toFixed(1) + '%　耗電能 ' + (s.Ein / 1000).toFixed(2) + ' kJ',
    '#426566',
    11
  );
}
