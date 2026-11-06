'use strict';
(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  M.register('radioactive-decay', '放射性衰變與半衰期', '近代物理', 'radioactive-decay', [
    P('population', '初始核數', 25, 400, 25, 100),
    P('halfLife', '半衰期', 1, 15, .5, 5, 's'),
    P('seed', '抽樣種子', 1, 100, 1, 17)
  ], [metric('remaining', '剩餘母核', '個'), metric('expected', '理論期望', '個'), metric('decayed', '已衰變', '個')],
  'λ = ln(2)/T½；E[N(t)] = N₀ exp(−λt)',
  '獨立母核以固定衰變率做指數等待時間抽樣。已衰變核保留為灰色標記。固定種子可重播同一樣本。',
  ['在一個半衰期時，比較實際剩餘核數與期望。', '換種子或增加核數，觀察相對波動如何改變。'], p => {
    const lambda = Math.LN2 / p.halfLife;
    let seed = p.seed;
    const lifetimes = Array.from({length: p.population}, () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return -Math.log((seed + .5) / 4294967296) / lambda;
    });
    return trajectory(5 * p.halfLife, t => {
      const remaining = lifetimes.reduce((sum, life) => sum + Number(life > t), 0);
      return { remaining, expected: p.population * Math.exp(-lambda * t), decayed: p.population - remaining };
    }, {
      lifetimes, hidePrimary: true, hideFloor: true, schematic: true,
      bounds: {min: [-3.3, 0, -3.3], max: [3.3, 2, 3.3]}
    });
  }, 'models/radioactive-decay.js');
})(globalThis.Mechanics);
