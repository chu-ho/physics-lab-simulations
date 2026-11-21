/* Two hoists lift the same load through the same height at different constant speeds: same work, different power. */
(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  M.register(
    'power-hoist',
    '功率：等功不同時',
    '能量與動量',
    'power-hoist',
    [
      P('m', '重物質量', 50, 500, 10, 200, 'kg'),
      P('h', '吊升高度', 2, 20, 0.5, 10, 'm'),
      P('tA', 'A 吊車所需時間', 4, 40, 1, 20, 's'),
      P('tB', 'B 吊車所需時間', 4, 40, 1, 8, 's'),
      P('f', '導軌摩擦力', 0, 600, 20, 200, 'N'),
      P('eta', '馬達效率', 40, 100, 5, 80, '%'),
      P('g', '重力加速度', 1, 15, 0.1, 9.8, 'm/s²')
    ],
    [metric('PA', 'A 輸出功率', 'W'), metric('PB', 'B 輸出功率', 'W'), metric('W', '每台作功', 'J')],
    'W = Fh；P = W/t = Fv；F = mg + f；η機械 = mgh/W；P輸入 = P/η馬達',
    '兩台吊車各把同一重物以固定速率吊升相同高度 h（略去起動與停止的短暫加速階段），故拉力 F = mg + f，每台作功皆為 Fh，與快慢無關；平均功率 P = W/t 與時間成反比，瞬時功率 P = Fv 在吊升時為定值，抵達後歸零。摩擦力 f 為導軌對重物的定力，使機械效率 η機械 = mg/(mg+f) 與速度無關。馬達效率 η 另計電能輸入 W/η。較快完成的吊車功率較大，但耗費的總能量相同。',
    ['兩台吊車作的功相同，為何功率不同？', '把摩擦力設為零，輸出功與重力位能增加量有什麼關係？'],
    p => {
      const F = p.m * p.g + p.f,
        W = F * p.h,
        duration = Math.max(p.tA, p.tB),
        run = (t, T) => {
          const moving = t < T,
            y = (p.h * Math.min(t, T)) / T,
            v = moving ? p.h / T : 0;
          return { y, v, P: F * v, work: F * y, avg: W / T, lift: p.m * p.g * y };
        };
      return trajectory(
        duration,
        t => {
          const a = run(t, p.tA),
            b = run(t, p.tB);
          return {
            yA: a.y,
            yB: b.y,
            vA: a.v,
            vB: b.v,
            PA: a.P,
            PB: b.P,
            WA: a.work,
            WB: b.work,
            avgPA: a.avg,
            avgPB: b.avg,
            W,
            F,
            Ein: W / (p.eta / 100),
            effMech: (p.m * p.g) / F,
            U: a.lift
          };
        },
        {
          hidePrimary: true,
          hideFloor: true,
          schematic: true,
          endLabel: '兩台吊車作功相同，功率不同',
          bounds: { min: [-3.5, 0, -3.2], max: [3.5, p.h + 3.5, 3.2] }
        }
      );
    },
    'models/power-hoist.js'
  );
  const d = M.defs.find(d => d.id === 'power-hoist');
  d.plotMetrics = [
    metric('WA', 'A 累積作功', 'J'),
    metric('WB', 'B 累積作功', 'J'),
    metric('avgPA', 'A 平均功率', 'W'),
    metric('avgPB', 'B 平均功率', 'W'),
    metric('Ein', '馬達耗電能', 'J')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
