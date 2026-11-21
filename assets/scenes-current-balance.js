'use strict';
function drawCurrentBalance(s) {
  const pivotY = 2.4,
    front = 1.8,
    back = -1.6,
    half = 0.3 + 7 * (params.length / 100),
    tilt = (s.tilt * Math.PI) / 180;
  const turn = p => {
    const dy = p[1] - pivotY;
    return [p[0], pivotY + dy * Math.cos(tilt) + p[2] * Math.sin(tilt), -dy * Math.sin(tilt) + p[2] * Math.cos(tilt)];
  };
  const add = (a, b, k = 1) => a.map((v, i) => v + k * b[i]);
  const frame = '#a87b52',
    currentColor = '#c2552f',
    fieldColor = '#3f7fb5',
    forceColor = '#1f8a5a',
    weightColor = '#7a5aa8';
  // 支架與刀口
  for (const x of [-half - 0.35, half + 0.35]) {
    segment([x, 0, 0], [x, pivotY - 0.08, 0], '#6d7f86', 4);
    sphere([x, pivotY, 0], 0.07, '#4f646b');
  }
  box([0, 0.06, 0], [2 * half + 1.4, 0.12, 0.8], '#9aa9ad');
  // 天平框架（兩側導軌 + 前端在磁場中的導線段）
  for (const x of [-half, half]) segment(turn([x, pivotY, back]), turn([x, pivotY, front]), frame, 3);
  segment(turn([-half, pivotY, back]), turn([half, pivotY, back]), frame, 3);
  segment(turn([-half, pivotY, front]), turn([half, pivotY, front]), currentColor, 5);
  // 後端指針與刻度
  const tip = turn([0, pivotY - 0.9, back]);
  segment(turn([0, pivotY, back]), tip, '#4f646b', 2);
  for (let k = -2; k <= 2; k++)
    segment(
      [-0.18, pivotY - 0.9 + 0.22 * k, back - 0.05],
      [0.18, pivotY - 0.9 + 0.22 * k, back - 0.05],
      '#93a5ab',
      k ? 1 : 2
    );
  label([0.75, pivotY - 0.9, back], '仰角 ' + s.tilt.toFixed(1) + '°', '#365464', 11);
  // 磁極與均勻磁場（水平面內，與 +x 夾 θ）
  const center = [0, pivotY, front],
    b = simulation.field,
    bSize = Math.hypot(...b),
    unit =
      bSize > 0
        ? b.map(v => v / bSize)
        : [Math.cos((params.angle * Math.PI) / 180), 0, -Math.sin((params.angle * Math.PI) / 180)],
    side = [-unit[2], 0, unit[0]],
    gap = half + 0.75;
  box(add(center, unit, -gap), [0.5, 0.9, 0.5], '#c76d5b');
  box(add(center, unit, gap), [0.5, 0.9, 0.5], '#5b86c7');
  label(add(add(center, unit, -gap), [0, 0.65, 0]), 'N', '#9b3f2f', 13);
  label(add(add(center, unit, gap), [0, 0.65, 0]), 'S', '#2f5a9b', 13);
  if (bSize > 0)
    for (const k of [-0.45, 0, 0.45]) {
      const start = add(add(center, side, k), unit, -gap + 0.35);
      arrow(
        add(start, [0, -0.35, 0]),
        add(add(start, unit, 2 * gap - 0.7), [0, -0.35, 0]),
        fieldColor,
        k === 0.45 ? 'B' : ''
      );
    }
  // 電流方向、磁力、砝碼重量
  const mid = turn(center),
    sign = Math.sign(s.currentNow);
  if (sign)
    arrow(turn([-0.55 * sign * half, pivotY, front]), turn([0.75 * sign * half, pivotY, front]), currentColor, 'I');
  const perMilliNewton = 1 / 25;
  if (Math.abs(s.force) > 0.05) {
    const length = Math.max(-1.8, Math.min(1.8, s.force * perMilliNewton));
    arrow(add(mid, [0.12, 0, 0]), add(mid, [0.12, length, 0]), forceColor, 'F = IL×B');
  }
  if (params.mass > 0) {
    const rider = add(mid, [-0.35, 0.16, 0]);
    box(rider, [0.26, 0.22, 0.26], '#8d7bb0');
    arrow(
      add(rider, [-0.05, -0.12, 0]),
      add(rider, [-0.05, -0.12 - Math.min(1.8, s.weight * perMilliNewton), 0]),
      weightColor,
      'mg'
    );
  }
  // 右手定則：四指由 I 轉向 B，拇指指向 F
  const u = [sign || 1, 0, 0],
    cosine = u[0] * unit[0] + u[2] * unit[2],
    alpha = Math.acos(Math.max(-1, Math.min(1, cosine)));
  if (sign && bSize > 0 && alpha > 0.05 && alpha < Math.PI - 0.05) {
    const radius = 0.55,
      at = f =>
        add(
          mid,
          add(
            u.map(v => (v * Math.sin((1 - f) * alpha)) / Math.sin(alpha)),
            unit.map(v => (v * Math.sin(f * alpha)) / Math.sin(alpha))
          ).map(v => v * radius)
        );
    let previous = at(0);
    for (let i = 1; i <= 16; i++) {
      const next = at(i / 16);
      if (i < 16) segment(previous, next, '#d39b3a', 2);
      else arrow(previous, next, '#d39b3a', '');
      previous = next;
    }
  }
  const handNote =
    !sign || bSize === 0
      ? '電流或磁場為零：無磁力'
      : alpha <= 0.05 || alpha >= Math.PI - 0.05
        ? 'I 與 B 平行：F = 0'
        : '右手：四指由 I 彎向 B，拇指指向 F（' + (s.force > 0 ? '向上' : '向下') + '）';
  label(
    [0, 4.35, 0],
    'I = ' + s.currentNow.toFixed(2) + ' A · F = ' + s.force.toFixed(1) + ' mN · mg = ' + s.weight.toFixed(1) + ' mN',
    '#365464',
    13
  );
  label([0, 3.95, 0], handNote, '#8a5a1c', 11);
  const balance = simulation.balanceCurrent;
  label(
    [0, 0.35, front],
    params.mass === 0
      ? '未放砝碼'
      : balance === null || !Number.isFinite(balance)
        ? '此夾角／磁場下磁力為零，無法平衡'
        : '平衡電流 I = mg/(LB sinθ) = ' + balance.toFixed(2) + ' A',
    '#a15b36',
    11
  );
}
