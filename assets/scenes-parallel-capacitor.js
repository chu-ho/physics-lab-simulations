'use strict';
function drawParallelCapacitor(s) {
  const gap = 0.45 + s.distance * 160;
  const side = 3 * Math.sqrt(params.area / 160);
  const left = -gap / 2,
    right = gap / 2;
  box([left, 1.75, 0], [0.12, side, side], '#d88b68');
  box([right, 1.75, 0], [0.12, side, side], '#6996c2');
  // 介電質：εr > 1 時在兩板間畫半透明板，越不透明代表 εr 越大。
  if (s.dielectric > 1.001) {
    const alpha = Math.round(40 + 150 * Math.min(1, (s.dielectric - 1) / 7))
      .toString(16)
      .padStart(2, '0');
    const hx = Math.max(0.025, gap / 2 - 0.1),
      h = (side * 0.92) / 2,
      fill = '#c9b27a' + alpha,
      V = (i, j, k) => [i * hx, 1.75 + j * h, k * h];
    for (const [a, b, c, d] of [
      [V(-1, -1, 1), V(1, -1, 1), V(1, 1, 1), V(-1, 1, 1)],
      [V(-1, -1, -1), V(1, -1, -1), V(1, 1, -1), V(-1, 1, -1)],
      [V(-1, 1, -1), V(1, 1, -1), V(1, 1, 1), V(-1, 1, 1)],
      [V(-1, -1, -1), V(1, -1, -1), V(1, -1, 1), V(-1, -1, 1)]
    ])
      polygon([a, b, c, d], fill, '#a8935f80');
    label([0, 1.75 + side / 2 + 0.25, 0], '介電質 εr = ' + s.dielectric.toFixed(1), '#8a7440', 11);
  }
  // 電場線密度與 E 成正比：以本次觀察中最大電場為 7 條，至少 1 條。
  const maxField = Math.max(1e-12, ...plotSamples.map(q => Math.abs(q.field))),
    n = Math.max(1, Math.round((7 * Math.abs(s.field)) / maxField));
  for (let i = 0; i < n; i++) {
    const z = n === 1 ? 0 : -side * 0.35 + (side * 0.7 * i) / (n - 1);
    arrow([left + 0.08, 1.75, z], [right - 0.08, 1.75, z], '#417563', '');
  }
  label([left, 3.45, 0], '+Q', '#a15b36', 13);
  label([right, 3.45, 0], '−Q', '#3a628a', 13);
  label([0, 0.2, 0], s.voltage.toFixed(2) + ' V · ' + s.energy.toFixed(1) + ' pJ', '#365464', 13);
}
