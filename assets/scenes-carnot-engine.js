'use strict';
function drawCarnotEngine(s) {
  const curve = simulation.curve;
  const maxVolume = Math.max(...curve.map(state => state.volume));
  const maxPressure = curve[0].pressure;
  const xy = state => [-3.1 + (6.1 * state.volume) / maxVolume, 0.65 + (3.3 * state.pressure) / maxPressure, 0];
  // 循環圍住的面積就是淨作功：半透明填色，並在中心標出。
  polygon(curve.map(xy), '#8ee0c040');
  const center = curve.map(xy).reduce((a, b) => a.map((v, j) => v + b[j] / curve.length), [0, 0, 0]);
  label(center, '面積 = 淨作功', '#2e6b5f', 12);
  segment([-3.1, 0.65, 0], [3.35, 0.65, 0], '#647f8c', 2);
  segment([-3.1, 0.65, 0], [-3.1, 4.1, 0], '#647f8c', 2);
  for (let i = 1; i < curve.length; i++) {
    const color = ['#b77a56', '#5f9788', '#668fb2', '#5f9788'][Math.floor((i - 1) / 24)];
    segment(xy(curve[i - 1]), xy(curve[i]), color, 3);
  }
  sphere(xy(s), 0.095, '#2e7c75');
  label([0, 4.55, 0], s.stage + ' · ' + s.temperature.toFixed(0) + ' K', '#365464', 13);
  label([0, 0.2, 0], '淨作功 ' + s.work.toFixed(1) + ' J · 效率 ' + s.efficiency.toFixed(1) + '%', '#365464', 12);
  label([3.4, 0.68, 0], 'V', '#365464', 12);
  label([-3.15, 4.15, 0], 'P', '#365464', 12);
}
