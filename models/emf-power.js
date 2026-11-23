'use strict';

(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  const LOAD = ['單一燈泡', '兩燈串聯', '兩燈並聯'];
  M.register(
    'emf-power',
    '電動勢、歐姆定律與電功率',
    '電磁學',
    'emf-power',
    [
      P('mode', '負載（0：單燈；1：兩燈串聯；2：兩燈並聯）', 0, 2, 1, 0, ''),
      P('closed', '開關（0：斷開；1：閉合）', 0, 1, 1, 1, ''),
      P('emf', '電動勢 ε', 1.5, 12, 0.5, 6, 'V'),
      P('internal', '內電阻 r', 0, 4, 0.1, 1, 'Ω'),
      P('load', '每個燈泡電阻 R', 0.5, 20, 0.1, 2, 'Ω')
    ],
    [
      metric('terminalVoltage', '端電壓 V', 'V'),
      metric('current', '總電流 I', 'A'),
      metric('loadPower', '負載總功率', 'W')
    ],
    'I = ε/(R外+r) · V = ε − Ir = IR外 · P負載 = I²R外 · P內耗 = I²r · R外 = r 時 P負載最大 = ε²/(4r)',
    '理想導線與歐姆式燈泡：燈泡電阻固定，不隨溫度改變。電池以理想電動勢 ε 串聯內電阻 r 表示，伏特計理想（不分流）、安培計理想（無壓降）。串聯外電阻 2R、並聯 R/2。開關斷開時電流為零，端電壓等於電動勢。時間軸是直流穩態下的累積觀察：播放秒等於物理秒，電荷流過量與能量線性累積。燈泡亮度與該燈功率單調對應，只作示意；移動小點是傳統電流方向的示意載子，速度與電流成正比，不是實際漂移速率。',
    [
      '固定 ε 與 r，把燈泡電阻 R 從小調到大，先預測端電壓與電流各怎麼變，再用功率—電阻圖找出負載功率最大的位置。',
      '比較兩燈串聯與並聯：哪一種接法每個燈泡較亮？內電阻損耗的功率比例又如何？',
      '把開關斷開，讀端電壓；再閉合，說明端電壓為何下降、下降量等於多少。'
    ],
    p => {
      const external = p.mode === 1 ? 2 * p.load : p.mode === 2 ? p.load / 2 : p.load;
      const current = p.closed ? p.emf / (external + p.internal) : 0;
      const terminalVoltage = p.emf - current * p.internal;
      const loadPower = current * current * external;
      const internalPower = current * current * p.internal;
      const totalPower = p.emf * current;
      const bulbCurrent = p.mode === 2 ? current / 2 : current;
      const bulbPower = bulbCurrent * bulbCurrent * p.load;
      const best = p.internal > 0 ? (p.emf * p.emf) / (4 * p.internal) : Infinity;
      const loadCurve = R => (p.closed ? (p.emf * p.emf * R) / (R + p.internal) ** 2 : 0);
      const lossCurve = R => (p.closed ? (p.emf * p.emf * p.internal) / (R + p.internal) ** 2 : 0);
      return trajectory(
        10,
        t => ({
          external,
          current,
          terminalVoltage,
          loadPower,
          internalPower,
          totalPower,
          efficiency: totalPower > 0 ? (100 * loadPower) / totalPower : 100,
          bulbCurrent,
          bulbVoltage: bulbCurrent * p.load,
          bulbPower,
          charge: current * t,
          supplied: totalPower * t,
          loadEnergy: loadPower * t,
          internalEnergy: internalPower * t
        }),
        {
          loadName: LOAD[p.mode],
          maximumLoadPower: best,
          positionPlot: {
            key: 'external',
            label: '外電阻 R外',
            unit: 'Ω',
            min: 0,
            max: Math.max(10, 3 * p.internal, 1.25 * external),
            title: '功率對外電阻',
            menuLabel: '功率—外電阻圖',
            yUnit: 'W',
            series: [
              { label: '負載功率 I²R外', color: '#ffc183', value: loadCurve },
              { label: '內耗 I²r', color: '#8ec5ff', value: lossCurve },
              { label: '電源總功率 εI', color: '#8ee0c0', value: R => loadCurve(R) + lossCurve(R) }
            ]
          },
          bounds: { min: [-4.8, 0, -1], max: [4.4, 4.8, 1] },
          hideGrid: () => true,
          hideFloor: true,
          hidePrimary: true,
          schematic: true,
          scaleNote: '電路示意，長度不對應實物。燈泡亮度與功率單調對應；移動小點示意傳統電流方向。',
          endLabel: '觀察 10 秒的電荷與能量累積'
        }
      );
    },
    'models/emf-power.js'
  );
  const def = M.defs.at(-1);
  def.defaultPlotMode = 'position';
  def.initialView = { yaw: -0.3, pitch: 0.2 };
  def.plotMetrics = [
    metric('internalPower', '內電阻損耗功率', 'W'),
    metric('totalPower', '電源總功率 εI', 'W'),
    metric('efficiency', '供電效率', '%'),
    metric('bulbPower', '每個燈泡功率', 'W'),
    metric('charge', '流過的電荷量', 'C'),
    metric('supplied', '電源已供能量', 'J'),
    metric('loadEnergy', '負載累積能量', 'J'),
    metric('internalEnergy', '內電阻累積熱', 'J')
  ];
})(globalThis.Mechanics);
