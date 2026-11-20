'use strict';
// 課程路線圖：真實 library.html 與腳本，驗證站點、展開、搜尋、課本篩選、主線篩選、先備跳轉、深連結與檢視切換。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {domHarness} = require('./tools/dom-harness.cjs');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const html = read('library.html');

assert.ok(html.indexOf('assets/learning-map.js') < html.indexOf('assets/course-route.js'), 'route view needs learning-map data first');
assert.ok(html.indexOf('assets/course-route.js') < html.indexOf('assets/library.js'), 'route view loads before catalogue mount');
for (const id of ['map-tools', 'map-results', 'map-branches', 'map-stage', 'map-details-panel'])
  assert.match(html, new RegExp('class="[^"]*star-only[^"]*" id="' + id + '"'), id + ' belongs to star view');
assert.ok(html.indexOf('<section class="hero">') < html.indexOf('id="learning-map"'), 'intro sits above the map');

function open(hash = '', saved = null) {
  const {ids, sandbox} = domHarness(html);
  const store = new Map(saved ? [['physics-map-view', saved]] : []);
  sandbox.localStorage = {getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value))};
  sandbox.window.addEventListener = () => {};
  sandbox.history.replaceState = () => {};
  sandbox.location.hash = hash;
  vm.runInContext(read('mechanics-models.js'), sandbox);
  for (const [, source] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)) {
    if (source === 'assets/library.js') continue;
    vm.runInContext(read(source), sandbox, {filename: source});
  }
  vm.runInContext("var routeApi; const __mount = mountCourseRoute; mountCourseRoute = catalogue => (routeApi = __mount(catalogue));", sandbox);
  vm.runInContext(read('assets/library.js'), sandbox, {filename: 'assets/library.js'});
  return {ids, sandbox, store, api: vm.runInContext('routeApi', sandbox)};
}

const {ids, api, store} = open();
const catalogue = 149;
assert.equal(api.columns.length, 4);
assert.equal(api.stops.length, 19);
assert.equal(api.stops.reduce((sum, stop) => sum + stop.total, 0), catalogue, 'every experiment appears once');
assert.equal(ids['learning-map'].attrs['data-view'], 'route');
assert.equal(ids['route-view'].hidden, false);
assert.equal(ids['map-viewswitch'].hidden, false);
assert.equal(ids['route-status'].textContent, '4 條主線 · 19 章 · 149 個實驗');
assert.ok(api.stops.every(stop => stop.body.hidden && stop.item.attrs['data-open'] === 'false'), 'stops start collapsed');

// 展開與收合
const optics = api.stops.find(stop => stop.chapter.id === '2.2');
optics.toggle.listeners.click({});
assert.equal(optics.body.hidden, false);
assert.equal(optics.toggle.attrs['aria-expanded'], 'true');
assert.ok(optics.rows.some(row => row.lab.id === 'eye-lens'));
optics.toggle.listeners.click({});
assert.equal(optics.body.hidden, true);

// 搜尋：自動展開符合章節、淡化其餘並更新計數
api.search.value = '透鏡';
api.search.listeners.input({});
const visible = api.stops.flatMap(stop => stop.rows).filter(row => !row.li.hidden);
assert.ok(visible.length >= 5 && visible.every(row => row.text.includes('透鏡')));
assert.equal(optics.item.attrs['data-open'], 'true');
assert.equal(api.stops.find(stop => stop.chapter.id === '1.1').item.attrs['data-dim'], 'true');
assert.match(ids['route-status'].textContent, /^找到 \d+ 個實驗，分布在 \d+ 個章節$/);
assert.equal(ids['route-clear'].hidden, false);
ids['route-clear'].listeners.click({});
assert.equal(api.search.value, '');
assert.ok(api.stops.every(stop => stop.rows.every(row => !row.li.hidden)));
assert.equal(ids['route-clear'].hidden, true);

// 別名與課本節名都能搜尋
api.search.value = '救護車';
api.search.listeners.input({});
assert.deepEqual(Array.from(api.stops.flatMap(stop => stop.rows).filter(row => !row.li.hidden).map(row => row.lab.id)), ['doppler']);
api.search.value = '司乃耳';
api.search.listeners.input({});
assert.ok(api.stops.flatMap(stop => stop.rows).filter(row => !row.li.hidden).some(row => row.lab.id === 'refraction-cart'));
ids['route-clear'].listeners.click({});

// 課本章節篩選
api.select.value = 'IV2';
api.select.listeners.change({});
assert.deepEqual(Array.from(api.stops.flatMap(stop => stop.rows).filter(row => !row.li.hidden).map(row => row.lab.id)).sort(), ['charged-particle', 'wire-magnetic-field']);
api.select.value = '';
api.select.listeners.change({});

// 主線篩選
const trunks = ids['route-trunks'].children;
assert.equal(trunks.length, 5);
trunks.find(item => item.textContent === '近代物理').listeners.click({});
assert.deepEqual(Array.from(api.columns.filter(column => !column.column.hidden).map(column => column.name)), ['近代物理']);
assert.equal(trunks.find(item => item.textContent === '近代物理').attrs['aria-pressed'], 'true');
// 先備跳轉會切回目標主線並展開
const quantum = api.stops.find(stop => stop.chapter.id === '4.5');
quantum.toggle.listeners.click({});
const jump = quantum.body.children.find(child => child.className === 'route-links').children[0].children.find(child => child.className === 'route-jump');
assert.match(jump.textContent, /^4\.3 /);
jump.listeners.click({});
assert.equal(api.stops.find(stop => stop.chapter.id === '4.3').item.attrs['data-open'], 'true');
trunks[0].listeners.click({});
assert.ok(api.columns.every(column => !column.column.hidden));

// 卡片標籤與探究活動
const lens = api.stops.flatMap(stop => stop.rows).find(row => row.lab.id === 'half-lens');
assert.equal(lens.li.children[0].href, 'mechanics.html#experiment=half-lens');
assert.ok(lens.li.children.some(child => child.className === 'route-lab-tags'));
assert.ok(lens.li.children.some(child => child.className === 'route-activity'), 'activity guide shown in route view');

// 檢視切換與記憶
ids['map-view-star'].listeners.click({});
assert.equal(ids['learning-map'].attrs['data-view'], 'star');
assert.equal(ids['route-view'].hidden, true);
assert.equal(store.get('physics-map-view'), 'star');
ids['map-view-route'].listeners.click({});
assert.equal(ids['learning-map'].attrs['data-view'], 'route');
assert.equal(open('', 'star').api.state.view, 'star', 'saved view restored');

// 深連結：#map-章節/實驗 會展開並標示該實驗
const linked = open('#map-3.2/charged-particle').api;
const magnet = linked.stops.find(stop => stop.chapter.id === '3.2');
assert.equal(magnet.item.attrs['data-open'], 'true');
assert.equal(magnet.rows.find(row => row.lab.id === 'charged-particle').li.attrs['aria-current'], 'true');

console.log('PASS course route: 4 trunks, 19 stops, 149 experiments; expand, search (aliases/textbook), textbook and trunk filters, prerequisite jumps, activities, view switch memory and deep links.');
