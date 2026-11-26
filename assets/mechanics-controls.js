'use strict';
function frame(now) {
  if (running) {
    if (last !== null) advance(Math.min(0.1, (now - last) / 1000) * +$('rate').value * (simulation.playbackScale || 1));
    last = now;
  } else last = null;
  if (dirty) render();
  requestAnimationFrame(frame);
}
// 依分類放進 optgroup；目前實驗在選單裡加「▶ …（目前）」，展開時一眼看出位置。
const experimentGroups = new Map(),
  experimentOptions = [];
for (const d of typeof MechanicsCatalog !== 'undefined' ? MechanicsCatalog : Mechanics.defs) {
  if (!experimentGroups.has(d.group)) {
    const group = document.createElement('optgroup');
    group.label = d.group;
    experimentGroups.set(d.group, group);
    $('experiment').append(group);
  }
  const option = document.createElement('option');
  option.value = d.id;
  option.textContent = option.baseLabel = d.group + ' · ' + d.title;
  experimentGroups.get(d.group).append(option);
  experimentOptions.push(option);
}
function markCurrentExperiment(id) {
  for (const option of experimentOptions) {
    const current = option.value === id;
    option.textContent = current ? '▶ ' + option.baseLabel + '（目前）' : option.baseLabel;
    option.classList.toggle('current', current);
  }
}
$('experiment').onchange = () => selectExperiment($('experiment').value);
$('plotMode').onchange = updatePlotMode;
// 切換參考系不重新取景：切換當下畫面維持不動（同一個世界位置留在原處），之後鏡頭跟著新的參考物移動。
// 模型若沒有提供世界原點（worldOriginX/Y）則照舊重新取景。
$('referenceFrame').onchange = () => {
  const frame = $('referenceFrame').value,
    before = simulation.inFrame ? simulation.inFrame(t, $('referenceFrame').previousFrame || 'ground') : null,
    after = simulation.inFrame ? simulation.inFrame(t, frame) : null;
  $('referenceFrame').previousFrame = frame;
  collectPlotSamples();
  if (before && after && Number.isFinite(before.worldOriginX) && Number.isFinite(after.worldOriginX) && !following) {
    camera.target[0] += after.worldOriginX - before.worldOriginX;
    camera.target[1] += (after.worldOriginY ?? 0) - (before.worldOriginY ?? 0);
    camera.target[2] += (after.worldOriginZ ?? 0) - (before.worldOriginZ ?? 0);
  } else fitCamera();
  updateUI();
};
$('play').onclick = () => {
  if (t >= simulation.duration) t = 0;
  running = !running;
  last = null;
  updateUI();
};
$('reset').onclick = reset;
$('restoreDefaults').onclick = restoreDefaults;
function stepBy(direction) {
  running = false;
  last = null;
  if (direction > 0) advance(0.05 * (simulation.playbackScale || 1));
  else {
    t = Math.max(0, t - 0.05 * (simulation.playbackScale || 1));
    updateUI();
  }
}
$('step').onclick = () => stepBy(1);
// 快捷鍵：空白鍵播放／暫停、← → 單步；焦點在表單元件或場景（方向鍵旋轉視角）時交給元件本身。
document.addEventListener('keydown', e => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || $('helpDialog').open) return;
  if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'SUMMARY', 'A'].includes(e.target.tagName)) return;
  if (e.key === ' ' && !$('play').disabled) $('play').onclick();
  else if (e.key === 'ArrowRight' && !$('step').disabled) stepBy(1);
  else if (e.key === 'ArrowLeft') stepBy(-1);
  else return;
  e.preventDefault();
});
$('share').onclick = () => {
  syncURL();
  const done = ok => ($('shareStatus').textContent = ok ? '已複製目前參數的連結' : '請從網址列複製目前的連結');
  if (navigator.clipboard)
    navigator.clipboard.writeText(location.href).then(
      () => done(true),
      () => done(false)
    );
  else done(false);
};
$('timeline').oninput = () => {
  running = false;
  last = null;
  t = (+$('timeline').value / 1000) * simulation.duration;
  updateUI();
};
for (const id of ['trail', 'vectors', 'forces', 'grid', 'plotMetric'])
  $(id).addEventListener('change', () => (dirty = true));
