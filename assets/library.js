'use strict';
const legacy = [
  {
    id: 'projectile',
    title: '平面斜拋',
    group: '運動學',
    href: 'projectile.html',
    formula: '拋體 水平 鉛直',
    description: '改變初速、仰角與方位角，追蹤自由拋體的三維軌跡。'
  },
  {
    id: 'stairs',
    title: '階梯斜拋與反彈',
    group: '運動學',
    href: 'staircase-projectile.html',
    formula: '碰撞 恢復係數 階梯',
    description: '從高台拋向等寬等高的階梯，記錄每一次反彈的位置。'
  },
  {
    id: 'inclined-projectile',
    title: '斜面上的斜拋',
    group: '運動學',
    href: 'inclined-projectile.html',
    formula: '斜面 仰角',
    description: '以斜面為基準發射，探索傾角、落點與離面高度。'
  }
];
const experiments = [
  ...legacy,
  ...MechanicsCatalog.map(d => ({
    ...d,
    href: 'mechanics.html#experiment=' + encodeURIComponent(d.id),
    description: d.question
  }))
];
const categories = ['全部', ...new Set(experiments.map(d => d.group))],
  icons = {
    運動學: '↗',
    牛頓定律: '⇄',
    動力學: '⇄',
    靜力學: '⚖',
    能量與動量: '◇',
    圓周與轉動: '↻',
    振動: '∿',
    萬有引力: '◎',
    波動光學: '≋'
  };
let selected = '全部';
document.getElementById('count').textContent =
  experiments.length + ' 個互動實驗 · ' + (categories.length - 1) + ' 大主題 · 自由旋轉視角';
for (const cat of categories) {
  const button = document.createElement('button');
  button.textContent = cat;
  button.setAttribute('aria-pressed', cat === selected);
  button.onclick = () => {
    selected = cat;
    for (const b of document.getElementById('filters').children)
      b.setAttribute('aria-pressed', b.textContent === selected);
    renderCards();
  };
  document.getElementById('filters').append(button);
}
// 實驗縮圖：tools/capture-thumbs.html 產生的 assets/thumbs/<id>.webp；懶載入，載入失敗就退回原本的圖示。
function thumbnail(d, className) {
  if (!d.href.startsWith('mechanics.html')) return null;
  const img = document.createElement('img');
  img.className = className;
  img.src = 'assets/thumbs/' + encodeURIComponent(d.id) + '.webp';
  img.alt = '';
  img.width = 400;
  img.height = 250;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.addEventListener('error', () => {
    img.closest('.has-thumb')?.classList.remove('has-thumb');
    img.remove();
  });
  return img;
}
function renderCards() {
  const q = document.getElementById('search').value.trim().toLowerCase(),
    chapter = chapterSelect ? chapterSelect.value : '',
    filtered = experiments.filter(
      d =>
        (selected === '全部' || d.group === selected) &&
        (!chapter || (window.Textbook && Textbook.inChapter(d.id, chapter))) &&
        [d.title, d.group, d.description, d.formula, d.id, window.Textbook ? Textbook.searchText(d.id) : '']
          .join(' ')
          .toLowerCase()
          .includes(q)
    );
  document.getElementById('result').textContent = '顯示 ' + filtered.length + ' / ' + experiments.length + ' 個實驗';
  const cards = document.getElementById('cards');
  cards.replaceChildren();
  for (const d of filtered) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = d.href;
    const thumb = thumbnail(d, 'thumb');
    if (thumb) a.className = 'card has-thumb';
    const number = document.createElement('div');
    number.className = 'number';
    number.textContent = String(experiments.indexOf(d) + 1).padStart(2, '0');
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = d.group;
    number.append(tag);
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = icons[d.group] || '◇';
    icon.setAttribute('aria-hidden', 'true');
    const h = document.createElement('h3');
    h.textContent = d.title;
    const p = document.createElement('p');
    p.textContent = d.description;
    const open = document.createElement('div');
    open.className = 'open';
    open.textContent = '進入 3D 實驗';
    const arrow = document.createElement('span');
    arrow.textContent = '↗';
    open.append(arrow);
    const chips = document.createElement('div');
    chips.className = 'textbook-tags compact';
    if (window.Textbook)
      for (const [index, section] of Textbook.lookup(d.id).slice(0, 3).entries()) {
        const chip = document.createElement('span');
        chip.className = 'textbook-chip' + (index === 0 ? ' primary' : '') + (section.extension ? ' extension' : '');
        chip.textContent = section.label;
        chip.title = section.full;
        chips.append(chip);
      }
    a.append(...(thumb ? [thumb] : []), number, icon, h, p, ...(chips.children.length ? [chips] : []), open);
    cards.append(a);
  }
  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '找不到符合的實驗，試試其他關鍵字或分類。';
    cards.append(empty);
  }
}
const chapterSelect = document.getElementById('chapterFilter');
if (chapterSelect && window.Textbook) {
  for (const group of Textbook.chapterOptions()) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.label;
    for (const item of group.options) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      optgroup.append(option);
    }
    chapterSelect.append(optgroup);
  }
  chapterSelect.addEventListener('change', renderCards);
}
document.getElementById('search').addEventListener('input', renderCards);
renderCards();

if (typeof mountAtlas === 'function') mountAtlas(experiments);

// 入口頁小橫列：「從這裡開始」與「最近更新」共用一列，用兩個切換鈕換內容（手機也只占一列高度）。
function mountShelves(root, highlights) {
  if (!root || !highlights) return;
  const byId = new Map(experiments.map(d => [d.id, d])),
    shelves = [
      { key: 'start', label: '從這裡開始', items: highlights.start },
      { key: 'recent', label: '最近更新', items: highlights.recent }
    ],
    tabs = document.createElement('div'),
    list = document.createElement('ul'),
    buttons = [];
  tabs.className = 'shelf-tabs';
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', '精選實驗');
  list.className = 'shelf-list';
  list.id = 'shelf-list';
  function show(key) {
    for (const [index, button] of buttons.entries())
      button.setAttribute('aria-pressed', String(shelves[index].key === key));
    const shelf = shelves.find(s => s.key === key);
    list.setAttribute('aria-label', shelf.label);
    list.replaceChildren(
      ...shelf.items
        .filter(item => byId.has(item.id))
        .map(item => {
          const d = byId.get(item.id),
            li = document.createElement('li'),
            a = document.createElement('a'),
            title = document.createElement('strong'),
            note = document.createElement('span'),
            img = thumbnail(d, 'shelf-thumb');
          a.className = 'shelf-card';
          a.href = d.href;
          title.textContent = d.title;
          note.textContent = item.date ? item.date.slice(5).replace('-', '/') + ' ' + item.note : item.note;
          a.append(...(img ? [img] : []), title, note);
          li.append(a);
          return li;
        })
    );
    list.scrollLeft = 0;
  }
  for (const shelf of shelves) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = shelf.label;
    button.addEventListener('click', () => show(shelf.key));
    buttons.push(button);
    tabs.append(button);
  }
  root.replaceChildren(tabs, list);
  root.hidden = false;
  show('start');
}
mountShelves(document.getElementById('shelves'), typeof LibraryHighlights !== 'undefined' ? LibraryHighlights : null);
