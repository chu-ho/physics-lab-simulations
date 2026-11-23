/* Floating measurement tools: ruler, protractor, probe (world points on a plane) and a stopwatch on simulation time. */
'use strict';
// 尺、量角器、探針的點都存成 3D 世界座標，旋轉或縮放視角時仍附著在場景上；
// 拖曳把手移動工具，拖曳其他地方照常轉視角。碼錶以模擬時間計，回放與單步也一致。
let measureTool = null,
  measureDrag = null,
  measureTap = null;
const measure = { plane: null, ruler: null, angle: null, probe: null },
  stopwatch = { on: false, start: null, laps: [] };
const MEASURE_HANDLE = 22;
// 個別實驗的探針讀數：回傳 { plane, read(point) }，點在場景世界座標。
const measureProbes = {
  'double-slit': () => {
    const yaw = (params.screenYaw * Math.PI) / 180,
      along = [Math.sin(yaw), 0, Math.cos(yaw)],
      origin = [simulation.screenX, 4, 0];
    return {
      plane: { point: origin, normal: [Math.cos(yaw), 0, -Math.sin(yaw)] },
      read(p) {
        const u = dot(vector(p, origin), along),
          v = p[1] - 4;
        if (Math.abs(u) > 4 || Math.abs(v) > 3) return '探針在屏幕外';
        const z = (u / 4) * params.span,
          Y = (v / 3) * params.span,
          q = simulation.components(z * 0.001, Y * 0.001),
          path = (params.d * 1e-6 * q.qU) / (params.lambda * 1e-9);
        return (
          '屏上 (' +
          z.toFixed(2) +
          ', ' +
          Y.toFixed(2) +
          ') mm　I/I₀ ' +
          simulation.intensity(z * 0.001, Y * 0.001).toFixed(3) +
          '　幾何光程差 ' +
          path.toFixed(2) +
          ' λ'
        );
      }
    };
  }
};
function measureLengthUnit() {
  return simulation.displayLengthUnit || 'm';
}
function measureApprox() {
  return simulation.schematic || simulation.displayPoint ? '（示意比例）' : '';
}
function measureDefaultPlane() {
  updateCamera();
  const custom = measureProbes[def.id]?.();
  if (measureTool === 'probe' && custom) return custom.plane;
  const target = camera.target.slice(),
    axis = [0, 1, 2].reduce((best, k) => (Math.abs(forward[k]) > Math.abs(forward[best]) ? k : best), 2),
    normal = [0, 0, 0];
  // 量測平面取最正對鏡頭的座標平面（x、y 或 z 為定值），通過目前視角中心。
  normal[axis] = 1;
  return { point: target, normal };
}
function measureRay(clientX, clientY) {
  updateCamera();
  const rect = canvas.getBoundingClientRect(),
    x = ((clientX - (rect.left || 0)) * W) / (rect.width || W),
    y = ((clientY - (rect.top || 0)) * H) / (rect.height || H),
    bounds = sceneBounds(),
    sx = (x - W / 2) / focal,
    sy = -(y - (bounds.top + bounds.bottom) / 2) / focal;
  return forward.map((v, j) => v + sx * right[j] + sy * up[j]);
}
function measurePlanePoint(clientX, clientY, plane = measure.plane) {
  if (!plane) return null;
  const dir = measureRay(clientX, clientY),
    denom = dot(dir, plane.normal);
  if (Math.abs(denom) < 1e-6) return null;
  const k = dot(vector(plane.point, eye), plane.normal) / denom;
  if (k <= 0) return null;
  const point = eye.map((v, j) => v + k * dir[j]);
  return point.every(Number.isFinite) ? point : null;
}
// 在量測平面內取兩個互相垂直的方向，供預設放置位置使用。
function measureAxes(plane) {
  const n = plane.normal,
    a = Math.abs(n[1]) > 0.9 ? [1, 0, 0] : norm(cross([0, 1, 0], n)),
    b = norm(cross(n, a));
  return [a, b];
}
function measurePlace() {
  measure.plane = measureDefaultPlane();
  const c = measure.plane.point,
    [a, b] = measureAxes(measure.plane),
    r = scale * 0.25,
    at = (x, y) => c.map((v, j) => v + x * a[j] + y * b[j]);
  measure.ruler = [at(-r, 0), at(r, 0)];
  measure.angle = [at(-r * 0.5, -r * 0.3), at(r * 0.6, -r * 0.3), at(r * 0.2, r * 0.45)];
  measure.probe = c.slice();
  dirty = true;
}
function measureHandles() {
  if (measureTool === 'ruler' && measure.ruler) return measure.ruler.map((p, i) => ['ruler', i, p]);
  if (measureTool === 'protractor' && measure.angle) return measure.angle.map((p, i) => ['angle', i, p]);
  if (measureTool === 'probe' && measure.probe) return [['probe', 0, measure.probe]];
  return [];
}
function measureHit(e) {
  const rect = canvas.getBoundingClientRect(),
    x = ((e.clientX - (rect.left || 0)) * W) / (rect.width || W),
    y = ((e.clientY - (rect.top || 0)) * H) / (rect.height || H);
  updateCamera();
  let best = null;
  for (const [kind, index, p] of measureHandles()) {
    const s = project(p);
    if (!s) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= MEASURE_HANDLE && (!best || d < best.d)) best = { kind, index, d };
  }
  return best;
}
function measureDown(e) {
  if (!measureTool || measureTool === 'stopwatch') return false;
  const hit = measureHit(e);
  if (!hit) {
    measureTap = { id: e.pointerId, x: e.clientX, y: e.clientY };
    return false;
  }
  e.preventDefault?.();
  measureDrag = { id: e.pointerId, ...hit };
  canvas.setPointerCapture(e.pointerId);
  canvas.focus({ preventScroll: true });
  return true;
}
function measureMove(e) {
  if (!measureDrag || e.pointerId !== measureDrag.id) {
    if (
      measureTap &&
      e.pointerId === measureTap.id &&
      Math.hypot(e.clientX - measureTap.x, e.clientY - measureTap.y) > 6
    )
      measureTap = null;
    return false;
  }
  const point = measurePlanePoint(e.clientX, e.clientY);
  if (point) {
    if (measureDrag.kind === 'ruler') measure.ruler[measureDrag.index] = point;
    else if (measureDrag.kind === 'angle') measure.angle[measureDrag.index] = point;
    else measure.probe = point;
    measureUpdate();
  }
  return true;
}
function measureRelease(e) {
  if (measureDrag && e.pointerId === measureDrag.id) {
    measureDrag = null;
    measureUpdate();
    return true;
  }
  // 探針：輕點（未拖曳）場景即把探針移到該點，之後照常結束轉視角手勢。
  if (measureTap && e.pointerId === measureTap.id && e.type === 'pointerup' && measureTool === 'probe') {
    const point = measurePlanePoint(e.clientX, e.clientY);
    if (point) {
      measure.probe = point;
      measureUpdate();
    }
  }
  measureTap = null;
  return false;
}
function measureLength(a, b) {
  return Math.hypot(...vector(a, b)) / (simulation.displayScale || 1);
}
function measureAngle([vertex, a, b]) {
  const u = vector(a, vertex),
    v = vector(b, vertex),
    c = dot(u, v) / ((Math.hypot(...u) || 1) * (Math.hypot(...v) || 1));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}
