'use strict';
// 翰林版課本章節標籤：資料完整性、總覽章節篩選與搜尋、實驗頁側欄顯示。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {domHarness} = require('./tools/dom-harness.cjs');
const Mechanics = require('./mechanics-models.js');
const Textbook = require('./assets/textbook-hanlin.js');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');

// 1. 資料：六冊章節、每個入口 1–3 個有效且不重複的標籤
assert.deepEqual(Textbook.books.map(book => book.key), ['B', 'I', 'II', 'III', 'IV', 'V']);
const ids = ['projectile', 'stairs', 'inclined-projectile', ...Mechanics.defs.map(def => def.id)];
assert.equal(ids.length, 149);
for (const id of ids) {
  const list = Textbook.tags[id];
  assert.ok(Array.isArray(list) && list.length >= 1 && list.length <= 3, id + ' needs 1-3 textbook tags');
  assert.equal(new Set(list).size, list.length, id + ' duplicate tag');
  for (const code of list) assert.ok(Textbook.sections.has(code), id + ' unknown section ' + code);
  assert.ok(!Textbook.sections.get(list[0]).extension || list.every(code => code.startsWith('X-')) || ['hydrostatic-buoyancy', 'plane-mirror'].includes(id), id + ' primary tag should be a textbook section when one is listed');
}
assert.deepEqual(Object.keys(Textbook.tags).filter(id => !ids.includes(id)), [], 'tags for unknown experiments');
const used = new Set(Object.values(Textbook.tags).flat().map(code => Textbook.sections.get(code).chapter));
const empty = Textbook.books.flatMap(book => book.chapters.map(([chapter]) => book.key + chapter)).filter(chapter => !used.has(chapter));
assert.deepEqual(empty, ['B1', 'I1'], 'only measurement/method chapters may lack experiments');
assert.equal(Textbook.sections.get('III3-1').full, '選修物理Ⅲ 波動、光及聲音 第3章 光的折射及其應用｜3-1 光的折射與司乃耳定律');

// 2. 總覽：真實 HTML 與腳本，章節選單、篩選與節名搜尋
const html = read('library.html');
assert.ok(html.indexOf('assets/textbook-hanlin.js') < html.indexOf('assets/library.js'), 'textbook data loads before library');
const {ids: nodes, sandbox} = domHarness(html);
sandbox.window.addEventListener = () => {};
sandbox.history.replaceState = () => {};
for (const [, source] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)) vm.runInContext(read(source), sandbox, {filename: source});
const select = nodes.chapterFilter;
assert.ok(html.includes('<option value="">全部章節</option>'));
const groups = select.children.filter(child => child.label);
assert.deepEqual(groups.map(group => group.label), [...Textbook.books.map(book => book.name), '課本外延伸']);
assert.equal(groups[1].children[1].textContent, '選修Ⅰ 第2章 運動學－直線運動');
const resultCount = () => Number(nodes.result.textContent.match(/顯示 (\d+)/)[1]);
assert.equal(resultCount(), 149);
const firstCard = nodes.cards.children[0];
const chips = firstCard.children.find(child => child.className === 'textbook-tags compact');
assert.ok(chips && chips.children[0].textContent === '選修Ⅰ 3-4', 'card shows primary textbook section');
select.value = 'III3';
select.listeners.change({});
const expected = ids.filter(id => Textbook.inChapter(id, 'III3')).length;
assert.equal(resultCount(), expected);
assert.ok(expected >= 12 && expected < 149, 'geometric-optics chapter filter narrows the list');
select.value = '';
select.listeners.change({});
nodes.search.value = '司乃耳';
nodes.search.listeners.input({});
assert.equal(resultCount(), ids.filter(id => (Textbook.tags[id] || []).includes('III3-1')).length);
nodes.search.value = '';
nodes.search.listeners.input({});
assert.equal(resultCount(), 149);

// 3. 實驗頁：側欄標籤跟著實驗切換
const page = read('mechanics.html');
assert.ok(page.includes('id="textbook"'));
assert.ok(page.indexOf('assets/textbook-hanlin.js') < page.indexOf('assets/mechanics-app.js'));
assert.match(read('assets/mechanics-app.js'), /Textbook\.render\(\$\('textbook'\),\s*def\.id,\s*document\)/);
const fake = {children: [], hidden: true, ownerDocument: {createElement: () => ({className: '', textContent: '', title: ''})},
  replaceChildren() { this.children = []; }, append(...items) { this.children.push(...items); }};
Textbook.render(fake, 'photoelectric');
assert.equal(fake.hidden, false);
assert.equal(fake.children[0].textContent, '翰林版課本');
assert.equal(fake.children[1].textContent, '選修Ⅴ 2-5 光電效應');
assert.ok(fake.children[1].className.includes('primary'));
Textbook.render(fake, 'pn-junction');
assert.ok(fake.children[1].className.includes('extension'));
Textbook.render(fake, 'not-a-lab');
assert.equal(fake.hidden, true);

console.log('PASS textbook tags: 149 entries mapped to Hanlin 108 required + elective I–V sections, catalogue chapter filter/search, card chips and experiment sidebar.');
