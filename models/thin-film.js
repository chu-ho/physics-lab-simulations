'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  function reflectance(wavelength, thickness, index, substrate, angle, polarized) {
    const c0 = Math.cos(angle);
    const sine = Math.sin(angle);
    const c1 = Math.sqrt(1 - (sine / index) ** 2);
    const c2 = Math.sqrt(1 - (sine / substrate) ** 2);
    const [a, b, c] = polarized ? [1 / c0, index / c1, substrate / c2] : [c0, index * c1, substrate * c2];
    const r01 = (a - b) / (a + b);
    const r12 = (b - c) / (b + c);
    const phase = 4 * Math.PI * index * thickness * c1 / wavelength;
    const cross = 2 * r01 * r12 * Math.cos(phase);
    return (r01 ** 2 + r12 ** 2 + cross) / (1 + (r01 * r12) ** 2 + cross);
  }

  M.register('thin-film', '薄膜干涉：反射光譜與鍍膜', '波動光學', 'thin-film', [
    P('thickness', '膜厚', 0, 1200, 1, 100, 'nm'),
    P('filmIndex', '薄膜折射率', 1, 2.5, .01, 1.38),
    P('substrateIndex', '基底折射率', 1, 2.5, .01, 1.52),
    P('angle', '入射角', 0, 75, 1, 0, '°'),
    P('polarized', '偏振（0：s／1：p）', 0, 1, 1, 0)
  ], [metric('reflectance', '反射率', '%'), metric('transmittance', '透射率', '%'), metric('wavelength', '掃描波長', 'nm')],
  '往返相位差 δ = 4πn d cosθ₁ / λ；R + T = 1',
  '空氣、平行無吸收薄膜與半無限基底。以 Fresnel 振幅和多次反射求相干反射，折射率不隨波長變化。光線與膜厚放大示意，時間軸掃描真空波長。',
  ['在正入射下改變膜厚，觀察反射率最低點移往何處。', '把膜厚設為零，改變薄膜折射率，反射光譜是否改變？'], p => {
    const angle = p.angle * Math.PI / 180;
    const value = nm => 100 * reflectance(nm, p.thickness, p.filmIndex, p.substrateIndex, angle, p.polarized);
    return trajectory(10, t => {
      const wavelength = 380 + 400 * t / 10;
      const reflectance = value(wavelength);
      return {wavelength, reflectance, transmittance: 100 - reflectance};
    }, {
      positionPlot: {
        key: 'wavelength', label: '真空波長', unit: 'nm', min: 380, max: 780,
        title: '薄膜反射光譜', menuLabel: '反射光譜', yUnit: '%',
        series: [{label: '反射率', color: '#8ee0c0', value}]
      },
      hidePrimary: true, hideFloor: true, schematic: true,
      bounds: {min: [-3, 0, -1.4], max: [3, 4, 1.4]},
      endLabel: '波長掃描完成'
    });
  }, 'models/thin-film.js');
  M.defs.find(d => d.id === 'thin-film').defaultPlotMode = 'position';
})(globalThis.Mechanics);
