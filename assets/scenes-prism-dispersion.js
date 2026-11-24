'use strict';
function drawPrismDispersion(s) {
  const sim = simulation,
    p = params,
    geo = sim.geometry,
    depth = 0.9,
    at = (q, z = 0) => [q[0], q[1], z],
    traces = sim.tracesAt(t),
    ref = traces[p.ref],
    band = sim.bands[p.ref];
  // 三稜柱：前後三角形與三個側面（半透明，讓內部光路可見）
  const corners = [geo.B1, geo.T, geo.B2];
  polygon(
    corners.map(q => at(q, -depth)),
    '#bcd7de55',
    '#6f8f99'
  );
  polygon(
    corners.map(q => at(q, depth)),
    '#bcd7de44',
    '#6f8f99'
  );
  for (let i = 0; i < 3; i++) {
    const a = corners[i],
      b = corners[(i + 1) % 3];
    polygon([at(a, -depth), at(b, -depth), at(b, depth), at(a, depth)], i === 2 ? '#a9c3ca55' : '#cfe4e933', '#7b98a2');
  }
  label(at([geo.T[0], geo.T[1] + 0.35], depth), '頂角 A = ' + p.apex + '°', '#3f6470', 12);
  label(at([0, -0.35], depth), sim.material.name + '（n' + band.name + ' = ' + sim.refN.toFixed(4) + '）', '#3f6470', 11);

  // 光線：入射白光＋七色，依時間由光源前進（掃描模式則整條顯示）
  const front = s.front;
  const drawPath = (points, color, width) => {
    let left = front;
    for (let i = 1; i < points.length && left > 0; i++) {
      const a = points[i - 1],
        b = points[i],
        L = Math.hypot(b[0] - a[0], b[1] - a[1]),
        f = Math.min(1, left / L);
      segment(at(a), at([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]), color, width);
      left -= L;
    }
  };
  const white = ref.points.slice(0, 2);
  drawPath(white, '#f4efe1', 5);
  drawPath(white, '#8d8a80', 1.2);
  sim.bands.forEach((b, j) => {
    const r = traces[j],
      main = j === p.ref;
    drawPath(r.points.slice(1), b.color + (r.clean ? '' : '99'), main ? 3 : 1.6);
    if (front >= r.length && r.exit) {
      const end = r.points.at(-1);
      sphere(at(end), main ? 0.08 : 0.055, b.color);
      if (r.clean) label(at([end[0] + 0.35, end[1]]), b.name, b.color, 10, !main);
    }
  });
  sphere(at(ref.points[0]), 0.12, '#f1e6c4');
  label(at([ref.points[0][0], ref.points[0][1] + 0.4]), '白光', '#6b6659', 11);

  // 法線與角度（參考色）
  if (p.normals && front > Math.hypot(ref.points[1][0] - ref.points[0][0], ref.points[1][1] - ref.points[0][1])) {
    const left = geo.edges[0],
      E = geo.entry,
      nl = left.outward;
    segment(at([E[0] + nl[0] * 1.3, E[1] + nl[1] * 1.3]), at([E[0] - nl[0] * 1.3, E[1] - nl[1] * 1.3]), '#5d7880', 1, true);
    label(
      at([E[0] + nl[0] * 1.5 - 0.2, E[1] + nl[1] * 1.5]),
      'θ₁ = ' + s.incidence.toFixed(1) + '°　r₁ = ' + ref.r1.toFixed(1) + '°',
      '#4f6b73',
      10
    );
    const h = ref.hits[0];
    if (h) {
      const edge = geo.edges.find(e => e.name === h.face),
        nr = edge.outward,
        X = h.point;
      segment(at([X[0] + nr[0] * 1.3, X[1] + nr[1] * 1.3]), at([X[0] - nr[0] * 1.3, X[1] - nr[1] * 1.3]), '#5d7880', 1, true);
      label(
        at([X[0] + nr[0] * 1.55 + 0.3, X[1] + nr[1] * 1.55]),
        h.tir
          ? 'r₂ = ' + h.incidence.toFixed(1) + '° > 臨界角 ' + ((Math.asin(1 / sim.refN) * 180) / Math.PI).toFixed(1) + '°'
          : 'r₂ = ' + h.incidence.toFixed(1) + '°　θ₂ = ' + ref.theta2.toFixed(1) + '°',
        h.tir ? '#b5474f' : '#4f6b73',
        10
      );
    }
  }

  // 狀態與讀值
  const x0 = -6.3;
  let y = 4.2;
  const line = (text, color = '#46616a', size = 11) => {
    label([x0 + 2.4, y, 0], text, color, size);
    y -= 0.42;
  };
  line('參考色（' + band.name + ' ' + band.lambda + ' nm）偏向角 δ = ' + (Number.isFinite(s.refDeviation) ? s.refDeviation.toFixed(2) + '°' : '—'), band.color, 12);
  if (Number.isFinite(s.deltaMin)) {
    line('最小偏向角 δmin = ' + s.deltaMin.toFixed(2) + '°（θ₁ = ' + s.bestIncidence.toFixed(1) + '°）');
    line('n = sin[(A+δmin)/2] / sin(A/2) = ' + s.nFromMin.toFixed(4));
  } else line('n sin(A/2) > 1：此色無最小偏向，任何入射角都在第二面全反射', '#b5474f');
  if (s.atMinimum)
    line('★ 最小偏向：光路對稱，r₁ = r₂ = A/2，稜鏡內光線平行底邊', '#2f7a55', 12);
  const tirNames = sim.bands.filter((b, j) => traces[j].tirAtSecond).map(b => b.name);
  if (tirNames.length) line('全反射：' + tirNames.join('、') + '光在第二面 n sin r₂ > 1，無法由右面射出', '#b5474f', 12);
  // 七色偏向角表（右下）
  const rx = 4.6;
  label([rx, -1.2, 0], '各色偏向角', '#46616a', 11);
  sim.bands.forEach((b, j) =>
    label(
      [rx, -1.6 - 0.32 * j, 0],
      b.name + '  n = ' + sim.ns[j].toFixed(4) + '  δ = ' + (traces[j].clean ? traces[j].deviation.toFixed(2) + '°' : '全反射'),
      b.color,
      10,
      true
    )
  );
}
