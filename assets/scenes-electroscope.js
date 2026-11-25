'use strict';
function drawElectroscope(s) {
  const p = params,
    e = simulation.electrical(t),
    pivot = [0, 3, 0],
    len = 0.65,
    // 模型張角只有幾度：畫面用單調的示意放大 75°×(1−e^(−θ/2°))，張角越大畫得越開，閉合時仍為 0；標籤寫真實角度。
    drawTheta = ((75 * Math.PI) / 180) * (1 - Math.exp(-e.theta / ((2 * Math.PI) / 180))),
    tip = sign => [sign * len * Math.sin(drawTheta), 3 - len * Math.cos(drawTheta), 0];
  box([0, 0.3, 0], [2, 0.3, 1.5], '#697d84');
  segment([0, 0.5, 0], [0, 4.6, 0], '#9eacb4', 8);
  sphere([0, 4.65, 0], 0.38, '#c5cbd0');
  for (const x of [-0.95, 0.95]) for (const z of [-0.65, 0.65]) segment([x, 1.5, z], [x, 4.25, z], '#84a3ab', 1);
  for (const y of [1.5, 4.25]) {
    segment([-0.95, y, -0.65], [0.95, y, -0.65], '#84a3ab', 1);
    segment([-0.95, y, 0.65], [0.95, y, 0.65], '#84a3ab', 1);
    segment([-0.95, y, -0.65], [-0.95, y, 0.65], '#84a3ab', 1);
    segment([0.95, y, -0.65], [0.95, y, 0.65], '#84a3ab', 1);
  }
  for (const sign of [-1, 1]) segment(pivot, tip(sign), '#c7a849', 9);
  label([0, 5.5, 0], e.stage, '#546d79', 12);
  const rodX = -0.38 - e.g;
  segment([rodX - 1.1, 4.65, 0], [rodX, 4.65, 0], p.rod >= 0 ? '#c5716f' : '#617cb5', 15);
  label([rodX - 0.5, 5.15, 0], '棒 ' + e.rodCharge.toFixed(2) + ' nC', p.rod >= 0 ? '#b35c59' : '#5779ac', 10);
  label([0, 1.5, 0], '張角 ±' + e.angle.toFixed(1) + '°（畫面張角為示意放大）', '#a4873d', 11);
  label([0, 0.8, 0], '淨電荷 ' + e.Q.toFixed(2) + ' nC · 大地 ' + e.earth.toFixed(2) + ' nC', '#536d79', 10);
  if (e.grounded) {
    segment([0, 4.2, 0], [2.2, 4.2, 0], '#68a696', 3);
    segment([2.2, 4.2, 0], [2.2, 0.7, 0], '#68a696', 3);
    for (let j = 0; j < 3; j++)
      segment([1.8 + j * 0.1, 0.7 - j * 0.12, 0], [2.6 - j * 0.1, 0.7 - j * 0.12, 0], '#68a696', 2);
    label([2, 2, 0], '接地 V=0', '#328575', 10);
  }
  if (p.charges) {
    const mark = (pos, q) => {
      if (Math.abs(q) < 0.005) return;
      label(pos, (q > 0 ? '+' : '−') + ' ' + Math.abs(q).toFixed(2), q > 0 ? '#bd655f' : '#597dad', 11);
    };
    mark([0.65, 4.8, 0], e.head);
    for (const sign of [-1, 1]) {
      const a = tip(sign);
      mark([a[0] + sign * 0.4, a[1] - 0.15, 0], e.leaf / 2);
    }
    label([0, 6, 0], '電荷符號為各區淨電荷示意（nC）', '#7b8790', 10);
  }
}
