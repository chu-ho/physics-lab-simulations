'use strict';
let michelsonCache;
function michelsonTexture(d) {
  const p = params,
    key = [p.lambda, p.tilt, d.toFixed(5)].join(',');
  if (michelsonCache?.key === key) return michelsonCache.texture;
  const size = 256,
    texture = michelsonCache?.texture || document.createElement('canvas');
  texture.width = size;
  texture.height = size;
  const g = texture.getContext('2d'),
    im = g.createImageData(size, size),
    color = spectralColor(p.lambda),
    half = simulation.screenHalf;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const I = simulation.pattern(d, half * ((2 * (x + 0.5)) / size - 1), half * (1 - (2 * (y + 0.5)) / size)),
        i = 4 * (y * size + x);
      for (let c = 0; c < 3; c++) im.data[i + c] = 8 + Math.round(240 * color[c] * I);
      im.data[i + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  michelsonCache = { key, texture };
  return texture;
}

function drawMichelson(s) {
  const p = params,
    h = 1,
    beam = '#' + spectralColor(p.lambda).map(c => Math.round(c * 210).toString(16).padStart(2, '0')).join(''),
    m1x = 2.4 + 0.009 * s.mirror,
    tilt = 3.5 * p.tilt,
    m2z = 2.6,
    screenZ = -3.6,
    side = 4.2;

  // 光學桌
  polygon(
    [
      [-5.2, 0, -4.2],
      [4.6, 0, -4.2],
      [4.6, 0, 3.4],
      [-5.2, 0, 3.4]
    ],
    '#dfe8e6',
    '#b7c7c4'
  );
  // 雷射與擴束
  box([-4.4, h, 0], [1.2, 0.45, 0.45], '#7896a3');
  label([-4.4, h + 0.6, 0], '雷射 λ = ' + p.lambda + ' nm', '#375765', 11);
  segment([-3.8, h, 0], [0, h, 0], beam, 3);
  // 分光鏡：45° 半透明玻璃片
  const u = [Math.SQRT1_2, 0, Math.SQRT1_2],
    c = [0, h, 0],
    q = (a, b) => [c[0] + a * u[0], c[1] + b, c[2] + a * u[2]];
  polygon([q(-0.55, -0.55), q(0.55, -0.55), q(0.55, 0.55), q(-0.55, 0.55)], '#9fd0e0aa', '#4c7c8c');
  label([0.2, h + 0.85, 0.3], '分光鏡', '#3c697b', 10);
  // 兩臂與回到屏的光
  segment([0, h, 0], [m1x, h, 0], beam, 2.5);
  segment([0, h, 0], [0, h, m2z], beam, 2.5);
  segment([0, h, 0], [0, h, screenZ], beam, 3);
  for (const [dx, dy] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1]
  ])
    segment([0, h, -0.6], [0.9 * dx, h + 0.9 * dy, screenZ], beam + '55', 1);
  // 鏡 M₁（可動、可傾斜）與 M₂（固定）
  box([m1x + 0.06, h, 0], [0.12, 1.1, 1.1], '#c4ccd4', tilt);
  box([m1x + 0.5, h - 0.55, 0], [0.7, 0.2, 0.9], '#8a7a62');
  label([m1x + 0.2, h + 0.95, 0], '鏡 M₁（可動）', '#3c697b', 11);
  label([m1x + 0.2, h + 0.6, 0], 'd = ' + s.mirror.toFixed(2) + ' μm', '#3c697b', 10);
  box([0, h, m2z + 0.06], [1.1, 1.1, 0.12], '#c4ccd4');
  label([0, h + 0.85, m2z], '鏡 M₂（固定）', '#3c697b', 11);

  // 屏與條紋（實際亮度分布）
  texturedScreen(michelsonTexture(s.mirror), [-side / 2, h + side / 2, screenZ], side, side, [1, 0, 0]);
  const mark = '#ffd166';
  segment([-0.18, h, screenZ + 0.02], [0.18, h, screenZ + 0.02], mark, 1.5);
  segment([0, h - 0.18, screenZ + 0.02], [0, h + 0.18, screenZ + 0.02], mark, 1.5);
  label([0, h + side / 2 + 0.3, screenZ], '屏（±' + simulation.screenHalf + ' mm）', '#375765', 11);

  // 數條紋
  const bright = s.centerIntensity > 0.9,
    dark = s.centerIntensity < 0.1;
  label(
    [-4.8, 3.95, -3.6],
    '中心' + (bright ? '亮' : dark ? '暗' : '亮度 ' + s.centerIntensity.toFixed(2)) + '　已數條紋 N = ' + s.count,
    '#7a5a10',
    13
  );
  label([-4.8, 3.45, -3.6], 'ΔL = Nλ/2 = ' + s.estimate.toFixed(3) + ' μm', '#375765', 12);
  label([-4.8, 3.0, -3.6], '實際位移 Δd = ' + s.displacement.toFixed(3) + ' μm', '#576577', 11);
  if (p.tilt > 0) label([-4.8, 2.55, -3.6], '傾角 β = ' + p.tilt.toFixed(3) + ' mrad → 直條紋間距 ≈ ' + ((p.lambda * 1e-6) / (2 * p.tilt * 1e-3)).toFixed(1) + ' mm', '#576577', 10);
}
