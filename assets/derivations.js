/* Step-by-step derivations linked to the live parameters. DOM-free: also loaded by verify-derivations.cjs. */
'use strict';
// 每題回傳 { steps, checks }：steps 依序揭露，算式代入目前參數；checks 把推導結果和模擬讀數並列。
// tolerance 是相對誤差上限；approx: true 表示這一列本來就是近似（如小角近似），差異是教學重點，不算錯。
(function (root) {
  const rad = d => (d * Math.PI) / 180,
    n = (x, digits = 3) => {
      if (!Number.isFinite(x)) return '—';
      if (x === 0) return '0';
      const a = Math.abs(x);
      return a >= 1e4 || a < 1e-3 ? x.toExponential(digits - 1) : (+x.toPrecision(digits)).toString();
    };
  // 在整段運動上取樣，回傳 fn 的最大值與對應狀態（以模擬為準的「量到的值」）。
  function scan(sim, key, count = 4000) {
    let best = null;
    for (let i = 0; i <= count; i++) {
      const t = (sim.duration * i) / count,
        s = sim.sample(t),
        v = typeof key === 'function' ? key(s) : s[key];
      if (!best || v > best.value) best = { value: v, t, s };
    }
    return best;
  }
  // 第一次由正變負的時間（線性內插）；用來量擺動的四分之一週期。
  function firstDownCrossing(sim, key, count = 6000) {
    let prev = sim.sample(0);
    for (let i = 1; i <= count; i++) {
      const t = (sim.duration * i) / count,
        s = sim.sample(t);
      if (prev[key] > 0 && s[key] <= 0) {
        const t0 = (sim.duration * (i - 1)) / count;
        return t0 + ((t - t0) * prev[key]) / (prev[key] - s[key]);
      }
      prev = s;
    }
    return NaN;
  }
  const Derivations = {
    incline(p, sim) {
      const a = rad(p.angle),
        N = p.m * p.g * Math.cos(a),
        drive = p.m * p.g * Math.sin(a),
        mus = Math.max(p.mus, p.mu),
        moving = drive > mus * N,
        acc = moving ? p.g * (Math.sin(a) - p.mu * Math.cos(a)) : 0;
      return {
        steps: [
          {
            title: '1. 畫力圖、選座標',
            text: '沿斜面向下取正 x，垂直斜面向外取正 y。木塊受重力 mg、正向力 N、沿坡向上的摩擦力 f。',
            math: 'mg = ' + n(p.m) + ' × ' + n(p.g) + ' = ' + n(p.m * p.g) + ' N'
          },
          {
            title: '2. 垂直斜面方向平衡',
            text: '垂直斜面沒有加速度，所以正向力抵銷重力的垂直分量。',
            math: 'N = mg cosα = ' + n(p.m * p.g) + ' × cos ' + p.angle + '° = ' + n(N) + ' N'
          },
          {
            title: '3. 會不會滑？',
            text: '重力沿坡分量和最大靜摩擦比較；本模型有效 μₛ = max(μₛ, μₖ)。',
            math:
              'mg sinα = ' +
              n(drive) +
              ' N　' +
              (moving ? '＞' : '≤') +
              '　μₛN = ' +
              n(mus) +
              ' × ' +
              n(N) +
              ' = ' +
              n(mus * N) +
              ' N　→　' +
              (moving ? '會滑動' : '保持靜止')
          },
          {
            title: '4. 沿斜面牛頓第二定律',
            text: moving
              ? '滑動時摩擦力 f = μₖN，沿坡合力 = mg sinα − μₖN，質量約掉。'
              : '靜止時靜摩擦力剛好抵銷重力沿坡分量，合力為零。',
            math: moving
              ? 'a = g(sinα − μₖcosα) = ' +
                n(p.g) +
                ' × (' +
                n(Math.sin(a)) +
                ' − ' +
                n(p.mu) +
                ' × ' +
                n(Math.cos(a)) +
                ') = ' +
                n(acc) +
                ' m/s²'
              : 'f = mg sinα = ' + n(drive) + ' N，a = 0'
          }
        ],
        checks: [
          { label: '沿坡加速度', unit: 'm/s²', derived: acc, simulated: sim.sample(0).ax, tolerance: 1e-9 },
          { label: '正向力', unit: 'N', derived: N, simulated: sim.sample(0).N, tolerance: 1e-9 }
        ]
      };
    },
    pendulum(p, sim) {
      const a0 = rad(p.angle),
        h = p.L * (1 - Math.cos(a0)),
        vmax = Math.sqrt(2 * p.g * h),
        T0 = 2 * Math.PI * Math.sqrt(p.L / p.g),
        quarter = firstDownCrossing(sim, 'angle');
      return {
        steps: [
          {
            title: '1. 最低點比釋放點低多少',
            text: '擺長 L、初始擺角 θ₀，由幾何得高度差。',
            math: 'h = L(1 − cosθ₀) = ' + n(p.L) + ' × (1 − cos ' + p.angle + '°) = ' + n(h) + ' m'
          },
          {
            title: '2. 力學能守恆求最低點速率',
            text: '張力始終垂直速度、不作功，重力位能全部轉成動能，質量約掉。',
            math: '½mv² = mgh　→　v = √(2gh) = √(2 × ' + n(p.g) + ' × ' + n(h) + ') = ' + n(vmax) + ' m/s'
          },
          {
            title: '3. 小角近似的週期',
            text: '角度小時 sinθ ≈ θ，運動方程化為簡諧運動，週期與振幅無關。',
            math: 'T₀ = 2π√(L/g) = 2π√(' + n(p.L) + ' / ' + n(p.g) + ') = ' + n(T0) + ' s'
          },
          {
            title: '4. 大角度時呢？',
            text: '模擬解的是完整方程 θ̈ = −(g/L)sinθ。振幅越大，sinθ 比 θ 小越多，回復力較弱，真實週期比 T₀ 長。',
            math:
              '模擬量到 T = 4 × (第一次過最低點的時間) = 4 × ' +
              n(quarter) +
              ' = ' +
              n(4 * quarter) +
              ' s，比 T₀ 長 ' +
              (((4 * quarter) / T0 - 1) * 100).toFixed(1) +
              '%'
          }
        ],
        checks: [
          { label: '最低點速率', unit: 'm/s', derived: vmax, simulated: scan(sim, 'speed').value, tolerance: 2e-3 },
          { label: '週期（小角近似）', unit: 's', derived: T0, simulated: 4 * quarter, approx: true }
        ]
      };
    },
    spring(p, sim) {
      const w = Math.sqrt(p.k / p.m),
        T = (2 * Math.PI) / w,
        vmax = p.A * w,
        E = 0.5 * p.k * p.A * p.A;
      return {
        steps: [
          {
            title: '1. 牛頓第二定律',
            text: '水平光滑面上只有彈力 F = −kx，所以 ma = −kx，是簡諧運動。',
            math: 'a = −(k/m)x，ω² = k/m'
          },
          {
            title: '2. 角頻率與週期',
            text: '週期只和 m、k 有關，與振幅 A 無關。',
            math: 'ω = √(' + n(p.k) + ' / ' + n(p.m) + ') = ' + n(w) + ' rad/s，T = 2π/ω = ' + n(T) + ' s'
          },
          {
            title: '3. 最大速率',
            text: 'x = A cosωt，微分得 v = −Aω sinωt，通過平衡點時速率最大。',
            math: 'v_max = Aω = ' + n(p.A) + ' × ' + n(w) + ' = ' + n(vmax) + ' m/s'
          },
          {
            title: '4. 總力學能',
            text: '在最大伸長處速度為零，能量全部是彈性位能；之後動能與位能互換，總和不變。',
            math: 'E = ½kA² = ½ × ' + n(p.k) + ' × ' + n(p.A) + '² = ' + n(E) + ' J'
          }
        ],
        checks: [
          {
            label: '最大速率',
            unit: 'm/s',
            derived: vmax,
            simulated: scan(sim, s => Math.abs(s.vx)).value,
            tolerance: 1e-3
          },
          { label: '總力學能', unit: 'J', derived: E, simulated: sim.sample(sim.duration * 0.37).E, tolerance: 1e-9 }
        ]
      };
    },
    'double-slit'(p, sim) {
      const lambda = p.lambda * 1e-9,
        d = p.d * 1e-6,
        spacing = ((lambda * p.L) / d) * 1000,
        theta = Math.asin(lambda / d);
      return {
        steps: [
          {
            title: '1. 兩縫到屏上一點的光程差',
            text: '屏距 L 遠大於縫距 d，從兩縫到屏上同一點的光線近似平行，光程差約為 d sinθ。',
            math: 'Δ = d sinθ ≈ d · y / L'
          },
          {
            title: '2. 亮紋條件',
            text: '光程差為波長整數倍時建設性干涉。',
            math: 'd · yₘ / L = mλ　→　yₘ = mλL / d'
          },
          {
            title: '3. 相鄰亮紋間距',
            text: '相鄰兩條亮紋 m 差 1，間距與 m 無關。',
            math: 'Δy = λL / d = ' + n(p.lambda) + ' nm × ' + n(p.L) + ' m / ' + n(p.d) + ' μm = ' + n(spacing) + ' mm'
          },
          {
            title: '4. 近似是否成立',
            text: '第一條亮紋的偏折角很小，所以 sinθ ≈ tanθ ≈ y/L 的近似成立；改變 λ、L、d 看間距怎麼變。',
            math: 'θ₁ = sin⁻¹(λ/d) = ' + n((theta * 180) / Math.PI) + '°'
          }
        ],
        checks: [
          {
            label: '條紋間距（正屏近軸）',
            unit: 'mm',
            derived: spacing,
            simulated: sim.sample(0).spacing,
            tolerance: 1e-9
          }
        ]
      };
    },
    'vertical-circle'(p, sim) {
      const top = p.v * p.v >= 4 * p.g * p.R,
        vTop = top ? Math.sqrt(p.v * p.v - 4 * p.g * p.R) : NaN,
        NTop = top ? p.m * ((vTop * vTop) / p.R - p.g) : NaN,
        hMax = (p.v * p.v) / (2 * p.g),
        highest = scan(sim, 'y');
      const steps = [
        {
          title: '1. 能量守恆',
          text: '雙面導軌的約束力始終垂直速度、不作功，所以力學能守恆。',
          math: '½mv₀² = ½mv² + mgh'
        },
        {
          title: '2. 能不能到最高點？',
          text: '最高點比最低點高 2R；初動能必須足以爬升 2R。',
          math:
            'v₀² = ' +
            n(p.v * p.v) +
            '　' +
            (top ? '≥' : '＜') +
            '　4gR = ' +
            n(4 * p.g * p.R) +
            '　→　' +
            (top ? '能通過最高點' : '到不了最高點，會往返擺動')
        }
      ];
      if (top)
        steps.push(
          {
            title: '3. 最高點速率',
            text: '代入 h = 2R。',
            math: 'v_top = √(v₀² − 4gR) = ' + n(vTop) + ' m/s'
          },
          {
            title: '4. 最高點的約束力',
            text: '最高點向心方向朝下：N + mg = mv²/R（N 為正表示導軌向圓心推）。',
            math:
              'N = m(v²/R − g) = ' + n(p.m) + ' × (' + n((vTop * vTop) / p.R) + ' − ' + n(p.g) + ') = ' + n(NTop) + ' N'
          }
        );
      else
        steps.push({
          title: '3. 最高可到多高',
          text: '速度降到零時動能全部轉為位能。',
          math: 'h_max = v₀² / (2g) = ' + n(hMax) + ' m（低於 2R = ' + n(2 * p.R) + ' m）'
        });
      return {
        steps,
        checks: top
          ? [
              { label: '最高點速率', unit: 'm/s', derived: vTop, simulated: highest.s.speed, tolerance: 3e-3 },
              { label: '最高點約束力', unit: 'N', derived: NTop, simulated: highest.s.N, tolerance: 3e-3 }
            ]
          : [{ label: '最高高度', unit: 'm', derived: hMax, simulated: highest.value - 0.3, tolerance: 3e-3 }]
      };
    }
  };
  // 推導與模擬的相對差；分母取兩者較大絕對值，避免接近零時爆掉。
  function derivationDiff(check) {
    const scale = Math.max(Math.abs(check.derived), Math.abs(check.simulated), 1e-12);
    return Math.abs(check.derived - check.simulated) / scale;
  }
  const api = { Derivations, derivationDiff, formatDerivationNumber: n };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== 'undefined' ? globalThis : this);
