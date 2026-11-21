'use strict';

function drawEmWave(s) {
  const field = simulation.field,
    amp = params.amplitude,
    scale = 1.5 / amp, // 畫面長度 / E 振幅
    eColor = '#cf7632',
    bColor = '#3a6fb0',
    tPhys = t * simulation.timeScale,
    X = m => m - 6,
    probe = params.probe,
    xs = Array.from({ length: 49 }, (_, i) => i * 0.25);
  // 傳播軸
  arrow([-6.4, 0, 0], [6.4, 0, 0], '#4c828d', '');
  label([5.4, 0.15, 0], '傳播方向 +x', '#4c828d', 12);
  // 每個取樣點的 E、B（E 在 y–z 平面，B = x̂×E/c 另一垂直方向）
  let prevE = null,
    prevB = null;
  for (const m of xs) {
    const f = field(m, tPhys),
      bScale = scale * 299792458,
      e = [X(m), f.Ey * scale, f.Ez * scale],
      b = [X(m), f.By * bScale, f.Bz * bScale];
    segment([X(m), 0, 0], e, eColor, 1.4);
    segment([X(m), 0, 0], b, bColor, 1.4);
    if (prevE) {
      segment(prevE, e, eColor + '88', 1);
      segment(prevB, b, bColor + '88', 1);
    }
    [prevE, prevB] = [e, b];
  }
  // 觀察點所在的波前平面與該點的 E、B
  const f0 = field(probe, tPhys),
    px = X(probe),
    h = 1.9;
  for (const [a, b] of [
    [
      [-h, -h],
      [h, -h]
    ],
    [
      [h, -h],
      [h, h]
    ],
    [
      [h, h],
      [-h, h]
    ],
    [
      [-h, h],
      [-h, -h]
    ]
  ])
    segment([px, a[0], a[1]], [px, b[0], b[1]], '#8aa2a0', 1, true);
  const E = [f0.Ey * scale, f0.Ez * scale],
    B = [f0.By * 299792458 * scale, f0.Bz * 299792458 * scale];
  arrow([px, 0, 0], [px, E[0], E[1]], eColor, '');
  arrow([px, 0, 0], [px, B[0], B[1]], bColor, '');
  sphere([px, E[0], E[1]], 0.06, eColor);
  sphere([px, B[0], B[1]], 0.06, bColor);
  label([px, E[0] + 0.15, E[1]], 'E', '#a0541f', 12);
  label([px, B[0] + 0.15, B[1]], 'B', '#2a5788', 12);
  // 波長標示與讀值
  const lambda = simulation.lambda;
  segment([X(0), -2.0, 0], [X(Math.min(lambda, 12)), -2.0, 0], '#6a7d88', 2);
  segment([X(0), -2.1, 0], [X(0), -1.9, 0], '#6a7d88', 2);
  segment([X(Math.min(lambda, 12)), -2.1, 0], [X(Math.min(lambda, 12)), -1.9, 0], '#6a7d88', 2);
  label([X(Math.min(lambda, 12) / 2), -2.0, 0], 'λ = ' + lambda.toFixed(2) + ' m', '#4a5d68', 12);
  label(
    [0, 3.6, 0],
    'f = ' +
      params.frequency +
      ' MHz　λ = ' +
      lambda.toFixed(2) +
      ' m　c = fλ = ' +
      ((params.frequency * 1e6 * lambda) / 1e8).toFixed(3) +
      '×10⁸ m/s',
    '#375765',
    12
  );
  label(
    [0, 3.0, 0],
    'E／B = ' + s.ratio.toFixed(3) + '×10⁸ m/s　｜　|E| = ' + s.E.toFixed(1) + ' V/m　|B| = ' + s.B.toFixed(1) + ' nT',
    '#576577',
    11
  );
  label(
    [0, 2.4, 0],
    'E ⊥ B ⊥ 傳播方向，E×B 指向 +x　｜　' +
      ['線偏振', '圓偏振（迎來波逆時針）', '圓偏振（迎來波順時針）'][params.polarization],
    '#576577',
    11
  );
}
