'use strict';
// 課程路線圖：四條主線各為一欄，章節是路線上的站點，展開後列出實驗、課本章節與探究活動。
// 依賴 learning-map.js 的 learningBranches、buildLearningMap、prerequisites、learningFocus、aliases、learningActivities，
// 以及選用的 assets/textbook-hanlin.js。只使用 DOM 測試支架支援的基本 API。

function mountCourseRoute(catalogue) {
  const root = document.getElementById('route-view');
  const section = document.getElementById('learning-map');
  const switcher = document.getElementById('map-viewswitch');
  if (!root || !section) return null;

  const chapters = buildLearningMap(catalogue);
  const book = typeof Textbook !== 'undefined' ? Textbook : null;
  const tones = {'高中入門': 'intro', '高中深化': 'deep', '進階': 'adv'};
  const state = {query: '', textbook: '', trunk: '', open: new Set(), view: 'route'};
  const stops = [];
  const columns = [];

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function button(text, className) {
    const element = node('button', text, className);
    element.type = 'button';
    return element;
  }
  function coverage(labs) {
    if (!book) return '';
    const byBook = new Map();
    for (const lab of labs) {
      const primary = book.lookup(lab.id).find(item => !item.extension);
      if (!primary) continue;
      const number = primary.chapter.slice(primary.book.length);
      if (!byBook.has(primary.short)) byBook.set(primary.short, new Set());
      byBook.get(primary.short).add(number);
    }
    return [...byBook].slice(0, 3).map(([name, numbers]) => name + ' 第' + [...numbers].sort().join('·') + '章').join('　');
  }

  // 工具列：主線、課本章節、搜尋
  const toolbar = node('div', '', 'route-toolbar');
  const search = node('input', '', 'search route-search');
  search.id = 'route-search';
  search.type = 'search';
  search.placeholder = '搜尋實驗、概念或課本節名';
  search.setAttribute('aria-label', '搜尋課程路線');
  const select = node('select', '', 'route-select');
  select.id = 'route-textbook';
  select.setAttribute('aria-label', '依翰林版課本章節篩選路線');
  const all = node('option', '全部課本章節');
  all.value = '';
  select.append(all);
  if (book) for (const group of book.chapterOptions()) {
    const optgroup = node('optgroup');
    optgroup.label = group.label;
    for (const item of group.options) {
      const option = node('option', item.label);
      option.value = item.value;
      optgroup.append(option);
    }
    select.append(optgroup);
  }
  const trunkNav = node('nav', '', 'route-trunks');
  trunkNav.id = 'route-trunks';
  trunkNav.setAttribute('aria-label', '物理主線');
  const trunkButtons = [];
  const trunks = learningBranches.map(([name, color]) => ({name, color}));
  for (const trunk of [{name: '', color: ''}, ...trunks]) {
    const item = button(trunk.name || '全部主線', 'route-trunk');
    if (trunk.color) item.style.setProperty('--branch', trunk.color);
    item.addEventListener('click', () => { state.trunk = trunk.name; apply(); });
    trunkNav.append(item);
    trunkButtons.push({item, name: trunk.name});
  }
  const clear = button('清除篩選', 'route-clear');
  clear.id = 'route-clear';
  clear.addEventListener('click', () => {
    state.query = ''; state.textbook = ''; state.trunk = '';
    search.value = ''; select.value = '';
    apply();
  });
  const filters = node('div', '', 'route-filters');
  const bookLabel = node('label', '', 'route-select-label');
  bookLabel.append(node('span', '翰林課本'), select);
  filters.append(search, bookLabel, clear);
  toolbar.append(trunkNav, filters);
  const status = node('p', '', 'route-status');
  status.id = 'route-status';
  status.setAttribute('role', 'status');
  const legend = node('p', '', 'route-legend');
  for (const [label, tone] of Object.entries(tones)) {
    const badge = node('span', label, 'route-level');
    badge.setAttribute('data-tone', tone);
    legend.append(badge);
  }
  legend.append(node('span', '點選站點展開實驗；虛線標籤為課本外延伸。', 'route-legend-note'));

  // 路線欄
  const grid = node('div', '', 'route-columns');
  for (const trunk of trunks) {
    const list = chapters.filter(chapter => chapter.branch === trunk.name);
    const labCount = list.reduce((sum, chapter) => sum + chapter.topics.reduce((n, topic) => n + topic.labs.length, 0), 0);
    const column = node('section', '', 'route-col');
    column.style.setProperty('--branch', trunk.color);
    column.setAttribute('aria-label', trunk.name + '路線');
    const head = node('div', '', 'route-col-head');
    head.append(node('h3', trunk.name), node('span', list.length + ' 章 · ' + labCount + ' 個實驗', 'route-col-meta'));
    const line = node('ol', '', 'route-line');
    column.append(head, line);
    columns.push({column, name: trunk.name});
    grid.append(column);

    for (const chapter of list) {
      const labs = chapter.topics.flatMap(topic => topic.labs);
      const [level, guidance] = learningFocus[chapter.id] || ['', ''];
      const item = node('li', '', 'route-stop');
      item.id = 'route-stop-' + chapter.id;
      const toggle = button('', 'route-stop-head');
      toggle.id = 'route-head-' + chapter.id;
      toggle.setAttribute('aria-controls', 'route-body-' + chapter.id);
      const marker = node('span', chapter.id, 'route-marker');
      marker.setAttribute('aria-hidden', 'true');
      const text = node('span', '', 'route-stop-text');
      const title = node('span', chapter.title, 'route-stop-title');
      const meta = node('span', '', 'route-stop-meta');
      if (level) {
        const badge = node('span', level, 'route-level');
        badge.setAttribute('data-tone', tones[level] || 'intro');
        meta.append(badge);
      }
      const count = node('span', labs.length + ' 個實驗', 'route-count');
      meta.append(count);
      text.append(title, meta);
      const books = coverage(labs);
      if (books) text.append(node('span', books, 'route-books'));
      toggle.append(marker, text, node('span', '', 'route-chevron'));

      const body = node('div', '', 'route-stop-body');
      body.id = 'route-body-' + chapter.id;
      if (guidance) body.append(node('p', guidance, 'route-guidance'));
      const links = node('div', '', 'route-links');
      const previous = (prerequisites[chapter.id] || []).map(id => chapters.find(other => other.id === id)).filter(Boolean);
      const next = chapters.filter(other => (prerequisites[other.id] || []).includes(chapter.id));
      for (const [label, targets] of [['先備', previous], ['接著', next]]) {
        if (!targets.length) continue;
        const row = node('div', '', 'route-link-row');
        row.append(node('span', label, 'route-link-label'));
        for (const target of targets) {
          const jump = button(target.id + ' ' + target.title, 'route-jump');
          jump.style.setProperty('--branch', target.color);
          jump.addEventListener('click', () => openStop(target.id, true));
          row.append(jump);
        }
        links.append(row);
      }
      if (links.children.length) body.append(links);

      const rows = [];
      const topics = [];
      for (const topic of chapter.topics) {
        const block = node('section', '', 'route-topic');
        block.append(node('h4', topic.name));
        const ul = node('ul', '', 'route-labs');
        const topicRows = [];
        for (const lab of topic.labs) {
          const li = node('li', '', 'route-lab');
          li.id = 'route-lab-' + lab.id;
          const link = node('a', lab.title, 'route-lab-link');
          link.href = lab.href;
          li.append(link);
          if (book) {
            const tags = node('span', '', 'route-lab-tags');
            for (const [index, entry] of book.lookup(lab.id).slice(0, 2).entries()) {
              const chip = node('span', entry.label, 'textbook-chip' + (index === 0 ? ' primary' : '') + (entry.extension ? ' extension' : ''));
              chip.title = entry.full;
              tags.append(chip);
            }
            li.append(tags);
          }
          const activity = learningActivities[lab.id];
          if (activity) {
            const [prompt, procedure, result, transfer] = activity;
            const guide = node('details', '', 'route-activity');
            guide.append(node('summary', '探究活動'), node('p', prompt), node('p', procedure));
            const answer = node('details');
            answer.append(node('summary', '核對觀察'), node('p', result));
            guide.append(answer);
            if (transfer) guide.append(node('p', '換個情境 · ' + transfer));
            li.append(guide);
          }
          ul.append(li);
          const haystack = [lab.title, lab.id, lab.group, aliases[lab.id] || '', topic.name, chapter.id, chapter.title, chapter.branch, book ? book.searchText(lab.id) : ''].join(' ').toLowerCase();
          const entry = {lab, li, text: haystack};
          rows.push(entry);
          topicRows.push(entry);
        }
        if (!topic.labs.length) ul.append(node('li', '規劃中', 'route-empty'));
        block.append(ul);
        body.append(block);
        topics.push({block, rows: topicRows});
      }
      item.append(toggle, body);
      line.append(item);
      const stop = {chapter, item, toggle, body, rows, topics, count, total: labs.length, column};
      toggle.addEventListener('click', () => {
        if (state.open.has(chapter.id)) state.open.delete(chapter.id); else state.open.add(chapter.id);
        apply();
      });
      stops.push(stop);
    }
  }

  function filtering() { return Boolean(state.query || state.textbook); }
  function apply() {
    const active = filtering();
    let found = 0, reached = 0;
    for (const stop of stops) {
      let visible = 0;
      for (const row of stop.rows) {
        const show = (!state.textbook || (book && book.inChapter(row.lab.id, state.textbook))) && (!state.query || row.text.includes(state.query));
        row.li.hidden = !show;
        if (show) visible++;
      }
      for (const topic of stop.topics) topic.block.hidden = active && topic.rows.length > 0 && topic.rows.every(row => row.li.hidden);
      const open = active ? visible > 0 : state.open.has(stop.chapter.id);
      stop.item.setAttribute('data-open', String(open));
      stop.item.setAttribute('data-dim', String(active && visible === 0));
      stop.toggle.setAttribute('aria-expanded', String(open));
      stop.body.hidden = !open;
      stop.count.textContent = active ? visible + ' / ' + stop.total + ' 個實驗' : stop.total + ' 個實驗';
      if (active && visible) { found += visible; reached++; }
    }
    for (const {column, name} of columns) column.hidden = Boolean(state.trunk && state.trunk !== name);
    for (const {item, name} of trunkButtons) item.setAttribute('aria-pressed', String(state.trunk === name));
    clear.hidden = !(active || state.trunk);
    status.textContent = active
      ? (found ? '找到 ' + found + ' 個實驗，分布在 ' + reached + ' 個章節' : '找不到符合的實驗，試試其他關鍵字或課本章節。')
      : trunks.length + ' 條主線 · ' + chapters.length + ' 章 · ' + catalogue.length + ' 個實驗';
  }
  function openStop(id, scroll) {
    const stop = stops.find(item => item.chapter.id === id);
    if (!stop) return;
    if (state.trunk && state.trunk !== stop.chapter.branch) state.trunk = '';
    state.open.add(id);
    apply();
    if (scroll && stop.item.scrollIntoView) stop.item.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    if (stop.toggle.focus) stop.toggle.focus({preventScroll: true});
  }
  function followHash() {
    const match = /^#map-(\d\.\d)(?:\/([\w-]+))?$/.exec((typeof location !== 'undefined' && location.hash) || '');
    for (const stop of stops) for (const row of stop.rows) row.li.setAttribute('aria-current', 'false');
    if (!match) return;
    state.open.add(match[1]);
    apply();
    if (match[2]) {
      const row = stops.flatMap(stop => stop.rows).find(item => item.lab.id === match[2]);
      if (row) row.li.setAttribute('aria-current', 'true');
    }
  }

  search.addEventListener('input', () => { state.query = search.value.trim().toLowerCase(); apply(); });
  select.addEventListener('change', () => { state.textbook = select.value; apply(); });

  // 檢視切換：路線圖（預設）與星圖
  const viewButtons = [];
  function setView(view) {
    state.view = view;
    section.setAttribute('data-view', view);
    root.hidden = view !== 'route';
    for (const {item, value} of viewButtons) item.setAttribute('aria-pressed', String(value === view));
    try { localStorage.setItem('physics-map-view', view); } catch (error) { /* 無法保存時仍可使用 */ }
  }
  if (switcher) {
    for (const [value, label] of [['route', '路線圖'], ['star', '星圖']]) {
      const item = button(label, 'map-viewswitch-button');
      item.id = 'map-view-' + value;
      item.addEventListener('click', () => setView(value));
      switcher.append(item);
      viewButtons.push({item, value});
    }
    switcher.hidden = false;
  }

  root.replaceChildren(toolbar, legend, status, grid);
  let saved = 'route';
  try { saved = localStorage.getItem('physics-map-view') === 'star' ? 'star' : 'route'; } catch (error) { saved = 'route'; }
  setView(saved);
  apply();
  followHash();
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('hashchange', followHash);
  return {chapters, stops, columns, state, apply, openStop, setView, search, select};
}
