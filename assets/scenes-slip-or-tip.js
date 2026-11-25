'use strict';
function drawSlipOrTip(s) {
  const C = simulation.coord,
    b = params.b,
    h = params.h,
    T = s.theta,
    c = Math.cos(T),
    sn = Math.sin(T),
    start = simulation.mode === 'slide' ? s.travel : 0;
  const point = (u, v, z) => {
    const q =
        simulation.mode === 'tip' ? [b / 2 + (u - b / 2) * c + v * sn, -(u - b / 2) * sn + v * c] : [u + start, v],
      xy = C(q[0], q[1]);
    return [xy[0], xy[1], z];
  };
  const left = -Math.max(3, b * 2),
    right = Math.max(5, s.travel + b + 2),
    plane = (u, z) => {
      const p = C(u, 0);
      return [p[0], p[1], z];
    };
  // 斜面畫成實心楔形，底面落到地面，物塊才看得出是站在斜面上，而不是浮在空中。
  const base = Math.min(0, plane(right, 0)[1], plane(left, 0)[1]) - 0.05,
    foot = (u, z) => [plane(u, z)[0], base, z];
  for (const z of [-2, 2])
    polygon([plane(left, z), plane(right, z), foot(right, z), foot(left, z)], '#8fa59b', '#5f7a72');
  polygon([plane(left, -2), plane(left, 2), foot(left, 2), foot(left, -2)], '#7b938a', '#5f7a72');
  polygon([plane(left, -2), plane(right, -2), plane(right, 2), plane(left, 2)], '#b3c4b5', '#5f7a72');
  for (let u = Math.ceil(left); u <= right; u++) segment(plane(u, -2), plane(u, 2), '#78938a55', 1);
  const corners = [
      [-b / 2, 0],
      [b / 2, 0],
      [b / 2, h],
      [-b / 2, h]
    ],
    front = corners.map(q => point(q[0], q[1], 0.5)),
    back = corners.map(q => point(q[0], q[1], -0.5));
  polygon(back, '#7699b6');
  polygon([back[1], front[1], front[2], back[2]], '#517c9f');
  polygon([back[2], front[2], front[3], back[3]], '#a8cadd');
  polygon(front, '#88afc8');
  for (let i = 0; i < 4; i++) {
    segment(front[i], front[(i + 1) % 4], '#385773', 1);
    segment(back[i], front[i], '#385773', 1);
  }
  sphere([s.x, s.y, 0.54], 0.09, '#af4154');
  label([s.x, s.y + 0.35, 0.6], '質心', '#874252', 11);
  const groundY = 5 - s.x * Math.tan((params.slope * Math.PI) / 180),
    projection = [s.x, groundY, 0.65];
  segment([s.x, s.y, 0.65], projection, '#b68436', 1.4, true);
  sphere(projection, 0.075, '#b68436');
  label(projection, '重力作用線投影', '#96723a', 10);
  const support = C(s.supportAlong, 0),
    a = (params.slope * Math.PI) / 180,
    scale = Math.max(0.6, Math.min(1.6, h * 0.45));
  sphere([support[0], support[1], 0.62], 0.085, '#267b69');
  if ($('forces').checked) {
    const at = [support[0], support[1], 0.7];
    arrow(at, [at[0] + Math.sin(a) * scale, at[1] + Math.cos(a) * scale, 0.7], '#267b69', 'N ' + s.N.toFixed(1) + ' N');
    if (Math.abs(s.friction) > 1e-7) {
      const sign = Math.sign(s.friction);
      arrow(
        at,
        [at[0] + sign * Math.cos(a) * scale, at[1] - sign * Math.sin(a) * scale, 0.7],
        '#a76d33',
        'f ' + s.friction.toFixed(1) + ' N'
      );
    }
    arrow([s.x, s.y, -0.65], [s.x, s.y - scale, -0.65], '#a44e62', 'mg');
  }
  const status =
    simulation.mode === 'stable' ? '平衡／臨界' : simulation.mode === 'slide' ? '底面滑動' : '繞坡下角翻倒';
  label(
    [s.x, s.y + h * 0.6 + 1, 0],
    status + ' · α滑 ' + s.slipAngle.toFixed(1) + '° · α倒 ' + s.tipAngle.toFixed(1) + '°',
    '#526c77',
    12
  );
  label(plane(left, 2), '固定坡角 ' + params.slope + '°；分力箭頭為方向示意', '#526c77', 10);
}
