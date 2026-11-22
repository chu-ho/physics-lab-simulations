(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers;
  const c = 299792458; // m/s
  const eps0 = 8.8541878128e-12; // F/m
  const mu0 = 1 / (eps0 * c * c);
  const timeScale = 2e-9; // 模擬 1 s = 真實 2 ns
  const duration = 20;
  const lengthRange = 12; // 畫面顯示 0–12 m

  M.register(
    'em-wave',
    '電磁波的傳播：E、B 與傳播方向',
    '電磁學',
    'em-wave',
    [
      P('frequency', '頻率 f', 30, 300, 1, 100, 'MHz'),
      P('amplitude', '電場振幅 E₀', 1, 100, 1, 60, 'V/m'),
      P('polarization', '偏振：0 線偏振／1 圓偏振（逆時針）／2 圓偏振（順時針）', 0, 2, 1, 0),
      P('angle', '線偏振的 E 方向（自 y 軸向 z 軸）', 0, 180, 5, 0, '°'),
      P('probe', '觀察點位置 x', 0, 12, 0.25, 3, 'm')
    ],
    [
      metric('wavelength', '波長 λ = c/f', 'm'),
      metric('E', '觀察點電場大小 |E|', 'V/m'),
      metric('B', '觀察點磁場大小 |B|', 'nT')
    ],
    'c = fλ；E = cB；E ⊥ B ⊥ 傳播方向，且 E×B 指向傳播方向；S = E×B/μ₀',
    '真空中沿 +x 傳播的單頻平面電磁波，E 與 B 同相、互相垂直且都垂直於 x。線偏振的 E 方向固定，圓偏振的 E 在 y–z 平面等速轉動；「逆時針」指迎著來波（由 +x 向原點看）的轉向。B = (x̂ × E)/c，故 |E|/|B| = c。振幅 E₀ 是 E 的最大值；圓偏振 |E| 恆等於 E₀。真實電磁波每秒振盪數億次，這裡模擬 1 秒相當於 2 奈秒；畫面顯示 0–12 m 的一段，E 與 B 的箭頭長度各自以同一畫面比例顯示，不代表單位相同。平面波假設波前無限延伸，忽略介質與邊界。',
    [
      '把頻率加倍，預測波長和波速分別怎麼變。再用 λ = c/f 驗證。',
      '觀察 E、B 與傳播方向。把線偏振方向轉到 90°，B 會怎麼轉？E×B 是否仍指向 +x？',
      '把電場振幅加倍，B 的大小怎麼變？換成圓偏振，同一點的 E 大小為何不再隨時間改變？'
    ],
    p => {
      const k = (2 * Math.PI * p.frequency * 1e6) / c,
        w = 2 * Math.PI * p.frequency * 1e6,
        lambda = c / (p.frequency * 1e6),
        psi = (p.angle * Math.PI) / 180,
        dirY = Math.cos(psi),
        dirZ = Math.sin(psi),
        sign = p.polarization === 2 ? -1 : 1,
        E0 = p.amplitude;
      // x 為公尺、tPhys 為秒；B = (x̂ × E)/c，x̂ × (Ey ŷ + Ez ẑ) = Ey ẑ − Ez ŷ
      const field = (x, tPhys) => {
        const eta = w * tPhys - k * x,
          Ey = p.polarization === 0 ? E0 * Math.cos(eta) * dirY : E0 * Math.cos(eta),
          Ez = p.polarization === 0 ? E0 * Math.cos(eta) * dirZ : sign * E0 * Math.sin(eta);
        return { Ey, Ez, By: -Ez / c, Bz: Ey / c, eta };
      };
      return trajectory(
        duration,
        t => {
          const f = field(p.probe, t * timeScale),
            E = Math.hypot(f.Ey, f.Ez),
            B = Math.hypot(f.By, f.Bz);
          return {
            wavelength: lambda,
            period: 1e9 / (p.frequency * 1e6),
            E,
            B: B * 1e9,
            Ey: f.Ey,
            Ez: f.Ez,
            By: f.By * 1e9,
            Bz: f.Bz * 1e9,
            ratio: B > 0 ? E / B / 1e8 : c / 1e8,
            poynting: (E * E) / (mu0 * c),
            phase: f.eta
          };
        },
        {
          field,
          lambda,
          timeScale,
          lengthRange,
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          schematic: true,
          minimumSceneScale: 5,
          bounds: { min: [-6.6, -2.4, -2.4], max: [6.6, 4.2, 2.4] },
          scaleNote: '模擬 1 s 約為真實 2 ns；E 與 B 的箭頭長度為各自的畫面比例。以圖表與讀值比較物理量。',
          endLabel: '觀察結束'
        }
      );
    },
    'models/em-wave.js'
  );

  const def = M.defs.find(d => d.id === 'em-wave');
  def.defaultPlotMetric = 'E';
  def.plotMetrics = [
    metric('Ey', '電場 y 分量', 'V/m'),
    metric('Ez', '電場 z 分量', 'V/m'),
    metric('By', '磁場 y 分量', 'nT'),
    metric('Bz', '磁場 z 分量', 'nT'),
    metric('ratio', '|E|／|B|', '10⁸ m/s'),
    metric('poynting', '瞬時能流密度 S', 'W/m²'),
    metric('period', '週期 T', 'ns'),
    metric('phase', '觀察點的相位', 'rad')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
