'use strict';

// 雙折射波片：光沿 +x；起偏片 x = −4.6，晶片 −1.5…1.5，檢偏片 x = 4.2。
function drawWaveplate(s) {
  const fieldAt = simulation.fieldAt,
    gamma = simulation.gamma,
    A = 1.25, // 起偏後電場振幅的畫面長度
    k = (2 * Math.PI) / 1.6, // 畫面上的波長 1.6
    eColor = '#cf7632',
    fastColor = '#168579',
    slowColor = '#8b5ac4',
    aColor = '#926b9e',
    P0 = -4.6,
    C0 = -1.5,
    C1 = 1.5,
    A0 = 4.2,
    probeX = 3.0,
    rad = d => (d * Math.PI) / 180,
    dir = d => [Math.cos(rad(d)), Math.sin(rad(d))],
    pt = (x, yz) => [x, yz[0], yz[1]];
  // 晶片內慢軸分量隨深度逐漸多累積的相位（0…Γ）
  const extraAt = x => (x <= C0 ? 0 : x >= C1 ? gamma : (gamma * (x - C0)) / (C1 - C0));
  const E = x => fieldAt(t, extraAt(x), k * (x - P0));

  arrow([-6.5, 0, 0], [6.5, 0, 0], '#4c828d', '');
  label([6.1, -0.25, 0], '傳播 +x', '#4c828d', 11);

  // 偏振片：圓框 + 透光軸
  const plate = (x, degrees, color, name) => {
    for (let i = 0; i < 48; i++) {
      const a = (i * 2 * Math.PI) / 48,
        b = ((i + 1) * 2 * Math.PI) / 48;
      segment([x, 1.6 * Math.cos(a), 1.6 * Math.sin(a)], [x, 1.6 * Math.cos(b), 1.6 * Math.sin(b)], color, 2);
    }
    const d = dir(degrees);
    segment(pt(x, [-1.45 * d[0], -1.45 * d[1]]), pt(x, [1.45 * d[0], 1.45 * d[1]]), color, 4);
    label([x, -2.05, 0], name + ' ' + degrees.toFixed(0) + '°', color, 12);
  };
  plate(P0, params.polarizer, '#507e9a', '起偏片');
  plate(A0, params.analyzer, aColor, '檢偏片');

  // 雙折射晶片：半透明薄板與快軸／慢軸
  const h = 1.5,
    V = (x, y, z) => [x, y, z];
  polygon([V(C0, -h, -h), V(C0, h, -h), V(C0, h, h), V(C0, -h, h)], '#9fd6d01f', '#5d8f8b');
  polygon([V(C1, -h, -h), V(C1, h, -h), V(C1, h, h), V(C1, -h, h)], '#9fd6d01f', '#5d8f8b');
  for (const [y, z] of [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h]
  ])
    segment([C0, y, z], [C1, y, z], '#5d8f8b', 1);
  const f = dir(params.fastAxis),
    sl = [-f[1], f[0]];
  segment(pt(C0, [-1.35 * f[0], -1.35 * f[1]]), pt(C0, [1.35 * f[0], 1.35 * f[1]]), fastColor, 3, true);
  segment(pt(C0, [-1.35 * sl[0], -1.35 * sl[1]]), pt(C0, [1.35 * sl[0], 1.35 * sl[1]]), slowColor, 3, true);
  label(pt(C0, [1.55 * f[0], 1.55 * f[1]]), '快軸 o 光', fastColor, 11);
  label(pt(C0, [1.55 * sl[0], 1.55 * sl[1]]), '慢軸 e 光', slowColor, 11);
  label([0, -2.0, 0], '波片 Δφ = ' + s.deltaDeg.toFixed(1) + '°（' + s.waves.toFixed(3) + ' λ）', '#3f6f6b', 12);

  // 電場向量：起偏片後、晶片內（o、e 分量分開畫）、晶片後、檢偏片後
  const xs = [];
  for (let x = P0 + 0.2; x <= 6.2 + 1e-9; x += 0.2) xs.push(Math.round(x * 100) / 100);
  let prev = null,
    prevF = null,
    prevS = null;
  for (const x of xs) {
    if (Math.abs(x - A0) < 0.1) {
      prev = null;
      continue;
    }
    const e = E(x);
    let tip;
    if (x > A0) {
      const u = dir(params.analyzer),
        ea = e.Ey * u[0] + e.Ez * u[1];
      tip = pt(x, [A * ea * u[0], A * ea * u[1]]);
    } else tip = pt(x, [A * e.Ey, A * e.Ez]);
    const inside = x > C0 && x < C1;
    if (inside) {
      const tf = pt(x, [A * e.Ef * f[0], A * e.Ef * f[1]]),
        ts = pt(x, [A * e.Es * sl[0], A * e.Es * sl[1]]);
      segment([x, 0, 0], tf, fastColor, 1.3);
      segment([x, 0, 0], ts, slowColor, 1.3);
      if (prevF) {
        segment(prevF, tf, fastColor + 'aa', 1);
        segment(prevS, ts, slowColor + 'aa', 1);
      }
      prevF = tf;
      prevS = ts;
      if (prev) segment(prev, tip, eColor + '66', 1);
    } else {
      prevF = prevS = null;
      segment([x, 0, 0], tip, eColor, 1.3);
      if (prev) segment(prev, tip, eColor + '88', 1);
    }
    prev = tip;
  }

  // 出射偏振軌跡：在 x = probeX 的橫截面上畫完整一圈，並標出目前的電場向量與旋向
  const loop = [];
  for (let i = 0; i <= 96; i++) {
    const e = fieldAt((i / 96) * simulation.period, gamma, 0);
    loop.push(pt(probeX, [A * e.Ey, A * e.Ez]));
  }
  for (let i = 0; i < 96; i++) segment(loop[i], loop[i + 1], '#e0a11b', 2.4);
  const now = E(probeX),
    tipNow = pt(probeX, [A * now.Ey, A * now.Ez]);
  arrow([probeX, 0, 0], tipNow, eColor, '');
  sphere(tipNow, 0.07, '#e0a11b');
  if (s.handed) {
    // 旋向箭頭：軌跡上相隔一小段的兩點
    const a = fieldAt(0, gamma, 0),
      b = fieldAt(0.12 * simulation.period, gamma, 0);
    arrow(pt(probeX, [A * a.Ey, A * a.Ez]), pt(probeX, [A * b.Ey, A * b.Ez]), '#b5790d', '');
  }
  label(pt(probeX, [0, 1.75]), '偏振軌跡', '#9a6a0a', 11);

  // 屏幕亮度
  const lum = Math.round(40 + 2.1 * s.output),
    c = 'rgb(' + lum + ',' + lum + ',' + Math.round(lum * 0.85) + ')';
  polygon(
    [
      [6.35, -1, -1],
      [6.35, 1, -1],
      [6.35, 1, 1],
      [6.35, -1, 1]
    ],
    c,
    '#526c77'
  );
  label([6.35, 1.35, 0], 'I = ' + s.output.toFixed(1) + '%', '#365464', 12);

  const names = simulation.typeName;
  label(
    [0, 4.2, 0],
    '出射：' + names + '　b/a = ' + s.ellipticity.toFixed(3) + (s.type >= 3 ? '　無固定長軸' : '　長軸方位 ' + s.orientation.toFixed(1) + '°'),
    '#375765',
    13
  );
  label([0, 3.6, 0], '穿過檢偏片 I/I₁ = ' + s.output.toFixed(1) + '%　（逆／順時針：迎著來光看）', '#576577', 11);
}
