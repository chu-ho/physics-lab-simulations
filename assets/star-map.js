'use strict';
// 物理星圖：以星座呈現四條主線。章節是有名稱的亮星，主題是周圍的小星群，實驗是星點。
// 三層由遠到近：全覽（主線與章節）→ 章節（主題與實驗星點）→ 實驗（側欄詳情）。
// 依賴 learning-map.js 的 learningBranches、prerequisites、learningFocus、learningActivities、experimentPrerequisites，
// atlas.js 的 atlasNode／atlasButton 與共用篩選，以及選用的 textbook-hanlin.js。

const starShortTitles = { 4.4: '原子模型與能階', 4.5: '量子力學與軌域' };
const starDirections = { 力學: [200, 6], 波動與光學: [-60, 6], 電與磁: [15, 10], 近代物理: [115, 8] };
const starSpacing = 10;
const starLabelRoom = 64;

function starLayout(chapters) {
  const clusters = [];
  for (const [trunk] of learningBranches) {
    const list = chapters.filter(chapter => chapter.branch === trunk);
    const [base, bend] = starDirections[trunk] || [0, 0];
    let distance = 90;
    list.forEach((chapter, index) => {
      const angle = ((base + bend * index) * Math.PI) / 180;
      const ux = Math.cos(angle),
        uy = Math.sin(angle);
      const topics = chapter.topics
        .filter(topic => topic.labs.length)
        .map(topic => {
          const radius = starSpacing * Math.sqrt(topic.labs.length) + 6;
          return { topic, radius, x: 0, y: 0, labs: [] };
        });
      const widest = topics.reduce((max, item) => Math.max(max, item.radius), 0);
      const ring = topics.length > 1 ? 24 + widest + (topics.length > 4 ? widest * 0.55 : 0) : 22 + widest;
      const radius = topics.length ? ring + widest + 8 : 30;
      const room = Math.max(radius, starLabelRoom);
      distance += (index ? 20 : 0) + room;
      clusters.push({ chapter, topics, ring, radius, room, x: ux * distance, y: uy * distance, index });
      distance += room;
    });
  }
  // 依序分離重疊的星座，並保持中心留白。
  for (let step = 0; step < 400; step++) {
    let moved = false;
    for (let i = 0; i < clusters.length; i++) {
      const a = clusters[i];
      const core = Math.hypot(a.x, a.y),
        keep = a.room + 50;
      if (core < keep) {
        const k = (keep - core) / (core || 1);
        a.x += a.x * k;
        a.y += a.y * k;
        moved = true;
      }
      for (let j = i + 1; j < clusters.length; j++) {
        const b = clusters[j];
        const dx = b.x - a.x,
          dy = b.y - a.y,
          gap = a.room + b.room + 14;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d < gap) {
          const push = (gap - d) / 2,
            nx = dx / d,
            ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  for (const cluster of clusters) {
    const outward = Math.atan2(cluster.y, cluster.x);
    cluster.topics.forEach((item, index) => {
      const count = cluster.topics.length;
      const angle = count === 1 ? outward : outward + (index - (count - 1) / 2) * ((2 * Math.PI) / count);
      item.x = cluster.x + Math.cos(angle) * cluster.ring;
      item.y = cluster.y + Math.sin(angle) * cluster.ring;
      item.angle = angle;
      item.labs = item.topic.labs.map((lab, n) => {
        const r = starSpacing * Math.sqrt(n + 0.5),
          theta = n * 2.39996323;
        return { lab, x: item.x + Math.cos(theta) * r, y: item.y + Math.sin(theta) * r };
      });
    });
  }
  // 星座範圍；文字以螢幕像素顯示，另由 frame() 以像素邊距保留空間
  const bounds = clusters.reduce(
    (box, c) => ({
      left: Math.min(box.left, c.x - c.radius),
      right: Math.max(box.right, c.x + c.radius),
      top: Math.min(box.top, c.y - c.radius),
      bottom: Math.max(box.bottom, c.y + c.radius)
    }),
    { left: -40, right: 40, top: -40, bottom: 40 }
  );
  return { clusters, bounds };
}

function createStarMap(root, chapters, filters, options = {}) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const book = typeof Textbook !== 'undefined' ? Textbook : null;
  const layout = starLayout(chapters);
  const byChapter = new Map(layout.clusters.map(cluster => [cluster.chapter.id, cluster]));
  const labIndex = new Map();
  const state = { focus: '', lab: '', view: null, target: null, animation: 0 };
  const node = atlasNode;
  const svgNode = (tag, attrs = {}, className) => {
    const element = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    if (className) element.setAttribute('class', className);
    return element;
  };
  const round = value => Math.round(value * 10) / 10;

  // 舞台：SVG、縮放按鈕、提示與側欄
  const stage = node('div', '', 'star-stage');
  const sky = node('div', '', 'star-sky');
  sky.id = 'star-sky';
  const svg = svgNode(
    'svg',
    {
      role: 'group',
      'aria-label': '物理星圖：拖曳平移、滾輪或雙指縮放，點選亮星進入章節',
      preserveAspectRatio: 'xMidYMid meet'
    },
    'star-svg'
  );
  svg.id = 'star-svg';
  const tooltip = node('div', '', 'star-tooltip');
  tooltip.id = 'star-tooltip';
  tooltip.setAttribute('role', 'status');
  tooltip.hidden = true;
  const controls = node('div', '', 'star-controls');
  const zoomIn = atlasButton('＋', 'star-control');
  zoomIn.id = 'star-zoom-in';
  zoomIn.setAttribute('aria-label', '放大星圖');
  const zoomOut = atlasButton('−', 'star-control');
  zoomOut.id = 'star-zoom-out';
  zoomOut.setAttribute('aria-label', '縮小星圖');
  const overview = atlasButton('全覽', 'star-control star-control-wide');
  overview.id = 'star-overview';
  controls.append(zoomIn, zoomOut, overview);
  const crumbs = node('nav', '', 'star-crumbs');
  crumbs.id = 'star-crumbs';
  crumbs.setAttribute('aria-label', '星圖位置');
  sky.append(svg, crumbs, controls, tooltip);
  const panel = node('aside', '', 'star-panel');
  panel.id = 'star-panel';
  panel.setAttribute('aria-live', 'polite');
  stage.append(sky, panel);

  // 背景：軌道環與固定亂數星點
  const { left, right, top, bottom } = layout.bounds;
  const backdrop = svgNode('g', { 'aria-hidden': 'true' }, 'star-backdrop');
  for (const r of [140, 300, 480, 680]) backdrop.append(svgNode('circle', { cx: 0, cy: 0, r }, 'star-orbit'));
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) {
    backdrop.append(
      svgNode(
        'circle',
        {
          cx: round(left - 120 + random() * (right - left + 240)),
          cy: round(top - 120 + random() * (bottom - top + 240)),
          r: round(0.5 + random() * 1.1)
        },
        'star-dust'
      )
    );
  }
  svg.append(backdrop);

  // 跨章節先備連線與主線脊線
  const links = svgNode('g', { 'aria-hidden': 'true' }, 'star-links');
  const linkElements = [];
  for (const [id, parents] of Object.entries(prerequisites))
    for (const parentId of parents) {
      const a = byChapter.get(parentId),
        b = byChapter.get(id);
      if (!a || !b) continue;
      const sameTrunk = a.chapter.branch === b.chapter.branch;
      const mx = (a.x + b.x) / 2,
        my = (a.y + b.y) / 2;
      const pull = sameTrunk ? 0.08 : 0.35;
      const path = svgNode(
        'path',
        {
          d: `M${round(a.x)} ${round(a.y)} Q${round(mx * (1 - pull))} ${round(my * (1 - pull))} ${round(b.x)} ${round(b.y)}`
        },
        'star-prereq' + (sameTrunk ? ' same' : '')
      );
      path.style.setProperty('--branch', b.chapter.color);
      links.append(path);
      linkElements.push({ path, from: parentId, to: id });
    }
  svg.append(links);
  const spines = svgNode('g', { 'aria-hidden': 'true' }, 'star-spines');
  const trunkLabels = svgNode('g', {}, 'star-trunk-labels');
  const trunkElements = [];
  for (const [trunk, color] of learningBranches) {
    const list = layout.clusters.filter(cluster => cluster.chapter.branch === trunk);
    const points = [[0, 0], ...list.map(cluster => [cluster.x, cluster.y])];
    const spine = svgNode(
      'polyline',
      { points: points.map(([x, y]) => round(x) + ',' + round(y)).join(' ') },
      'star-spine'
    );
    spine.style.setProperty('--branch', color);
    spine.setAttribute('data-trunk', trunk);
    spines.append(spine);
    trunkElements.push({ element: spine, trunk });
    const last = list[list.length - 1];
    const angle = Math.atan2(last.y, last.x);
    const label = svgNode(
      'text',
      {
        x: round(last.x + Math.cos(angle) * (last.radius + 18)),
        y: round(last.y + Math.sin(angle) * (last.radius + 18)),
        'text-anchor': Math.cos(angle) < -0.3 ? 'end' : Math.cos(angle) > 0.3 ? 'start' : 'middle'
      },
      'star-trunk-label'
    );
    label.style.setProperty('--branch', color);
    label.setAttribute('data-trunk', trunk);
    label.textContent = trunk;
    trunkLabels.append(label);
    trunkElements.push({ element: label, trunk });
  }
  svg.append(spines);

  // 星座：章節亮星、主題星群、實驗星點
  const groups = svgNode('g', {}, 'star-clusters');
  const chapterElements = new Map();
  for (const cluster of layout.clusters) {
    const { chapter } = cluster;
    const group = svgNode('g', {}, 'star-chapter');
    group.style.setProperty('--branch', chapter.color);
    group.setAttribute('data-chapter', chapter.id);
    const total = chapter.topics.reduce((sum, topic) => sum + topic.labs.length, 0);
    const field = svgNode(
      'circle',
      { cx: round(cluster.x), cy: round(cluster.y), r: round(cluster.radius) },
      'star-field'
    );
    group.append(field);
    const topicElements = [];
    for (const item of cluster.topics) {
      group.append(
        svgNode(
          'line',
          { x1: round(cluster.x), y1: round(cluster.y), x2: round(item.x), y2: round(item.y) },
          'star-topic-line'
        )
      );
      const topicGroup = svgNode('g', {}, 'star-topic');
      const halo = svgNode(
        'circle',
        { cx: round(item.x), cy: round(item.y), r: round(item.radius) },
        'star-topic-halo'
      );
      topicGroup.append(halo);
      for (const entry of item.labs) {
        const dot = svgNode(
          'circle',
          {
            cx: round(entry.x),
            cy: round(entry.y),
            r: 3.1,
            tabindex: -1,
            role: 'button',
            'aria-label': entry.lab.title + '（' + item.topic.name + '）'
          },
          'star-lab'
        );
        dot.id = 'star-lab-' + entry.lab.id;
        entry.dot = dot;
        entry.chapter = chapter;
        entry.topic = item.topic;
        labIndex.set(entry.lab.id, entry);
        dot.addEventListener('click', event => {
          if (event && event.stopPropagation) event.stopPropagation();
          selectLab(entry.lab.id);
        });
        dot.addEventListener('keydown', event => {
          if (event && (event.key === 'Enter' || event.key === ' ')) {
            if (event.preventDefault) event.preventDefault();
            selectLab(entry.lab.id);
          }
        });
        dot.addEventListener('pointerenter', event => showTooltip(entry, event));
        dot.addEventListener('pointerleave', hideTooltip);
        dot.addEventListener('focus', () => showTooltip(entry));
        dot.addEventListener('blur', hideTooltip);
        topicGroup.append(dot);
      }
      const outX = Math.cos(item.angle),
        outY = Math.sin(item.angle);
      const label = svgNode(
        'text',
        {
          x: round(item.x + outX * (item.radius + 5)),
          y: round(item.y + outY * (item.radius + 5)),
          'text-anchor': outX < -0.35 ? 'end' : outX > 0.35 ? 'start' : 'middle',
          'dominant-baseline': outY < -0.35 ? 'auto' : outY > 0.35 ? 'hanging' : 'middle'
        },
        'star-topic-label'
      );
      label.textContent = item.topic.name;
      topicGroup.append(label);
      group.append(topicGroup);
      topicElements.push(topicGroup);
    }
    const radius = 7 + Math.sqrt(total) * 1.15;
    const star = svgNode(
      'g',
      { tabindex: 0, role: 'button', 'aria-label': chapter.id + ' ' + chapter.title + '，' + total + ' 個實驗' },
      'star-node'
    );
    star.id = 'star-chapter-' + chapter.id;
    star.append(
      svgNode('circle', { cx: round(cluster.x), cy: round(cluster.y), r: round(radius * 2.4) }, 'star-glow'),
      svgNode('circle', { cx: round(cluster.x), cy: round(cluster.y), r: round(radius) }, 'star-core')
    );
    const number = svgNode(
      'text',
      { x: round(cluster.x), y: round(cluster.y), 'text-anchor': 'middle', 'dominant-baseline': 'central' },
      'star-number'
    );
    number.textContent = chapter.id;
    const name = svgNode(
      'text',
      { x: round(cluster.x), y: round(cluster.y), dy: '2.05em', 'text-anchor': 'middle' },
      'star-name'
    );
    name.textContent = starShortTitles[chapter.id] || chapter.title;
    const hint = svgNode('title');
    hint.textContent = chapter.id + ' ' + chapter.title + '（' + total + ' 個實驗）';
    star.append(hint, number, name);
    star.addEventListener('click', event => {
      if (event && event.stopPropagation) event.stopPropagation();
      focusChapter(chapter.id);
    });
    star.addEventListener('keydown', event => {
      if (event && (event.key === 'Enter' || event.key === ' ')) {
        if (event.preventDefault) event.preventDefault();
        focusChapter(chapter.id);
      }
    });
    group.append(star);
    groups.append(group);
    chapterElements.set(chapter.id, { group, star, cluster, total, topicElements, name, label: name.textContent });
  }
  svg.append(groups, trunkLabels);
  const core = svgNode('g', { 'aria-hidden': 'true' }, 'star-center');
  core.append(svgNode('circle', { cx: 0, cy: 0, r: 22 }, 'star-center-ring'));
  const coreText = svgNode(
    'text',
    { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central' },
    'star-center-text'
  );
  coreText.textContent = '物理';
  core.append(coreText);
  svg.append(core);

  // 視角：viewBox 與容器同比例，字體與線寬換算成固定螢幕像素
  function size() {
    const rect = sky.getBoundingClientRect ? sky.getBoundingClientRect() : null;
    return {
      width: rect && rect.width ? rect.width : 960,
      height: rect && rect.height ? rect.height : 600,
      left: rect && rect.left ? rect.left : 0,
      top: rect && rect.top ? rect.top : 0
    };
  }
  // 以像素邊距取景：寬 w 需滿足 w = 內容寬 + 2·邊距·(w / 畫面寬)
  function frame(box, padX = 96, padY = 46) {
    const { width, height } = size();
    const px = Math.min(padX, width * 0.3),
      py = Math.min(padY, height * 0.3);
    const needW = (box.right - box.left) / (1 - (2 * px) / width);
    const needH = (box.bottom - box.top) / (1 - (2 * py) / height);
    let w = needW,
      h = needH;
    if (w / h > width / height) h = (w * height) / width;
    else w = (h * width) / height;
    return { x: (box.left + box.right) / 2 - w / 2, y: (box.top + box.bottom) / 2 - h / 2, w, h };
  }
  const fullView = () => frame(trunkBounds(filters.state.trunk) || layout.bounds);
  function trunkBounds(trunk) {
    if (!trunk) return null;
    const list = layout.clusters.filter(cluster => cluster.chapter.branch === trunk);
    return list.reduce(
      (box, c) => ({
        left: Math.min(box.left, c.x - c.radius),
        right: Math.max(box.right, c.x + c.radius),
        top: Math.min(box.top, c.y - c.radius),
        bottom: Math.max(box.bottom, c.y + c.radius)
      }),
      { left: 0, right: 0, top: 0, bottom: 0 }
    );
  }
  function apply(view) {
    state.view = view;
    svg.setAttribute('viewBox', [view.x, view.y, view.w, view.h].map(round).join(' '));
    const unit = view.w / size().width;
    svg.style.setProperty('--u', String(Math.round(unit * 1000) / 1000));
    root.setAttribute('data-zoom', unit < 0.55 ? 'near' : unit < 1.1 ? 'mid' : 'far');
    placeLabels(view);
  }
  // 章節名稱避讓：以螢幕座標放置，實驗多與目前聚焦的章節優先；先放星的下方，不行改上方，再不行暫時隱藏。
  function placeLabels(view) {
    const { width, height } = size();
    const toScreen = (x, y) => ({ x: ((x - view.x) / view.w) * width, y: ((y - view.y) / view.h) * height });
    const boxes = [];
    const hits = box => boxes.some(other => box.l < other.r && box.r > other.l && box.t < other.b && box.b > other.t);
    for (const { cluster } of chapterElements.values()) {
      const p = toScreen(cluster.x, cluster.y);
      boxes.push({ l: p.x - 14, r: p.x + 14, t: p.y - 14, b: p.y + 14 });
    }
    const center = toScreen(0, 0);
    boxes.push({ l: center.x - 21, r: center.x + 21, t: center.y - 21, b: center.y + 21 });
    for (const { element, trunk } of trunkElements) {
      if (element.tagName !== 'text') continue;
      const cluster = layout.clusters.filter(item => item.chapter.branch === trunk).pop();
      const angle = Math.atan2(cluster.y, cluster.x);
      const p = toScreen(
        cluster.x + Math.cos(angle) * (cluster.radius + 18),
        cluster.y + Math.sin(angle) * (cluster.radius + 18)
      );
      const w = trunk.length * 20 + 8,
        anchor = Math.cos(angle) < -0.3 ? 'end' : Math.cos(angle) > 0.3 ? 'start' : 'middle';
      const l = anchor === 'end' ? p.x - w : anchor === 'start' ? p.x : p.x - w / 2;
      boxes.push({ l, r: l + w, t: p.y - 16, b: p.y + 6 });
    }
    const order = [...chapterElements.entries()].sort(
      ([idA, a], [idB, b]) => (idB === state.focus) - (idA === state.focus) || b.total - a.total
    );
    for (const [, entry] of order) {
      const p = toScreen(entry.cluster.x, entry.cluster.y);
      const w = entry.label.length * 13.6 + 8;
      let placed = '';
      for (const [side, offset, dy] of [
        ['below', 27.7, '2.05em'],
        ['above', -20.9, '-1.55em']
      ]) {
        const box = { l: p.x - w / 2, r: p.x + w / 2, t: p.y + offset - 13, b: p.y + offset + 4 };
        if (box.l < 2 || box.r > width - 2 || box.t < 2 || box.b > height - 2 || hits(box)) continue;
        boxes.push(box);
        entry.name.setAttribute('dy', dy);
        placed = side;
        break;
      }
      entry.name.setAttribute('data-placed', placed || 'hidden');
    }
  }
  function animateTo(view) {
    state.target = view;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (
      !state.view ||
      reduce ||
      typeof requestAnimationFrame !== 'function' ||
      typeof performance === 'undefined' ||
      !(typeof window !== 'undefined' && window.matchMedia)
    ) {
      apply(view);
      return;
    }
    const from = state.view,
      started = performance.now(),
      token = ++state.animation;
    const tick = now => {
      if (token !== state.animation) return;
      const t = Math.min(1, (now - started) / 420),
        e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      apply({
        x: from.x + (view.x - from.x) * e,
        y: from.y + (view.y - from.y) * e,
        w: from.w + (view.w - from.w) * e,
        h: from.h + (view.h - from.h) * e
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function zoomBy(factor, cx, cy) {
    const view = state.view || fullView();
    const limit = fullView();
    const w = Math.min(limit.w * 1.6, Math.max(120, view.w * factor));
    const k = w / view.w;
    const px = cx ?? view.x + view.w / 2,
      py = cy ?? view.y + view.h / 2;
    state.animation++;
    apply({ x: px - (px - view.x) * k, y: py - (py - view.y) * k, w, h: view.h * k });
  }
  function toData(clientX, clientY) {
    const { width, height, left: l, top: t } = size();
    const view = state.view;
    return { x: view.x + ((clientX - l) / width) * view.w, y: view.y + ((clientY - t) / height) * view.h };
  }

  // 互動：拖曳、滾輪、雙指
  const pointers = new Map();
  let drag = null,
    moved = false;
  svg.addEventListener('pointerdown', event => {
    if (!event || event.clientX === undefined) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    drag = { x: event.clientX, y: event.clientY, view: state.view, spread: null };
    moved = false;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      drag.spread = Math.hypot(a.x - b.x, a.y - b.y);
      drag.mid = toData((a.x + b.x) / 2, (a.y + b.y) / 2);
    }
  });
  svg.addEventListener('pointermove', event => {
    if (!drag || !event || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && drag.spread) {
      const [a, b] = [...pointers.values()];
      const spread = Math.hypot(a.x - b.x, a.y - b.y);
      if (spread > 0) {
        zoomBy(drag.spread / spread, drag.mid.x, drag.mid.y);
        drag.spread = spread;
      }
      moved = true;
      return;
    }
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    if (!moved && svg.setPointerCapture)
      try {
        svg.setPointerCapture(event.pointerId);
      } catch (error) {
        /* 部分瀏覽器不支援 */
      }
    moved = true;
    root.setAttribute('data-dragging', 'true');
    const { width } = size();
    const k = drag.view.w / width;
    state.animation++;
    apply({ x: drag.view.x - dx * k, y: drag.view.y - dy * k, w: drag.view.w, h: drag.view.h });
  });
  const release = event => {
    if (event) pointers.delete(event.pointerId);
    if (!pointers.size) {
      drag = null;
      root.setAttribute('data-dragging', 'false');
    }
  };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);
  svg.addEventListener('click', event => {
    if (moved) {
      moved = false;
      return;
    }
    if (event && event.target === svg && state.focus) back();
  });
  svg.addEventListener(
    'wheel',
    event => {
      if (!event) return;
      if (event.preventDefault) event.preventDefault();
      const point = event.clientX === undefined ? {} : toData(event.clientX, event.clientY);
      zoomBy(Math.exp((event.deltaY || 0) * 0.0015), point.x, point.y);
    },
    { passive: false }
  );
  svg.addEventListener('keydown', event => {
    if (event && event.key === 'Escape') back();
  });
  zoomIn.addEventListener('click', () => zoomBy(0.7));
  zoomOut.addEventListener('click', () => zoomBy(1 / 0.7));
  overview.addEventListener('click', () => clearFocus());

  // 提示框
  function showTooltip(entry, event) {
    const primary = book ? book.lookup(entry.lab.id)[0] : null;
    tooltip.replaceChildren(
      node('strong', entry.lab.title),
      node(
        'span',
        entry.chapter.id + ' ' + entry.chapter.title + ' · ' + entry.topic.name + (primary ? ' · ' + primary.label : '')
      )
    );
    tooltip.hidden = false;
    const { width, height, left: l, top: t } = size();
    const view = state.view || fullView();
    const x = event && event.clientX !== undefined ? event.clientX - l : ((entry.x - view.x) / view.w) * width;
    const y = event && event.clientY !== undefined ? event.clientY - t : ((entry.y - view.y) / view.h) * height;
    tooltip.style.setProperty('left', Math.round(Math.min(width - 12, Math.max(12, x))) + 'px');
    tooltip.style.setProperty('top', Math.round(Math.max(12, y)) + 'px');
  }
  function hideTooltip() {
    tooltip.hidden = true;
  }

  // 側欄
  function crumb(label, action) {
    const item = action ? atlasButton(label, 'star-crumb') : node('span', label, 'star-crumb current');
    if (action) item.addEventListener('click', action);
    return item;
  }
  function renderCrumbs() {
    const parts = [crumb('全部星圖', state.focus || filters.state.trunk ? clearFocus : null)];
    const chapter = state.focus ? byChapter.get(state.focus).chapter : null;
    if (chapter)
      parts.push(
        crumb(chapter.branch),
        crumb(
          chapter.id + ' ' + (starShortTitles[chapter.id] || chapter.title),
          state.lab ? () => focusChapter(chapter.id) : null
        )
      );
    if (state.lab) parts.push(crumb(labIndex.get(state.lab).lab.title));
    crumbs.replaceChildren(
      ...parts.flatMap((part, index) => (index ? [node('span', '›', 'star-crumb-sep'), part] : [part]))
    );
  }
  function chips(labId, limit = 3) {
    const wrap = node('div', '', 'textbook-tags');
    if (book)
      for (const [index, entry] of book.lookup(labId).slice(0, limit).entries()) {
        const chip = node(
          'span',
          entry.extension ? entry.label : entry.label + ' ' + entry.name,
          'textbook-chip' + (index === 0 ? ' primary' : '') + (entry.extension ? ' extension' : '')
        );
        chip.title = entry.full;
        wrap.append(chip);
      }
    return wrap;
  }
  function levelBadge(chapterId) {
    const [level] = learningFocus[chapterId] || [''];
    const badge = node('span', level, 'route-level');
    badge.setAttribute('data-tone', routeTones[level] || 'intro');
    return badge;
  }
  function renderOverview() {
    const intro = node('div', '', 'star-panel-section');
    intro.append(
      node('p', 'PHYSICS ATLAS', 'star-eyebrow'),
      node('h3', '從一顆星開始'),
      node(
        'p',
        '每顆亮星是一個章節，周圍的小星群是主題，星點就是實驗。星座越大，代表那一章可以動手的實驗越多；虛線是跨主線的先備關係。',
        'star-copy'
      )
    );
    const legend = node('ul', '', 'star-legend');
    for (const [className, label] of [
      ['chapter', '章節'],
      ['topic', '主題星群'],
      ['lab', '實驗'],
      ['prereq', '先備關係']
    ]) {
      const item = node('li');
      item.append(node('span', '', 'star-key ' + className), node('span', label));
      legend.append(item);
    }
    intro.append(legend);
    const starts = node('div', '', 'star-panel-section');
    starts.append(node('h4', '建議起點'));
    for (const [trunk] of learningBranches) {
      const first = chapters.find(chapter => chapter.branch === trunk);
      const total = first.topics.reduce((sum, topic) => sum + topic.labs.length, 0);
      const go = atlasButton('', 'star-start');
      go.style.setProperty('--branch', first.color);
      go.append(
        node('span', trunk, 'star-start-trunk'),
        node('span', first.id + ' ' + first.title, 'star-start-title'),
        node('span', total + ' 個實驗', 'star-start-meta')
      );
      go.addEventListener('click', () => focusChapter(first.id));
      starts.append(go);
    }
    panel.replaceChildren(intro, starts);
  }
  function renderResults() {
    const section = node('div', '', 'star-panel-section star-lab-list');
    section.append(node('p', '篩選結果', 'star-eyebrow'), node('h3', filters.status.textContent));
    for (const cluster of layout.clusters) {
      if (filters.state.trunk && cluster.chapter.branch !== filters.state.trunk) continue;
      const labs = cluster.chapter.topics.flatMap(topic => topic.labs).filter(lab => filters.labMatches(lab.id));
      if (!labs.length) continue;
      const heading = atlasButton(
        cluster.chapter.id + ' ' + cluster.chapter.title + ' · ' + labs.length,
        'star-result-chapter'
      );
      heading.style.setProperty('--branch', cluster.chapter.color);
      heading.addEventListener('click', () => focusChapter(cluster.chapter.id));
      section.append(heading);
      for (const lab of labs) {
        const row = atlasButton('', 'star-lab-row');
        row.style.setProperty('--branch', cluster.chapter.color);
        row.append(node('span', lab.title, 'star-lab-title'));
        row.addEventListener('click', () => selectLab(lab.id));
        section.append(row);
      }
    }
    panel.replaceChildren(section);
  }
  function renderIdle() {
    if (filters.filtering()) renderResults();
    else renderOverview();
  }
  function renderChapter(chapterId) {
    const { chapter } = byChapter.get(chapterId);
    const [, guidance] = learningFocus[chapter.id] || ['', ''];
    const head = node('div', '', 'star-panel-section');
    head.style.setProperty('--branch', chapter.color);
    head.append(node('p', chapter.branch + ' · 第 ' + chapter.id + ' 章', 'star-eyebrow'), node('h3', chapter.title));
    const meta = node('div', '', 'star-meta');
    const total = chapter.topics.reduce((sum, topic) => sum + topic.labs.length, 0);
    meta.append(levelBadge(chapter.id), node('span', total + ' 個實驗', 'route-count'));
    const coverage = routeCoverage(chapter.topics.flatMap(topic => topic.labs));
    if (coverage) meta.append(node('span', coverage, 'route-books'));
    head.append(meta);
    if (guidance) head.append(node('p', guidance, 'star-copy'));
    const previous = (prerequisites[chapter.id] || []).map(id => byChapter.get(id)).filter(Boolean);
    const next = layout.clusters.filter(cluster => (prerequisites[cluster.chapter.id] || []).includes(chapter.id));
    for (const [label, list] of [
      ['先備', previous],
      ['接著', next]
    ]) {
      if (!list.length) continue;
      const row = node('div', '', 'route-link-row');
      row.append(node('span', label, 'route-link-label'));
      for (const cluster of list) {
        const jump = atlasButton(cluster.chapter.id + ' ' + cluster.chapter.title, 'route-jump');
        jump.style.setProperty('--branch', cluster.chapter.color);
        jump.addEventListener('click', () => focusChapter(cluster.chapter.id));
        row.append(jump);
      }
      head.append(row);
    }
    const list = node('div', '', 'star-panel-section star-lab-list');
    for (const topic of chapter.topics) {
      if (!topic.labs.length) continue;
      const visible = topic.labs.filter(lab => filters.labMatches(lab.id));
      if (!visible.length) continue;
      list.append(node('h4', topic.name + ' · ' + visible.length));
      for (const lab of visible) {
        const row = atlasButton('', 'star-lab-row');
        row.append(node('span', lab.title, 'star-lab-title'));
        const primary = book ? book.lookup(lab.id)[0] : null;
        if (primary)
          row.append(node('span', primary.label, 'textbook-chip' + (primary.extension ? ' extension' : ' primary')));
        row.addEventListener('click', () => selectLab(lab.id));
        row.addEventListener('pointerenter', () => labIndex.get(lab.id).dot.setAttribute('data-hover', 'true'));
        row.addEventListener('pointerleave', () => labIndex.get(lab.id).dot.setAttribute('data-hover', 'false'));
        list.append(row);
      }
    }
    const actions = node('div', '', 'star-actions');
    if (options.onRoute) {
      const routeButton = atlasButton('在路線圖中查看', 'star-secondary');
      routeButton.addEventListener('click', () => options.onRoute(chapter.id));
      actions.append(routeButton);
    }
    panel.replaceChildren(head, list, actions);
  }
  function renderLab(labId) {
    const entry = labIndex.get(labId);
    const { lab, chapter, topic } = entry;
    const head = node('div', '', 'star-panel-section');
    head.style.setProperty('--branch', chapter.color);
    head.append(
      node('p', chapter.id + ' ' + chapter.title + ' · ' + topic.name, 'star-eyebrow'),
      node('h3', lab.title)
    );
    if (lab.description) head.append(node('p', lab.description, 'star-copy'));
    head.append(chips(lab.id));
    const open = node('a', '開啟 3D 實驗', 'star-open');
    open.id = 'star-open';
    open.href = lab.href;
    head.append(open);
    const extra = node('div', '', 'star-panel-section');
    for (const [parent, reason] of experimentPrerequisites[lab.id] || []) {
      const target = labIndex.get(parent);
      if (!target) continue;
      const jump = atlasButton('先看 → ' + target.lab.title, 'route-jump');
      jump.title = reason;
      jump.style.setProperty('--branch', target.chapter.color);
      jump.addEventListener('click', () => selectLab(parent));
      extra.append(jump);
    }
    const activity = learningActivities[lab.id];
    if (activity) {
      const [prompt, procedure, result, transfer] = activity;
      const guide = node('details', '', 'route-activity star-activity');
      guide.append(node('summary', '探究活動'), node('p', prompt), node('p', procedure));
      const answer = node('details');
      answer.append(node('summary', '核對觀察'), node('p', result));
      guide.append(answer);
      if (transfer) guide.append(node('p', '換個情境 · ' + transfer));
      extra.append(guide);
    }
    const siblings = topic.labs.filter(other => other.id !== lab.id);
    if (siblings.length) {
      extra.append(node('h4', '同一星群'));
      for (const other of siblings.slice(0, 8)) {
        const row = atlasButton(other.title, 'star-lab-row compact');
        row.addEventListener('click', () => selectLab(other.id));
        extra.append(row);
      }
    }
    panel.replaceChildren(head, extra);
  }

  // 狀態
  function paint() {
    const active = filters.filtering();
    const trunk = filters.state.trunk;
    for (const [id, { group, star, cluster }] of chapterElements) {
      let hits = 0;
      for (const item of cluster.topics)
        for (const entry of item.labs) {
          const match = filters.labMatches(entry.lab.id);
          if (match) hits++;
          entry.dot.setAttribute('data-match', String(!active || match));
          entry.dot.setAttribute('data-selected', String(state.lab === entry.lab.id));
          entry.dot.setAttribute('tabindex', state.focus === id ? '0' : '-1');
        }
      const outside = Boolean(trunk && cluster.chapter.branch !== trunk);
      group.setAttribute(
        'data-dim',
        String(outside || (active && !hits) || Boolean(state.focus && state.focus !== id))
      );
      group.setAttribute('data-focused', String(state.focus === id));
      group.setAttribute('data-hits', String(active ? hits : 0));
      star.setAttribute('aria-pressed', String(state.focus === id));
    }
    for (const { path, from, to } of linkElements)
      path.setAttribute('data-active', String(Boolean(state.focus) && (state.focus === from || state.focus === to)));
    for (const { element, trunk: owner } of trunkElements)
      element.setAttribute('data-dim', String(Boolean(trunk) && owner !== trunk));
    root.setAttribute('data-level', state.lab ? 'lab' : state.focus ? 'chapter' : 'overview');
    renderCrumbs();
  }
  function writeHash() {
    if (typeof history === 'undefined' || !history.replaceState) return;
    const hash = state.focus ? '#map-' + state.focus + (state.lab ? '/' + state.lab : '') : '#learning-map';
    try {
      history.replaceState(history.state, '', hash);
    } catch (error) {
      /* file: 網址可能不允許 */
    }
  }
  function focusChapter(chapterId, quiet) {
    const cluster = byChapter.get(chapterId);
    if (!cluster) return;
    if (filters.state.trunk && filters.state.trunk !== cluster.chapter.branch) filters.set({ trunk: '' });
    state.focus = chapterId;
    state.lab = '';
    animateTo(
      frame(
        {
          left: cluster.x - cluster.radius,
          right: cluster.x + cluster.radius,
          top: cluster.y - cluster.radius,
          bottom: cluster.y + cluster.radius
        },
        70,
        56
      )
    );
    renderChapter(chapterId);
    paint();
    if (!quiet) writeHash();
  }
  function selectLab(labId, quiet) {
    const entry = labIndex.get(labId);
    if (!entry) return;
    if (state.focus !== entry.chapter.id) focusChapter(entry.chapter.id, true);
    state.lab = labId;
    renderLab(labId);
    paint();
    if (!quiet) writeHash();
  }
  function clearFocus() {
    state.focus = '';
    state.lab = '';
    hideTooltip();
    animateTo(fullView());
    renderIdle();
    paint();
    writeHash();
  }
  function back() {
    if (state.lab) focusChapter(state.focus);
    else if (state.focus) clearFocus();
  }
  function reveal(chapterId, labId) {
    if (labId && labIndex.has(labId)) selectLab(labId, true);
    else focusChapter(chapterId, true);
  }
  function refresh() {
    if (state.focus) {
      const cluster = byChapter.get(state.focus);
      apply(
        frame(
          {
            left: cluster.x - cluster.radius,
            right: cluster.x + cluster.radius,
            top: cluster.y - cluster.radius,
            bottom: cluster.y + cluster.radius
          },
          70,
          56
        )
      );
    } else apply(fullView());
  }

  filters.onChange(() => {
    if (state.focus) {
      const cluster = byChapter.get(state.focus);
      if (filters.state.trunk && cluster.chapter.branch !== filters.state.trunk) {
        clearFocus();
        return;
      }
      if (!state.lab) renderChapter(state.focus);
      paint();
    } else {
      animateTo(fullView());
      renderIdle();
      paint();
    }
  });
  if (typeof ResizeObserver !== 'undefined')
    new ResizeObserver(() => {
      if (!root.hidden) refresh();
    }).observe(sky);

  root.replaceChildren(stage);
  renderOverview();
  apply(fullView());
  paint();
  return {
    layout,
    state,
    labIndex,
    chapterElements,
    linkElements,
    svg,
    panel,
    crumbs,
    tooltip,
    focusChapter,
    selectLab,
    clearFocus,
    back,
    reveal,
    refresh,
    zoomBy,
    apply
  };
}
