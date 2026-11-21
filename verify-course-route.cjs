'use strict';
// 學習地圖入口與課程路線圖：真實 library.html 與腳本，驗證共用篩選、站點、展開、課本與主線篩選、先備跳轉、檢視切換與深連結。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {domHarness} = require('./tools/dom-harness.cjs');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const html = read('library.html');
const order = ['assets/learning-map.js', 'assets/course-route.js', 'assets/star-map.js', 'assets/atlas.js', 'assets/library.js'];
order.reduce((previous, file) => { const at = html.indexOf(file); assert.ok(at > previous, file + ' load order'); return at; }, -1);
assert.ok(!html.includes('class="hero"'), 'large hero removed; the atlas header is the entry');
assert.ok(!html.includes('id="map-board"'), 'old 3D star map markup removed');

function open(hash = '', saved = null) {
  const {ids, sandbox} = domHarness(html);
  const store = new Map(saved ? [['physics-map-view', saved]] : []);
  sandbox.localStorage = {getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value))};
  sandbox.window.addEventListener = () => {};
  sandbox.history.replaceState = () => {};
  sandbox.location.hash = hash;
  for (const [, source] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)) {
    if (source === 'assets/library.js') continue;
    vm.runInContext(read(source), sandbox, {filename: source});
  }
  vm.runInContext('var atlasApi; const __mount = mountAtlas; mountAtlas = catalogue => (atlasApi = __mount(catalogue));', sandbox);
  vm.runInContext(read('assets/library.js'), sandbox, {filename: 'assets/library.js'});
  return {ids, store, api: vm.runInContext('atlasApi', sandbox)};
}
const visibleLabs = route => Array.from(route.stops.flatMap(stop => stop.rows).filter(row => !row.li.hidden).map(row => row.lab.id));

const {ids, api, store} = open();
const {route, filters} = api;
assert.equal(ids['learning-map'].attrs['data-ready'], 'true');
assert.equal(ids['map-fallback'].hidden, true, 'static fallback hidden once scripts run');
assert.equal(ids['learning-map'].attrs['data-view'], 'route');
assert.equal(ids['route-view'].hidden, false);
assert.equal(ids['star-view'].hidden, true);
assert.equal(ids['atlas-filters'].hidden, false);
assert.equal(ids['atlas-status'].textContent, '4 條主線 · 19 章 · 150 個實驗');
assert.equal(route.columns.length, 4);
assert.equal(route.stops.length, 19);
assert.equal(route.stops.reduce((sum, stop) => sum + stop.total, 0), 150, 'every experiment appears once');
assert.ok(route.stops.every(stop => stop.body.hidden && stop.item.attrs['data-open'] === 'false'), 'stops start collapsed');

// 展開與收合
const optics = route.stops.find(stop => stop.chapter.id === '2.2');
optics.toggle.listeners.click({});
assert.equal(optics.body.hidden, false);
assert.equal(optics.toggle.attrs['aria-expanded'], 'true');
optics.toggle.listeners.click({});
assert.equal(optics.body.hidden, true);

// 共用搜尋：自動展開符合章節、淡化其餘並更新計數
filters.search.value = '透鏡';
filters.search.listeners.input({});
const lensHits = visibleLabs(route);
assert.ok(lensHits.length >= 5);
assert.equal(optics.item.attrs['data-open'], 'true');
assert.equal(route.stops.find(stop => stop.chapter.id === '1.1').item.attrs['data-dim'], 'true');
assert.equal(ids['atlas-status'].textContent, '找到 ' + lensHits.length + ' 個實驗，分布在 1 個章節');
assert.equal(ids['atlas-clear'].hidden, false);
ids['atlas-clear'].listeners.click({});
assert.equal(filters.search.value, '');
assert.equal(visibleLabs(route).length, 150);
assert.equal(ids['atlas-clear'].hidden, true);

// 別名與課本節名都能搜尋
filters.set({query: '救護車'});
assert.deepEqual(visibleLabs(route), ['doppler']);
filters.set({query: '司乃耳'});
assert.ok(visibleLabs(route).includes('refraction-cart'));
filters.set({query: ''});

// 課本章節篩選
filters.select.value = 'IV2';
filters.select.listeners.change({});
assert.deepEqual(visibleLabs(route).sort(), ['charged-particle', 'wire-magnetic-field']);
filters.set({textbook: ''});

// 主線篩選
const trunks = ids['atlas-trunks'].children;
assert.equal(trunks.length, 5);
trunks.find(item => item.textContent === '近代物理').listeners.click({});
assert.deepEqual(Array.from(route.columns.filter(column => !column.column.hidden).map(column => column.name)), ['近代物理']);
assert.equal(ids['atlas-status'].textContent, '近代物理 · 7 章 · 10 個實驗');
// 先備跳轉會切回目標主線並展開
const quantum = route.stops.find(stop => stop.chapter.id === '4.5');
quantum.toggle.listeners.click({});
const jump = quantum.body.children.find(child => child.className === 'route-links').children[0].children.find(child => child.className === 'route-jump');
assert.match(jump.textContent, /^4\.3 /);
jump.listeners.click({});
assert.equal(route.stops.find(stop => stop.chapter.id === '4.3').item.attrs['data-open'], 'true');
trunks[0].listeners.click({});
assert.ok(route.columns.every(column => !column.column.hidden));

// 實驗列：連結、課本標籤、探究活動
const lens = route.stops.flatMap(stop => stop.rows).find(row => row.lab.id === 'half-lens');
assert.equal(lens.li.children[0].href, 'mechanics.html#experiment=half-lens');
assert.ok(lens.li.children.some(child => child.className === 'route-lab-tags'));
assert.ok(lens.li.children.some(child => child.className === 'route-activity'));

// 檢視切換與記憶
ids['map-view-star'].listeners.click({});
assert.equal(ids['learning-map'].attrs['data-view'], 'star');
assert.equal(ids['route-view'].hidden, true);
assert.equal(ids['star-view'].hidden, false);
assert.equal(store.get('physics-map-view'), 'star');
ids['map-view-route'].listeners.click({});
assert.equal(ids['learning-map'].attrs['data-view'], 'route');
assert.equal(open('', 'star').api.state.view, 'star', 'saved view restored');

// 深連結：#map-章節/實驗 兩種檢視都展開並標示該實驗
const linked = open('#map-3.2/charged-particle').api;
const magnet = linked.route.stops.find(stop => stop.chapter.id === '3.2');
assert.equal(magnet.item.attrs['data-open'], 'true');
assert.equal(magnet.rows.find(row => row.lab.id === 'charged-particle').li.attrs['aria-current'], 'true');
assert.equal(linked.star.state.focus, '3.2');
assert.equal(linked.star.state.lab, 'charged-particle');

console.log('PASS course route: atlas shell, shared filters (search/aliases/textbook/trunk), 19 stops with 150 experiments, prerequisite jumps, activities, view switch memory and deep links in both views.');
