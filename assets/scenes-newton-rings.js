'use strict';
let newtonRingsCache;
function newtonRingsTexture() {
  const p = params,
    key = [p.mode, p.R, p.wedge, p.lambda, p.n, p.view].join(',');
  if (newtonRingsCache?.key === key) return newtonRingsCache.texture;
  const size = 384,
    texture = document.createElement('canvas');
  texture.width = size;
  texture.height = size;
  const g = texture.getContext('2d'),
    im = g.createImageData(size, size),
    color = spectralColor(p.lambda),
    span = simulation.span,
    // 2×2 超取樣，避免外圈細環產生疊紋
    at = (x, y) => {
      const u = x / size,
        v = y / size;
      return p.mode === 0 ? simulation.display(span * Math.hypot(2 * u - 1, 1 - 2 * v)) : simulation.display(span * u);
    };
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const I = (at(x + 0.25, y + 0.25) + at(x + 0.75, y + 0.25) + at(x + 0.25, y + 0.75) + at(x + 0.75, y + 0.75)) / 4,
        i = 4 * (y * size + x);
      for (let c = 0; c < 3; c++) im.data[i + c] = 8 + Math.round(240 * color[c] * I);
      im.data[i + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  newtonRingsCache = { key, texture };
  return texture;
}

function drawNewtonRings(s) {
  const p = params,
    sim = simulation,
    ring0 = p.mode === 0,
    beam = '#' + spectralColor(p.lambda).map(c => Math.round(c * 200).toString(16).padStart(2, '0')).join(''),
    filmColor = p.n > 1.005 ? '#7fb6d6' : '#d7ecf2';

  // —— 左：剖面示意（膜厚大幅放大）——
  const axis = -3.4,
    plateTop = 0,
    halfWidth = 2.5;
  box([axis, plateTop - 0.25, 0], [2 * halfWidth + 0.4, 0.5, 2.2], '#9cc3cf');
  label([axis, -0.85, 0], '平面玻璃（n = 1.52）', '#3c697b', 10);
  let probeX, gapAt;
  if (ring0) {
    // 平凸透鏡：底面 y = cρ²，頂面平
    const lensR = 2.3,
      top = 1.25,
      c = 0.55 / (lensR * lensR),
      rings = 8,
      sectors = 28,
      V = (rho, phi, y) => [axis + rho * Math.cos(phi), y, rho * Math.sin(phi) * 0.45];
    const sag = rho => c * rho * rho;
    gapAt = x => sag(x - axis);
    for (let i = 0; i < rings; i++)
      for (let k = 0; k < sectors; k++) {
        const r0 = (lensR * i) / rings,
          r1 = (lensR * (i + 1)) / rings,
          a0 = (TAU * k) / sectors,
          a1 = (TAU * (k + 1)) / sectors;
        polygon([V(r0, a0, sag(r0)), V(r1, a0, sag(r1)), V(r1, a1, sag(r1)), V(r0, a1, sag(r0))], '#a9d3e0aa');
      }
    for (let k = 0; k < sectors; k++) {
      const a0 = (TAU * k) / sectors,
        a1 = (TAU * (k + 1)) / sectors;
      polygon([V(lensR, a0, sag(lensR)), V(lensR, a1, sag(lensR)), V(lensR, a1, top), V(lensR, a0, top)], '#b9dde899');
      polygon([V(0, 0, top), V(lensR, a0, top), V(lensR, a1, top)], '#cfe8efaa');
    }
    // 薄膜剖面（z = 0 前緣）
    const film = [];
    for (let i = -20; i <= 20; i++) film.push([axis + (lensR * i) / 20, sag((lensR * i) / 20), 0.02]);
    for (let i = 20; i >= -20; i--) film.push([axis + (lensR * i) / 20, plateTop, 0.02]);
    polygon(film, filmColor + 'cc');
    label([axis, top + 0.35, 0], '平凸透鏡　R = ' + p.R.toFixed(1) + ' m', '#3c697b', 11);
    probeX = axis + (2.2 * s.probe) / sim.span;
    label([axis, -0.25, 1.15], '接觸點 t = 0', '#3c697b', 10);
  } else {
    // 楔形膜：左端接觸，右端夾墊片
    const left = axis - halfWidth,
      length = 2 * halfWidth,
      lift = 0.6,
      tilt = Math.atan2(lift, length),
      thick = 0.3;
    gapAt = x => (lift * (x - left)) / length;
    box(
      [left + (length / 2) * Math.cos(tilt) - (thick / 2) * Math.sin(tilt), lift / 2 + (thick / 2) * Math.cos(tilt), 0],
      [length / Math.cos(tilt), thick, 2.2],
      '#b9dde8',
      tilt
    );
    box([left + length - 0.12, lift / 2, 0], [0.18, lift, 1.6], '#b0654b');
    polygon(
      [
        [left, plateTop, 1.12],
        [left + length - 0.21, gapAt(left + length - 0.21), 1.12],
        [left + length - 0.21, plateTop, 1.12]
      ],
      filmColor + 'cc'
    );
    label([left + length - 0.1, lift + 0.75, 0], '墊片', '#855740', 10);
    label([axis, lift + 0.75, 0], '上玻璃片　α = ' + p.wedge.toFixed(2) + ' mrad', '#3c697b', 11);
    label([left, -0.25, 1.15], '接觸邊 t = 0', '#3c697b', 10);
    probeX = left + (length * s.probe) / sim.span;
  }

  // 入射光與兩道相干光（在掃描點）：反射往上、透射往下
  const yTop = 3.3,
    yUpper = gapAt(probeX),
    off = 0.14,
    reflect = p.view === 0;
  segment([probeX, yTop, 0.05], [probeX, reflect ? plateTop : -1.1, 0.05], beam, 2.5);
  if (reflect) {
    segment([probeX - off, yUpper, 0.05], [probeX - off, yTop, 0.05], beam + 'cc', 2);
    segment([probeX + off, plateTop, 0.05], [probeX + off, yTop, 0.05], beam + 'cc', 2);
    label([probeX - off - 0.2, yTop + 0.05, 0], '①', '#375765', 11);
    label([probeX + off + 0.2, yTop + 0.05, 0], '②', '#375765', 11);
  } else segment([probeX + off, plateTop, 0.05], [probeX + off, -1.1, 0.05], beam + '88', 2);
  sphere([probeX, plateTop, 0.05], 0.06, '#d39b45');
  label([probeX, yTop + 0.45, 0], '入射 λ = ' + p.lambda + ' nm', '#375765', 11);
  label(
    [-3.4, -2.3, 0],
    reflect ? '① 膜上表面反射：玻璃→膜，無相位突變' : '透射：直接穿透的光＋在膜內來回反射一次的光',
    '#576577',
    10
  );
  label(
    [-3.4, -2.7, 0],
    reflect ? '② 膜下表面反射：膜→玻璃，半波損失 π' : '膜內兩次反射各有 π，互相抵消 → 與反射亮暗互補',
    '#576577',
    10
  );
  label(
    [-3.4, -1.35, 0],
    '掃描點 ' + (ring0 ? 'r' : 'x') + ' = ' + s.probe.toFixed(2) + ' mm　t = ' + s.thickness.toFixed(0) + ' nm',
    '#375765',
    11
  );
  const nearDark = Math.abs(s.intensity) < 0.04;
  label(
    [-3.4, -1.8, 0],
    '2nt／λ = ' + s.pathRatio.toFixed(2) + (nearDark ? '　→ 暗' : s.intensity > 0.96 ? '　→ 亮' : ''),
    nearDark ? '#2f5a7a' : '#576577',
    11
  );

  // —— 右：俯視條紋（實際尺寸）——
  const X0 = 0.9,
    Y0 = 4.0,
    side = 5.2;
  texturedScreen(newtonRingsTexture(), [X0, Y0, 0], side, side, [1, 0, 0]);
  const toScreen = pos => (ring0 ? X0 + side / 2 + (side / 2) * (pos / sim.span) : X0 + side * (pos / sim.span)),
    cy = Y0 - side / 2,
    mark = '#ffd166';
  if (ring0) {
    if (s.rDark <= sim.span) ring([X0 + side / 2, cy, 0.03], ((side / 2) * s.rDark) / sim.span, 'xy', mark, 1.5);
    label([X0 + side / 2, Y0 + 0.3, 0], '俯視牛頓環（視窗 ±' + sim.span + ' mm）', '#375765', 11);
  } else {
    if (s.rDark <= sim.span) segment([toScreen(s.rDark), Y0, 0.03], [toScreen(s.rDark), Y0 - side, 0.03], mark, 1.5);
    label([X0 + side / 2, Y0 + 0.3, 0], '俯視楔形膜條紋（0 – ' + sim.span + ' mm）', '#375765', 11);
  }
  sphere([toScreen(s.probe), cy, 0.06], 0.07, '#ffffff');
  label(
    [X0 + side / 2, Y0 - side - 0.35, 0],
    (p.view === 0 ? '反射光' : '透射光（對比已放大）') +
      '　第 ' +
      p.m +
      ' 條暗' +
      (ring0 ? '環 r' : '紋 x') +
      ' = ' +
      s.rDark.toFixed(3) +
      ' mm',
    '#7a5a10',
    11
  );
  label(
    [X0 + side / 2, Y0 - side - 0.8, 0],
    (ring0 ? (p.view === 0 ? 'rₘ = √(mλR/n)' : 'rₘ = √((m−½)λR/n)') : p.view === 0 ? 'xₘ = mλ/(2nα)' : 'xₘ = (m−½)λ/(2nα)') +
      '　相鄰間距 ' + s.spacing.toFixed(3) + ' mm',
    '#576577',
    10
  );
}
