'use strict';
function drawOpticalFiber(s) {
  const sim = simulation,
    p = params,
    geo = sim.geometry,
    ray = sim.ray,
    a = sim.core,
    outer = a + sim.cladding,
    at = (q, z = 0) => [q[0], q[1], z],
    N = Math.max(24, Math.ceil(geo.length * 2));
  // 光纖：纖芯（淺藍）與包層（米色）以帶狀面表示，外加數圈截面環提示立體管狀
  const off = (c, d) => [c.p[0] + c.n[0] * d, c.p[1] + c.n[1] * d];
  for (let i = 0; i < N; i++) {
    const c0 = geo.centerline((geo.length * i) / N),
      c1 = geo.centerline((geo.length * (i + 1)) / N);
    polygon([at(off(c0, -a), -0.02), at(off(c1, -a), -0.02), at(off(c1, a), -0.02), at(off(c0, a), -0.02)], '#bfe0ea66');
    for (const sgn of [-1, 1]) {
      polygon(
        [at(off(c0, sgn * a), -0.03), at(off(c1, sgn * a), -0.03), at(off(c1, sgn * outer), -0.03), at(off(c0, sgn * outer), -0.03)],
        '#e6dcc266'
      );
      segment(at(off(c0, sgn * a)), at(off(c1, sgn * a)), '#5f8c99', 1.2);
      segment(at(off(c0, sgn * outer)), at(off(c1, sgn * outer)), '#a39572', 1);
    }
  }
  for (let k = 0; k <= 8; k++) {
    const c = geo.centerline((geo.length * k) / 8);
    let prev = null;
    for (let j = 0; j <= 24; j++) {
      const ang = (j / 24) * 2 * Math.PI,
        q = [c.p[0] + c.n[0] * outer * Math.cos(ang), c.p[1] + c.n[1] * outer * Math.cos(ang), outer * Math.sin(ang)];
      if (prev) segment(prev, q, '#a3957255', 1);
      prev = q;
    }
  }
  const mid = geo.centerline(Math.min(10, geo.length / 2));
  label(at(off(mid, outer + 0.9)), '包層 n₂ = ' + p.n2.toFixed(3), '#8a7a4f', 11);
  label(at(off(mid, 0.05)), '纖芯 n₁ = ' + p.n1.toFixed(3), '#3f6f7d', 11);

  // 受光錐：入射點往空氣側 ±θa
  const E = ray.entry;
  if (p.normals) {
    for (const sgn of [-1, 1]) {
      const th = (sgn * sim.acceptance * Math.PI) / 180;
      segment(at(E), at([E[0] - 4 * Math.cos(th), E[1] - 4 * Math.sin(th)]), '#6f9a6a', 1, true);
    }
    label(at([E[0] - 3.4, E[1] - 4 * Math.sin((sim.acceptance * Math.PI) / 180) - 1]), '受光角 θa = ' + sim.acceptance.toFixed(1) + '°', '#4f7a4b', 10);
  }

  // 光線：依時間前進；逸出段以紅色虛線
  for (const seg of ray.segments) {
    if (t < seg.t0) break;
    const f = seg.t1 > seg.t0 ? Math.min(1, (t - seg.t0) / (seg.t1 - seg.t0)) : 1,
      end = [seg.start[0] + (seg.end[0] - seg.start[0]) * f, seg.start[1] + (seg.end[1] - seg.start[1]) * f],
      escape = seg.kind === 'escape';
    segment(at(seg.start), at(end), escape ? '#d0505a' : '#e0a530', escape ? 2.5 : 2.2, escape);
  }
  sphere(at(ray.segments[0].start), 0.25, '#e8c46a');
  label(at([ray.segments[0].start[0], ray.segments[0].start[1] + 0.7]), '光源', '#7a6633', 10);
  sphere(at([s.x, s.y]), 0.16, '#f0b43c');

  // 碰壁點：全反射（藍點）／逸出（紅點），第一次碰壁與逸出點標法線與角度
  const firstWall = ray.hits[0];
  for (const h of ray.hits) {
    if (h.time > t) break;
    sphere(at(h.point), 0.1, h.tir ? '#3d7f95' : '#d0505a');
    if (p.normals && h.normal && (h === firstWall || !h.tir)) {
      segment(at([h.point[0] - h.normal[0] * 1.2, h.point[1] - h.normal[1] * 1.2]), at([h.point[0] + h.normal[0] * 1.6, h.point[1] + h.normal[1] * 1.6]), '#5d7880', 1, true);
      label(
        at([h.point[0] - h.normal[0] * 1.7, h.point[1] - h.normal[1] * 1.7]),
        'φ = ' + h.angle.toFixed(1) + '° ' + (h.tir ? '≥' : '<') + ' θc',
        h.tir ? '#3d6f80' : '#b5474f',
        10
      );
    }
  }

  // 讀值與狀態
  const b = sim.bounds;
  let y = b.max[1] - 0.6;
  const line = (text, color = '#46616a', size = 11) => {
    label([b.min[0] + 7.5, y, 0], text, color, size);
    y -= 1.15;
  };
  line('sin θc = n₂/n₁ → 臨界角 θc = ' + (p.n2 < p.n1 ? sim.critical.toFixed(2) + '°' : '不存在'), '#46616a', 12);
  line(
    'NA = √(n₁² − n₂²) = ' + sim.naRaw.toFixed(3) + (sim.naRaw >= 1 ? '（≥ 1：任何入射角都可導光）' : '　受光角 θa = ' + sim.acceptance.toFixed(2) + '°'),
    '#46616a',
    12
  );
  if (p.n2 >= p.n1) line('包層折射率不小於纖芯：界面無法全反射，光無法被導引', '#b5474f', 12);
  const escape = ray.hits.find(h => !h.tir);
  if (ray.status === 'escaped' && escape.time <= t)
    line(
      '第 ' + ray.hits.length + ' 次碰壁 φ = ' + escape.angle.toFixed(1) + '° < θc，光折射進入包層而逸出' + (p.bend && ray.hits.length > 1 ? '（彎曲處）' : ''),
      '#b5474f',
      12
    );
  else if (ray.status === 'guided')
    line(
      (t >= ray.duration ? '導光成功：' : '導光中：') + '全反射 ' + s.reflections + ' 次' + (t >= ray.duration ? '，由末端射出' : ''),
      '#2f7a55',
      12
    );
  else if (ray.status === 'end-tir') line('光到末端面時入射角過大，在端面全反射', '#b5474f', 12);
}
