'use strict';

(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  const g = 9.81,
    RAMP = 8,
    TILT_PER_MN = 0.4,
    TILT_STOP = 10;
  M.register(
    'current-balance',
    '載流導線受磁力（電流天平）',
    '電磁學',
    'current-balance',
    [
      P('current', '導線電流 I（+x 為正）', -5, 5, 0.1, 3, 'A'),
      P('field', '磁場 B（水平）', 0, 0.3, 0.01, 0.15, 'T'),
      P('angle', '電流與磁場夾角 θ', 0, 180, 5, 90, '°'),
      P('length', '在磁場中的導線長 L', 2, 10, 0.5, 5, 'cm'),
      P('mass', '前端砝碼質量 m', 0, 10, 0.1, 2, 'g')
    ],
    [
      metric('force', '磁力（向上為正）', 'mN'),
      metric('weight', '砝碼重量 mg', 'mN'),
      metric('tilt', '天平前端仰角', '°')
    ],
    'F = I L × B · |F| = ILB sinθ · 平衡時 ILB sinθ = mg，I平衡 = mg/(LB sinθ)',
    '等臂電流天平：未通電、未放砝碼時已調成水平。前端導線段沿 x 軸，長 L 的部分處在均勻水平磁場中，磁場在水平面內與電流夾 θ 角；其餘導線在場外，兩側引線的磁力互相抵消。導線受力 F = IL × B 恆為鉛直。播放時電流在 8 秒內由 0 線性增至設定值再保持，視為準靜態；仰角是與淨力成正比的指示（每 mN 0.4°），在 ±10° 擋止，不代表真實轉動慣量與阻尼。重力加速度取 9.81 m/s²。',
    [
      '保持 B、L、θ 不變，播放並記下天平回到水平時的電流；把砝碼加倍，再預測平衡電流。',
      '把夾角由 90° 調到 30° 及 0°，用右手定則說明磁力方向與大小的變化；θ = 0° 時為什麼無論電流多大都不能平衡？',
      '把電流反向，磁力朝哪裡？天平還能平衡砝碼嗎？'
    ],
    p => {
      const L = p.length / 100,
        mass = p.mass / 1000,
        angle = (p.angle * Math.PI) / 180;
      const field = [p.field * Math.cos(angle), 0, -p.field * Math.sin(angle)];
      const weight = mass * g * 1000;
      const perAmpere = L * p.field * Math.sin(angle) * 1000;
      const balanceCurrent = Math.abs(perAmpere) > 1e-12 ? weight / perAmpere : null;
      const events = [];
      if (weight > 0 && balanceCurrent !== null && p.current !== 0) {
        const fraction = balanceCurrent / p.current;
        if (fraction > 0 && fraction <= 1)
          events.push({
            t: RAMP * fraction,
            label: `電流達 ${balanceCurrent.toFixed(2)} A：磁力等於砝碼重，天平回到水平`
          });
      }
      return trajectory(
        RAMP + 2,
        t => {
          const currentNow = p.current * Math.min(1, t / RAMP);
          const wire = [currentNow * L, 0, 0];
          const forceVector = [
            wire[1] * field[2] - wire[2] * field[1],
            wire[2] * field[0] - wire[0] * field[2],
            wire[0] * field[1] - wire[1] * field[0]
          ];
          const force = forceVector[1] * 1000;
          const net = force - weight;
          return {
            currentNow,
            forceX: forceVector[0],
            forceY: forceVector[1],
            forceZ: forceVector[2],
            force,
            weight,
            net,
            tilt: Math.max(-TILT_STOP, Math.min(TILT_STOP, TILT_PER_MN * net))
          };
        },
        {
          events,
          field,
          balanceCurrent,
          bounds: { min: [-1.8, 0.4, -1.9], max: [1.8, 4.4, 3.5] },
          minimumSceneScale: 5,
          hideFloor: true,
          hideGrid: () => true,
          hidePrimary: true,
          schematic: true,
          scaleNote: '導線長度依 L 放大示意；力箭頭長度與力成正比（25 mN 約一格），仰角只作指示。',
          endLabel: '電流已達設定值'
        }
      );
    },
    'models/current-balance.js'
  );
  M.defs.at(-1).initialView = { yaw: -2.2, pitch: 0.35 };
  M.defs.at(-1).plotMetrics = [metric('currentNow', '目前電流', 'A'), metric('net', '淨鉛直力 F − mg', 'mN')];
})(globalThis.Mechanics);
