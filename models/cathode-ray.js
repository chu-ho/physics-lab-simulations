'use strict';

(function (M) {
  const { P, M: metric, trajectory } = M.helpers;
  const e = 1.602176634e-19,
    me = 9.1093837015e-31;
  // 幾何（m）：陰極、陽極、偏向板（長 plate、間距 gap）、螢光幕
  const CATHODE = -0.06,
    ANODE = -0.04,
    PLATE = 0.05,
    GAP = 0.02,
    SCREEN = 0.2;
  const DRIFT = SCREEN - PLATE;
  // sin(wt)/w、(1−cos wt)/w²、(wt − sin wt)/w³，小 wt 用級數避免相消
  function kernels(w, t) {
    const u = w * t;
    if (Math.abs(u) < 1e-3) {
      const u2 = u * u;
      return [
        t * (1 - u2 / 6 + (u2 * u2) / 120),
        t * t * (0.5 - u2 / 24 + (u2 * u2) / 720),
        t ** 3 * (1 / 6 - u2 / 120 + (u2 * u2) / 5040)
      ];
    }
    return [Math.sin(u) / w, (2 * Math.sin(u / 2) ** 2) / (w * w), (u - Math.sin(u)) / w ** 3];
  }
  // 電子：加速、無場漂移、板間（均勻 E 沿 y 與 B 沿 z 交叉）、無場直線至螢幕
  function flight(accel, deflect, bz) {
    const v0 = Math.sqrt((2 * e * accel) / me);
    const tA = (2 * (ANODE - CATHODE)) / v0,
      tB = tA + (0 - ANODE) / v0;
    const a = (e * deflect) / (me * GAP); // qE_y/m，q = −e、E_y = −V/d
    const w = (-e * bz) / me; // qB_z/m
    const plates = tau => {
      const [s1, c2, s3] = kernels(w, tau);
      const cw = Math.cos(w * tau);
      return { x: v0 * s1 + a * w * s3, y: (a - v0 * w) * c2, vx: v0 * cw + a * w * c2, vy: (a - v0 * w) * s1 };
    };
    // 找出板間第一個事件：離開板端或撞板
    const limit = (20 * PLATE) / v0,
      steps = 4000,
      over = tau => {
        const q = plates(tau);
        return Math.max(q.x - PLATE, Math.abs(q.y) - GAP / 2);
      };
    let lo = 0,
      hi = null;
    for (let i = 1; i <= steps; i++) {
      const tau = (limit * i) / steps;
      if (over(tau) >= 0) {
        hi = tau;
        break;
      }
      lo = tau;
    }
    let tauExit = limit,
      outcome = 'trapped';
    if (hi !== null) {
      for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2;
        if (over(mid) >= 0) hi = mid;
        else lo = mid;
      }
      tauExit = hi;
      const q = plates(tauExit);
      outcome = q.x - PLATE >= Math.abs(q.y) - GAP / 2 ? 'exit' : 'hit';
    }
    const end = plates(tauExit);
    const tC = tB + tauExit;
    const reaches = outcome === 'exit' && end.vx > 0;
    const tD = reaches ? tC + DRIFT / end.vx : tC;
    const screenY = reaches ? end.y + (end.vy * DRIFT) / end.vx : null;
    const sample = time => {
      const t = Math.max(0, Math.min(tD, time));
      if (t <= tA) {
        const acc = v0 / tA;
        return { x: CATHODE + 0.5 * acc * t * t, y: 0, vx: acc * t, vy: 0, inside: 0, plateY: 0 };
      }
      if (t <= tB) return { x: ANODE + v0 * (t - tA), y: 0, vx: v0, vy: 0, inside: 0, plateY: 0 };
      if (t <= tC) {
        const q = plates(t - tB);
        return { ...q, inside: 1, plateY: q.y };
      }
      const dt = t - tC;
      return { x: PLATE + end.vx * dt, y: end.y + end.vy * dt, vx: end.vx, vy: end.vy, inside: 0, plateY: end.y };
    };
    return { v0, a, w, tA, tB, tC, tD, outcome, reaches, screenY, end, sample };
  }
  M.register(
    'cathode-ray',
    '電場中的帶電粒子：陰極射線與荷質比',
    '電磁學',
    'cathode-ray',
    [
      P('accel', '加速電壓 Vₐ', 500, 5000, 50, 2000, 'V'),
      P('deflect', '偏向板電壓（上板高於下板）', -400, 400, 10, 150, 'V'),
      P('field', '板間磁場 B（沿 −z 為正）', -1, 1, 0.005, 0, 'mT')
    ],
    [
      metric('kinetic', '電子動能', 'eV'),
      metric('yMillimetre', '偏離軸線 y', 'mm'),
      metric('speedPercent', '速率 v/c', '%')
    ],
    'eVₐ = ½mv₀² · 板間 E = V/d、a = eE/m · 速度選擇 eE = ev₀B ⇒ v₀ = E/B · 只有電場時螢幕偏移 Y = (eE/m)(ℓ/v₀²)(ℓ/2 + D) ⇒ e/m = Yv₀²/[Eℓ(ℓ/2 + D)]',
    '電子由靜止從陰極出發，在 2 cm 的均勻加速區獲得動能 eVₐ，經 4 cm 無場區進入長 ℓ = 5 cm、間距 d = 2 cm 的平行偏向板，再飛行 D = 15 cm 到螢光幕。板間電場與磁場均勻且只存在於板間，忽略邊緣場、重力、空間電荷與相對論修正（5 kV 時 v ≈ 0.14c，誤差約 0.4%）。板間交叉場的運動以解析式計算；電子觸板即停止。播放 10 秒代表整段飛行（約數奈秒）。e/m 推算值模擬湯姆森的兩步測量：以 E/B 取得速度，再用同一電場、關掉磁場時的光點偏移計算；只有磁場調到使光束直行時，推算值才等於真實的 e/m。',
    [
      '只加偏向電壓時，把加速電壓加倍，預測螢幕光點偏移量會變成幾倍，再播放驗證。',
      '固定加速與偏向電壓，調整磁場直到光束不偏轉。讀出 E/B，與電子速率比較，再讀推算的 e/m。',
      '把偏向電壓調大或加速電壓調小，讓電子撞上偏向板，說明板間偏移與哪些量有關。'
    ],
    p => {
      const bz = -p.field / 1000;
      const run = flight(p.accel, p.deflect, bz);
      const E = Math.abs(p.deflect) / GAP;
      // 湯姆森兩步：同一電場只開電場的光點偏移，加上目前 E/B 給的速度
      const electricOnly = flight(p.accel, p.deflect, 0);
      const selectorSpeed = p.field !== 0 && p.deflect !== 0 ? E / Math.abs(bz) : null;
      const estimate =
        selectorSpeed !== null && electricOnly.reaches
          ? (Math.abs(electricOnly.screenY) * selectorSpeed ** 2) / (E * PLATE * (PLATE / 2 + DRIFT))
          : null;
      const scale = 10 / run.tD;
      const events = [
        { t: run.tA * scale, label: `通過陽極：動能 eVₐ = ${p.accel} eV，v₀ = ${(run.v0 / 1e6).toFixed(2)}×10⁶ m/s` },
        { t: run.tB * scale, label: '進入偏向板' }
      ];
      if (run.outcome === 'exit')
        events.push({ t: run.tC * scale, label: `離開偏向板：y = ${(run.end.y * 1000).toFixed(2)} mm` });
      else if (run.outcome === 'hit') events.push({ t: run.tC * scale, label: '電子撞上偏向板' });
      if (run.reaches) events.push({ t: 10, label: `打到螢光幕：Y = ${(run.screenY * 1000).toFixed(1)} mm` });
      return trajectory(
        10,
        t => {
          const q = run.sample(t / scale);
          const speed = Math.hypot(q.vx, q.vy);
          const kinetic = (0.5 * me * speed * speed) / e;
          return {
            x: q.x,
            y: q.y,
            vx: q.vx,
            vy: q.vy,
            fx: q.inside ? me * run.w * q.vy : q.x < ANODE ? (me * run.v0) / run.tA : 0,
            fy: q.inside ? me * (run.a - run.w * q.vx) : 0,
            physicalNanoseconds: (t / scale) * 1e9,
            kinetic,
            yMillimetre: q.y * 1000,
            xMillimetre: q.x * 1000,
            speedMega: speed / 1e6,
            speedPercent: (100 * speed) / 299792458,
            vyMega: q.vy / 1e6,
            fieldWork: (p.deflect * q.plateY) / GAP,
            inside: q.inside
          };
        },
        {
          events,
          flight: run,
          geometry: { CATHODE, ANODE, PLATE, GAP, SCREEN },
          screenY: run.screenY,
          outcome: run.outcome,
          selectorSpeed,
          estimate,
          trueRatio: e / me,
          balanceField: (p.deflect / (GAP * run.v0)) * 1000,
          bounds: { min: [-1.7, 0.3, -1.6], max: [5.2, 3.7, 1.6] },
          hideGrid: () => true,
          hideFloor: true,
          hidePrimary: true,
          schematic: true,
          scaleNote: '場景以 1 格 = 4 cm 等比例繪製，沒有放大偏移。播放 10 秒代表整段數奈秒的飛行。',
          endLabel: run.reaches ? '電子打到螢光幕' : run.outcome === 'hit' ? '電子撞上偏向板' : '電子未離開偏向板'
        }
      );
    },
    'models/cathode-ray.js'
  );
  const def = M.defs.at(-1);
  def.initialView = { yaw: -0.45, pitch: 0.25 };
  def.plotMetrics = [
    metric('speedMega', '速率', '10⁶ m/s'),
    metric('vyMega', '縱向速度 vᵧ', '10⁶ m/s'),
    metric('xMillimetre', '沿軸位置 x', 'mm'),
    metric('fieldWork', '偏向電場作功', 'eV'),
    metric('physicalNanoseconds', '實際飛行時間', 'ns')
  ];
  M.CathodeRay = { flight, e, me, CATHODE, ANODE, PLATE, GAP, SCREEN };
})(globalThis.Mechanics);
