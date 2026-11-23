/* Parameter levels for the 入門／探究／進階 switch. 1 = 入門, 2 = 探究; unlisted parameters are 進階 (3). */
'use strict';
// 只列出已試做分層的實驗；未列出的實驗不顯示分層切換，所有拉桿照常出現。
// 層次是「最少要到哪一層才顯示」：入門只看主要現象，探究加入次要變因，進階為全部。
const ParamLevels = {
  'double-slit': { L: 1, lambda: 1, d: 1, a: 2, b: 2, span: 2 },
  'optical-instruments': {
    mode: 1,
    objectDistance: 1,
    f1: 2,
    f2: 2,
    separation: 2,
    objectMode: 2,
    objectHeight: 2,
    rays: 2,
    images: 2
  },
  'block-stack': { n: 1, L: 1, spread: 1, layer: 2, push: 2 },
  'collision-2d': { m1: 1, m2: 1, v: 1, e: 1, b: 2, v2: 2, angle1: 2, angle2: 2 },
  'two-source-interference': {
    separation: 1,
    lambda: 1,
    nodes: 1,
    antinodes: 1,
    phase: 2,
    A: 2,
    c: 2,
    trackX: 2,
    trackZ: 2,
    fronts: 2
  },
  doppler: { sourceV: 1, observerV: 1, frequency: 1, fronts: 1, wind: 2, temperature: 2, distance: 2, listen: 2 },
  rainbow: { view: 1, altitude: 1, order: 1, n: 2, wavelength: 2, impact: 2, cones: 2 },
  'two-charges': {
    qA: 1,
    qB: 1,
    distance: 1,
    fieldLines: 1,
    equipotential: 1,
    probeX: 2,
    probeY: 2,
    view: 2,
    vectors: 2
  },
  'standing-waves': { mode: 1, lambda: 1, c: 1, markers: 1, A: 2, ratio: 2, components: 2, track: 2 },
  'gravitation-g': { mode: 1, M: 1, h: 1, phi: 1, m: 2, l: 2, R: 2, day: 2 }
};
const PARAM_LEVEL_NAMES = ['入門', '探究', '進階'];
function paramLevelOf(experimentId, paramId) {
  return ParamLevels[experimentId]?.[paramId] || 3;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { ParamLevels, paramLevelOf, PARAM_LEVEL_NAMES };
