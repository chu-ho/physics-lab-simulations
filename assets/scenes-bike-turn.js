'use strict';
function drawBikeTurn(s) {
  const R = simulation.contactRadius,
    h = params.h,
    a = s.theta,
    C = Math.cos(a),
    S = Math.sin(a),
    center = [s.contactX, 0, s.contactZ],
    inward = [-C, 0, -S],
    tangent = [-S, 0, C];
  function pos(along, up, inside = 0) {
    return [
      center[0] + tangent[0] * along + inward[0] * inside,
      up,
      center[2] + tangent[2] * along + inward[2] * inside
    ];
  }
  for (const rad of [R - 0.7, R, R + 0.7])
    ring([0, 0.015, 0], rad, 'xz', rad === R ? '#d4a14a' : '#88a8a1', rad === R ? 2 : 1);
  for (let j = 0; j < 24; j++) {
    const q = (j * TAU) / 24;
    segment(
      [(R - 0.65) * Math.cos(q), 0.02, (R - 0.65) * Math.sin(q)],
      [(R + 0.65) * Math.cos(q), 0.02, (R + 0.65) * Math.sin(q)],
      '#afc1b9',
      1
    );
  }
  const co = Math.cos(s.phi),
    si = Math.sin(s.phi),
    point = (along, height) => pos(along, height * co, height * si),
    wheelRadius = 0.25;
  for (const along of [-0.55, 0.55]) {
    const hub = point(along, wheelRadius);
    for (let j = 0; j < 30; j++) {
      const q = (j * TAU) / 30,
        b = ((j + 1) * TAU) / 30,
        pt = u => {
          const z = point(along + wheelRadius * Math.cos(u), wheelRadius + wheelRadius * Math.sin(u));
          return z;
        };
      segment(pt(q), pt(b), '#426468', 3);
    }
    sphere(hub, 0.045, '#bf9655');
    for (let j = 0; j < 6; j++) {
      const q = (j * TAU) / 6 - (s.theta * R) / wheelRadius;
      segment(hub, point(along + wheelRadius * Math.cos(q), wheelRadius + wheelRadius * Math.sin(q)), '#789493', 1);
    }
  }
  const rear = point(-0.55, wheelRadius),
    front = point(0.55, wheelRadius),
    seat = point(-0.1, 0.56),
    handle = point(0.38, 0.68);
  for (const pair of [
    [rear, seat],
    [seat, front],
    [rear, front],
    [seat, handle],
    [handle, front]
  ])
    segment(...pair, '#399b8c', 4);
  const hip = point(-0.08, h * 0.72),
    head = point(0.16, h * 1.02),
    hand = point(0.42, 0.73),
    foot = point(0.15, 0.32);
  segment(hip, head, '#4687b0', 7);
  segment(hip, foot, '#4687b0', 5);
  segment(head, hand, '#4687b0', 4);
  sphere(head, 0.12, '#d4ab83');
  sphere([s.x, s.y, s.z], 0.075, '#dc7958');
  sphere(center, 0.055, '#b46654');
  segment(center, [s.x, s.y, s.z], '#c7795b', 1);
  if (params.comparison) {
    const eq = simulation.equilibrium;
    segment(center, pos(0, h * Math.cos(eq), h * Math.sin(eq)), '#b89a48', 2);
    label(
      pos(0, h * Math.cos(eq) + 0.25, h * Math.sin(eq)),
      '平衡 ' + s.equilibriumLean.toFixed(1) + '°',
      '#9a7934',
      10
    );
  }
  label(
    pos(-0.15, Math.max(0.3, s.y) + 0.6, h * si),
    s.lean.toFixed(1) + '° · μ需 ' + s.requiredMu.toFixed(2),
    '#46676a',
    11
  );
  if ($('forces').checked) {
    const base = [s.x, s.y, s.z],
      scale = 0.9 / (params.m * 9.81);
    arrow(base, [base[0], base[1] + scale * s.normal, base[2]], '#a27b40', 'N');
    arrow(base, [base[0] + scale * s.fx, base[1], base[2] + scale * s.fz], '#a55d50', 'f');
    arrow(base, [base[0], base[1] - 0.9, base[2]], '#767eaa', 'mg');
  }
  label([0, 0.1, 0], '指定圓形接觸軌跡；紅點為等效質心', '#4c7172', 10);
  if (t >= simulation.duration - 1e-7 && simulation.duration < 8)
    label(pos(0, 2.2, 0), '接觸失效；停止於失效前瞬間', '#b0604c', 12);
}
