'use strict';
function drawRadioactiveDecay(s) {
  const side = Math.ceil(Math.sqrt(params.population));
  for (const [i, lifetime] of simulation.lifetimes.entries()) {
    const x = 6 * ((i % side + .5) / side - .5);
    const z = 6 * ((Math.floor(i / side) + .5) / side - .5);
    sphere([x,.45,z], 1.8 / side, lifetime > t ? '#358c78' : '#a7b3b9');
  }
  label([0,1.7,0], '剩餘 ' + s.remaining + ' 個 · 期望 ' + s.expected.toFixed(1) + ' 個', '#375868', 14);
}
