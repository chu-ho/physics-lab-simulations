'use strict';
// 物理學習地圖（入口）：共用篩選列、路線圖與星圖兩種檢視、#map-章節/實驗 深連結。
// 依賴 learning-map.js（章節資料）、textbook-hanlin.js（選用）、course-route.js、star-map.js。
// 只使用 DOM 測試支架支援的基本 API。

function atlasNode(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function atlasButton(text, className) {
  const element = atlasNode('button', text, className);
  element.type = 'button';
  return element;
}

// 共用篩選：主線、關鍵字、課本章節。兩種檢視都訂閱同一份狀態。
function createAtlasFilters(root, chapters, catalogue) {
  const book = typeof Textbook !== 'undefined' ? Textbook : null;
  const state = {trunk: '', query: '', textbook: ''};
  const listeners = [];
  const trunks = learningBranches.map(([name, color]) => ({name, color}));
  const haystacks = new Map();
  for (const chapter of chapters) for (const topic of chapter.topics) for (const lab of topic.labs)
    haystacks.set(lab.id, [lab.title, lab.id, lab.group, aliases[lab.id] || '', topic.name, chapter.id, chapter.title, chapter.branch, book ? book.searchText(lab.id) : ''].join(' ').toLowerCase());

  const trunkNav = atlasNode('nav', '', 'atlas-trunks');
  trunkNav.id = 'atlas-trunks';
  trunkNav.setAttribute('aria-label', '物理主線');
  const trunkButtons = [];
  for (const trunk of [{name: '', color: ''}, ...trunks]) {
    const item = atlasButton(trunk.name || '全部主線', 'atlas-trunk');
    if (trunk.color) item.style.setProperty('--branch', trunk.color);
    item.addEventListener('click', () => set({trunk: trunk.name}));
    trunkNav.append(item);
    trunkButtons.push({item, name: trunk.name});
  }
  const search = atlasNode('input', '', 'search atlas-search');
  search.id = 'atlas-search';
  search.type = 'search';
  search.placeholder = '搜尋實驗、生活情境或課本節名';
  search.setAttribute('aria-label', '搜尋學習地圖');
  const select = atlasNode('select', '', 'atlas-select');
  select.id = 'atlas-textbook';
  select.setAttribute('aria-label', '依翰林版課本章節篩選');
  const all = atlasNode('option', '全部課本章節');
  all.value = '';
  select.append(all);
  if (book) for (const group of book.chapterOptions()) {
    const optgroup = atlasNode('optgroup');
    optgroup.label = group.label;
    for (const entry of group.options) {
      const option = atlasNode('option', entry.label);
      option.value = entry.value;
      optgroup.append(option);
    }
    select.append(optgroup);
  }
  const clear = atlasButton('清除', 'atlas-clear');
  clear.id = 'atlas-clear';
  clear.addEventListener('click', () => set({trunk: '', query: '', textbook: ''}));
  const status = atlasNode('p', '', 'atlas-status');
  status.id = 'atlas-status';
  status.setAttribute('role', 'status');
  const fields = atlasNode('div', '', 'atlas-fields');
  const bookLabel = atlasNode('label', '', 'atlas-select-label');
  bookLabel.append(atlasNode('span', '翰林課本'), select);
  fields.append(search, bookLabel, clear);
  root.replaceChildren(trunkNav, fields, status);
  root.hidden = false;

  search.addEventListener('input', () => set({query: search.value}));
  select.addEventListener('change', () => set({textbook: select.value}));

  function labMatches(id) {
    const query = state.query.trim().toLowerCase();
    if (query && !(haystacks.get(id) || '').includes(query)) return false;
    if (state.textbook && !(book && book.inChapter(id, state.textbook))) return false;
    return true;
  }
  function filtering() { return Boolean(state.query.trim() || state.textbook); }
  function summary() {
    let found = 0;
    const reached = new Set();
    for (const chapter of chapters) {
      if (state.trunk && chapter.branch !== state.trunk) continue;
      for (const topic of chapter.topics) for (const lab of topic.labs)
        if (labMatches(lab.id)) { found++; reached.add(chapter.id); }
    }
    return {found, chapters: reached.size};
  }
  function render() {
    if (search.value !== state.query) search.value = state.query;
    if (select.value !== state.textbook) select.value = state.textbook;
    for (const {item, name} of trunkButtons) item.setAttribute('aria-pressed', String(state.trunk === name));
    clear.hidden = !(filtering() || state.trunk);
    const scope = state.trunk ? chapters.filter(chapter => chapter.branch === state.trunk) : chapters;
    const total = scope.reduce((sum, chapter) => sum + chapter.topics.reduce((n, topic) => n + topic.labs.length, 0), 0);
    if (filtering()) {
      const {found, chapters: reached} = summary();
      status.textContent = found ? '找到 ' + found + ' 個實驗，分布在 ' + reached + ' 個章節' : '找不到符合的實驗，試試其他關鍵字或課本章節。';
    } else {
      status.textContent = (state.trunk ? state.trunk + ' · ' : learningBranches.length + ' 條主線 · ') + scope.length + ' 章 · ' + total + ' 個實驗';
    }
  }
  function set(partial) {
    Object.assign(state, partial);
    render();
    for (const listener of listeners) listener(state);
  }
  render();
  return {state, set, labMatches, filtering, onChange: listener => listeners.push(listener), search, select, clear, trunkButtons, status};
}

function mountAtlas(catalogue) {
  const section = document.getElementById('learning-map');
  const filterRoot = document.getElementById('atlas-filters');
  const routeRoot = document.getElementById('route-view');
  const starRoot = document.getElementById('star-view');
  const switcher = document.getElementById('map-viewswitch');
  if (!section || !filterRoot || !routeRoot || !starRoot) return null;
  const chapters = buildLearningMap(catalogue);
  const filters = createAtlasFilters(filterRoot, chapters, catalogue);
  const route = createCourseRoute(routeRoot, chapters, filters);
  const star = createStarMap(starRoot, chapters, filters, {onRoute: id => { setView('route'); route.reveal(id, null, true); }});
  const state = {view: 'route'};
  const viewButtons = [];

  function setView(view, remember = true) {
    state.view = view === 'star' ? 'star' : 'route';
    section.setAttribute('data-view', state.view);
    routeRoot.hidden = state.view !== 'route';
    starRoot.hidden = state.view !== 'star';
    for (const {item, value} of viewButtons) item.setAttribute('aria-pressed', String(value === state.view));
    if (state.view === 'star') star.refresh();
    if (remember) try { localStorage.setItem('physics-map-view', state.view); } catch (error) { /* 無法保存時仍可使用 */ }
  }
  if (switcher) {
    for (const [value, label, hint] of [['route', '路線圖', '依章節順序逐步學'], ['star', '星圖', '看概念之間的連結']]) {
      const item = atlasButton('', 'atlas-view');
      item.id = 'map-view-' + value;
      item.append(atlasNode('span', label, 'atlas-view-label'), atlasNode('span', hint, 'atlas-view-hint'));
      item.addEventListener('click', () => setView(value));
      switcher.append(item);
      viewButtons.push({item, value});
    }
    switcher.hidden = false;
  }
  function followHash() {
    const match = /^#map-(\d\.\d)(?:\/([\w-]+))?$/.exec((typeof location !== 'undefined' && location.hash) || '');
    if (!match) return false;
    route.reveal(match[1], match[2]);
    star.reveal(match[1], match[2]);
    return true;
  }

  const fallback = document.getElementById('map-fallback');
  if (fallback) fallback.hidden = true;
  section.setAttribute('data-ready', 'true');
  let saved = 'route';
  try { saved = localStorage.getItem('physics-map-view') === 'star' ? 'star' : 'route'; } catch (error) { saved = 'route'; }
  setView(saved, false);
  followHash();
  if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('hashchange', followHash);
  return {chapters, filters, route, star, state, setView, followHash};
}
