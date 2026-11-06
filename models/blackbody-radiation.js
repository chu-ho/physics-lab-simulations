'use strict';
(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  const spectrum = (nm, temperature) => {
    const wavelength = nm * 1e-9;
    return 2 * Math.PI * 6.62607015e-34 * 299792458 ** 2 /
      (wavelength ** 5 * Math.expm1(0.014387768775 / (wavelength * temperature))) * 1e-9;
  };
  M.register('blackbody-radiation', '黑體輻射：溫度與光譜', '近代物理', 'blackbody-radiation', [
    P('temperature', '絕對溫度', 800, 12000, 100, 5800, 'K'),
    P('reference', '比較溫度', 800, 12000, 100, 3000, 'K')
  ], [metric('peak', '峰值波長', 'nm'), metric('power', '總輻射出射度', 'W/m²'), metric('intensity', '取樣光譜出射度', 'W/m²/nm')],
  'λ峰 T = 2.89777×10⁶ nm·K；M = σT⁴',
  '理想黑體，圖示為每單位波長的半球光譜出射度。時間軸掃描波長，物體溫度固定。圖中球體色彩僅區分兩組溫度。',
  ['提高溫度，預測峰值波長往何處移動。', '把溫度加倍，總輻射出射度會變成幾倍？'], p => {
    const peak = 2.897771955e6 / p.temperature;
    const power = 5.670374419e-8 * p.temperature ** 4;
    return trajectory(10, t => {
      const wavelength = 180 + 3820 * t / 10;
      return { wavelength, peak, power, intensity: spectrum(wavelength, p.temperature) };
    }, {
      positionPlot: {
        key: 'wavelength', label: '波長', unit: 'nm', min: 180, max: 4000,
        title: '黑體光譜', menuLabel: '波長光譜', yUnit: 'W/m²/nm',
        series: [
          { label: '主要溫度', color: '#ffc183', value: nm => spectrum(nm, p.temperature) },
          { label: '比較溫度', color: '#8ee0c0', value: nm => spectrum(nm, p.reference) }
        ]
      },
      hidePrimary: true, hideFloor: true, schematic: true,
      bounds: { min: [-3, 0, -1], max: [3, 4, 1] },
      endLabel: '波長掃描完成'
    });
  }, 'models/blackbody-radiation.js');
  M.defs.find(d => d.id === 'blackbody-radiation').defaultPlotMode = 'position';
})(globalThis.Mechanics);
