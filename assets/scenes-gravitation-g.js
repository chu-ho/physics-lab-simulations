'use strict';
function drawGravitationG(s) {
  if (!params.mode) {
    const u = 2, // 示意放大：公尺 → 畫面單位
      y = 1.2,
      a = (s.theta * (12 * Math.PI)) / 180 / s.eq, // 平衡時畫成 12°
      c = Math.cos(a),
      n = Math.sin(a),
      rM = 0.1 * Math.cbrt(params.M / 158) * u,
      rm = 0.03 * Math.cbrt(params.m / 0.73) * u,
      L = params.l * u,
      d = params.R * u;
    segment([0, 2.7, 0], [0, y, 0], '#8f9fa6', 1);
    segment([-L * c, y, -L * n], [L * c, y, L * n], '#46616a', 3);
    segment([-L, y, 0], [L, y, 0], '#9aa9ae', 1, true);
    for (const k of [1, -1]) {
      sphere([k * L * c, y, k * L * n], rm, '#4b91bd');
      sphere([k * L, y, k * d], rM, '#7d8a90');
      segment([k * L * c, y, k * L * n], [k * L, y, k * d], '#cf7632', 1, true);
    }
    label([0, 2.95, 0], '扭秤示意（偏轉角放大）', '#426566', 12);
    label([L, y + rM + 0.25, d], '大球 M', '#5d6b70', 11);
    label([-L * c - 0.75, y, -L * n], '小球 m', '#3f7ea6', 11);
    label([0, -0.5, 0], '每對引力 ' + s.force.toExponential(2) + ' N', '#426566', 11);
    label([0, -1.2, 0], '總力矩 ' + s.torque.toExponential(2) + ' N·m', '#426566', 11);
    return;
  }
  const k = 3 / 6371,
    ph = (params.phi * Math.PI) / 180,
    rr = (s.r / 1000) * k,
    pos = [rr * Math.cos(ph), rr * Math.sin(ph), 0];
  sphere([0, 0, 0], 3, '#4b8fc2');
  ring([0, 0, 0], 3.02, 'xz', '#2f5f86', 2);
  segment([0, -3.8, 0], [0, 3.8, 0], '#8f9fa6', 1, true);
  if (params.h > 20000) ring([0, 0, 0], 3 * (42164 / 6371), 'xz', '#b7c7c4', 1);
  sphere(pos, 0.12 + 0.05 * (rr / 3), '#cf7632');
  label([0, 4, 0], '探測器 高 ' + s.hKm.toFixed(0) + ' km　g有效 ' + s.gEff.toFixed(3) + ' m/s²', '#426566', 12);
  label(
    [0, -5, 0],
    'GM/r² ' +
      s.gTrue.toFixed(3) +
      '　離心 ' +
      s.centrifugal.toFixed(3) +
      '　偏離徑向 ' +
      ((s.tilt * 180) / Math.PI).toFixed(2) +
      '°',
    '#426566',
    11
  );
  if ($('forces').checked) {
    const q = 0.12,
      a = x => [pos[0] + x[0] * q, pos[1] + x[1] * q, 0];
    arrow(pos, a([-s.gTrue * Math.cos(ph), -s.gTrue * Math.sin(ph)]), '#4b91bd', 'GM/r²');
    arrow(pos, a([s.gx, s.gy]), '#b56657', 'g 有效');
  }
}
