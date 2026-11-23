'use strict';
function drawDimensionalAnalysis(s) {
  const u = 0.7,
    py = 7,
    sign = x => (x < 0 ? '−' : '') + Math.abs(x),
    ex = [params.a, params.b, params.c].map(sign);
  for (const [z, L, th, color, name, m] of [
    [-1.4, params.L, s.theta1, '#4b91bd', '甲擺', params.m],
    [1.4, 4 * params.L, s.theta2, '#cf7632', '乙擺（4L，2m）', 2 * params.m]
  ]) {
    const bob = [-0.3 + u * L * Math.sin(th), py - u * L * Math.cos(th), z];
    segment([-0.3, py, z - 0.6], [-0.3, py, z + 0.6], '#7a8d93', 4);
    segment([-0.3, py, z], bob, '#a9b3af', 2);
    sphere(bob, 0.12 + 0.12 * Math.cbrt(m), color);
    label([-0.3, py + 0.35, z], name + '　L = ' + L.toFixed(1) + ' m', color, 11);
  }
  label([2.2, 6.3, 0], 'T = k · m^' + ex[0] + ' · L^' + ex[1] + ' · g^' + ex[2], '#375868', 13);
  label(
    [2.2, 5.85, 0],
    '因次：M^' +
      sign(s.dimM) +
      ' L^' +
      sign(s.dimL) +
      ' T^' +
      sign(s.dimT) +
      '　' +
      (s.ok ? '符合 T¹ ✓' : '不是時間 ✗'),
    s.ok ? '#438d80' : '#b56657',
    12
  );
  label(
    [2.2, 5.4, 0],
    'k = ' +
      s.k.toFixed(3) +
      '　乙擺預測 ' +
      s.Tpred.toFixed(3) +
      ' s　模擬 ' +
      s.T2.toFixed(3) +
      ' s（誤差 ' +
      s.err.toFixed(1) +
      '%）',
    '#426566',
    11
  );
  if (s.ok && Math.abs(s.err) < 1) label([2.2, 4.95, 0], '甲擺定出的 k 能預測乙擺（k ≈ 2π = 6.283）', '#438d80', 11);
}
