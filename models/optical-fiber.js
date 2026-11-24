(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers,
    C = 299792458,
    rad = d => (d * Math.PI) / 180,
    deg = r => (r * 180) / Math.PI;
  // 長度單位 mm：纖芯半徑 0.5 mm（塑膠光纖尺度），示意包層厚 0.3 mm
  const a = 0.5,
    clad = 0.3,
    straightIn = 14,
    straightOut = 8,
    straightOnly = 24;
  const dot2 = (u, v) => u[0] * v[0] + u[1] * v[1],
    crossz = (u, v) => u[0] * v[1] - u[1] * v[0],
    along = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
  // 光纖幾何：直段 → 90° 圓弧（彎曲半徑 R 為中心線半徑）→ 直段；或整條直線
  function fiberGeometry(bend, R) {
    const walls = [],
      line = (p, q, inward) => walls.push({ type: 'line', p, q, inward }),
      arc = (center, r, from, to, inwardSign) => walls.push({ type: 'arc', center, r, from, to, inwardSign });
    let end, length, centerline;
    if (!bend) {
      line([0, a], [straightOnly, a], [0, -1]);
      line([0, -a], [straightOnly, -a], [0, 1]);
      end = { p: [straightOnly, -a], q: [straightOnly, a], outward: [1, 0] };
      length = straightOnly;
      centerline = s => ({ p: [s, 0], n: [0, 1] });
    } else {
      const c = [straightIn, R],
        x = straightIn + R;
      line([0, a], [straightIn, a], [0, -1]);
      line([0, -a], [straightIn, -a], [0, 1]);
      arc(c, R - a, -Math.PI / 2, 0, 1); // 內側壁：法線指離圓心才朝向纖芯
      arc(c, R + a, -Math.PI / 2, 0, -1); // 外側壁：法線指向圓心
      line([x - a, R], [x - a, R + straightOut], [1, 0]);
      line([x + a, R], [x + a, R + straightOut], [-1, 0]);
      end = { p: [x - a, R + straightOut], q: [x + a, R + straightOut], outward: [0, 1] };
      const arcLength = (R * Math.PI) / 2;
      length = straightIn + arcLength + straightOut;
      centerline = s => {
        if (s <= straightIn) return { p: [s, 0], n: [0, 1] };
        if (s <= straightIn + arcLength) {
          const ang = -Math.PI / 2 + (s - straightIn) / R;
          return { p: [c[0] + R * Math.cos(ang), c[1] + R * Math.sin(ang)], n: [-Math.cos(ang), -Math.sin(ang)] };
        }
        return { p: [x, R + (s - straightIn - arcLength)], n: [-1, 0] };
      };
    }
    return { walls, end, length, centerline, bend, R };
  }
  // 射線與牆的最近交點，並回傳該點指向纖芯內側的單位法線
  function hitWall(wall, pos, dir) {
    if (wall.type === 'line') {
      const e = [wall.q[0] - wall.p[0], wall.q[1] - wall.p[1]],
        L = Math.hypot(e[0], e[1]),
        u = [e[0] / L, e[1] / L],
        den = crossz(dir, u);
      if (Math.abs(den) < 1e-14) return null;
      const w = [wall.p[0] - pos[0], wall.p[1] - pos[1]],
        s = crossz(w, u) / den,
        along_ = crossz(w, dir) / den;
      return s > 1e-9 && along_ >= -1e-9 && along_ <= L + 1e-9 ? { s, normal: wall.inward } : null;
    }
    const f = [pos[0] - wall.center[0], pos[1] - wall.center[1]],
      b = dot2(f, dir),
      c = dot2(f, f) - wall.r * wall.r,
      disc = b * b - c;
    if (disc < 0) return null;
    const root = Math.sqrt(disc);
    for (const s of [-b - root, -b + root]) {
      if (s <= 1e-9) continue;
      const q = along(pos, dir, s),
        ang = Math.atan2(q[1] - wall.center[1], q[0] - wall.center[0]);
      if (ang >= wall.from - 1e-9 && ang <= wall.to + 1e-9) {
        const radial = [(q[0] - wall.center[0]) / wall.r, (q[1] - wall.center[1]) / wall.r];
        return { s, normal: [wall.inwardSign * radial[0], wall.inwardSign * radial[1]] };
      }
    }
    return null;
  }
  // 向量 Snell：N 朝入射側
  function refract(d, N, n1, n2) {
    const cosi = -dot2(d, N),
      eta = n1 / n2,
      k = 1 - eta * eta * (1 - cosi * cosi);
    if (k < 0) return null;
    const c = eta * cosi - Math.sqrt(k);
    return [eta * d[0] + c * N[0], eta * d[1] + c * N[1]];
  }
  function traceFiber(geo, n1, n2, theta0, offset) {
    const dIn = [Math.cos(rad(theta0)), Math.sin(rad(theta0))],
      entry = [0, offset * a],
      start = along(entry, dIn, -5),
      segments = [],
      hits = [];
    let time = 0;
    const push = (p, q, n, kind) => {
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]),
        dt = (L * 1e-3 * n) / C;
      segments.push({ start: p, end: q, n, kind, t0: time, t1: time + dt, length: L });
      time += dt;
    };
    push(start, entry, 1, 'air');
    let pos = entry,
      dir = refract(dIn, [-1, 0], 1, n1),
      status = 'lost',
      exitDir = null,
      escapeDir = null;
    const thetaR = deg(Math.atan2(dir[1], dir[0]));
    for (let k = 0; k < 600; k++) {
      let best = null;
      for (const wall of geo.walls) {
        const h = hitWall(wall, pos, dir);
        if (h && (!best || h.s < best.s)) best = h;
      }
      const e = geo.end,
        eu = [e.q[0] - e.p[0], e.q[1] - e.p[1]],
        den = crossz(dir, eu);
      let endHit = null;
      if (Math.abs(den) > 1e-14) {
        const w = [e.p[0] - pos[0], e.p[1] - pos[1]],
          s = crossz(w, eu) / den,
          u = crossz(w, dir) / den;
        if (s > 1e-9 && u >= -1e-9 && u <= 1 + 1e-9) endHit = s;
      }
      if (endHit !== null && (!best || endHit <= best.s)) {
        const q = along(pos, dir, endHit);
        push(pos, q, n1, 'core');
        const out = refract(dir, [-e.outward[0], -e.outward[1]], n1, 1);
        if (out) {
          exitDir = out;
          push(q, along(q, out, 6), 1, 'exit');
          status = 'guided';
        } else {
          hits.push({ point: q, angle: NaN, tir: true, endFace: true, time });
          status = 'end-tir';
        }
        break;
      }
      if (!best) break;
      const q = along(pos, dir, best.s);
      push(pos, q, n1, 'core');
      const N = best.normal,
        cos = Math.abs(dot2(dir, N)),
        phi = deg(Math.atan2(Math.abs(crossz(dir, N)), cos)),
        tir = n2 < n1 && n1 * Math.sin(rad(phi)) >= n2;
      hits.push({ point: q, angle: phi, tir, normal: N, time });
      if (tir) {
        dir = [dir[0] + 2 * cos * N[0], dir[1] + 2 * cos * N[1]];
        pos = q;
      } else {
        escapeDir = refract(dir, N, n1, n2);
        push(q, along(q, escapeDir, 3.5), n2, 'escape');
        status = 'escaped';
        break;
      }
    }
    return { segments, hits, status, thetaR, entry, dIn, exitDir, escapeDir, duration: time };
  }
  M.FiberOptics = { a, fiberGeometry, traceFiber, hitWall };

  M.register(
    'optical-fiber',
    '全反射與光纖',
    '幾何光學',
    'optical-fiber',
    [
      P('n1', '纖芯折射率 n₁', 1.4, 1.7, 0.005, 1.49),
      P('n2', '包層折射率 n₂', 1.3, 1.65, 0.005, 1.4),
      P('angle', '端面入射角 θ₀（空氣中，相對光纖軸）', 0, 85, 0.5, 20, '°'),
      P('offset', '入射點高度（纖芯半徑的倍數）', -0.9, 0.9, 0.05, 0),
      { ...P('bend', '光纖形狀：0 直線／1 彎曲 90°', 0, 1, 1, 1), refit: true },
      { ...P('radius', '彎曲半徑 R（中心線）', 2, 20, 0.5, 12, 'mm'), refit: true },
      { ...P('normals', '顯示法線、角度與受光錐', 0, 1, 1, 1), visual: true }
    ],
    [metric('critical', '臨界角 θc', '°'), metric('na', '數值孔徑 NA', ''), metric('acceptance', '受光角 θa', '°')],
    'sin θc = n₂/n₁；NA = sin θa = √(n₁² − n₂²)；牆面入射角 φ ≥ θc 時全反射導光',
    '纖芯（n₁）外包一層折射率較低的包層（n₂），光由空氣經平整端面射入。在纖芯與包層界面，以牆面法線量入射角 φ：n₁ sin φ ≥ n₂ 時全反射繼續前進，否則折射進入包層而逸出。直光纖中 φ = 90° − θ_r，sin θ₀ = n₁ sin θ_r，因此導光條件等價於 sin θ₀ ≤ √(n₁² − n₂²) = NA；NA 大於 1 時任何入射角都能導光。彎曲段以精確圓弧求交點與局部法線，光線在外側壁的入射角變小，彎得太急就會逸出。只追跡主光路：逸出時不追跡部分反射、也不計包層外表面；纖芯尺度為塑膠光纖（直徑 1 mm），屬幾何光學，未考慮模態、色散與損耗。時間以 c/n 計，播放以約 6 秒慢放。',
    [
      '入射角慢慢加大，在哪個角度光開始從側面逸出？與 NA 算出的受光角相同嗎？',
      '把包層折射率調到接近纖芯，臨界角與受光角怎麼變？',
      '縮小彎曲半徑，光線在哪一側先逸出？為什麼？'
    ],
    p => {
      const geo = fiberGeometry(p.bend, p.radius),
        ray = traceFiber(geo, p.n1, p.n2, p.angle, p.offset),
        critical = deg(Math.asin(Math.min(1, p.n2 / p.n1))),
        naRaw = Math.sqrt(Math.max(0, p.n1 * p.n1 - p.n2 * p.n2)),
        acceptance = deg(Math.asin(Math.min(1, naRaw))),
        duration = Math.max(ray.duration, 1e-15),
        firstEscape = ray.hits.find(h => !h.tir),
        bounds = p.bend
          ? { min: [-6, -3, -1.2], max: [straightIn + p.radius + 5, p.radius + straightOut + 4, 1.2] }
          : { min: [-6, -4, -1.2], max: [straightOnly + 6, 4, 1.2] };
      return trajectory(
        duration,
        t => {
          const seg = ray.segments.find(s => t <= s.t1) || ray.segments.at(-1),
            f = seg.t1 > seg.t0 ? Math.max(0, Math.min(1, (t - seg.t0) / (seg.t1 - seg.t0))) : 1,
            x = seg.start[0] + (seg.end[0] - seg.start[0]) * f,
            y = seg.start[1] + (seg.end[1] - seg.start[1]) * f;
          return {
            x,
            y,
            z: 0,
            entryAngle: p.angle,
            critical,
            na: naRaw,
            acceptance,
            reflections: ray.hits.filter(h => h.tir && h.time <= t).length,
            escaped: ray.status === 'escaped' && firstEscape.time <= t ? 1 : 0
          };
        },
        {
          schematic: true,
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          scientificNumbers: true,
          playbackScale: duration / 6,
          geometry: geo,
          ray,
          core: a,
          cladding: clad,
          critical,
          naRaw,
          acceptance,
          bounds,
          minimumSceneScale: 12,
          events: [
            ...(firstEscape ? [{ t: firstEscape.time, label: '光線逸出包層' }] : []),
            ...(ray.status === 'guided'
              ? [{ t: ray.segments.find(s => s.kind === 'exit').t0, label: '由末端射出' }]
              : [])
          ],
          positionPlot: {
            key: 'entryAngle',
            label: '端面入射角 θ₀',
            unit: '°',
            min: 0,
            max: 85,
            title: '直段牆面入射角與臨界角',
            menuLabel: '牆面入射角對入射角',
            yUnit: '°',
            scopeLabel: '— 直段牆面入射角 φ 與臨界角 θc：φ ≥ θc 時全反射導光　● 目前入射角',
            series: [
              { label: '牆面入射角 φ', color: '#e0b04c', value: x => 90 - deg(Math.asin(Math.sin(rad(x)) / p.n1)) },
              { label: '臨界角 θc', color: '#e07a7a', value: () => critical }
            ]
          },
          scaleNote: '纖芯直徑 1 mm、包層厚度為示意；角度依實際幾何追跡。',
          endLabel: ray.status === 'guided' ? '光由末端射出' : ray.status === 'escaped' ? '光線已逸出' : '觀察結束'
        }
      );
    },
    'models/optical-fiber.js'
  );
  const def = M.defs.find(d => d.id === 'optical-fiber');
  def.initialView = { yaw: -0.18, pitch: 0.12 };
  def.plotMetrics = [metric('reflections', '已全反射次數', ''), metric('escaped', '是否已逸出（1 是）', '')];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
