'use strict';
const $ = id => document.getElementById(id),
  canvas = $('scene'),
  ctx = canvas.getContext('2d'),
  TAU = Math.PI * 2;
let W = 1,
  H = 1,
  scale = 30,
  dirty = true,
  t = 0,
  running = false,
  last = null,
  def,
  params,
  simulation,
  plotSamples = [],
  velocityScale = 0.25,
  forceScale = 0.1,
  following = false;
const experimentAudio = MechanicsAudio.create({ button: $('toggleSound'), status: $('soundStatus') });
const camera = { yaw: -0.65, pitch: 0.48, zoom: 1, target: [0, 3, 0] };
function stateAt(time) {
  return simulation.inFrame ? simulation.inFrame(time, $('referenceFrame').value || 'ground') : simulation.sample(time);
}
function collectPlotSamples() {
  plotSamples = Array.from({ length: 481 }, (_, i) => ({
    time: (i / 480) * simulation.duration,
    ...stateAt((i / 480) * simulation.duration)
  }));
}
// 迷你能量條：狀態同時有動能 K 與位能 U 的實驗才顯示。位能零點本可任選，這裡一律以本次運動的最低點為零
// （同課本習慣），否則重力位能的大常數會讓動能與熱幾乎看不見；守恆時總長度固定。
// 比例尺取整段運動的最大總能量，播放中不跳動。
let energyInfo = null;
function setupEnergy() {
  const ok = s => Number.isFinite(s.K) && Number.isFinite(s.U);
  energyInfo = null;
  if (plotSamples.length && plotSamples.every(ok)) {
    // 例外一：U 整段幾乎不變（多粒子系綜的平均位能）時不平移，否則位能會被扣成 0。
    // 例外二：讀數列本身有「總機械能」時，文字改用該讀數（真實零點，例如萬有引力的負能量），
    // 長條仍以最低位能為起點，避免能量條與讀數互相矛盾。
    const Us = plotSamples.map(s => s.U),
      minU = Math.min(...Us),
      flat = Math.max(...Us) - minU <= 1e-3 * Math.abs(minU),
      shift = flat ? 0 : minU,
      totalMetric = def.metrics.find(m => ['energy', 'E'].includes(m.key) || m.label.includes('機械能')),
      heat = plotSamples.every(s => Number.isFinite(s.heat)),
      max = Math.max(...plotSamples.map(s => s.K + s.U - shift + (heat ? s.heat : 0)));
    if (max > 0) energyInfo = { shift, heat, max, totalMetric };
  }
  $('energyOption').hidden = !energyInfo;
  updateEnergy(stateAt(t));
}
function updateEnergy(s) {
  const show = !!energyInfo && $('energyToggle').checked;
  if (!$('energy').hidden !== show) {
    $('energy').hidden = !show;
    resize();
  }
  if (!show) return;
  const { shift, heat, max, totalMetric } = energyInfo,
    u = s.U - shift,
    h = heat ? s.heat : 0,
    pct = v => Math.max(0, Math.min(100, (v / max) * 100)) + '%',
    total = totalMetric && Number.isFinite(s[totalMetric.key]) ? s[totalMetric.key] : null,
    shifted = Math.abs(shift) > 1e-3 * max,
    uName = shifted && total === null ? 'U（最低點為零）' : 'U';
  $('energyK').style.width = pct(s.K);
  $('energyU').style.width = pct(u);
  $('energyH').style.width = pct(h);
  const shownU = total === null ? u : total - s.K - h,
    parts = ['K ' + format(s.K), uName + ' ' + format(shownU)];
  if (heat) parts.push('熱 ' + format(h));
  parts.push('總 ' + format(total === null ? s.K + u + h : total) + ' ' + (totalMetric?.unit || 'J'));
  if (total !== null && shifted) parts.push('（長條以最低位能為起點）');
  $('energyText').textContent = parts.join('　');
  $('energyTrack').setAttribute('aria-label', '能量條：' + parts.join('，'));
}
// 推導分頁：只對 Derivations 有的實驗出現；收合時不計算。步驟逐步揭露，改參數時數字即時更新、
// 已揭露的步數保留；全部揭露後才列出「推導 vs 模擬」。
let derivationShown = 1;
function derivationAvailable() {
  return typeof Derivations !== 'undefined' && !!def && !!Derivations[def.id];
}
function renderDerivation() {
  const panel = $('derivationPanel');
  if (!panel) return;
  panel.hidden = !derivationAvailable();
  if (panel.hidden || !panel.open) return;
  const { steps, checks } = Derivations[def.id](params, simulation),
    shown = Math.min(derivationShown, steps.length);
  $('derivationSteps').replaceChildren(
    ...steps.slice(0, shown).map(step => {
      const item = document.createElement('li'),
        title = document.createElement('strong'),
        text = document.createElement('p'),
        math = document.createElement('code');
      title.textContent = step.title;
      text.textContent = step.text;
      math.textContent = step.math;
      item.append(title, text, math);
      return item;
    })
  );
  $('derivationProgress').textContent = '第 ' + shown + ' / ' + steps.length + ' 步';
  $('derivationNext').disabled = shown >= steps.length;
  $('derivationAll').disabled = shown >= steps.length;
  const done = shown >= steps.length;
  $('derivationChecks').hidden = !done;
  $('derivationChecks').replaceChildren(
    ...(done ? checks : []).map(check => {
      const row = document.createElement('p'),
        diff = derivationDiff(check),
        relative = (check.simulated - check.derived) / Math.abs(check.derived || 1),
        verdict = check.approx
          ? '近似，模擬比推導' + (relative >= 0 ? '大 ' : '小 ') + Math.abs(relative * 100).toFixed(1) + '%'
          : diff <= check.tolerance
            ? '✓ 一致'
            : '✗ 差 ' + (diff * 100).toFixed(2) + '%';
      row.className = 'derivation-check' + (check.approx ? ' approx' : '');
      row.textContent =
        check.label +
        '：推導 ' +
        formatDerivationNumber(check.derived, 4) +
        ' ' +
        check.unit +
        '　模擬 ' +
        formatDerivationNumber(check.simulated, 4) +
        ' ' +
        check.unit +
        '　' +
        verdict;
      return row;
    })
  );
}
function plotMetrics() {
  return [...new Map([...def.metrics, ...(def.plotMetrics || [])].map(m => [m.key, m])).values()];
}
function point(s) {
  if (simulation?.displayPoint) return simulation.displayPoint(s, params);
  const a = simulation?.displayScale || 1;
  return [s.x * a, s.y * a, s.z * a];
}
// 取景範圍：上緣在視角按鈕列下方、下緣在讀數與播放列上方。依實際元素位置量測（resize 時更新），
// 矮視窗或讀數只有一列時，3D 場景可以用到兩者之間的全部空間；量不到時用固定估計值。
let sceneInsets = null;
function measureSceneInsets(r) {
  sceneInsets = null;
  if (typeof document === 'undefined' || !document.querySelector) return;
  const cameraBar = document.querySelector('.camera-buttons'),
    bottomBar = document.querySelector('.viewport .bottom');
  if (!cameraBar || !bottomBar || !cameraBar.getBoundingClientRect) return;
  const c = cameraBar.getBoundingClientRect(),
    b = bottomBar.getBoundingClientRect();
  if (c.height && b.height) sceneInsets = { top: c.bottom - r.top + 10, bottom: b.top - r.top - 10 };
}
function sceneBounds() {
  const left = Math.min(30, W * 0.05),
    right = W - left;
  const fallbackTop = H > 480 ? 125 : 90;
  if (sceneInsets) {
    // 手機版的縮放按鈕另成一欄、不在視角按鈕列內，上緣仍用固定值；下緣不超出畫布。
    const top = W < 700 ? Math.max(fallbackTop, sceneInsets.top) : sceneInsets.top,
      bottom = Math.min(H - 10, sceneInsets.bottom);
    if (bottom - top >= 120) return { left, right, top, bottom };
  }
  return { left, right, top: fallbackTop, bottom: Math.max(fallbackTop + 55, H - 180) };
}
function formatParameter(value, step) {
  const [coefficient, exponent = '0'] = String(step).toLowerCase().split('e'),
    digits = Math.max(0, (coefficient.split('.')[1]?.length || 0) - Number(exponent));
  return Number(value).toFixed(Math.min(8, digits));
}
// 讀數格式：浮點殘差（|v| < 1e-9）顯示 0.00；小量保留三位有效數字而不是被捨成 0.00；
// 一萬到一千萬之間用整數，不用科學記號。
function format(v) {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (v !== 0 && simulation?.scientificNumbers && a < 0.01) return v.toExponential(2);
  if (a < 1e-9) return '0.00';
  if (a < 0.005) return v.toPrecision(3);
  if (a >= 1e7) return v.toExponential(2);
  if (a >= 10000) return v.toFixed(0);
  return v.toFixed(2);
}
// 計數類讀數（顆、次、個…）顯示整數。
const countUnits = new Set(['顆', '次', '個', '條', '粒', '階', '層', '圈']);
function formatMetric(v, unit) {
  return countUnits.has(unit) && Number.isFinite(v) ? String(Math.round(v)) : format(v);
}
// 網址 #experiment=id&參數=值：可分享目前參數；只記錄與預設不同的參數。
function shareURL() {
  const query = new URLSearchParams({ experiment: def.id }),
    base = Mechanics.defaults(def);
  for (const p of def.params) if (params[p.id] !== base[p.id]) query.set(p.id, params[p.id]);
  return '#' + query.toString();
}
function syncURL() {
  history.replaceState(null, '', shareURL());
  applyParamLevel();
}
// 參數分層（入門／探究／進階）：只對 ParamLevels 列出的實驗出現；隱藏的拉桿保留目前值，
// 切換不動時間與播放狀態。選擇的層次存在瀏覽器（僅為方便，讀寫失敗也照常運作）。
let paramLevel = 2;
try {
  paramLevel = Math.min(3, Math.max(1, +localStorage.getItem('physicsLab.paramLevel') || 2));
} catch {}
function paramLevelAvailable() {
  return typeof ParamLevels !== 'undefined' && !!def && !!ParamLevels[def.id];
}
// 某層次下「隱藏參數應有的值」：預設值，再套上該層可見拉桿的連動設定（如教學預設模式）。
function paramBaseline(level) {
  const baseline = Mechanics.defaults(def);
  for (const p of def.params)
    if (p.setOnInput && paramLevelOf(def.id, p.id) <= level)
      Object.assign(
        baseline,
        typeof p.setOnInput === 'function' ? p.setOnInput(params[p.id], { ...params }) : p.setOnInput
      );
  return baseline;
}
function hiddenChangedAt(level) {
  const baseline = paramBaseline(level);
  return def.params.filter(p => paramLevelOf(def.id, p.id) > level && params[p.id] !== baseline[p.id]);
}
function setupParamLevel() {
  // 分享網址或先前調整過的隱藏參數與該層應有值不同時，自動升到能看到它的層次（不記住）。
  if (paramLevelAvailable()) while (paramLevel < 3 && hiddenChangedAt(paramLevel).length) paramLevel++;
  applyParamLevel();
}
function applyParamLevel() {
  if (!def || !$('levelSwitch')) return;
  const available = paramLevelAvailable(),
    hiddenChanged = available ? hiddenChangedAt(paramLevel).length : 0;
  for (const p of def.params)
    if ($('control-' + p.id)) $('control-' + p.id).hidden = available && paramLevelOf(def.id, p.id) > paramLevel;
  $('levelSwitch').hidden = !available;
  for (const level of [1, 2, 3]) {
    const button = $('level-' + level),
      count = available ? def.params.filter(p => paramLevelOf(def.id, p.id) <= level).length : 0;
    button.setAttribute('aria-pressed', String(level === paramLevel));
    button.title = PARAM_LEVEL_NAMES[level - 1] + '：顯示 ' + count + ' 個參數';
  }
  $('levelNote').hidden = !available || !hiddenChanged;
  $('levelNote').textContent = hiddenChanged
    ? '有 ' + hiddenChanged + ' 個隱藏參數不是預設值；按「參數還原」或切到「進階」查看。'
    : '';
}
function selectParamLevel(level) {
  paramLevel = level;
  try {
    localStorage.setItem('physicsLab.paramLevel', String(level));
  } catch {}
  applyParamLevel();
}
function routeFromURL() {
  const hash = Object.fromEntries(new URLSearchParams((location.hash || '').slice(1)));
  return { id: hash.experiment || new URLSearchParams(location.search).get('experiment'), overrides: hash };
}
// 開關與模式參數：模型以 0～N 整數拉桿定義，標籤寫成「名稱：0甲／1乙／…」或單純「顯示…」（0／1）。
// 介面改成下拉選單或勾選框，比拖拉桿對照數字代碼直覺；元素仍以 value 讀寫數字，網址參數與程式不受影響。
const toggleWords = [
  ['隱藏', '顯示'],
  ['關', '開'],
  ['否', '是'],
  ['無', '有']
];
function paramChoice(p) {
  if (p.min !== 0 || p.step !== 1 || !(p.max >= 1) || p.max > 12 || p.unit) return null;
  const label = p.label,
    codes = [];
  let from = 0;
  for (let k = 0; k <= p.max; k++) {
    const re = new RegExp('(^|[：:（(／/；;\\s])' + k + '(?!\\d)', 'g');
    re.lastIndex = from;
    const m = re.exec(label);
    if (!m) break;
    codes.push({ at: m.index + m[1].length, end: m.index + m[0].length });
    from = m.index + m[0].length;
  }
  if (codes.length !== p.max + 1) return p.max === 1 ? { kind: 'toggle', name: label } : null;
  // 選項去掉分隔符；整段包在括號內（「名稱（0甲／1乙）」）時，最後一項多出的右括號也去掉。
  const count = (text, re) => (text.match(re) || []).length,
    clean = text => {
      text = text.replace(/^[\s：:]+|[\s／/；;]+$/g, '');
      while (/[）)]$/.test(text) && count(text, /[）)]/g) > count(text, /[（(]/g)) text = text.slice(0, -1).trim();
      return text;
    },
    options = codes.map((c, k) => clean(label.slice(c.end, k < p.max ? codes[k + 1].at : label.length))),
    name = label.slice(0, codes[0].at).replace(/[\s：:（(]+$/, '') || '模式';
  if (options.some(o => !o)) return null;
  if (p.max === 1 && toggleWords.some(([a, b]) => options[0] === a && options[1] === b))
    return { kind: 'toggle', name };
  return { kind: 'select', name, options };
}
function showParam(p) {
  if (paramChoice(p)) {
    $(p.id + 'Out').textContent = '';
    return;
  }
  const text = formatParameter(params[p.id], p.step) + ' ' + p.unit;
  $(p.id + 'Out').textContent = text;
  $('param-' + p.id).setAttribute('aria-valuetext', text.trim());
}
function selectExperiment(id, updateURL = true, overrides = {}) {
  if (typeof ExperimentLoader !== 'undefined' && id && ExperimentLoader.has(id) && !ExperimentLoader.isReady(id)) {
    $('experiment').disabled = true;
    ExperimentLoader.load(id).then(
      () => {
        $('experiment').disabled = false;
        selectExperiment(id, updateURL, overrides);
      },
      error => {
        $('experiment').disabled = false;
        console.error(error);
        $('experiment').value = def ? def.id : '';
      }
    );
    return;
  }
  def = Mechanics.defs.find(d => d.id === id) || Mechanics.defs[0];
  params = Mechanics.defaults(def);
  for (const p of def.params) {
    const value = overrides[p.id] === '' ? NaN : +overrides[p.id];
    if (Number.isFinite(value)) params[p.id] = Math.min(p.max, Math.max(p.min, value));
  }
  if (def.initialView) Object.assign(camera, def.initialView);
  if (typeof annotationSelect === 'function') annotationSelect();
  if (typeof measureReset === 'function') measureReset();
  derivationShown = 1;
  document.title = def.title + ' · 3D 互動實驗室';
  $('title').textContent = def.title + ' / 3D';
  $('title').setAttribute('title', def.title);
  $('category').textContent = def.group + ' / SETTINGS';
  if (typeof Textbook !== 'undefined') Textbook.render($('textbook'), def.id, document);
  $('overline').textContent =
    'PHYSICS LAB / ' +
    String(
      (typeof MechanicsCatalog !== 'undefined'
        ? MechanicsCatalog.findIndex(d => d.id === def.id)
        : Mechanics.defs.indexOf(def)) + 4
    ).padStart(2, '0');
  $('sceneTitle').firstChild.textContent = def.title;
  $('experiment').value = def.id;
  if (typeof markCurrentExperiment === 'function') markCurrentExperiment(def.id);
  $('controls').replaceChildren();
  $('referencePanel').hidden = def.id !== 'relative-motion';
  $('referenceFrame').value = 'ground';
  if (typeof resetDisplayOptions === 'function') resetDisplayOptions();
  for (const p of def.params) {
    const label = document.createElement('label');
    label.className = 'control';
    label.id = 'control-' + p.id;
    const head = document.createElement('span');
    head.className = 'label';
    const choice = paramChoice(p);
    head.append(document.createTextNode(choice ? choice.name : p.label));
    const output = document.createElement('output');
    output.id = p.id + 'Out';
    head.append(output);
    let input;
    if (choice && choice.kind === 'select') {
      input = document.createElement('select');
      input.id = 'param-' + p.id;
      choice.options.forEach((text, k) => {
        const option = document.createElement('option');
        option.value = k;
        option.textContent = text;
        input.append(option);
      });
      input.value = params[p.id];
      input.setAttribute('aria-label', choice.name);
      label.classList.add('choice');
    } else if (choice) {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'param-' + p.id;
      // 勾選框的 value 對應 checked（0／1），與拉桿、下拉選單同樣以 value 讀寫。
      Object.defineProperty(input, 'value', {
        configurable: true,
        get() {
          return this.checked ? '1' : '0';
        },
        set(v) {
          this.checked = +v === 1;
        }
      });
      input.value = params[p.id];
      input.setAttribute('aria-label', choice.name);
      label.classList.add('toggle');
    } else {
      input = document.createElement('input');
      Object.assign(input, {
        type: 'range',
        id: 'param-' + p.id,
        min: p.min,
        max: p.max,
        step: p.step,
        value: params[p.id]
      });
      input.setAttribute('aria-label', p.label);
    }
    const onChange = () => {
      params[p.id] = +input.value;
      for (const [key, value] of Object.entries(
        typeof p.setOnInput === 'function' ? p.setOnInput(params[p.id], params) : p.setOnInput || {}
      )) {
        params[key] = value;
        $('param-' + key).value = value;
      }
      if (p.visual || (def.kind === 'safe-parabola' && ['envelope', 'circle', 'ellipse'].includes(p.id))) {
        showParam(p);
        dirty = true;
        if (p.refit) fitCamera();
      } else if (p.preservePlayback) {
        const previousTime = t,
          wasRunning = running;
        setup(false, !!p.preserveAudio);
        t = Math.min(previousTime, simulation.duration);
        running = wasRunning && t < simulation.duration;
        updateUI();
      } else setup(!!p.refit);
      syncURL();
    };
    input.addEventListener('input', onChange);
    if (choice) input.addEventListener('change', () => +input.value !== params[p.id] && onChange());
    if (choice && choice.kind === 'toggle') label.append(input, head);
    else if (choice) label.append(head, input);
    else {
      const limits = document.createElement('span');
      limits.className = 'limits';
      for (const v of [p.min, p.max]) {
        const span = document.createElement('span');
        span.textContent = v + ' ' + p.unit;
        limits.append(span);
      }
      label.append(head, input, limits);
    }
    $('controls').append(label);
  }
  setupParamLevel();
  if (typeof configureViolinImport === 'function') configureViolinImport();
  $('plotMode').value = def.defaultPlotMode || 'time';
  $('plotMetric').replaceChildren();
  for (const m of plotMetrics()) {
    const option = document.createElement('option');
    option.value = m.key;
    option.textContent = m.unit ? m.label + '（' + m.unit + '）' : m.label;
    $('plotMetric').append(option);
  }
  $('plotMetric').value = def.defaultPlotMetric || def.metrics[0].key;
  def.metrics.forEach((m, i) => {
    $('m' + i + 'label').textContent = m.label;
    $('m' + i + 'unit').textContent = m.unit;
  });
  $('note').textContent = def.note;
  $('formula').textContent = def.formula;
  $('helpNote').textContent = def.note;
  $('helpFormula').textContent = def.formula;
  $('helpTitle').textContent = def.title;
  $('questions').replaceChildren();
  for (const q of def.questions) {
    const li = document.createElement('li');
    li.textContent = q;
    $('questions').append(li);
  }
  if (updateURL) syncURL();
  setup(true);
  if (def.kind === 'bicycle') {
    following = true;
    camera.zoom = Math.max(2.5, camera.zoom);
    $('follow').setAttribute('aria-pressed', 'true');
  }
  if (def.kind === 'bike-turn') {
    following = true;
    camera.zoom = Math.max(4, camera.zoom);
    $('follow').setAttribute('aria-pressed', 'true');
  }
}
function setup(fit, preserveAudio = false) {
  const wasInView = !fit && allInView();
  simulation = def.build(params);
  experimentAudio.setExperiment(simulation, params, { preserveEnabled: preserveAudio });
  for (const p of def.params) showParam(p);
  collectPlotSamples();
  setupEnergy();
  const selectedMode = $('plotMode').value,
    modes = [['time', '時間圖']];
  if (simulation.positionPlot)
    modes.push([
      'position',
      simulation.positionPlot.menuLabel ||
        simulation.positionPlot.modeLabel ||
        simulation.positionPlot.title ||
        ((simulation.positionPlot.yUnit ?? 'J') === 'J' ? '位置—能量圖' : '對' + simulation.positionPlot.label + '作圖')
    ]);
  if (simulation.phasePlot) modes.push(['phase', '左右位移相圖']);
  if (simulation.histogramPlot) modes.push(['distribution', '樣本分布與理論']);
  if (simulation.barPlot) modes.push(['bars', '模式能量比較']);
  $('plotMode').replaceChildren();
  for (const [value, label] of modes) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    $('plotMode').append(option);
  }
  $('plotMode').value = modes.some(m => m[0] === selectedMode) ? selectedMode : 'time';
  $('plotModeChoice').hidden = modes.length === 1;
  updatePlotMode();
  if (fit || (wasInView && !allInView())) fitCamera();
  updateFrontView();
  renderDerivation();
  $('duration').textContent = format(simulation.duration) + ' s';
  $('extraInfo').textContent = '';
  if ('mus' in params) $('extraInfo').textContent = '有效靜摩擦係數 μₛ = ' + Math.max(params.mus, params.mu).toFixed(2);
  if (def.kind === 'massive-spring')
    $('extraInfo').textContent =
      'mₛ/3 近似週期 ' +
      format(simulation.sample(0).approxPeriod) +
      ' s；實際基頻 ' +
      format(simulation.sample(0).period) +
      ' s。';
  if (def.kind === 'bungee') {
    const reference = document.createElement('p');
    reference.className = 'note';
    reference.textContent =
      '純彈力平衡高度：' +
      format(simulation.elasticHeight) +
      ' m（ke = mg，不含阻尼）。有阻尼時，合力為零須滿足繩索總拉力 T = mg；這與最低點 v = 0 不同。';
    $('extraInfo').append(reference);
    for (const event of simulation.markers) {
      const row = document.createElement('p');
      row.className = 'note';
      row.textContent =
        simulation.markers.indexOf(event) +
        1 +
        '. ' +
        event.label +
        '：' +
        format(event.y) +
        ' m，' +
        format(event.t) +
        ' s';
      $('extraInfo').append(row);
    }
    if (!simulation.markers.some(e => e.key === 'lowest')) {
      const row = document.createElement('p');
      row.className = 'note';
      row.textContent = '本次觀察內未出現離地的最低轉折點。';
      $('extraInfo').append(row);
    }
  }
  const maxV = Math.max(
      1,
      ...plotSamples.map(s =>
        Math.hypot(s.vx, s.vy, s.vz, s.rdot || 0, s.radius && Number.isFinite(s.omega) ? s.radius * s.omega : 0)
      )
    ),
    // 有受力分解箭頭時，合力與各分力共用同一比例，箭頭長度才能直接比較、相加。
    maxF = Math.max(
      1,
      ...plotSamples.map(s => Math.hypot(s.fx, s.fy, s.fz)),
      ...(def.forceParts ? plotSamples.flatMap(s => def.forceParts(s, params).map(f => Math.hypot(...f.v))) : [])
    );
  velocityScale = Math.min(0.4, (scale * 0.12) / maxV);
  forceScale = Math.min(0.25, (scale * (def.forceParts ? 0.16 : 0.12)) / maxF);
  if (def.kind === 'lever') forceScale = 2 / (Math.max(params.m1, params.m2) * params.g);
  $('scaleNote').textContent =
    '速度箭頭：1 m/s → ' +
    velocityScale.toPrecision(2) +
    ' m；合力箭頭：1 N → ' +
    forceScale.toPrecision(2) +
    ' m。兩者採不同尺度。改參數後若裝置跑出畫面會自動重新取景；也可隨時按「完整取景」。';
  if (def.kind === 'orbit') $('scaleNote').textContent += ' 軌道模型合力按 1 kg 測試質點計。';
  if (simulation.scaleNote) $('scaleNote').textContent = simulation.scaleNote;
  if (def.kind === 'bicycle')
    $('scaleNote').textContent +=
      ' 輪下前後輪摩擦箭頭畫在觸地點，長度與大小成正比（本次最大摩擦力對應 1.5 m）；ΣF 箭頭仍採上列比例。';
  if (def.kind === 'double-slit')
    $('scaleNote').textContent =
      '狹縫孔徑放大 4000 倍，屏幕橫向／縱向另採示意尺度；屏距與光學計算使用參數中的真實數值。圖表為相對光強對位置，不是光飛行時間。';
  reset();
}
// 取景要包含的世界座標點：整段運動的物體位置加上裝置範圍。
function framePositions() {
  const positions = plotSamples.flatMap(s => {
    const pts = [point(s)];
    if (Number.isFinite(s.x2)) pts.push([s.x2, s.y2 ?? s.y, s.z2 ?? (def.kind === 'two-carts' ? 2.5 : 0)]);
    return pts;
  });
  positions.push([0, 0, 0]);
  // Include apparatus, not only moving objects.
  if (['pendulum', 'conical', 'ballistic'].includes(def.kind)) positions.push([0, (params.L || 4) + 2, 0]);
  if (def.kind === 'ballistic') positions.push([-3, 1, 0]);
  if (def.kind === 'bungee') positions.push([-8, 0, -2], [22, params.h + 10, 2], [0, params.h - params.L / 2, 0]);
  if (def.kind === 'spring') positions.push([Math.min(-5, ...plotSamples.map(s => s.x - 2)) - 0.5, 2, 0]);
  if (def.kind === 'massive-spring') positions.push([-4.6, 0, -1], [1.5, 2, 1]);
  if (def.kind === 'bicycle')
    for (const s of plotSamples) positions.push([s.x - 1.3, 0, -0.6], [s.x + 1.3, params.R + 1.7, 0.6]);
  if (def.kind === 'double-slit') positions.push([-6.5, 1, -4], [simulation.screenX, 8, 4]);
  if (def.kind === 'airplane-drop') {
    const u = Math.max(0.8, Math.min(2.8, params.h * 0.06));
    positions.push([-3 * u, 0, -3 * u], [params.v * simulation.duration + 3 * u, params.h + 3 * u, 3 * u]);
  }
  if (def.kind === 'shoot-monkey') positions.push([params.D, params.H + 2.5, 0], [-1, 0, -1]);
  if (['optimal-projectile', 'projectile-explosion'].includes(def.kind)) {
    const b = simulation.bounds;
    for (const x of [b.xmin, b.xmax])
      for (const y of [b.ymin, b.ymax]) for (const z of [b.zmin, b.zmax]) positions.push([x, y, z]);
  }
  if (def.kind === 'shm-projection') positions.push([-params.A - 1, 0, -0.5], [params.A + 1, 2 * params.A + 2.5, 0.5]);
  // frameBounds()：場景版面會隨可用區長寬比改變時（例如矮寬視窗改橫排），由模型依目前版面給取景範圍。
  const box = typeof simulation.frameBounds === 'function' ? simulation.frameBounds() : simulation.bounds;
  if (box?.min && box?.max)
    for (const x of [box.min[0], box.max[0]])
      for (const y of [box.min[1], box.max[1]]) for (const z of [box.min[2], box.max[2]]) positions.push([x, y, z]);
  if (def.kind === 'belt-wheels') positions.push([-7, 0, -1], [7, 7, 2.2]);
  if (def.kind === 'slip-or-tip') {
    const end = simulation.sample(simulation.duration),
      left = -Math.max(3, params.b * 2),
      right = Math.max(5, end.travel + params.b + 2),
      r = Math.hypot(params.b, params.h);
    for (const u of [left, right])
      for (const z of [-2, 2]) {
        const q = simulation.coord(u, 0);
        positions.push([q[0], q[1], z]);
      }
    for (const s of plotSamples) positions.push([s.x - r, s.y - r, -1], [s.x + r, s.y + r, 1]);
  }
  if (def.kind === 'incline-shadow') {
    const xs = plotSamples.flatMap(s => [s.x, s.shadowX]),
      zs = plotSamples.map(s => s.shadowZ),
      left = Math.min(0, ...xs) - 2,
      right = Math.max(0, ...xs) + 2,
      z0 = Math.min(-2, ...zs) - 1,
      z1 = Math.max(2, ...zs) + 1;
    for (const x of [left, right])
      for (const z of [z0, z1]) positions.push([x, x * Math.tan((params.slope * Math.PI) / 180), z]);
    for (const s of plotSamples) positions.push([s.shadowX, s.shadowY, s.shadowZ]);
  }
  if (def.kind === 'safe-parabola')
    for (const x of [-simulation.maxRange, simulation.maxRange])
      for (const y of [0, params.h + simulation.A + 1]) positions.push([x, y, 0]);
  if (def.kind === 'relative-motion')
    for (const s of plotSamples) positions.push([s.cartX - 1.5, s.cartY - 0.5, -1], [s.cartX + 1.5, s.cartY + 1, 1]);
  if (def.kind === 'elevator') for (const s of plotSamples) positions.push([-2, s.floor, 0], [2, s.floor + 7, 0]);
  if (def.kind === 'table-pulley') positions.push([-7.5, 5.4, -2.5], [3.6, 6, 2.5], [3.1, -0.45, 0]);
  if (def.kind === 'pulley') positions.push([-3, 12.5, 0], [3, 0, 0]);
  if (def.kind === 'massive-pulley') positions.push([-3, Math.max(9.5, 8 + params.R) + params.R + 1, 0], [3, 0, 0]);
  if (def.kind === 'skater') {
    const r = Math.max(params.r0, params.r1) + 0.4;
    positions.push([-r, 0, -r], [r, 2, r]);
  }
  if (def.kind === 'lever') positions.push([-params.L1, 3, 0], [params.L2, 3, 0]);
  if (def.kind === 'torque' || def.kind === 'rotor') positions.push([-params.R, 1, -params.R], [params.R, 1, params.R]);
  return positions;
}
// 改參數後：原本整個裝置都在畫面內、改完卻有部分跑出畫面，才自動重新取景；
// 使用者自行放大觀察細節（原本就有部分在畫面外）或跟隨物體時不動鏡頭。
function allInView() {
  if (!simulation || following) return false;
  updateCamera();
  const bounds = sceneBounds(),
    pad = 12;
  return framePositions().every(q => {
    const p = project(q);
    return (
      p &&
      p.x >= bounds.left - pad &&
      p.x <= bounds.right + pad &&
      p.y >= bounds.top - pad &&
      p.y <= bounds.bottom + pad
    );
  });
}
// 運動物體幾乎全在 x–y 平面（z 方向沒有位移）時，「正視」沿 x 軸看只剩一條線：停用並說明。
function updateFrontView() {
  const pts = plotSamples.map(point),
    range = i => Math.max(...pts.map(p => p[i])) - Math.min(...pts.map(p => p[i])),
    flat = !simulation.allowFrontView && range(2) < 0.05 * Math.max(range(0), range(1));
  $('front').disabled = flat;
  $('front').title = flat ? '此實驗裝置位於 x–y 平面，正視只會看到側邊；請用「側視」。' : '沿 x 軸看裝置';
}
let frameKey = null;
function fitCamera() {
  frameKey = typeof simulation?.frameBounds === 'function' ? JSON.stringify(simulation.frameBounds()) : null;
  const positions = framePositions();
  const mins = [0, 1, 2].map(i => Math.min(...positions.map(p => p[i]))),
    maxs = [0, 1, 2].map(i => Math.max(...positions.map(p => p[i])));
  camera.target = mins.map((v, i) => (v + maxs[i]) / 2);
  scale = Math.max(simulation.minimumSceneScale ?? 9, ...maxs.map((v, i) => v - mins[i])) * 1.05;
  // 預設取景倍率上限 1.25；版面可能過扁的實驗可用 maxFitZoom 放寬，讓內容填滿可用區。
  const maxZoom = simulation.maxFitZoom ?? 1.25;
  camera.zoom = maxZoom;
  // Fit projected geometry to the usable region above the transport controls.
  const margin = Math.max(0.65, Math.min(1.2, scale * 0.014)),
    bounds = sceneBounds(),
    fitPoints = positions.flatMap(p => [
      p,
      [p[0] - margin, p[1], p[2]],
      [p[0] + margin, p[1], p[2]],
      [p[0], p[1] - margin, p[2]],
      [p[0], p[1] + margin, p[2]]
    ]);
  const fits = () => {
    updateCamera();
    return fitPoints
      .map(project)
      .every(p => p && p.x >= bounds.left && p.x <= bounds.right && p.y >= bounds.top && p.y <= bounds.bottom);
  };
  let fitted = false;
  for (let i = 0; i < 35; i++) {
    if (fits()) {
      fitted = true;
      break;
    }
    camera.zoom *= 0.88;
  }
  // 粗調每步縮 12%，再用二分法在最後一步之間細調，讓裝置盡量填滿可用範圍。
  if (fitted && camera.zoom < maxZoom) {
    let low = camera.zoom,
      high = Math.min(maxZoom, camera.zoom / 0.88);
    for (let i = 0; i < 8; i++) {
      camera.zoom = (low + high) / 2;
      if (fits()) low = camera.zoom;
      else high = camera.zoom;
    }
    camera.zoom = low;
    updateCamera();
  }
  following = false;
  $('follow').setAttribute('aria-pressed', 'false');
  dirty = true;
}
function restoreDefaults() {
  params = Mechanics.defaults(def);
  for (const p of def.params) $('param-' + p.id).value = params[p.id];
  setup(false);
  syncURL();
}
function reset() {
  t = 0;
  running = false;
  last = null;
  updateUI();
}
function updateUI() {
  const s = stateAt(t),
    ended = t >= simulation.duration;
  // 播放時間與物理時間不同的實驗（例如渦電流、量子井）主讀數顯示物理時間。
  $('time').textContent = format(Number.isFinite(s.physicalTime) ? s.physicalTime : t);
  def.metrics.forEach((m, i) => ($('m' + i).textContent = formatMetric(s[m.key], m.unit)));
  updateEnergy(s);
  if (typeof measureUpdate === 'function' && (measureTool || stopwatch.on)) measureUpdate();
  $('timeline').value = simulation.duration ? (t / simulation.duration) * 1000 : 0;
  $('timeline').disabled = simulation.duration === 0;
  $('timeline').setAttribute('aria-valuetext', format(t) + ' 秒，共 ' + format(simulation.duration) + ' 秒');
  $('step').disabled = ended;
  $('play').disabled = simulation.duration === 0;
  $('play').textContent = running ? 'Ⅱ 暫停' : ended ? '↻ 再次播放' : t > 0 ? '▶ 繼續' : '▶ 播放';
  // 符號只是裝飾；螢幕閱讀器讀不含符號的名稱。
  $('play').setAttribute('aria-label', running ? '暫停' : ended ? '再次播放' : t > 0 ? '繼續' : '播放');
  $('status').textContent =
    def.kind === 'lever'
      ? Math.abs(s.net) < 1e-8
        ? '力矩平衡'
        : '需要外加約束力矩'
      : ended
        ? simulation.endLabel || '觀察結束'
        : running
          ? '● 實驗進行中'
          : t > 0
            ? '已暫停'
            : '準備實驗';
  $('events').textContent = (simulation.events || [])
    .filter(e => e.t <= t)
    .map(e => format(e.t) + ' s · ' + e.label)
    .join(' / ');
  experimentAudio.update(s, running && t < simulation.duration);
  scheduleSceneSummary(ended);
  dirty = true;
}
// 場景文字摘要：暫停、單步、拖時間軸、改參數或播完時，停 0.6 秒後以 aria-live 禮貌更新一次；
// 播放中不更新（狀態列已會報「實驗進行中」），避免螢幕閱讀器被數字洗版。
let sceneSummaryTimer = null;
function sceneSummaryText(s, ended) {
  const parts = def.metrics.map(m => m.label + ' ' + formatMetric(s[m.key], m.unit) + (m.unit ? ' ' + m.unit : ''));
  if (energyInfo && $('energyToggle').checked) parts.push($('energyText').textContent);
  return (
    def.title +
    '，' +
    (ended ? '觀察結束' : t > 0 ? '已暫停' : '準備實驗') +
    '：時間 ' +
    format(t) +
    ' 秒；' +
    parts.join('；') +
    '。'
  );
}
function writeSceneSummary() {
  const text = sceneSummaryText(stateAt(t), t >= simulation.duration);
  if ($('sceneSummary').textContent !== text) $('sceneSummary').textContent = text;
}
function scheduleSceneSummary(ended) {
  if (running && !ended) return;
  if (typeof setTimeout !== 'function' || typeof clearTimeout !== 'function') return writeSceneSummary();
  clearTimeout(sceneSummaryTimer);
  sceneSummaryTimer = setTimeout(writeSceneSummary, 600);
}
function advance(dt) {
  t = Math.min(simulation.duration, t + dt);
  if (t >= simulation.duration) running = false;
  updateUI();
}
function resize() {
  const r = canvas.getBoundingClientRect(),
    d = Math.min(devicePixelRatio || 1, 2);
  W = Math.max(1, r.width);
  H = Math.max(1, r.height);
  canvas.width = Math.round(W * d);
  canvas.height = Math.round(H * d);
  ctx.setTransform(d, 0, 0, d, 0, 0);
  measureSceneInsets(r);
  // 視窗尺寸改變使場景換版面（frameBounds 改變）時重新取景，否則新版面的內容可能落在畫面外。
  if (frameKey !== null && typeof simulation?.frameBounds === 'function') {
    const key = JSON.stringify(simulation.frameBounds());
    if (key !== frameKey) fitCamera();
  }
  dirty = true;
}
function drawPlot() {
  if ($('plotPanel').hidden) return;
  $('plotScope').textContent = '— 全程　● 目前';
  const c = $('plot'),
    r = c.getBoundingClientRect(),
    d = Math.min(devicePixelRatio || 1, 2),
    w = Math.max(1, r.width),
    h = Math.max(1, r.height);
  c.width = w * d;
  c.height = h * d;
  const g = c.getContext('2d');
  g.setTransform(d, 0, 0, d, 0, 0);
  g.clearRect(0, 0, w, h);
  if (simulation.barPlot && $('plotMode').value === 'bars') {
    drawBarPlot(g, w, h, simulation.barPlot.data(stateAt(t), params));
    return;
  }
  if (simulation.histogramPlot && $('plotMode').value === 'distribution') {
    drawHistogramPlot(g, w, h, simulation.histogramPlot.data(stateAt(t), params));
    return;
  }
  if (simulation.phasePlot && $('plotMode').value === 'phase') {
    drawPhasePlot(g, w, h, simulation.phasePlot, stateAt(t));
    return;
  }
  if (def.kind === 'pv-path' && $('plotMode').value === 'position') {
    drawPVPathPlot(g, w, h, simulation.positionPlot, stateAt(t));
    return;
  }
  if (simulation.positionPlot && $('plotMode').value === 'position') {
    drawEnergyPositionPlot(g, w, h, simulation.positionPlot, stateAt(t));
    return;
  }
  const m = plotMetrics().find(m => m.key === $('plotMetric').value) || def.metrics[0],
    values = plotSamples.map(s => s[m.key]),
    low = Math.min(0, ...values),
    high = Math.max(0, ...values),
    range = high - low || 1,
    pad = range * 0.1,
    min = low - pad,
    max = high + pad,
    left = 43,
    right = w - 8,
    top = 10,
    bottom = h - 18;
  const px = time => left + (right - left) * (simulation.duration ? time / simulation.duration : 0),
    py = v => bottom - ((v - min) / (max - min)) * (bottom - top);
  const axis = simulation.plotAxis;
  $('plotLabel').textContent = m.unit ? m.label + ' / ' + m.unit : m.label;
  c.setAttribute(
    'aria-label',
    m.label +
      '隨' +
      (axis ? axis.label : '時間') +
      '圖，橫軸' +
      (axis ? axis.unit : '秒') +
      '，縱軸' +
      m.unit +
      '，目前 ' +
      format(stateAt(t)[m.key])
  );
  g.strokeStyle = '#546c76';
  g.lineWidth = 0.6;
  g.beginPath();
  g.moveTo(left, top);
  g.lineTo(left, bottom);
  g.lineTo(right, bottom);
  g.stroke();
  g.font = '9px system-ui';
  g.fillStyle = '#c1d1d7';
  g.textAlign = 'right';
  g.fillText(format(high), left - 4, top + 5);
  g.fillText(format(low), left - 4, bottom - 2);
  g.textAlign = 'left';
  g.fillText(axis ? format(plotSamples[0][axis.key]) : '0', left, bottom + 13);
  g.textAlign = 'right';
  g.fillText(
    axis ? format(plotSamples.at(-1)[axis.key]) + ' ' + axis.unit : format(simulation.duration) + ' s',
    right,
    bottom + 13
  );
  g.strokeStyle = '#8ee0c0';
  g.lineWidth = 1.5;
  g.beginPath();
  plotSamples.forEach((s, i) => (i ? g.lineTo(px(s.time), py(s[m.key])) : g.moveTo(px(s.time), py(s[m.key]))));
  g.stroke();
  g.strokeStyle = '#ffb36b88';
  g.beginPath();
  g.moveTo(px(t), top);
  g.lineTo(px(t), bottom);
  g.stroke();
  g.fillStyle = '#ffb36b';
  g.beginPath();
  g.arc(px(t), py(stateAt(t)[m.key]), 3, 0, TAU);
  g.fill();
}
