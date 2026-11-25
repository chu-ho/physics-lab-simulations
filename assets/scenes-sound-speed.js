'use strict';
function drawSoundSpeed(s) {
  const sim = simulation,
    height = 2.8,
    // 兩座山的間距隨距離拉桿改變（100 m → 4 單位，1500 m → 13 單位），聲包長度仍按真實比例。
    D = 2 + (4.5 * (params.distance - 100)) / 1400,
    map = x => -D + (2 * D * x) / params.distance;
  for (const x of [-D, D]) {
    const peak = [x, height - 0.1, 0],
      corners = [
        [x - 1.4, 0, -1.3],
        [x + 1.4, 0, -1.3],
        [x + 1.4, 0, 1.3],
        [x - 1.4, 0, 1.3]
      ];
    for (let i = 0; i < 4; i++)
      polygon([corners[i], corners[(i + 1) % 4], peak], i % 2 ? '#839e91' : '#a4b3a1', '#7c978a');
    const col = x < 0 ? '#bb9659' : '#a67d9c';
    segment([x, height - 0.05, 0], [x, height + 0.45, 0], col, 3);
    sphere([x, height + 0.6, 0], 0.12, col);
    segment([x - 0.18, height + 0.25, 0], [x + 0.18, height + 0.25, 0], col, 2);
  }
  label([-D, height + 1, 0], s.sourceEnvelope > 0 ? '小明：發聲中' : '小明', '#a6854a', 11);
  label(
    [D, height + 1, 0],
    s.receiverEnvelope > 0 ? '姊姊：收到聲音' : s.packetPassed ? '姊姊：聲包通過' : '姊姊：等待',
    '#97708f',
    11
  );
  if (params.path) segment([-D, height, 0], [D, height, 0], '#89a6a088', 1, true);
  const left = Math.max(0, s.packetTailDistance),
    right = Math.min(params.distance, s.wavefrontDistance);
  if (right > left && t >= sim.emitTime) {
    const a = map(left),
      b = map(right);
    polygon(
      [
        [a, height - 0.12, -0.25],
        [b, height - 0.12, -0.25],
        [b, height + 0.12, 0.25],
        [a, height + 0.12, 0.25]
      ],
      '#70b8b75a',
      '#6fa7a870'
    );
  }
  if (params.fronts && t >= sim.emitTime)
    for (const [radius, col, title] of [
      [s.wavefrontDistance, '#6ba7ba', '前緣'],
      [s.packetTailDistance, '#baa265', '後緣']
    ]) {
      if (radius < 0 || radius > params.distance) continue;
      if (title === '後緣' && t < sim.emitTime + params.pulse) continue;
      const x = map(radius);
      for (let i = 0; i < 24; i++) {
        const a = (i * TAU) / 24,
          b = ((i + 1) * TAU) / 24;
        segment(
          [x, height + 0.45 * Math.cos(a), 0.45 * Math.sin(a)],
          [x, height + 0.45 * Math.cos(b), 0.45 * Math.sin(b)],
          col,
          1.5
        );
      }
      label([x, height - 0.7, 0], title, col, 10);
    }
  const heat = (params.temperature + 30) / 80;
  sphere([2, 4.5, -0.7], 0.18 + 0.2 * heat, '#d9b75f');
  for (let i = 0; i < 3; i++) sphere([-3.5 + i * 0.25, 4.5, -0.7], 0.17 + 0.12 * (1 - heat), '#b9cbd1');
  label([0, 4.5, 0], params.temperature + ' °C · c=' + format(s.soundSpeed) + ' m/s', '#6c8d97', 11);
  label([0, 0.5, 0], '實際距離 ' + params.distance + ' m · Δt=' + format(s.travelTime) + ' s', '#6c8d97', 11);
}
