'use strict';
// 課程路線圖：四條主線各為一欄，章節是路線上的站點，展開後列出實驗、課本章節與探究活動。
// 篩選由 atlas.js 的共用篩選列提供；依賴 learning-map.js 的 learningBranches、prerequisites、
// learningFocus、learningActivities，以及選用的 assets/textbook-hanlin.js。只使用 DOM 測試支架支援的基本 API。

const routeTones = {'高中入門': 'intro', '高中深化': 'deep', '進階': 'adv'};

function routeCoverage(labs) {
  if (typeof Textbook === 'undefined') return '';
  const byBook = new Map();
  for (const lab of labs) {
    const primary = Textbook.lookup(lab.id).find(item => !item.extension);
    if (!primary) continue;
    const number = primary.chapter.slice(primary.book.length);
    if (!byBook.has(primary.short)) byBook.set(primary.short, new Set());
    byBook.get(primary.short).add(number);
  }
  return [...byBook].slice(0, 3).map(([name, numbers]) => name + ' 第' + [...numbers].sort().join('·') + '章').join('　');
}

function createCourseRoute(root, chapters, filters) {
  const book = typeof Textbook !== 'undefined' ? Textbook : null;
  const open = new Set();
  const stops = [];
  const columns = [];
  const node = atlasNode;

  const legend = node('p', '', 'route-legend');
  for (const [label, tone] of Object.entries(routeTones)) {
    const badge = node('span', label, 'route-level');
    badge.setAttribute('data-tone', tone);
    legend.append(badge);
  }
  legend.append(node('span', '點選站點展開實驗；虛線標籤為課本外延伸。', 'route-legend-note'));

  const grid = node('div', '', 'route-columns');
  for (const [trunkName, trunkColor] of learningBranches) {
    const list = chapters.filter(chapter => chapter.branch === trunkName);
    const labCount = list.reduce((sum, chapter) => sum + chapter.topics.reduce((n, topic) => n + topic.labs.length, 0), 0);
    const column = node('section', '', 'route-col');
    column.style.setProperty('--branch', trunkColor);
    column.setAttribute('aria-label', trunkName + '路線');
    const head = node('div', '', 'route-col-head');
    head.append(node('h3', trunkName), node('span', list.length + ' 章 · ' + labCount + ' 個實驗', 'route-col-meta'));
    const line = node('ol', '', 'route-line');
    column.append(head, line);
    columns.push({column, name: trunkName});
    grid.append(column);

    for (const chapter of list) {
      const labs = chapter.topics.flatMap(topic => topic.labs);
      const [level, guidance] = learningFocus[chapter.id] || ['', ''];
      const item = node('li', '', 'route-stop');
      item.id = 'route-stop-' + chapter.id;
      const toggle = atlasButton('', 'route-stop-head');
      toggle.id = 'route-head-' + chapter.id;
      toggle.setAttribute('aria-controls', 'route-body-' + chapter.id);
      const marker = node('span', chapter.id, 'route-marker');
      marker.setAttribute('aria-hidden', 'true');
      const text = node('span', '', 'route-stop-text');
      const meta = node('span', '', 'route-stop-meta');
      if (level) {
        const badge = node('span', level, 'route-level');
        badge.setAttribute('data-tone', routeTones[level] || 'intro');
        meta.append(badge);
      }
      const count = node('span', labs.length + ' 個實驗', 'route-count');
      meta.append(count);
      text.append(node('span', chapter.title, 'route-stop-title'), meta);
      const books = routeCoverage(labs);
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
          const jump = atlasButton(target.id + ' ' + target.title, 'route-jump');
          jump.style.setProperty('--branch', target.color);
          jump.addEventListener('click', () => reveal(target.id, null, true));
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
          const entry = {lab, li};
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
      toggle.addEventListener('click', () => {
        if (open.has(chapter.id)) open.delete(chapter.id); else open.add(chapter.id);
        update();
      });
      stops.push({chapter, item, toggle, body, rows, topics, count, total: labs.length});
    }
  }

  function update() {
    const state = filters.state;
    const active = filters.filtering();
    for (const stop of stops) {
      let visible = 0;
      for (const row of stop.rows) {
        const show = filters.labMatches(row.lab.id);
        row.li.hidden = !show;
        if (show) visible++;
      }
      for (const topic of stop.topics) topic.block.hidden = active && topic.rows.length > 0 && topic.rows.every(row => row.li.hidden);
      const isOpen = active ? visible > 0 : open.has(stop.chapter.id);
      stop.item.setAttribute('data-open', String(isOpen));
      stop.item.setAttribute('data-dim', String(active && visible === 0));
      stop.toggle.setAttribute('aria-expanded', String(isOpen));
      stop.body.hidden = !isOpen;
      stop.count.textContent = active ? visible + ' / ' + stop.total + ' 個實驗' : stop.total + ' 個實驗';
    }
    for (const {column, name} of columns) column.hidden = Boolean(state.trunk && state.trunk !== name);
  }
  function reveal(chapterId, labId, scroll) {
    const stop = stops.find(item => item.chapter.id === chapterId);
    if (!stop) return;
    if (filters.state.trunk && filters.state.trunk !== stop.chapter.branch) filters.set({trunk: ''});
    open.add(chapterId);
    update();
    for (const other of stops) for (const row of other.rows) row.li.setAttribute('aria-current', String(Boolean(labId) && row.lab.id === labId));
    if (scroll && stop.item.scrollIntoView) stop.item.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    if (scroll && stop.toggle.focus) stop.toggle.focus({preventScroll: true});
  }

  root.replaceChildren(legend, grid);
  filters.onChange(update);
  update();
  return {stops, columns, open, update, reveal};
}
