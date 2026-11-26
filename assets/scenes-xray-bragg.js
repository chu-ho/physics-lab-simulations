'use strict';

// 矮寬視窗（可用區高度不足、寬度有餘）時，光譜與干涉讀值改排在晶體右側，
// 取景高度由 7.6 降為 6.5 單位，標籤才不會被避讓機制擠成一團。
// 比較兩種版面在目前可用區能得到的每單位像素，橫排明顯較大才切換。
function xrayWideLayout() {
  if (typeof sceneBounds !== 'function') return false;
  const b = sceneBounds(),
    w = b.right - b.left,
    h = b.bottom - b.top;
  return Math.min(w / 18, h / 6.5) > 1.08 * Math.min(w / 12, h / 7.6);
}

function drawXrayBragg(s) {
  const th = (s.angle * Math.PI) / 180,
    u = [Math.cos(th), Math.sin(th)],
    n = [-Math.sin(th), Math.cos(th)],
    O = [0.4, 1.0],
    dS = (0.38 * params.spacing) / 0.282,
    at = (p, z = 0) => [p[0], p[1], z],
    incident = '#835bc3',
    reflected = '#237a98';

  // X 光管：燈絲、被加速的電子、陽極靶
  const tubeX = -5.3;
  box([tubeX, 3.0, 0], [0.35, 0.16, 0.35], '#b0654b');
  box([tubeX, 0.95, 0], [0.55, 0.35, 0.55], '#7896a3', 0.5);
  const tz = -0.6;
  for (const [a, b] of [
    [
      [-0.6, 3.3],
      [0.6, 3.3]
    ],
    [
      [-0.6, 0.6],
      [0.6, 0.6]
    ],
    [
      [-0.6, 3.3],
      [-0.6, 0.6]
    ],
    [
      [0.6, 3.3],
      [0.6, 0.6]
    ]
  ])
    segment([tubeX + a[0], a[1], tz], [tubeX + b[0], b[1], tz], '#8ca3ab', 1);
  label([tubeX, 3.55, 0], 'X 光管　V = ' + params.voltage.toFixed(1) + ' kV', '#375765', 12);
  label([tubeX + 1.0, 3.0, 0], '燈絲（−）', '#855740', 10);
  label([tubeX - 1.0, 0.95, 0], simulation.targetName + ' 靶（+）', '#3c697b', 10);
  for (let i = 0; i < 6; i++) {
    const phase = (t * 0.8 + i / 6) % 1;
    sphere([tubeX + 0.1 * ((i % 3) - 1), 2.85 - 1.8 * phase * phase, 0], 0.05, '#237a98');
  }

  // 晶體：晶面與原子（向光束反側延伸）
  const half = 1.7;
  for (let k = 0; k < 4; k++) {
    const base = [O[0] - n[0] * dS * k, O[1] - n[1] * dS * k];
    segment(
      at([base[0] - u[0] * half, base[1] - u[1] * half], -0.7),
      at([base[0] + u[0] * half, base[1] + u[1] * half], -0.7),
      '#b9a27a',
      1,
      true
    );
    for (let a = -3; a <= 3; a++) {
      const p = [base[0] + u[0] * a * 0.5, base[1] + u[1] * a * 0.5];
      sphere(at(p), 0.09, k === 0 ? '#d39b45' : '#c9a468');
    }
  }
  label(at([O[0] + 2.0, O[1] - 3.2 * dS - 0.55]), '晶面間距 d = ' + params.spacing.toFixed(3) + ' nm', '#8a6f3c', 11);

  // 入射線、反射線（相鄰兩晶面）
  const P1 = [O[0] - n[0] * dS, O[1] - n[1] * dS],
    strength = s.present ? 0.15 + 0.85 * s.intensity : 0,
    dir = [Math.cos(2 * th), Math.sin(2 * th)],
    start = tubeX + 0.7;
  if (s.present) {
    segment(at([start, O[1]]), at(O), incident, 3);
    segment(at([start, P1[1]]), at(P1), incident + '99', 2);
    sphere(at([start + 0.9, O[1]]), 0.05, incident);
    const width = 1.5 + 4 * s.intensity;
    segment(
      at(O),
      at([O[0] + 3.2 * dir[0], O[1] + 3.2 * dir[1]]),
      reflected +
        Math.round(40 + 215 * strength)
          .toString(16)
          .padStart(2, '0'),
      width
    );
    segment(at(P1), at([P1[0] + 3.2 * dir[0], P1[1] + 3.2 * dir[1]]), reflected + '66', 1.5);
    box(at([O[0] + 3.4 * dir[0], O[1] + 3.4 * dir[1]], 0), [0.3, 0.3, 0.3], '#6f8a8d', 2 * th);
    label(at([O[0] + 3.4 * dir[0], O[1] + 3.4 * dir[1] + 0.35]), '偵測器', '#3c697b', 10);
  }
  // 掠射角標示：入射線與晶面之間的弧線
  for (let i = 0; i < 12; i++) {
    const p = k => at([O[0] - 0.9 * Math.cos((th * k) / 12), O[1] - 0.9 * Math.sin((th * k) / 12)]);
    segment(p(i), p(i + 1), '#576577', 1.5);
  }
  label(at([O[0] - 1.5, O[1] + 0.25]), 'θ = ' + s.angle.toFixed(1) + '°', '#576577', 12);

  // 干涉結果（直排：晶體下方；橫排：光譜下方）
  const wide = xrayWideLayout(),
    constructive = s.present && s.nearestOrder >= 1 && Math.abs(s.orderExact - s.nearestOrder) < 0.03,
    rx = wide ? 7.7 : 2.0,
    ry = wide ? -0.35 : -1.1,
    // 橫排時每單位像素較少，行距放寬到 0.55 單位，避免相鄰讀值被避讓機制連鎖推開。
    gap = wide ? 0.55 : 0.45;
  label(
    [rx, ry, 0],
    s.present
      ? simulation.sourceName + ' λ = ' + s.lambda.toFixed(4) + ' nm（' + s.photonEnergy.toFixed(2) + ' keV）'
      : '此入射波長在目前電壓下不存在',
    '#576577',
    11
  );
  if (s.present) {
    label(
      [rx, ry - gap, 0],
      '2d sinθ = ' + s.pathDifference.toFixed(3) + ' nm = ' + s.orderExact.toFixed(2) + ' λ',
      constructive ? '#2f7a55' : '#576577',
      12
    );
    label(
      [rx, ry - 2 * gap, 0],
      constructive ? '→ 第 ' + s.nearestOrder + ' 階建設性干涉' : '非整數倍，反射微弱',
      constructive ? '#2f7a55' : '#576577',
      12
    );
    label(
      [rx, ry - 3 * gap - 0.05, 0],
      // 晶面間距大、波長短時可達十多階，整行會超出畫面；只列前 5 階，其餘以總數帶過。
      '階數角：' +
        (simulation.orders
          .slice(0, 5)
          .map(o => 'n=' + o.n + ' ' + o.angle.toFixed(1) + '°')
          .join('　') || '無') +
        (simulation.orders.length > 5 ? '　…共 ' + simulation.orders.length + ' 階' : ''),
      '#576577',
      10
    );
  }

  // 光譜：Kramers 連續譜與特徵線
  const x0 = wide ? 5.0 : -5.8,
    x1 = wide ? 10.4 : -1.4,
    y0 = wide ? 1.2 : -2.3,
    h = wide ? 1.9 : 1.3,
    lo = 0.02,
    hi = 0.3,
    X = l => x0 + ((l - lo) / (hi - lo)) * (x1 - x0),
    pts = Array.from({ length: 151 }, (_, i) => lo + ((hi - lo) * i) / 150),
    top = Math.max(...pts.map(simulation.spectrum), 1e-9);
  segment(at([x0, y0]), at([x1, y0]), '#6a7d88', 1);
  for (const l of [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]) {
    segment(at([X(l), y0]), at([X(l), y0 - 0.06]), '#6a7d88', 1);
    if (!wide || Math.round(l * 100) % 10 === 0) label(at([X(l), y0 - 0.3]), l.toFixed(2), '#6a7d88', 9);
  }
  // 橫排時光譜下方只剩一排刻度與入射標記的空間，軸名改放在軸的右端。
  if (wide) label(at([x1 + 0.75, y0 + 0.05]), 'λ（nm）', '#6a7d88', 10);
  else label(at([(x0 + x1) / 2, y0 - 0.52]), '波長 λ（nm）', '#6a7d88', 10);
  label(at([(x0 + x1) / 2, y0 + h + 0.8]), '管內產生的 X 射線光譜', '#375765', 11);
  let last = null;
  for (const l of pts) {
    const p = at([X(l), y0 + (h * simulation.spectrum(l)) / top]);
    if (last) segment(last, p, '#c0603a', 1.6);
    last = p;
  }
  const lmX = X(s.lambdaMin);
  segment(at([lmX, y0]), at([lmX, y0 + h]), '#6a7d88', 1, true);
  label(at([lmX, y0 + h + 0.35]), 'λmin = ' + s.lambdaMin.toFixed(4) + ' nm', '#6a7d88', 10);
  for (const line of simulation.lines)
    if (line.height > 0)
      label(
        at([
          X(line.lambda) + (line.name === 'Kβ' ? -0.25 : 0.2),
          y0 + (h * simulation.spectrum(line.lambda)) / top + 0.02
        ]),
        line.name,
        '#8a4a2a',
        10
      );
  if (s.present) {
    segment(at([X(s.lambda), y0]), at([X(s.lambda), y0 + 0.25]), incident, 3);
    label(at([X(s.lambda), y0 - 0.85]), '▲ 入射 λ', incident, 10);
  }
}
