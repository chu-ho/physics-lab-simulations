'use strict';
// 學習地圖章節資料與無腳本備援：四主線十九章、每個實驗恰好一個歸屬、先備無循環、探究活動與別名有效，
// 備援清單與資料一致（tools/build-map-fallback.cjs --check）。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const {domHarness} = require('./tools/dom-harness.cjs');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const html = read('library.html');
const {sandbox} = domHarness(html);
sandbox.window.addEventListener = () => {};
for (const [, source] of html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)) vm.runInContext(read(source), sandbox, {filename: source});

const catalogue = vm.runInContext('experiments', sandbox);
const chapters = vm.runInContext('buildLearningMap(experiments)', sandbox);
const branches = vm.runInContext('learningBranches.map(([name]) => name)', sandbox);
assert.deepEqual(Array.from(branches), ['力學', '波動與光學', '電與磁', '近代物理']);
assert.equal(chapters.length, 19);
const placed = chapters.flatMap(chapter => chapter.topics.flatMap(topic => topic.labs.map(lab => lab.id)));
assert.equal(placed.length, catalogue.length, 'every experiment placed exactly once');
assert.equal(new Set(placed).size, catalogue.length);

const ids = new Set(catalogue.map(lab => lab.id));
const chapterIds = new Set(chapters.map(chapter => chapter.id));
const prerequisites = vm.runInContext('prerequisites', sandbox);
const visited = new Set();
function visit(id, trail = new Set()) {
  assert.ok(chapterIds.has(id), 'unknown chapter ' + id);
  assert.ok(!trail.has(id), 'prerequisite cycle at ' + id);
  if (visited.has(id)) return;
  for (const parent of prerequisites[id] || []) visit(parent, new Set([...trail, id]));
  visited.add(id);
}
for (const id of chapterIds) visit(id);
const focus = vm.runInContext('learningFocus', sandbox);
assert.deepEqual(Object.keys(focus).sort(), [...chapterIds].sort(), 'every chapter has a learning level and guidance');
for (const [level, guidance] of Object.values(focus)) assert.ok(['高中入門', '高中深化', '進階'].includes(level) && guidance.trim());
for (const [id, steps] of Object.entries(vm.runInContext('learningActivities', sandbox))) {
  assert.ok(ids.has(id), 'activity for unknown experiment ' + id);
  assert.ok(steps.length >= 3 && steps.every(step => step.trim()));
}
for (const [id, links] of Object.entries(vm.runInContext('experimentPrerequisites', sandbox))) {
  assert.ok(ids.has(id));
  for (const [parent, reason] of links) assert.ok(ids.has(parent) && parent !== id && reason.trim());
}
for (const id of Object.keys(vm.runInContext('aliases', sandbox))) assert.ok(ids.has(id), 'alias for unknown experiment ' + id);

// 無腳本備援：與資料一致，並在腳本載入後隱藏
execFileSync(process.execPath, [path.join(__dirname, 'tools/build-map-fallback.cjs'), '--check'], {stdio: 'pipe'});
assert.ok(html.includes('id="map-fallback"') && html.includes('<!-- end map fallback -->'));
console.log('PASS learning map data: 4 trunks, 19 chapters, ' + catalogue.length + ' experiments placed once, acyclic prerequisites, valid levels/activities/aliases, static fallback in sync.');
