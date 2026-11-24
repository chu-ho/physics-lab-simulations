'use strict';

// 雙折射波片：起偏片 → 波片（快軸／慢軸）→ 檢偏片，以 Jones 向量計算偏振態轉換。
// 座標：光沿 +x 前進，橫向平面為 y（垂直向上，角度 0°）與 z；角度自 y 軸轉向 z 軸。
(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  const rad = d => (d * Math.PI) / 180,
    deg = r => (r * 180) / Math.PI;
  const period = 2; // 畫面上一個光振盪週期 = 2 s（真實約 2 fs）
  const duration = 20;

  // 複數只需要乘法與共軛；以 [re, im] 表示
  const cx = (re, im = 0) => [re, im],
    mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
    add = (a, b) => [a[0] + b[0], a[1] + b[1]],
    scale = (a, k) => [a[0] * k, a[1] * k],
    abs2 = a => a[0] * a[0] + a[1] * a[1];

  // Jones 計算：輸入起偏角 θp、快軸角 α、相位延遲 Γ（慢軸落後）；回傳出射 Jones 向量 (Ey, Ez)。
  // 慣例：實際電場 E(t) = Re[Ẽ e^{iωt}]，慢軸分量乘 e^{−iΓ}，即 E_s(t) ∝ cos(ωt − Γ)。
  function jones(polarizer, fastAxis, gamma) {
    const p = rad(polarizer),
      a = rad(fastAxis),
      f = [Math.cos(a), Math.sin(a)], // 快軸單位向量 (y, z)
      s = [-Math.sin(a), Math.cos(a)], // 慢軸單位向量
      ein = [Math.cos(p), Math.sin(p)],
      af = ein[0] * f[0] + ein[1] * f[1],
      as = ein[0] * s[0] + ein[1] * s[1],
      ef = cx(af),
      es = mul(cx(as), cx(Math.cos(gamma), -Math.sin(gamma)));
    return {
      Ey: add(scale(ef, f[0]), scale(es, s[0])),
      Ez: add(scale(ef, f[1]), scale(es, s[1])),
      af,
      as
    };
  }

  // Stokes 參數 → 偏振橢圓：方位角 ψ、橢圓率 b/a、旋向（+1 迎著來光逆時針，即 y→z）
  function ellipse(J) {
    const Ey = J.Ey,
      Ez = J.Ez,
      yz = mul(Ey, [Ez[0], -Ez[1]]), // Ey · Ez*
      S0 = abs2(Ey) + abs2(Ez),
      S1 = abs2(Ey) - abs2(Ez),
      S2 = 2 * yz[0],
      S3 = 2 * yz[1],
      chi = 0.5 * Math.asin(Math.max(-1, Math.min(1, S3 / S0))),
      ratio = Math.abs(Math.tan(chi));
    let psi = deg(0.5 * Math.atan2(S2, S1));
    if (psi < 0) psi += 180;
    if (psi >= 180 - 1e-9) psi = 0;
    const handed = Math.abs(S3 / S0) < 1e-9 ? 0 : Math.sign(S3);
    return { S0, S1, S2, S3, chi, ratio, psi, handed };
  }

  const TOL = 0.005;
  const stateType = (ratio, handed) =>
    ratio < TOL ? 0 : ratio > 1 - TOL ? (handed > 0 ? 3 : 4) : handed > 0 ? 1 : 2;
  const TYPE_NAMES = ['線偏振', '橢圓偏振（逆時針）', '橢圓偏振（順時針）', '圓偏振（逆時針）', '圓偏振（順時針）'];

  M.register(
    'waveplate',
    '雙折射與波片：偏振態轉換',
    '波動光學',
    'waveplate',
    [
      P('polarizer', '起偏片透光軸 θₚ', 0, 180, 5, 45, '°'),
      P('fastAxis', '波片快軸 α', 0, 180, 5, 0, '°'),
      P('mode', '延遲設定（0 直接選相位延遲／1 由厚度、Δn、波長計算）', 0, 1, 1, 0),
      P('retard', '相位延遲（以波長計；0.25 = λ/4 片、0.5 = λ/2 片）', 0, 1, 0.01, 0.25, 'λ'),
      P('thickness', '晶片厚度 d（mode = 1 時使用）', 1, 120, 0.1, 16, 'μm'),
      P('dn', '雙折射率 Δn = n_慢 − n_快（石英約 0.0092）', 0.001, 0.2, 0.0001, 0.0092),
      P('wavelength', '真空波長 λ', 400, 700, 1, 589, 'nm'),
      P('analyzer', '檢偏片透光軸 θₐ', 0, 180, 5, 90, '°')
    ],
    [
      metric('deltaPhi', '相位差 Δφ = 2πΔn·d/λ', 'rad'),
      metric('ellipticity', '出射橢圓率 b/a（0 線、1 圓）', ''),
      metric('output', '穿過檢偏片強度 I/I₁', '%')
    ],
    'Δφ = 2πΔn·d/λ；λ/4 片 Δφ = π/2、λ/2 片 Δφ = π；I = I₁[cos²(θₐ−θₚ) − sin2(θₚ−α)·sin2(θₐ−α)·sin²(Δφ/2)]',
    '單色平面波沿 +x 前進。起偏片後的線偏振光強度記為 I₁ = 100%，忽略反射與吸收。波片為零級、光軸平行於晶面的單軸晶體：振動方向沿快軸的分量走得較快，沿慢軸的分量多累積相位 Δφ = 2π(n_慢 − n_快)d/λ。以石英（正晶體，nₑ > nₒ）為例，垂直光軸的 o 光為快軸、沿光軸的 e 光為慢軸。角度以垂直方向（y 軸）為 0°、轉向 z 軸為正；「逆時針／順時針」指迎著來光（由檢偏片往光源方向）看電場向量的轉向。光每秒振盪約 5×10¹⁴ 次，這裡把一個週期放慢成 2 秒；晶片內 o、e 光的波長差也放大示意，數值以讀值為準。',
    [
      '起偏 45°、快軸 0°，選 λ/4 片：出射光的電場末端畫出什麼形狀？轉動檢偏片時強度會變嗎？',
      '改成 λ/2 片、起偏 0°，把快軸轉到 30°：出射仍是線偏振嗎？方向在哪裡？用 2α − θₚ 預測後再轉檢偏片驗證。',
      '切換到 mode = 1，用石英 Δn = 0.0092、λ = 589 nm，找出讓 45° 線偏振變成圓偏振的最薄厚度。'
    ],
    p => {
      const gamma = p.mode === 1 ? (2 * Math.PI * p.dn * p.thickness * 1e-6) / (p.wavelength * 1e-9) : 2 * Math.PI * p.retard,
        lambdaNm = p.wavelength,
        thicknessUm = p.mode === 1 ? p.thickness : (p.retard * lambdaNm * 1e-3) / p.dn,
        J = jones(p.polarizer, p.fastAxis, gamma),
        el = ellipse(J),
        type = stateType(el.ratio, el.handed);
      if (type >= 3) el.psi = 0; // 圓偏振沒有固定長軸
      // 穿過檢偏片：|Ẽ·û|²，Ẽ 的強度已正規化為 1（= I₁）
      const outputAt = analyzer => {
        const u = rad(analyzer);
        return 100 * abs2(add(scale(J.Ey, Math.cos(u)), scale(J.Ez, Math.sin(u))));
      };
      const output = outputAt(p.analyzer);
      // 某處的實際電場：phase 為該處相對於波片前的額外慢軸延遲（0…Γ）
      const omega = (2 * Math.PI) / period;
      const fieldAt = (t, extra, kx) => {
        const a = rad(p.fastAxis),
          wt = omega * t - kx,
          Ef = J.af * Math.cos(wt),
          Es = J.as * Math.cos(wt - extra);
        return { Ey: Ef * Math.cos(a) - Es * Math.sin(a), Ez: Ef * Math.sin(a) + Es * Math.cos(a), Ef, Es };
      };
      const gammaWrapped = ((gamma % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      return trajectory(
        duration,
        t => {
          const out = fieldAt(t, gamma, 0),
            u = rad(p.analyzer),
            Ea = out.Ey * Math.cos(u) + out.Ez * Math.sin(u);
          return {
            analyzerAngle: p.analyzer,
            deltaPhi: gamma,
            deltaDeg: deg(gammaWrapped),
            waves: gamma / (2 * Math.PI),
            thicknessUm,
            ellipticity: el.ratio,
            orientation: el.psi,
            handed: el.handed,
            type,
            output,
            Ey: out.Ey,
            Ez: out.Ez,
            Ea,
            fast: J.af * J.af * 100,
            slow: J.as * J.as * 100
          };
        },
        {
          jones: J,
          ellipse: el,
          gamma,
          type,
          typeName: TYPE_NAMES[type],
          fieldAt,
          period,
          outputAt,
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          schematic: true,
          minimumSceneScale: 6,
          bounds: { min: [-6.6, -2.4, -2.2], max: [6.6, 4.6, 2.2] },
          scaleNote: '光的振盪放慢為每 2 秒一個週期；晶片內 o、e 光的波長差為放大示意。以讀值為準。',
          endLabel: '觀察結束',
          positionPlot: {
            key: 'analyzerAngle',
            label: '檢偏片角度',
            unit: '°',
            min: 0,
            max: 180,
            title: '穿過檢偏片的強度',
            menuLabel: '強度對檢偏角',
            yUnit: '%',
            series: [{ label: '透射強度', color: '#8ee0c0', value: outputAt }]
          }
        }
      );
    },
    'models/waveplate.js'
  );

  const def = M.defs.find(d => d.id === 'waveplate');
  def.defaultPlotMode = 'position';
  def.initialView = { yaw: -0.35, pitch: 0.3 };
  def.defaultPlotMetric = 'Ey';
  def.plotMetrics = [
    metric('Ey', '出射電場 y 分量', 'E₁'),
    metric('Ez', '出射電場 z 分量', 'E₁'),
    metric('Ea', '沿檢偏軸的電場分量', 'E₁'),
    metric('deltaDeg', '相位差（0–360°）', '°'),
    metric('waves', '相位差（以波長計）', 'λ'),
    metric('thicknessUm', '對應晶片厚度', 'μm'),
    metric('orientation', '橢圓長軸方位', '°'),
    metric('fast', '快軸分量強度', '%'),
    metric('slow', '慢軸分量強度', '%')
  ];
  def.waveplateTypeNames = TYPE_NAMES;
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
