'use strict';
function drawHydrogenSpectrum(s) {
  const y = n => .5 + 3.1 * (1 - 1 / n ** 2);
  for (const n of new Set([1, params.lower, s.upper])) {
    segment([-1.65,y(n),0],[1.65,y(n),0], '#496a7e', 2);
    label([-2.12,y(n),0], 'n=' + n, '#375868', 12);
  }
  sphere([0,y(s.level),0], .13, '#3c9c8a');
  label([0,4.6,0], s.wavelength.toFixed(1) + ' nm · ' + s.delta.toFixed(3) + ' eV', '#375868', 14);
  if (t >= 3) label([1.65,4,0], params.absorption ? '吸收光子' : '發射光子', '#a56836', 12);
}
