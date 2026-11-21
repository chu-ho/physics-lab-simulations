'use strict';
function drawEmfPower(s) {
  const ink = '#46616a',
    meter = '#80533d',
    flow = colors.mint;
  const top = 3.6,
    base = 1,
    left = -3.4,
    right = 3.4;
  const at = (x, y, z = 0) => [x, y, z];
  const wire = (x1, y1, x2, y2, color = ink) => segment(at(x1, y1), at(x2, y2), color, 3);
  const text = (x, y, value, color = ink, size = 11) => label([x, y, 0.12], value, color, size);
  const glow = power => power / (power + 4);
  const bulb = (x, y, power, side = false) => {
    const b = glow(power);
    const mix = (a, c) => Math.round(a + (c - a) * b);
    const color = 'rgb(' + mix(150, 255) + ',' + mix(150, 214) + ',' + mix(140, 90) + ')';
    for (let i = 0; i < 8 && b > 0.02; i++) {
      const a = (i * Math.PI) / 4,
        r0 = 0.42,
        r1 = 0.42 + 0.55 * b;
      segment(
        at(x + r0 * Math.cos(a), y + r0 * Math.sin(a)),
        at(x + r1 * Math.cos(a), y + r1 * Math.sin(a)),
        '#f2c14e',
        2
      );
    }
    sphere(at(x, y), 0.34, color);
    text(side ? x + 0.95 : x, side ? y : y - 0.62, power.toFixed(2) + ' W', meter);
  };
  const carriers = (points, amount) => {
    const lengths = points.slice(1).map((q, i) => Math.hypot(q[0] - points[i][0], q[1] - points[i][1]));
    const total = lengths.reduce((a, b) => a + b, 0),
      spacing = 0.55,
      shift = (((0.35 * amount) % spacing) + spacing) % spacing;
    for (let d = shift; d < total; d += spacing) {
      let rest = d,
        i = 0;
      while (rest > lengths[i]) rest -= lengths[i++];
      const f = rest / lengths[i],
        a = points[i],
        b = points[i + 1];
      sphere(at(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 0.05), 0.055, flow);
    }
  };
  // 電池：理想電動勢 ε 串聯內電阻 r（虛線框）
  const cellTop = 2.95,
    cellBottom = 1.65;
  for (const [x1, y1, x2, y2] of [
    [left - 0.55, cellBottom - 0.2, left + 0.55, cellBottom - 0.2],
    [left + 0.55, cellBottom - 0.2, left + 0.55, cellTop + 0.2],
    [left + 0.55, cellTop + 0.2, left - 0.55, cellTop + 0.2],
    [left - 0.55, cellTop + 0.2, left - 0.55, cellBottom - 0.2]
  ])
    segment(at(x1, y1), at(x2, y2), '#93a5ab', 1, true);
  wire(left, base, left, cellBottom);
  wire(left - 0.18, cellBottom, left + 0.18, cellBottom);
  wire(left - 0.32, cellBottom + 0.22, left + 0.32, cellBottom + 0.22, '#ba6650');
  wire(left, cellBottom + 0.22, left, 2.25);
  box(at(left, 2.48), [0.3, 0.46, 0.3], '#b98b65');
  wire(left, 2.71, left, top);
  text(left + 1.05, 1.86, 'ε ' + params.emf.toFixed(1) + ' V', '#ba6650');
  text(left + 1.05, 2.48, 'r ' + params.internal.toFixed(1) + ' Ω', meter);
  text(left + 1.05, cellTop + 0.05, '電池（＋極在上）', '#6b8087', 10);
  // 理想伏特計跨接電池兩端
  const vx = left - 1.25;
  segment(at(left, top - 0.25), at(vx, top - 0.25), '#9a7b6a', 1, true);
  segment(at(left, base + 0.25), at(vx, base + 0.25), '#9a7b6a', 1, true);
  segment(at(vx, base + 0.25), at(vx, top - 0.25), '#9a7b6a', 1, true);
  box(at(vx, (top + base) / 2), [0.62, 0.42, 0.2], '#e7dccd');
  text(vx, (top + base) / 2, 'V', meter, 12);
  text(vx, top + 0.25, '端電壓 ' + s.terminalVoltage.toFixed(2) + ' V', meter, 12);
  // 開關與安培計
  const sx = -2.35;
  wire(left, top, sx, top);
  wire(sx, top, sx + 0.7, top + (params.closed ? 0 : 0.42), meter);
  sphere(at(sx, top), 0.055);
  sphere(at(sx + 0.7, top), 0.055);
  box(at(-1.05, top), [0.5, 0.42, 0.2], '#e7dccd');
  text(-1.05, top, 'A', meter, 12);
  text(-1.05, top + 0.45, s.current.toFixed(2) + ' A', flow, 12);
  wire(sx + 0.7, top, -1.3, top);
  wire(-0.8, top, right, top);
  wire(right, top, right, base);
  wire(right, base, left, base);
  const loop = [at(left, base), at(left, top), at(right, top), at(right, base), at(left, base)];
  if (params.mode === 2) {
    const bx = 0.9;
    wire(bx, top, bx, base);
    bulb(bx, 2.3, s.bulbPower, true);
    bulb(right, 2.3, s.bulbPower, true);
    carriers([at(left, base), at(left, top), at(bx, top)], s.charge);
    carriers([at(bx, top), at(bx, base)], s.charge / 2);
    carriers([at(bx, top), at(right, top), at(right, base), at(bx, base)], s.charge / 2);
    carriers([at(bx, base), at(left, base)], s.charge);
  } else if (params.mode === 1) {
    bulb(0.6, top, s.bulbPower);
    bulb(2.2, top, s.bulbPower);
    carriers(loop, s.charge);
  } else {
    bulb(1.4, top, s.bulbPower);
    carriers(loop, s.charge);
  }
  if (s.current > 0) arrow(at(1.6, base - 0.28), at(0.4, base - 0.28), flow, '');
  text(0, 4.55, simulation.loadName + (params.closed ? ' · 開關閉合' : ' · 開關斷開'), ink, 12);
  text(
    1.2,
    0.42,
    'R外 ' +
      s.external.toFixed(2) +
      ' Ω · 負載 ' +
      s.loadPower.toFixed(2) +
      ' W · 內耗 ' +
      s.internalPower.toFixed(2) +
      ' W',
    ink
  );
  const best = simulation.maximumLoadPower;
  if (params.closed && Number.isFinite(best))
    text(
      1.2,
      0.05,
      Math.abs(s.external - params.internal) < 0.05
        ? 'R外 = r：負載功率達最大 ' + best.toFixed(2) + ' W'
        : '最大負載功率 ε²/4r = ' + best.toFixed(2) + ' W（R外 = r 時）',
      '#a15b36'
    );
}