function measureProbeText() {
  const p = measure.probe,
    custom = measureProbes[def.id]?.();
  if (custom) return custom.read(p);
  const k = simulation.displayScale || 1,
    unit = measureLengthUnit();
  return '座標 (' + p.map(v => format(v / k)).join(', ') + ') ' + unit + measureApprox();
}
function stopwatchText() {
  if (stopwatch.start === null) return '碼錶 0.00 s（按「開始」）';
  const parts = ['碼錶 ' + format(t - stopwatch.start) + ' s'];
  stopwatch.laps.forEach(lap => parts.push('第' + lap.n + '筆 ' + format(lap.dt) + ' s'));
  return parts.join('　');
}
// 量測平面說明：例如「平面 z = 0.00 m」；探針若用實驗自訂平面則不另標。
function measurePlaneText() {
  const pl = measure.plane;
  if (!pl || (measureTool === 'probe' && measureProbes[def.id])) return '';
  const k = pl.normal.findIndex(v => Math.abs(v) > 0.9);
  if (k < 0) return '';
  return (
    '（平面 ' +
    'xyz'[k] +
    ' = ' +
    format(pl.point[k] / (simulation.displayScale || 1)) +
    ' ' +
    measureLengthUnit() +
    '）'
  );
}
function measureReadings() {
  const out = [];
  if (measureTool === 'ruler' && measure.ruler)
    out.push(
      '尺 ' + format(measureLength(...measure.ruler)) + ' ' + measureLengthUnit() + measureApprox() + measurePlaneText()
    );
  if (measureTool === 'protractor' && measure.angle) out.push('量角器 ' + measureAngle(measure.angle).toFixed(1) + '°');
  if (measureTool === 'probe' && measure.probe) out.push('探針 ' + measureProbeText());
  if (stopwatch.on) out.push(stopwatchText());
  return out;
}
function measureUpdate() {
  const lines = measureReadings();
  $('measureReadout').hidden = !lines.length;
  $('measureReadout').textContent = lines.join('　｜　');
  for (const tool of ['ruler', 'protractor', 'probe'])
    $('measure-' + tool).setAttribute('aria-pressed', String(measureTool === tool));
  $('measure-stopwatch').setAttribute('aria-pressed', String(stopwatch.on));
  $('stopwatchControls').hidden = !stopwatch.on;
  $('stopwatchLap').disabled = stopwatch.start === null;
  $('stopwatchStart').textContent = stopwatch.start === null ? '開始' : '從現在重新計時';
  $('measureReplace').disabled = !measureTool;
  canvas.style.cursor = measureTool && measureTool !== 'stopwatch' ? 'crosshair' : '';
  dirty = true;
}
function measureSelectTool(tool) {
  measureDrag = null;
  measureTap = null;
  measureTool = measureTool === tool ? null : tool;
  if (measureTool) measurePlace();
  measureUpdate();
}
function measureReset() {
  measureTool = null;
  measureDrag = null;
  measureTap = null;
  measure.plane = measure.ruler = measure.angle = measure.probe = null;
  stopwatch.on = false;
  stopwatch.start = null;
  stopwatch.laps = [];
  measureUpdate();
}
function measureMark(p, text) {
  const s = project(p);
  if (!s) return;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 7, 0, TAU);
  ctx.fillStyle = '#ffffffd9';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#12323d';
  ctx.stroke();
  if (text) measureText(s.x + 11, s.y - 10, text);
}
function measureText(x, y, text) {
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'left';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffffe6';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#12323d';
  ctx.fillText(text, x, y);
}
function measureLine(a, b, dashed = false) {
  const A = project(a),
    B = project(b);
  if (!A || !B) return null;
  ctx.setLineDash(dashed ? [6, 5] : []);
  for (const [w, c] of [
    [5, '#ffffffcc'],
    [2, '#12323d']
  ]) {
    ctx.lineWidth = w;
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  return [A, B];
}
function drawMeasure() {
  if (measureTool === 'ruler' && measure.ruler) {
    const [a, b] = measure.ruler,
      seg = measureLine(a, b);
    measureMark(a);
    measureMark(b);
    if (seg)
      measureText(
        (seg[0].x + seg[1].x) / 2 + 8,
        (seg[0].y + seg[1].y) / 2 - 10,
        format(measureLength(a, b)) + ' ' + measureLengthUnit()
      );
  }
  if (measureTool === 'protractor' && measure.angle) {
    const [v, a, b] = measure.angle;
    measureLine(v, a);
    measureLine(v, b);
    const V = project(v),
      A = project(a),
      B = project(b);
    if (V && A && B) {
      const r = 26,
        a0 = Math.atan2(A.y - V.y, A.x - V.x),
        a1 = Math.atan2(B.y - V.y, B.x - V.x);
      let d = a1 - a0;
      while (d > Math.PI) d -= TAU;
      while (d < -Math.PI) d += TAU;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#12323d';
      ctx.beginPath();
      ctx.arc(V.x, V.y, r, a0, a0 + d, d < 0);
      ctx.stroke();
    }
    measureMark(v, measureAngle(measure.angle).toFixed(1) + '°');
    measureMark(a);
    measureMark(b);
  }
  if (measureTool === 'probe' && measure.probe) {
    const s = project(measure.probe);
    if (s) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#12323d';
      ctx.beginPath();
      ctx.moveTo(s.x - 14, s.y);
      ctx.lineTo(s.x + 14, s.y);
      ctx.moveTo(s.x, s.y - 14);
      ctx.lineTo(s.x, s.y + 14);
      ctx.stroke();
    }
    measureMark(measure.probe);
  }
}
for (const tool of ['ruler', 'protractor', 'probe']) $('measure-' + tool).onclick = () => measureSelectTool(tool);
$('measure-stopwatch').onclick = () => {
  stopwatch.on = !stopwatch.on;
  measureUpdate();
};
$('stopwatchStart').onclick = () => {
  stopwatch.start = t;
  stopwatch.laps = [];
  measureUpdate();
};
$('stopwatchLap').onclick = () => {
  if (stopwatch.start === null) return;
  stopwatch.laps.push({ n: (stopwatch.laps.at(-1)?.n || 0) + 1, dt: t - stopwatch.start });
  if (stopwatch.laps.length > 3) stopwatch.laps.shift();
  measureUpdate();
};
$('measureReplace').onclick = () => {
  if (measureTool && measureTool !== 'stopwatch') measurePlace();
  measureUpdate();
};
