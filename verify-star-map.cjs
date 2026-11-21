'use strict';
// 物理星圖：版面、三層聚焦、篩選、標籤避讓、縮放與鍵盤操作（真實 library.html 與腳本）。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {domHarness} = require('./tools/dom-harness.cjs');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const html = read('library.html');

function open(hash = '') {
  const {ids, sandbox} = domHarness(html);
  const replaced = [];
  sandbox.localStorage = {getItem: () => 'star', setItem() {}};
  sandbox.window.addEventListener = () => {};
  sandbox.history.replaceState = (_, __, hash) => replaced.push(hash);
  sandbox.location.hash = hash;
  for (const [, source] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)) {
    if (source === 'assets/library.js') continue;
    vm.runInContext(read(source), sandbox, {filename: source});
  }
  vm.runInContext('var atlasApi; const __mount = mountAtlas; mountAtlas = catalogue => (atlasApi = __mount(catalogue));', sandbox);
  vm.runInContext(read('assets/library.js'), sandbox, {filename: 'assets/library.js'});
  return {ids, replaced, api: vm.runInContext('atlasApi', sandbox)};
}

const {ids, api, replaced} = open();
const {star, filters} = api;
assert.equal(api.state.view, 'star');
assert.equal(ids['star-view'].hidden, false);

// 版面：19 個星座互不重疊、遠離中心，151 個實驗各有一個星點且在所屬星座內
const clusters = star.layout.clusters;
assert.equal(clusters.length, 19);
for (let i = 0; i < clusters.length; i++) {
  assert.ok(Math.hypot(clusters[i].x, clusters[i].y) >= clusters[i].room + 49, clusters[i].chapter.id + ' keeps the centre clear');
  for (let j = i + 1; j < clusters.length; j++) {
    const a = clusters[i], b = clusters[j];
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= a.room + b.room + 13, a.chapter.id + ' overlaps ' + b.chapter.id);
  }
}
assert.equal(star.labIndex.size, 151);
for (const entry of star.labIndex.values()) {
  const cluster = clusters.find(item => item.chapter.id === entry.chapter.id);
  assert.ok(Math.hypot(entry.x - cluster.x, entry.y - cluster.y) <= cluster.radius + 0.01, entry.lab.id + ' inside its constellation');
  assert.ok(Number.isFinite(entry.x) && Number.isFinite(entry.y));
}
assert.ok(star.linkElements.length >= 14, 'prerequisite links drawn');
assert.equal(ids['star-svg'].attrs.viewBox.split(' ').length, 4);
assert.equal(ids['star-view'].attrs['data-level'], 'overview');
assert.ok(ids['star-panel'].children[0].children.some(child => child.textContent === '從一顆星開始'));

// 章節名稱避讓：已放置的標籤在畫面內且互不重疊
function labelBoxes() {
  const [x, y, w, h] = ids['star-svg'].attrs.viewBox.split(' ').map(Number);
  const boxes = [];
  for (const entry of star.chapterElements.values()) {
    const placed = entry.name.attrs['data-placed'];
    if (placed === 'hidden') continue;
    const sx = (entry.cluster.x - x) / w * 1100, sy = (entry.cluster.y - y) / h * 760;
    const width = entry.label.length * 13.6 + 8, offset = placed === 'below' ? 27.7 : -20.9;
    boxes.push({id: entry.cluster.chapter.id, l: sx - width / 2, r: sx + width / 2, t: sy + offset - 13, b: sy + offset + 4});
  }
  return boxes;
}
const overviewBoxes = labelBoxes();
assert.ok(overviewBoxes.length >= 12, 'most chapter names fit at desktop size: ' + overviewBoxes.length);
for (let i = 0; i < overviewBoxes.length; i++) {
  const a = overviewBoxes[i];
  assert.ok(a.l >= 0 && a.r <= 1100 && a.t >= 0 && a.b <= 760, a.id + ' label inside view');
  for (let j = i + 1; j < overviewBoxes.length; j++) {
    const b = overviewBoxes[j];
    assert.ok(!(a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t), a.id + ' label overlaps ' + b.id);
  }
}

// 第二層：點亮星進入章節
const dynamics = star.chapterElements.get('1.2');
dynamics.star.listeners.click({stopPropagation() {}});
assert.equal(star.state.focus, '1.2');
assert.equal(dynamics.group.attrs['data-focused'], 'true');
assert.equal(star.chapterElements.get('2.1').group.attrs['data-dim'], 'true');
assert.equal(ids['star-view'].attrs['data-level'], 'chapter');
assert.equal(replaced.pop(), '#map-1.2');
const [, , focusW] = ids['star-svg'].attrs.viewBox.split(' ').map(Number);
assert.ok(focusW < 900, 'zoomed into the constellation');
assert.equal(star.labIndex.get('friction').dot.attrs.tabindex, '0', 'experiments focusable inside the focused chapter');
assert.equal(star.labIndex.get('doppler').dot.attrs.tabindex, '-1');
assert.ok(star.linkElements.some(link => link.path.attrs['data-active'] === 'true'), 'related prerequisites highlighted');
const panelText = JSON.stringify(ids['star-panel'].children.map(section => section.children.map(child => child.textContent)));
assert.ok(panelText.includes('動力學') && panelText.includes('受力與摩擦'));
assert.equal(ids['star-crumbs'].children.filter(child => child.className.startsWith('star-crumb') && child.className !== 'star-crumb-sep').length, 3);

