'use strict';
// 電子雙縫場景：電子槍 → 雙縫板 → 偵測屏。屏上落點用小方點（不用球，480 點也畫得動），
// 屏上方的直方圖統計目前累積的落點，條紋會隨時間慢慢浮現。雙縫幾何是示意放大，不按 nm 比例。
function drawMatterWave(s) {
  const p = params,
    screenZ = 0,
    slitZ = -2,
    gunZ = -3.8,
    yMid = 1.8;
  // 電子槍與加速電壓。
  box([0, yMid, gunZ], [0.45, 0.45, 0.8], '#5b6f78');
  label([0, yMid + 0.55, gunZ], '電子槍 ' + p.voltage + ' V', '#365464', 12);
  segment([0, yMid, gunZ + 0.5], [0, yMid, slitZ - 0.05], '#5d6fb0', 2, true);
  // 雙縫板：三塊板子之間留兩道縫。
  const gap = 0.08,
    half = 0.2 + (0.1 * (p.spacing - 0.5)) / 2.5,
    edge = 0.75;
  for (const [a, b] of [
    [-edge, -half - gap / 2],
    [-half + gap / 2, half - gap / 2],
    [half + gap / 2, edge]
  ])
    box([(a + b) / 2, yMid, slitZ], [b - a, 1.6, 0.08], '#8d9fa3');
  label([0, yMid + 1.05, slitZ], '雙縫 d = ' + p.spacing + ' nm（示意放大）', '#365464', 12);
  if (p.whichPath) {
    for (const x of [-half, half]) sphere([x, yMid + 1.3, slitZ - 0.15], 0.07, '#c0602a');
    label([0, yMid - 1.45, slitZ], '縫旁偵測器：知道走哪一縫', '#a0522d', 12);
  }
  // 兩縫往屏散開的示意光束。
  for (const x of [-half, half])
    for (const end of [-2.6, 2.6]) segment([x, yMid, slitZ], [end, yMid, screenZ], '#5d6fb055', 1, true);
  // 偵測屏與落點。
  box([0, yMid, screenZ + 0.13], [5.7, 2.35, 0.2], '#dde6e8');
  const r = 0.028;
  for (let i = 0; i < s.count; i++) {
    const [x, y] = simulation.hits[i],
      X = x / 45,
      Y = yMid + y * 2;
    polygon(
      [
        [X - r, Y - r, screenZ],
        [X + r, Y - r, screenZ],
        [X + r, Y + r, screenZ],
        [X - r, Y + r, screenZ]
      ],
      '#1f5f69'
    );
  }
  // 落點直方圖（屏上方），高度依目前最多的一格縮放。
  const bins = 48,
    counts = new Array(bins).fill(0);
  for (let i = 0; i < s.count; i++) {
    const k = Math.floor(((simulation.hits[i][0] + 120) / 240) * bins);
    counts[Math.max(0, Math.min(bins - 1, k))]++;
  }
  const most = Math.max(1, ...counts),
    width = 240 / 45 / bins,
    base = yMid + 1.25;
  for (let k = 0; k < bins; k++) {
    if (!counts[k]) continue;
    const x0 = -120 / 45 + k * width,
      h = (0.9 * counts[k]) / most;
    polygon(
      [
        [x0, base, screenZ + 0.1],
        [x0 + width * 0.9, base, screenZ + 0.1],
        [x0 + width * 0.9, base + h, screenZ + 0.1],
        [x0, base + h, screenZ + 0.1]
      ],
      '#2e7c75'
    );
  }
  // 狀態文字放在屏上方（不放屏下方：從電子槍那側看會被雙縫板擋住）。
  label([0, base + 1.2, screenZ], '電子落點 · ' + s.count + ' 次', '#365464', 14);
  label([0, base + 1.65, screenZ], p.whichPath ? '有路徑資訊：條紋消失' : '兩路相干：出現干涉條紋', '#365464', 13);
}
