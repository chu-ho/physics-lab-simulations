(function (M) {
  'use strict';
  const { P, M: metric, trajectory } = M.helpers,
    rad = d => (d * Math.PI) / 180,
    deg = r => (r * 180) / Math.PI;
  // 材料以 d 線（589.3 nm）折射率 nd 與阿貝數 V 描述；兩項 Cauchy 式 n(λ) = A + B/λ²（λ 以 µm 計）
  // 由 nF − nC = (nd − 1)/V 決定 B，再令 n(589.3 nm) = nd 決定 A。
  const materials = [
    { name: '水', nd: 1.333, V: 55.7 },
    { name: '冕牌玻璃 BK7', nd: 1.5168, V: 64.17 },
    { name: '火石玻璃 F2', nd: 1.62, V: 36.37 },
    { name: '重火石玻璃 SF11', nd: 1.7847, V: 25.68 }
  ].map(m => {
    const B = (m.nd - 1) / (m.V * (1 / 0.4861 ** 2 - 1 / 0.6563 ** 2));
    return { ...m, A: m.nd - B / 0.5893 ** 2, B };
  });
  const bands = [
    { name: '紅', lambda: 656, color: '#d0505a' },
    { name: '橙', lambda: 610, color: '#e08a3c' },
    { name: '黃', lambda: 589, color: '#c9a92a' },
    { name: '綠', lambda: 532, color: '#4c9e57' },
    { name: '藍', lambda: 486, color: '#3a8cc0' },
    { name: '靛', lambda: 450, color: '#5662b8' },
    { name: '紫', lambda: 410, color: '#8c5bb8' }
  ];
  const nOf = (material, lambda) => {
    const m = materials[material];
    return m.A + m.B / (lambda / 1000) ** 2;
  };
  // 解析式（只用來標示與畫圖；光路本身由向量追跡求出）
  const minIncidence = (A, n) => {
    const s = n * Math.sin(rad(A) / 2);
    return s <= 1 ? deg(Math.asin(s)) : NaN;
  };
  const analyticDeviation = (A, n, theta1) => {
    const r1 = Math.asin(Math.sin(rad(theta1)) / n),
      s2 = n * Math.sin(rad(A) - r1);
    return Math.abs(s2) > 1 ? NaN : theta1 + deg(Math.asin(s2)) - A;
  };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]],
    dot2 = (a, b) => a[0] * b[0] + a[1] * b[1],
    crossz = (a, b) => a[0] * b[1] - a[1] * b[0],
    along = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
  // 向量形式 Snell 定律；N 為朝向入射側的單位法線
  function bend(d, outward, n1, n2) {
    const N = dot2(d, outward) < 0 ? outward : [-outward[0], -outward[1]],
      cosi = -dot2(d, N),
      eta = n1 / n2,
      k = 1 - eta * eta * (1 - cosi * cosi),
          angle = Math.atan2(Math.abs(crossz(d, N)), cosi);
    if (k < 0) return { tir: true, dir: [d[0] + 2 * cosi * N[0], d[1] + 2 * cosi * N[1]], cosi, angle };
    const c = eta * cosi - Math.sqrt(k);
    return { tir: false, dir: [eta * d[0] + c * N[0], eta * d[1] + c * N[1]], cosi, angle };
  }
  function prismGeometry(A, side = 3.4) {
    const h = rad(A) / 2,
      w = side * Math.sin(h),
      H = side * Math.cos(h),
      B1 = [-w, 0],
      T = [0, H],
      B2 = [w, 0],
      edges = [
        [B1, T, 'left'],
        [T, B2, 'right'],
        [B2, B1, 'base']
      ].map(([a, b, name]) => {
        const e = sub(b, a),
          L = Math.hypot(e[0], e[1]);
        return { a, b, name, L, e: [e[0] / L, e[1] / L], outward: [-e[1] / L, e[0] / L] };
      });
    return { A, w, H, B1, T, B2, edges, entry: along(B1, edges[0].e, 0.62 * side) };
  }
  // 從空氣射入左面後在稜鏡內逐面追跡：每面先判斷全反射，再折射離開
  function traceBand(geo, n, theta1) {
    const left = geo.edges[0],
      inward = [-left.outward[0], -left.outward[1]],
      c = Math.cos(rad(theta1)),
      s = Math.sin(rad(theta1)),
      dIn = [inward[0] * c - inward[1] * s, inward[0] * s + inward[1] * c],
      start = along(geo.entry, dIn, -5.2),
      first = bend(dIn, left.outward, 1, n),
      points = [start, geo.entry],
      hits = [];
    let pos = geo.entry,
      dir = first.dir,
      from = left,
      exit = null;
    const r1 = deg(Math.atan2(Math.abs(crossz(dir, inward)), dot2(dir, inward)));
    for (let k = 0; k < 8 && !exit; k++) {
      let best = null;
      for (const edge of geo.edges) {
        if (edge === from) continue;
        const den = crossz(dir, edge.e);
        if (Math.abs(den) < 1e-14) continue;
        const q = sub(edge.a, pos),
          tRay = crossz(q, edge.e) / den,
          u = crossz(q, dir) / den;
        if (tRay > 1e-9 && u >= -1e-9 && u <= edge.L + 1e-9 && (!best || tRay < best.t)) best = { t: tRay, edge };
      }
      if (!best) break;
      pos = along(pos, dir, best.t);
      points.push(pos);
      const out = bend(dir, best.edge.outward, n, 1),
        incidence = deg(out.angle);
      hits.push({ point: pos, face: best.edge.name, tir: out.tir, incidence });
      if (out.tir) {
        dir = out.dir;
        from = best.edge;
      } else exit = { point: pos, face: best.edge.name, dir: out.dir, incidence };
    }
    const tirCount = hits.filter(h => h.tir).length,
      clean = !!exit && exit.face === 'right' && tirCount === 0;
    if (exit) points.push(along(exit.point, exit.dir, 6.5));
    const deviation = exit ? -deg(Math.atan2(crossz(dIn, exit.dir), dot2(dIn, exit.dir))) : NaN;
    return {
      points,
      hits,
      exit,
      dIn,
      r1,
      r2: hits.length ? hits[0].incidence : NaN,
      theta2: clean ? deg(Math.asin(Math.min(1, n * Math.sin(rad(hits[0].incidence))))) : NaN,
      firstFace: hits.length ? hits[0].face : '',
      tirAtSecond: !!hits.length && hits[0].face === 'right' && hits[0].tir,
      tirCount,
      clean,
      deviation: clean ? deviation : NaN,
      rawDeviation: deviation,
      length: points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0)
    };
  }
  M.PrismOptics = { materials, bands, nOf, minIncidence, analyticDeviation, traceBand, prismGeometry };

  const sweepDuration = 12,
    frontDuration = 3,
    fixedDuration = 5;
  M.register(
    'prism-dispersion',
    '稜鏡色散與最小偏向角',
    '幾何光學',
    'prism-dispersion',
    [
      { ...P('apex', '稜鏡頂角 A', 20, 80, 1, 60, '°'), refit: true },
      P('material', '材料：0 水／1 冕牌玻璃／2 火石玻璃／3 重火石玻璃', 0, 3, 1, 2),
      { ...P('incidence', '入射角 θ₁（相對左面法線）', 0, 89, 0.1, 54.1, '°'), setOnInput: { mode: 0 } },
      {
        ...P('mode', '入射角：0 手動／1 對準參考色最小偏向／2 自動掃描', 0, 2, 1, 0),
        setOnInput: (v, p) => {
          if (v !== 1) return {};
          const best = minIncidence(p.apex, nOf(p.material, bands[p.ref].lambda));
          return Number.isFinite(best) ? { incidence: Math.round(best * 10) / 10 } : {};
        }
      },
      P('ref', '參考色：0 紅／1 橙／2 黃／3 綠／4 藍／5 靛／6 紫', 0, 6, 1, 2),
      { ...P('normals', '顯示法線與角度', 0, 1, 1, 1), visual: true }
    ],
    [
      metric('incidence', '入射角 θ₁', '°'),
      metric('refN', '參考色折射率 n', ''),
      metric('tirBands', '第二面無法射出的色光數', '')
    ],
    'δ = θ₁ + θ₂ − A；最小偏向時 r₁ = r₂ = A/2，n = sin[(A + δmin)/2] / sin(A/2)',
    '白光自左方以入射角 θ₁ 射到稜鏡左面同一點，七色各用自己的折射率，以向量形式 Snell 定律逐面追跡：在第二面先檢查 n sin r₂ 是否大於 1，大於即全反射並繼續追跡至射出面。偏向角 δ 為出射光相對入射光順時針轉過的角度，只有不經全反射、由右面射出的光才計入。折射率採兩項 Cauchy 式 n(λ) = A + B/λ²，由各材料 d 線折射率與阿貝數換算，屬教學近似；未計反射損失、吸收及光束寬度。最小偏向角由解析式 θ₁ = sin⁻¹[n sin(A/2)] 標示，可與追跡結果及 n = sin[(A+δmin)/2]/sin(A/2) 互相核對。時間軸只用來播放光線前進或自動掃描入射角，不是實際光速。',
    [
      '慢慢改變入射角，參考色的偏向角怎麼變？最小值出現時，稜鏡內的光線有什麼特徵？',
      '換成色散較強的材料，哪一色偏折最多？紅紫分散角變多少？',
      '把頂角調大，為什麼有些顏色先在第二面全反射？'
    ],
    p => {
      const geo = prismGeometry(p.apex),
        material = materials[p.material],
        ns = bands.map(b => nOf(p.material, b.lambda)),
        refN = ns[p.ref],
        best = minIncidence(p.apex, refN),
        deltaMin = Number.isFinite(best) ? 2 * deg(Math.asin(refN * Math.sin(rad(p.apex) / 2))) - p.apex : NaN,
        // 第二面掠射出射時的入射角：θ₁ 小於此值時參考色在第二面全反射
        critical = deg(Math.asin(1 / refN)),
        grazing = deg(Math.asin(Math.max(-1, Math.min(1, refN * Math.sin(rad(p.apex - critical)))))),
        sweep = p.mode === 2,
        fixedIncidence = p.mode === 1 && Number.isFinite(best) ? best : p.incidence,
        incidenceAt = t => (sweep ? (89 * Math.max(0, Math.min(t, sweepDuration))) / sweepDuration : fixedIncidence),
        traceAll = theta1 => ns.map(n => traceBand(geo, n, theta1)),
        fixedTraces = sweep ? null : traceAll(fixedIncidence),
        tracesAt = t => fixedTraces || traceAll(incidenceAt(t)),
        maxLength = Math.max(...(fixedTraces || traceAll(45)).map(r => r.length)),
        duration = sweep ? sweepDuration : fixedDuration;
      return trajectory(
        duration,
        t => {
          const traces = tracesAt(t),
            ref = traces[p.ref],
            incidence = incidenceAt(t),
            out = {
              x: 0,
              y: 1,
              z: 0,
              incidence,
              refN,
              refDeviation: ref.deviation,
              deltaMin,
              bestIncidence: best,
              spread: traces[6].deviation - traces[0].deviation,
              tirBands: traces.filter(r => !r.clean).length,
              nFromMin: Number.isFinite(deltaMin)
                ? Math.sin(rad(p.apex + deltaMin) / 2) / Math.sin(rad(p.apex) / 2)
                : NaN,
              atMinimum: Number.isFinite(best) && Math.abs(incidence - best) < 0.35 ? 1 : 0,
              front: sweep ? 1e3 : (maxLength * t) / frontDuration
            };
          traces.forEach((r, j) => (out['dev' + j] = r.deviation));
          return out;
        },
        {
          schematic: true,
          hidePrimary: true,
          hideFloor: true,
          hideGrid: () => true,
          geometry: geo,
          material,
          bands,
          ns,
          refN,
          bestIncidence: best,
          grazingIncidence: grazing,
          tracesAt,
          bounds: { min: [-6.6, -3.4, -1.4], max: [7.4, 4.6, 1.4] },
          minimumSceneScale: 5,
          positionPlot: {
            key: 'incidence',
            label: '入射角 θ₁',
            unit: '°',
            min: 0,
            max: 89,
            title: '各色偏向角對入射角',
            menuLabel: '偏向角對入射角',
            yUnit: '°',
            scopeLabel: '— 七色偏向角 δ（全反射處中斷）　● 目前入射角',
            series: bands.map((b, j) => ({
              label: b.name,
              color: b.color,
              value: x => analyticDeviation(p.apex, ns[j], x)
            }))
          },
          scaleNote: '稜鏡與光路為示意尺寸；角度依實際幾何追跡。',
          endLabel: sweep ? '入射角掃描完成' : '光線已射出稜鏡'
        }
      );
    },
    'models/prism-dispersion.js'
  );

  const def = M.defs.find(d => d.id === 'prism-dispersion');
  def.defaultPlotMode = 'position';
  def.initialView = { yaw: -0.22, pitch: 0.12 };
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
