'use strict';
function drawCircuitRC(s) {
  const parallel = params.mode === 1;
  const rc = params.mode >= 2;
  const discharge = params.mode === 3;
  const ink = '#46616a', active = colors.mint, meter = '#80533d';
  const top = 3.3, base = .9;
  const at = (x, y) => [x, y, 0];
  const wire = (x1, y1, x2, y2, color = ink) => segment(at(x1, y1), at(x2, y2), color, 3);
  const text = (x, y, value, color = ink) => label([x, y, .12], value, color, 11);
  const resistor = (x, y, value, volts, current) => {
    box(at(x, y), [1.1, .34, .42], '#b98b65');
    text(x, y + .53, value + ' · ' + volts.toFixed(2) + ' V', meter);
    text(x, y - .38, current.toFixed(2) + ' A', active);
  };
  text(0, 4.55, ['串聯', '並聯', 'RC 充電', 'RC 放電'][params.mode] +
    (params.closed ? ' · 開關閉合' : ' · 開關斷開'));
  wire(-4, top, -3.4, top, '#ba6650');
  wire(-3.4, top, -2.65, top + (params.closed ? 0 : .45), meter);
  sphere(at(-3.4, top), .055);
  sphere(at(-2.65, top), .055);
  wire(-4, base, 4, base);
  if (discharge) {
    wire(-4, base, -4, top);
  } else {
    wire(-4, top, -4, 2.3, '#ba6650');
    wire(-4, 1.96, -4, base);
    wire(-4.32, 2.3, -3.68, 2.3, '#ba6650');
    wire(-4.18, 1.96, -3.82, 1.96);
    text(-3.12, 2.03, params.voltage + ' V');
  }
  if (parallel) {
    const lower = 2.1;
    wire(-2.65, top, -2.25, top);
    wire(-2.25, top, -2.25, lower);
    for (const y of [top, lower]) {
      wire(-2.25, y, -.55, y, s.nodeVoltage ? '#ba6650' : ink);
      wire(.55, y, 4, y);
    }
    wire(4, base, 4, top);
    sphere(at(-2.25, top), .065);
    sphere(at(4, lower), .065);
    resistor(0, top, 'R₁', s.v1, s.i1);
    resistor(0, lower, 'R₂', s.v2, s.i2);
    text(2.75, 3.75, '並聯節點 ' + s.nodeVoltage.toFixed(2) + ' V', meter);
  } else {
    wire(-2.65, top, -1.55, top, params.closed ? '#ba6650' : ink);
    resistor(-1, top, 'R₁', s.v1, s.i1);
    if (rc) {
      wire(-.45, top, 4, top, s.nodeVoltage ? '#ba6650' : ink);
      wire(4, top, 4, 2.28);
      wire(4, 1.94, 4, base);
      wire(3.64, 2.28, 4.36, 2.28, '#ba6650');
      wire(3.64, 1.94, 4.36, 1.94);
      text(2.9, 2.25, 'V꜀ ' + s.nodeVoltage.toFixed(2) + ' V', meter);
      text(2.9, 1.7, '儲能 ' + s.stored.toFixed(2) + ' J');
    } else {
      wire(-.45, top, 1.45, top, s.nodeVoltage ? '#947046' : ink);
      resistor(2, top, 'R₂', s.v2, s.i2);
      wire(2.55, top, 4, top);
      wire(4, top, 4, base);
      sphere(at(.5, top), .065);
      text(.5, 3.75, '節點 ' + s.nodeVoltage.toFixed(2) + ' V', meter);
    }
  }
  if (Math.abs(s.current) > 1e-6) {
    const [from, to] = s.current > 0 ? [1.4, .45] : [.45, 1.4];
    arrow(at(from, base), at(to, base), active, '');
    if (parallel) {
      arrow(at(1.2, top), at(2, top), active, '');
      arrow(at(1.2, 2.1), at(2, 2.1), active, '');
    }
  }
  text(-1.8, .61, '回流端 0 V');
  text(1.65, .61, rc ? 'τ = ' + s.tau.toFixed(2) + ' s' : '等效電阻 ' + s.equivalent.toFixed(2) + ' Ω');
}