for (const level of [1, 2, 3]) $('level-' + level).addEventListener('click', () => selectParamLevel(level));
$('derivationPanel').addEventListener('toggle', renderDerivation);
$('derivationNext').onclick = () => {
  derivationShown++;
  renderDerivation();
};
$('derivationAll').onclick = () => {
  derivationShown = 99;
  renderDerivation();
};
$('derivationReset').onclick = () => {
  derivationShown = 1;
  renderDerivation();
};
$('energyToggle').addEventListener('change', () => {
  updateEnergy(stateAt(t));
  dirty = true;
});
function setPlotVisible(visible) {
  $('plotPanel').hidden = !visible;
  $('togglePlot').textContent = visible ? '隱藏圖表' : '顯示圖表';
  $('togglePlot').setAttribute('aria-expanded', String(visible));
  resize();
  if (visible && typeof $('plotPanel').scrollIntoView === 'function')
    $('plotPanel').scrollIntoView({ block: 'nearest' });
  dirty = true;
}
$('togglePlot').onclick = () => setPlotVisible($('plotPanel').hidden);
function view(yaw, pitch) {
  camera.yaw = yaw;
  camera.pitch = pitch;
  dirty = true;
}
$('perspective').onclick = () => view(-0.65, 0.48);
$('side').onclick = () => view(0, 0.06);
$('top').onclick = () => view(0, Math.PI / 2 - 0.001);
$('front').onclick = () => view(Math.PI / 2, 0.1);
$('fit').onclick = () => fitCamera();
$('follow').onclick = () => {
  following = !following;
  $('follow').setAttribute('aria-pressed', String(following));
  if (following) camera.zoom = Math.max(2.5, camera.zoom);
  dirty = true;
};
function zoom(factor) {
  camera.zoom = Math.max(0.04, Math.min(6, camera.zoom * factor));
  dirty = true;
}
$('zoomIn').onclick = () => zoom(1.2);
$('zoomOut').onclick = () => zoom(1 / 1.2);
const pointers = new Map();
let gesture = null;
function snapshot() {
  const a = [...pointers.values()];
  return a.length >= 2
    ? { type: 'pinch', distance: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }
    : a.length
      ? { type: 'orbit', x: a[0].x, y: a[0].y }
      : null;
}
canvas.addEventListener('pointerdown', e => {
  if (annotationDown(e) || measureDown(e)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  canvas.setPointerCapture(e.pointerId);
  gesture = snapshot();
  canvas.classList.add('dragging');
  canvas.focus({ preventScroll: true });
});
canvas.addEventListener('pointermove', e => {
  if (annotationMove(e) || measureMove(e)) return;
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const next = snapshot();
  if (gesture && next.type === gesture.type) {
    if (next.type === 'pinch') {
      if (gesture.distance > 0) zoom(next.distance / gesture.distance);
    } else {
      camera.yaw -= (next.x - gesture.x) * 0.008;
      camera.pitch = Math.max(0.025, Math.min(Math.PI / 2 - 0.001, camera.pitch + (next.y - gesture.y) * 0.006));
      dirty = true;
    }
  }
  gesture = next;
});
function release(e) {
  if (annotationRelease(e) || measureRelease(e)) return;
  dirty = true;
  pointers.delete(e.pointerId);
  gesture = snapshot();
  if (!pointers.size) canvas.classList.remove('dragging');
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('lostpointercapture', release);
canvas.addEventListener(
  'wheel',
  e => {
    e.preventDefault();
    zoom(Math.exp(-e.deltaY * 0.001));
  },
  { passive: false }
);
canvas.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(e.key)) {
    e.preventDefault();
    if (e.key === 'ArrowLeft') camera.yaw -= 0.12;
    if (e.key === 'ArrowRight') camera.yaw += 0.12;
    if (e.key === 'ArrowUp') camera.pitch = Math.min(Math.PI / 2 - 0.001, camera.pitch + 0.08);
    if (e.key === 'ArrowDown') camera.pitch = Math.max(0.025, camera.pitch - 0.08);
    if (e.key === '+' || e.key === '=') zoom(1.1);
    if (e.key === '-') zoom(1 / 1.1);
    dirty = true;
  }
});
$('focus').onclick = () => {
  const active = $('app').classList.toggle('fullscreen');
  $('focus').textContent = active ? '顯示參數' : '放大場景';
  resize();
};
$('help').onclick = () => {
  running = false;
  last = null;
  updateUI();
  $('helpDialog').showModal();
};
$('closeHelp').onclick = () => $('helpDialog').close();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false;
    last = null;
    updateUI();
  }
});
$('export').onclick = () => {
  const keys = [
      'x',
      'y',
      'z',
      'vx',
      'vy',
      'vz',
      'fx',
      'fy',
      'fz',
      ...def.metrics.map(m => m.key),
      ...Object.keys(stateAt(0)).filter(k => typeof stateAt(0)[k] === 'number'),
      ...Object.keys(stateAt(simulation.duration)).filter(k => typeof stateAt(simulation.duration)[k] === 'number')
    ].filter((v, i, a) => a.indexOf(v) === i),
    rows = [
      '# ' + def.title,
      '# parameters_user_units=' + JSON.stringify(params),
      '# parameter_units=' + JSON.stringify(Object.fromEntries(def.params.map(p => [p.id, p.unit]))),
      '# reference_frame=' + (simulation.inFrame ? $('referenceFrame').value : 'world'),
      '# ' + def.note,
      ['time_s', ...keys].join(',')
    ];
  const count = Math.max(1, Math.ceil(simulation.duration / ((simulation.playbackScale || 1) * 0.025)));
  for (let i = 0; i <= count; i++) {
    const time = (i / count) * simulation.duration,
      s = stateAt(time);
    rows.push(
      [time, ...keys.map(k => s[k])]
        .map(v => (Number.isFinite(v) ? (v !== 0 && Math.abs(v) < 1e-6 ? v.toExponential(10) : v.toFixed(8)) : ''))
        .join(',')
    );
  }
  const url = URL.createObjectURL(new Blob(['\ufeff' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })),
    a = document.createElement('a');
  a.href = url;
  a.download = def.id + '-data.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
setPlotVisible(false);
const route = routeFromURL();
selectExperiment(route.id, false, route.overrides);
// 同分頁改網址 hash（貼連結、書籤）時切換實驗與參數；replaceState 不會觸發此事件。
window.addEventListener('hashchange', () => {
  if (!def || location.hash === shareURL()) return;
  const next = routeFromURL();
  selectExperiment(next.id, false, next.overrides);
});
const sceneResizeObserver = new ResizeObserver(resize);
sceneResizeObserver.observe(canvas.parentElement);
// 讀數列換行或能量條出現時，取景範圍跟著更新。
if (typeof document.querySelector === 'function' && document.querySelector('.viewport .bottom'))
  sceneResizeObserver.observe(document.querySelector('.viewport .bottom'));
requestAnimationFrame(frame);

// 手機底部抽屜：三段高度（只剩把手／原本的預設高度／約 55% 畫面），點一下在預設與展開間切換，
// 拖曳可自由調整並在放開時吸附最近的一段；↑↓ 鍵切換。只改版面，不動時間與播放。
const drawer = { start: null, moved: false, base: null };
function drawerStops() {
  const app = $('workspace').getBoundingClientRect().height || innerHeight;
  // 中間一段取 CSS 原本給的高度（第一次操作前量到的值），手機與觸控寬度不同時也一致。
  if (drawer.base === null) drawer.base = drawerHeight();
  return [52, drawer.base, Math.max(drawer.base + 40, Math.round(app * 0.55))];
}
function drawerHeight() {
  return $('sidebar').getBoundingClientRect().height || 224;
}
function setDrawer(height) {
  const stops = drawerStops(),
    h = Math.max(stops[0], Math.min(stops[2], height));
  $('workspace').style.setProperty('--drawer-h', Math.round(h) + 'px');
  const expanded = h > stops[1] + 1;
  $('drawerToggle').setAttribute('aria-expanded', String(expanded));
  $('drawerLabel').textContent = h <= stops[0] + 1 ? '展開設定' : expanded ? '收回設定' : '展開設定';
  resize();
}
function snapDrawer(height) {
  const stops = drawerStops();
  setDrawer(stops.reduce((best, s) => (Math.abs(s - height) < Math.abs(best - height) ? s : best), stops[1]));
}
$('drawerToggle').addEventListener('pointerdown', e => {
  drawer.start = { y: e.clientY, h: drawerHeight(), id: e.pointerId };
  drawer.moved = false;
  $('drawerToggle').setPointerCapture?.(e.pointerId);
});
$('drawerToggle').addEventListener('pointermove', e => {
  if (!drawer.start || e.pointerId !== drawer.start.id) return;
  const dy = e.clientY - drawer.start.y;
  if (Math.abs(dy) > 6) drawer.moved = true;
  if (drawer.moved) setDrawer(drawer.start.h - dy);
});
function drawerRelease(e) {
  if (!drawer.start || e.pointerId !== drawer.start.id) return;
  if (drawer.moved) snapDrawer(drawerHeight());
  drawer.start = null;
}
$('drawerToggle').addEventListener('pointerup', drawerRelease);
$('drawerToggle').addEventListener('pointercancel', drawerRelease);
$('drawerToggle').addEventListener('click', () => {
  if (drawer.moved) {
    drawer.moved = false;
    return;
  }
  const stops = drawerStops();
  setDrawer(drawerHeight() > stops[1] + 1 ? stops[1] : stops[2]);
});
$('drawerToggle').addEventListener('keydown', e => {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
  e.preventDefault();
  const stops = drawerStops(),
    h = drawerHeight(),
    next = e.key === 'ArrowUp' ? stops.find(s => s > h + 1) : [...stops].reverse().find(s => s < h - 1);
  if (next) setDrawer(next);
});
