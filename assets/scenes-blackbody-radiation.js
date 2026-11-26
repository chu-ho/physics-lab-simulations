'use strict';
// 黑體輻射場景：兩顆球的顏色依溫度改變（色溫近似），下方在場景內畫出兩條光譜曲線、
// 可見光色帶、峰值位置與目前掃描的波長，讓「溫度升高 → 峰值左移、變白變藍、總量暴增」直接看得見。
function blackbodyColor(T) {
  // Tanner Helland 的色溫近似（1000–40000 K），輸出 sRGB；只作示意，不是精確色度計算。
  const t = T / 100,
    clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592,
    g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492,
    b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}
function visibleColor(nm) {
  // 可見光色帶用的波長→顏色近似（380–750 nm）。
  let r = 0,
    g = 0,
    b = 0;
  if (nm < 440) [r, b] = [(440 - nm) / 60, 1];
  else if (nm < 490) [g, b] = [(nm - 440) / 50, 1];
  else if (nm < 510) [g, b] = [1, (510 - nm) / 20];
  else if (nm < 580) [r, g] = [(nm - 510) / 70, 1];
  else if (nm < 645) [r, g] = [1, (645 - nm) / 65];
  else r = 1;
  return (
    '#' +
    [r, g, b]
      .map(v =>
        Math.round(255 * v)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}
function drawBlackbodyRadiation(s) {
  const p = params,
    temps = [
      { T: p.temperature, color: '#c0602a', x: -1.5, name: '主要' },
      { T: p.reference, color: '#287768', x: 1.5, name: '比較' }
    ],
    planck = (nm, T) => 1 / ((nm * 1e-9) ** 5 * Math.expm1(0.014387768775 / (nm * 1e-9 * T))),
    X = nm => -3 + (6 * (nm - 180)) / 3820,
    peakOf = T => 2.897771955e6 / T,
    top = Math.max(...temps.map(d => planck(peakOf(d.T), d.T))),
    Y = v => 0.15 + (2.1 * v) / top,
    hotter = Math.max(p.temperature, p.reference),
    cooler = Math.min(p.temperature, p.reference);
  // 兩顆發光球：顏色依溫度，旁邊寫溫度與相對總輻射（σT⁴ 比值）。
  for (const d of temps) {
    sphere([d.x, 3.3, 0], 0.55, blackbodyColor(d.T));
    label([d.x, 4.15, 0], d.name + ' ' + d.T + ' K', d.color, 14);
  }
  label([0, 3.3, 0], '總輻射比 ' + ((hotter / cooler) ** 4).toPrecision(3) + ' 倍', '#365464', 12);
  // 可見光色帶（貼在橫軸下方）。
  for (let nm = 380; nm < 750; nm += 10)
    polygon(
      [
        [X(nm), 0.02, 0],
        [X(nm + 10), 0.02, 0],
        [X(nm + 10), 0.12, 0],
        [X(nm), 0.12, 0]
      ],
      visibleColor(nm + 5)
    );
  segment([-3, 0.15, 0], [3, 0.15, 0], '#46616a', 2);
  label([X(565), -0.2, 0], '可見光', '#365464', 11);
  label([2.6, -0.2, 0], '4000 nm', '#365464', 11);
  label([-2.8, -0.2, 0], '180 nm', '#365464', 11);
  // 兩條光譜（同一縱軸比例，低溫曲線可能很扁，這正是 T⁵ 的差距）。
  for (const d of temps) {
    let previous = null;
    for (let nm = 180; nm <= 4000; nm += 20) {
      const point = [X(nm), Y(planck(nm, d.T)), 0];
      if (previous) segment(previous, point, d.color, 2.5);
      previous = point;
    }
    const peak = peakOf(d.T);
    if (peak >= 180 && peak <= 4000) {
      const tip = [X(peak), Y(planck(peak, d.T)), 0];
      segment([tip[0], 0.15, 0], tip, d.color, 1);
      label([tip[0], tip[1] + 0.25, 0], 'λ峰 ' + peak.toFixed(0) + ' nm', d.color, 11);
    }
  }
  // 時間軸掃描的波長。
  const scan = X(s.wavelength);
  segment([scan, 0.15, 0], [scan, 2.4, 0], '#5d6fb0', 1.5);
  label([scan, 2.6, 0], s.wavelength.toFixed(0) + ' nm', '#5d6fb0', 12);
}
