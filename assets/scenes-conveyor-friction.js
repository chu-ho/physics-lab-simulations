'use strict';
function drawConveyorFriction(s) {
  const left = simulation.bounds.min[0],
    right = simulation.bounds.max[0],
    r = 0.45;
  // 長帶面切成約 1 m 小段分別排序深度；整條一個面時平均深度在帶子中央，近端的箱子會被畫在帶面之下。
  const pieces = Math.max(1, Math.ceil(right - left)),
    w = (right - left) / pieces;
  for (let i = 0; i < pieces; i++) {
    const cx = left + (i + 0.5) * w;
    box([cx, 0.72, 0], [w, 0.18, 1.7], '#507c79');
    box([cx, 1.18, 0], [w, 0.13, 1.7], '#446f70');
  }
  // Marks circulate around the rounded belt path at its actual prescribed displacement.
  const length = right - left,
    total = 2 * length + 2 * Math.PI * r,
    point = q => {
      q = ((q % total) + total) % total;
      if (q < length) return [left + q, 1.2, 0.91];
      q -= length;
      if (q < Math.PI * r) {
        const a = Math.PI / 2 - q / r;
        return [right + r * Math.cos(a), 0.75 + r * Math.sin(a), 0.91];
      }
      q -= Math.PI * r;
      if (q < length) return [right - q, 0.3, 0.91];
      q -= length;
      const a = -Math.PI / 2 - q / r;
      return [left + r * Math.cos(a), 0.75 + r * Math.sin(a), 0.91];
    };
  for (let j = 0; j < Math.ceil(total / 0.8); j++) {
    const q = point(j * 0.8 + s.beltX);
    segment([q[0], q[1], -0.78], [q[0], q[1], 0.78], '#e4c574', 1.5);
  }
  for (const cx of [left, right]) {
    ring([cx, 0.75, 0], r, 'xy', '#6b9d94', 3);
    for (let j = 0; j < 6; j++) {
      const a = -s.beltX / r + (j * TAU) / 6;
      segment([cx, 0.75, 0], [cx + r * Math.cos(a), 0.75 + r * Math.sin(a), 0], '#668a89', 2);
    }
  }
  box([s.x, s.y, 0], [0.9, 0.8, 0.9], s.sticking ? '#76b49c' : '#dda96a');
  label([s.x, s.y + 0.75, 0], s.sticking ? '靜摩擦黏住' : '相對滑動', '#426566', 12);
  label([s.x, s.y + 1.1, 0], 'Q ' + s.Q.toFixed(2) + ' J · f ' + s.friction.toFixed(2) + ' N', '#426566', 11);
  const base = [s.x, 1.3, 0.8],
    scale = 0.5;
  if ($('vectors').checked) {
    if (Math.abs(s.vB) > 0.01)
      arrow(base, [base[0] + scale * s.vB, base[1], base[2]], '#4b91bd', 'v帶 ' + s.vB.toFixed(2));
    if (Math.abs(s.vx) > 0.01)
      arrow([s.x, 2.25, 0.8], [s.x + scale * s.vx, 2.25, 0.8], '#438d80', 'v箱 ' + s.vx.toFixed(2));
  }
  if ($('forces').checked && Math.abs(s.friction) > 1e-7)
    arrow(
      [s.x, 1.7, -0.6],
      [s.x + 0.7 * Math.sign(s.friction), 1.7, -0.6],
      '#b56657',
      'f ' + s.friction.toFixed(2) + ' N'
    );
  label([s.x, 0.1, 1.2], '無限帶示意窗；摩擦箭頭只示方向', '#426566', 10);
}