// 第三層：選實驗星點；Enter 也能選取
const bike = star.labIndex.get('bicycle-friction');
bike.dot.listeners.keydown({key: 'Enter', preventDefault() {}});
assert.equal(star.state.lab, 'bicycle-friction');
assert.equal(bike.dot.attrs['data-selected'], 'true');
assert.equal(ids['star-view'].attrs['data-level'], 'lab');
assert.equal(ids['star-open'].href, 'mechanics.html#experiment=bicycle-friction');
assert.equal(replaced.pop(), '#map-1.2/bicycle-friction');
// 提示框顯示名稱
bike.dot.listeners.pointerenter({clientX: 400, clientY: 300});
assert.equal(ids['star-tooltip'].hidden, false);
assert.equal(ids['star-tooltip'].children[0].textContent, bike.lab.title);
bike.dot.listeners.pointerleave({});
assert.equal(ids['star-tooltip'].hidden, true);

// Esc 逐層返回
ids['star-svg'].listeners.keydown({key: 'Escape'});
assert.equal(star.state.lab, '');
assert.equal(star.state.focus, '1.2');
ids['star-svg'].listeners.keydown({key: 'Escape'});
assert.equal(star.state.focus, '');
assert.equal(ids['star-view'].attrs['data-level'], 'overview');

// 篩選：搜尋讓符合的星點亮起、無結果的章節變暗，側欄列出結果
filters.set({query: '透鏡'});
const optics = star.chapterElements.get('2.2');
assert.equal(optics.group.attrs['data-dim'], 'false');
assert.ok(Number(optics.group.attrs['data-hits']) >= 5);
assert.equal(star.chapterElements.get('1.1').group.attrs['data-dim'], 'true');
assert.equal(star.labIndex.get('half-lens').dot.attrs['data-match'], 'true');
assert.equal(star.labIndex.get('friction').dot.attrs['data-match'], 'false');
assert.ok(ids['star-panel'].children[0].children.some(child => child.className === 'star-result-chapter'), 'results listed in panel');
filters.set({query: ''});
assert.equal(star.labIndex.get('friction').dot.attrs['data-match'], 'true');

// 主線篩選：其他主線變暗並重新取景；聚焦其他主線的章節會清除主線篩選
const before = ids['star-svg'].attrs.viewBox;
filters.set({trunk: '電與磁'});
assert.notEqual(ids['star-svg'].attrs.viewBox, before);
assert.equal(star.chapterElements.get('1.1').group.attrs['data-dim'], 'true');
assert.equal(star.chapterElements.get('3.3').group.attrs['data-dim'], 'false');
star.focusChapter('4.2');
assert.equal(filters.state.trunk, '');
star.clearFocus();

// 縮放上下限與按鈕
for (let i = 0; i < 30; i++) ids['star-zoom-in'].listeners.click({});
assert.ok(Number(ids['star-svg'].attrs.viewBox.split(' ')[2]) >= 119.9, 'zoom-in clamped');
for (let i = 0; i < 30; i++) ids['star-zoom-out'].listeners.click({});
const limit = Number(ids['star-svg'].attrs.viewBox.split(' ')[2]);
ids['star-overview'].listeners.click({});
assert.ok(limit <= Number(ids['star-svg'].attrs.viewBox.split(' ')[2]) * 1.61, 'zoom-out clamped');
// 拖曳平移不會觸發返回
const start = ids['star-svg'].attrs.viewBox;
ids['star-svg'].listeners.pointerdown({pointerId: 1, clientX: 300, clientY: 300});
ids['star-svg'].listeners.pointermove({pointerId: 1, clientX: 360, clientY: 330});
ids['star-svg'].listeners.pointerup({pointerId: 1});
assert.notEqual(ids['star-svg'].attrs.viewBox, start, 'drag pans');
ids['star-svg'].listeners.wheel({deltaY: -200, clientX: 500, clientY: 380, preventDefault() {}});

// 深連結
const linked = open('#map-2.3').api.star;
assert.equal(linked.state.focus, '2.3');

console.log('PASS star map: 19 non-overlapping constellations, 151 experiment stars, label avoidance, chapter/experiment focus with Esc back, tooltip, search and trunk filters, zoom limits, drag and deep links.');
