'use strict';

const pvPathColors = ['#238479', '#a25b29'];

function drawPVPath(state) {
  [state.left, state.right].forEach((gas, i) => {
    const x = i === 0 ? -1 : 1;
    const color = pvPathColors[i];
    const height = .28 * gas.v;
    const base = .2;
    const half = .4;
    const corners = [[-half, -half], [half, -half], [half, half], [-half, half]];
    const rim = y => corners.map(([dx, z]) => [x + dx, y, z]);
    const bottom = rim(base);
    const top = rim(base + 1.5);
    const gasTop = rim(base + height);
    box([x, base / 2, 0], [.98, base, .98], '#6c8588');
    bottom.forEach((corner, j) => {
      const next = (j + 1) % 4;
      polygon([corner, bottom[next], gasTop[next], gasTop[j]], color + '32');
      segment(corner, top[j], '#718d96', 1.25);
      segment(top[j], top[next], '#718d96', 1.25);
    });
    box([x, base + height, 0], [.82, .055, .82], color);
    box([x, base + height + .16, 0], [.08, .32, .08], '#6c8588');
    const route = i === 0 ? 'A 等壓先行' : (params.isothermal ? 'B 等溫先行' : 'B 等容先行');
    label([x, 2.16, 0], route, color, 14);
    label([x, 1.94, 0], gas.v.toFixed(2) + ' L · ' + gas.p.toFixed(1) + ' kPa', '#304e55', 12);
    label([x, .19, .65], 'Q ' + gas.heat.toFixed(0) + ' J · W ' + gas.work.toFixed(0) + ' J', color, 12);
    label([x, -.04, .65], 'ΔU ' + gas.deltaU.toFixed(0) + ' J', '#304e55', 12);
  });
}

function drawPVPathPlot(g, w, h, diagram, state) {
  const points = diagram.curves.flat();
  const maxV = Math.max(...points.map(point => point.v));
  const maxP = Math.max(...points.map(point => point.p));
  const left = 45, right = Math.max(left + 1, w - 13), top = 22, bottom = Math.max(top + 1, h - 20);
  const x = v => left + (right - left) * v / (1.08 * maxV);
  const y = p => bottom - (bottom - top) * p / (1.08 * maxP);
  $('plotLabel').textContent = '壓力 P 對體積 V';
  $('plotScope').textContent = '● 目前　陰影：去程｜功｜';
  $('plot').setAttribute('aria-label', 'P–V 路徑圖。A 目前 ' + state.left.v.toFixed(2) + ' L、' +
    state.left.p.toFixed(2) + ' kPa。B 目前 ' + state.right.v.toFixed(2) + ' L、' +
    state.right.p.toFixed(2) + ' kPa。');
  g.font = '10px system-ui';
  g.textAlign = 'left';
  g.fillStyle = '#c1d1d7';
  g.fillText('P / kPa', 5, top - 7);
  g.fillText(maxP.toFixed(0), 5, y(maxP) + 3);
  g.fillText('0', left - 9, bottom + 12);
  g.textAlign = 'right';
  g.fillText(maxV.toFixed(1) + ' L', x(maxV), bottom + 13);
  g.beginPath();
  g.moveTo(left, top);
  g.lineTo(left, bottom);
  g.lineTo(right, bottom);
  g.strokeStyle = '#647c87';
  g.lineWidth = 1;
  g.stroke();

  const ink = ['#8ee0c0', '#ffb36b'];
  diagram.curves.forEach((curve, i) => {
    g.fillStyle = ink[i] + '24';
    g.beginPath();
    g.moveTo(x(curve[0].v), bottom);
    curve.forEach(({v, p}) => g.lineTo(x(v), y(p)));
    g.lineTo(x(curve.at(-1).v), bottom);
    g.closePath();
    g.fill();
    g.beginPath();
    curve.forEach(({v, p}, j) => j ? g.lineTo(x(v), y(p)) : g.moveTo(x(v), y(p)));
    g.strokeStyle = ink[i];
    g.lineWidth = 1.7;
    g.setLineDash(i ? [5, 3] : []);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = ink[i];
    g.textAlign = 'left';
    g.fillText(i ? 'B ┄' : 'A ─', left + i * 52, top - 7);
  });
  [state.left, state.right].forEach(({v, p}, i) => {
    g.strokeStyle = ink[i];
    g.lineWidth = 1.7;
    g.beginPath();
    g.arc(x(v), y(p), i ? 4 : 7, 0, 2 * Math.PI);
    g.stroke();
  });
}
