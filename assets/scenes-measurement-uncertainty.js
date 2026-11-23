'use strict';
function drawMeasurementUncertainty(s) {
  const px = -2.6,
    py = 3.3,
    bob = [px + 2 * Math.sin(s.theta * 6), py - 2 * Math.cos(s.theta * 6), 0]; // 擺角放大 6 倍便於觀察
  segment([px - 0.5, py, 0], [px + 0.5, py, 0], '#7a8d93', 4);
  segment([px, py, 0], bob, '#a9b3af', 2);
  sphere(bob, 0.18, '#4b91bd');
  label([px, py + 0.4, 0], '單擺（擺角已放大示意）', '#426566', 11);
  // 點圖：橫軸為週期估計，範圍為真值 ± 3.2 × 單次估計的標準差
  const sd = (Math.SQRT2 * params.sigma) / params.N,
    w = 3.2 * sd,
    x0 = 0.5,
    x1 = 3.4,
    X = v => x0 + ((v - simulation.trueT + w) / (2 * w)) * (x1 - x0),
    bins = 16,
    height = Array(bins).fill(0);
  segment([x0, 0.3, 0], [x1, 0.3, 0], '#526c77', 2);
  for (let j = 0; j <= 4; j++) {
    const v = simulation.trueT - w + (j * 2 * w) / 4;
    segment([X(v), 0.3, 0], [X(v), 0.22, 0], '#526c77', 1);
    label([X(v), 0.0, 0], v.toFixed(3), '#526c77', 9);
  }
  for (let i = 0; i < s.k; i++) {
    const b = Math.max(
      0,
      Math.min(bins - 1, Math.floor(((simulation.trials[i] - simulation.trueT + w) / (2 * w)) * bins))
    );
    sphere([X(simulation.trials[i]), 0.55 + 0.2 * height[b]++, 0], 0.09, '#cf7632');
  }
  segment([X(simulation.trueT), 0.3, 0], [X(simulation.trueT), 3.4, 0], '#438d80', 2, true);
  label([X(simulation.trueT), 3.55, 0], '真值', '#438d80', 10);
  if (s.k > 1) {
    segment([X(s.mean), 0.3, 0], [X(s.mean), 3.0, 0], '#4b91bd', 3);
    for (const sign of [-1, 1])
      segment([X(s.mean + sign * s.se), 0.3, 0], [X(s.mean + sign * s.se), 2.7, 0], '#4b91bd', 1, true);
    label([X(s.mean), 3.15, 0], '平均 ± 標準誤', '#4b91bd', 10);
    const result = s.reportMean.toFixed(s.decimals) + ' ± ' + s.reportU.toFixed(s.decimals) + ' s';
    label([0, 4.3, 0], '第 ' + s.k + ' 次後：T = ' + result + '（不確定度 1 位有效數字）', '#375868', 13);
    label([0, 3.95, 0], 's = ' + s.s.toFixed(4) + ' s　u = s/√n = ' + s.se.toFixed(4) + ' s', '#426566', 11);
  } else label([0, 4.3, 0], '第 1 次測量', '#375868', 13);
  label([0, 4.7, 0], '每次計時 ' + params.N + ' 個週期；單次估計誤差約 ' + sd.toFixed(3) + ' s', '#426566', 11);
}
