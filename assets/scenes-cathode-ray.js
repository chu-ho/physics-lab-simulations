'use strict';
function drawCathodeRay(s) {
  const k = 25,
    axis = 2,
    G = simulation.geometry;
  const at = (x, y = 0, z = 0) => [x * k, axis + y * k, z * k];
  const halfGap = (G.GAP / 2) * k,
    plateEnd = G.PLATE * k,
    screenX = G.SCREEN * k,
    glass = '#9fb6bd';
  // 玻璃管輪廓（軸對稱示意）
  const tube = (x, r) => {
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        b = ((i + 1) * Math.PI) / 12;
      segment([x, axis + r * Math.cos(a), r * Math.sin(a)], [x, axis + r * Math.cos(b), r * Math.sin(b)], glass, 1);
    }
  };
  tube(-1.6, 0.45);
  tube(-0.2, 0.45);
  tube(screenX, 1.55);
  for (const [y, z] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
  ]) {
    segment([-1.6, axis + 0.45 * y, 0.45 * z], [-0.2, axis + 0.45 * y, 0.45 * z], glass, 1);
    segment([-0.2, axis + 0.45 * y, 0.45 * z], [screenX, axis + 1.55 * y, 1.55 * z], glass, 1);
  }
  // 電子槍：陰極與陽極
  box(at(G.CATHODE - 0.003), [0.12, 0.42, 0.42], '#b5643f');
  label(at(G.CATHODE, 0.017), '陰極 −', '#8a3f22', 11);
  for (const y of [1, -1]) box([G.ANODE * k, axis + y * 0.22, 0], [0.08, 0.3, 0.5], '#8b9aa0');
  label(at(G.ANODE, -0.019), '陽極 +' + params.accel + ' V', '#365464', 11);
  // 偏向板：上板電位高時為正極
  const upper = params.deflect >= 0 ? '#d88b68' : '#6996c2',
    lower = params.deflect >= 0 ? '#6996c2' : '#d88b68';
  box([plateEnd / 2, axis + halfGap + 0.03, 0], [plateEnd, 0.06, 0.8], upper);
  box([plateEnd / 2, axis - halfGap - 0.03, 0], [plateEnd, 0.06, 0.8], lower);
  if (params.deflect !== 0) {
    label([plateEnd / 2, axis + halfGap + 0.28, 0], params.deflect > 0 ? '+' : '−', '#365464', 13);
    label([plateEnd / 2, axis - halfGap - 0.28, 0], params.deflect > 0 ? '−' : '+', '#365464', 13);
    const down = params.deflect > 0 ? -1 : 1;
    for (const x of [0.3, 0.95])
      arrow(
        [x, axis - down * (halfGap - 0.05), -0.3],
        [x, axis + down * (halfGap - 0.05), -0.3],
        '#417563',
        x < 0.5 ? 'E' : ''
      );
  }
  // 磁場（沿 ±z）與線圈
  if (params.field !== 0) {
    const dir = params.field > 0 ? -1 : 1;
    ring([plateEnd / 2, axis, 0.75], 0.7, 'xy', '#8f7a52', 2);
    ring([plateEnd / 2, axis, -0.75], 0.7, 'xy', '#8f7a52', 2);
    for (const x of [0.25, 0.65, 1.05])
      arrow(
        [x, axis + halfGap + 0.45, -0.55 * dir],
        [x, axis + halfGap + 0.45, 0.55 * dir],
        '#3f7fb5',
        x === 1.05 ? 'B' : ''
      );
  }
  // 螢光幕與刻度（每 1 cm）
  const R = 1.4;
  polygon(
    [
      [screenX, axis - R, -R],
      [screenX, axis + R, -R],
      [screenX, axis + R, R],
      [screenX, axis - R, R]
    ],
    'rgba(150,214,160,0.55)',
    '#5f8f6a'
  );
  for (let cm = -5; cm <= 5; cm++)
    segment(
      [screenX - 0.01, axis + cm * 0.25, -0.12 * (cm % 5 ? 1 : 2)],
      [screenX - 0.01, axis + cm * 0.25, 0.12 * (cm % 5 ? 1 : 2)],
      '#3d6b48',
      1
    );
  // 電子軌跡與目前位置
  const color = '#2b6fd6';
  let previous = at(simulation.sample(0).x, simulation.sample(0).y);
  for (let i = 1; i <= 120; i++) {
    const q = simulation.sample((t * i) / 120),
      next = at(q.x, q.y);
    segment(previous, next, color, 2);
    previous = next;
  }
  sphere(at(s.x, s.y), 0.07, color);
  const arrived = simulation.screenY !== null && t >= simulation.duration - 1e-9;
  if (arrived) sphere(at(G.SCREEN, simulation.screenY), 0.12, '#7dff8a');
  // 讀值標籤
  const fmt = v => (v / 1e11).toFixed(3) + '×10¹¹ C/kg';
  label(
    [1.8, 4.35, 0],
    'v₀ = ' + (simulation.flight.v0 / 1e6).toFixed(2) + '×10⁶ m/s · 動能 ' + s.kinetic.toFixed(0) + ' eV',
    '#365464',
    13
  );
  const need =
    'B = ' +
    simulation.balanceField.toFixed(3) +
    ' mT' +
    (Math.abs(simulation.balanceField) > 1 ? '（超出拉桿範圍）' : '');
  const selector =
    simulation.selectorSpeed === null
      ? params.deflect === 0
        ? '偏向電壓為零：只有磁場時電子做圓弧偏轉'
        : '光束直行所需 ' + need + '（E = vB）'
      : 'E/B = ' + (simulation.selectorSpeed / 1e6).toFixed(2) + '×10⁶ m/s · 直行需 ' + need;
  label([1.8, 3.98, 0], selector, '#3f6f8f', 11);
  const estimate =
    simulation.estimate === null
      ? '推算 e/m：需同時有 E 與 B，且只開電場時光點落在螢幕上'
      : '推算 e/m = ' + fmt(simulation.estimate) + '（真值 ' + fmt(simulation.trueRatio) + '）';
  label([1.8, 0.45, 0], estimate, '#a15b36', 11);
  label(
    [screenX, axis - R - 0.3, 0],
    simulation.screenY === null
      ? simulation.outcome === 'hit'
        ? '電子撞上偏向板'
        : '電子未到達螢幕'
      : '光點 Y = ' + (simulation.screenY * 1000).toFixed(1) + ' mm',
    '#2f6a3c',
    12
  );
}
