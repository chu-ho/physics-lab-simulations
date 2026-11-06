'use strict';
(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  const energy = n => -13.5984 / n ** 2;
  M.register('hydrogen-spectrum', '氫原子能階與光譜', '近代物理', 'hydrogen-spectrum', [
    P('lower', '低能階主量子數', 1, 4, 1, 2),
    P('jump', '兩能階的主量子數差', 1, 5, 1, 1),
    P('absorption', '模式（0 發射／1 吸收）', 0, 1, 1, 0)
  ], [metric('delta', '光子能量', 'eV'), metric('wavelength', '真空波長', 'nm'), metric('upperEnergy', '高能階能量', 'eV')],
  'Eₙ = −13.5984/n² eV；E光子 = |ΔE|；λ = hc/E光子',
  '採氫原子玻爾能階與理想離散躍遷。忽略精細結構、自然線寬與選擇定則。動畫為能階示意，時間用於標記躍遷事件。',
  ['固定低能階，提高高能階，比較光子能量和波長。', '將相同兩能階切換成吸收，波長如何變化？'], p => {
    const upper = p.lower + p.jump;
    const lowerEnergy = energy(p.lower), upperEnergy = energy(upper);
    const delta = upperEnergy - lowerEnergy;
    return trajectory(6, t => ({
      upper, lowerEnergy, upperEnergy, delta, wavelength: 1239.841984 / delta,
      level: (t < 3) === Boolean(p.absorption) ? p.lower : upper
    }), {
      events: [{key: 'transition', t: 3, label: p.absorption ? '吸收光子' : '發射光子'}],
      hidePrimary: true, hideFloor: true, schematic: true,
      bounds: {min: [-3, 0, -1], max: [3, 5, 1]}
    });
  }, 'models/hydrogen-spectrum.js');
})(globalThis.Mechanics);
