'use strict';

function drawMillikanOilDrop(s) {
  const bottom = 0.5,
    top = 3.5,
    gapUnit = top - bottom;
  box([0, top + 0.07, 0], [5, 0.14, 3], '#c98f78');
  box([0, bottom - 0.07, 0], [5, 0.14, 3], '#7896a3');
  label([2.9, top + 0.2, 0], '上板 +', '#855740', 12);
  label([2.9, bottom - 0.5, 0], '下板 −', '#3c697b', 12);
  // 電源與導線
  segment([-2.5, top + 0.07, 0], [-3, top + 0.07, 0], '#526c76', 2);
  segment([-3, top + 0.07, 0], [-3, bottom - 0.07, 0], '#526c76', 2);
  segment([-3, bottom - 0.07, 0], [-2.5, bottom - 0.07, 0], '#526c76', 2);
  label([-3, (top + bottom) / 2 + 0.1, 0], 'V = ' + params.voltage.toFixed(1) + ' V', '#375765', 12);
  label([-3, (top + bottom) / 2 - 0.3, 0], 'E = ' + s.fieldStrength.toFixed(1) + ' kV/m ↓', '#576577', 11);
  // 電場線（向下）
  for (const x of [-1.6, -0.8, 0.8, 1.6])
    if (params.voltage > 0) segment([x, top, -0.9], [x, bottom, -0.9], '#9aa9ba', 1, true);
  // 目鏡刻度：每 0.5 mm 一格
  for (let i = 0; i <= 10; i++) {
    const y = bottom + (gapUnit * i) / 10;
    segment([2.35, y, 0.8], [2.35 + (i % 2 ? 0.1 : 0.2), y, 0.8], '#6a7d88', 1);
    if (i % 2 === 0) label([2.85, y - 0.1, 0.8], (i / 2).toFixed(0) + ' mm', '#6a7d88', 10);
  }
  segment([2.35, bottom, 0.8], [2.35, top, 0.8], '#6a7d88', 1);
  // 油滴與受力
  const y = bottom + (s.height / 5) * gapUnit,
    drop = [0, y, 0];
  sphere(drop, 0.09, '#d39b45');
  const scale = 0.6;
  arrow([0.35, y, 0], [0.35, y - scale, 0], '#7a5aa6', 'mg');
  if (s.fieldForce > 0)
    arrow([-0.35, y, 0], [-0.35, y + Math.min(1.6, (scale * s.fieldForce) / s.weight), 0], '#c0603a', 'qE');
  const status = s.stuck
    ? '油滴已碰板'
    : Math.abs(s.velocity) < 0.5
      ? '接近懸浮'
      : s.velocity > 0
        ? '向上等速 ' + s.velocity.toFixed(1) + ' μm/s'
        : '向下等速 ' + (-s.velocity).toFixed(1) + ' μm/s';
  label([0, top + 0.75, 0], '油滴 ' + params.drop + '：' + status, '#376b6e', 13);
  label(
    [0, top + 1.15, 0],
    '半徑 ' + s.radius.toFixed(2) + ' μm（由無電場下落速度 ' + s.fallSpeed.toFixed(1) + ' μm/s 反推）',
    '#576577',
    11
  );
  label(
    [0, bottom - 0.95, 0],
    '懸浮 q = mgd/V 推得 ' + (s.balanceCharge ? s.balanceCharge.toFixed(2) : '—') + ' × 10⁻¹⁹ C',
    '#375765',
    12
  );
}
