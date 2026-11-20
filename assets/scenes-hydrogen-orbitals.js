'use strict';
function drawHydrogenOrbitals(s) {
  const scale = 0.23;
  const origin = [0, 3, 0];
  segment([0, 3, -3.6], [0, 3, 3.6], '#889ca8', 1);
  sphere(origin, 0.085, '#50716c');
  for (let i = 0; i < s.count; i++) {
    const { point, negative } = simulation.samples[i];
    const position = point.map((value, axis) => origin[axis] + value * scale);
    sphere(position, 0.033, negative ? '#cc8558' : '#4585ad');
  }
  label([0, 6.6, 0], simulation.orbital + ' · ' + s.count + ' 個位置樣本', '#365464', 14);
  label([0, -0.45, 0], '藍 ＋相位 · 橘 −相位 · z 軸沿中心線', '#365464', 11);
}
