'use strict';
// 按需載入：每個實驗在獨立頁面中只載入 catalog.js 列出的檔案，仍能建立模型、在整段時間繪製場景與圖表。
// 另驗證 catalog.js 與模型一致、實驗頁與總覽頁不再載入全部模型。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const {domHarness} = require('./tools/dom-harness.cjs');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const Mechanics = require('./mechanics-models.js');
const {MechanicsCatalog, MechanicsStaticScripts} = require('./assets/catalog.js');

execFileSync(process.execPath, [path.join(__dirname, 'tools/build-catalog.cjs'), '--check'], {stdio: 'pipe'});
assert.deepEqual(MechanicsCatalog.map(entry => entry.id), Mechanics.defs.map(def => def.id), 'catalog order matches model order');
for (const entry of MechanicsCatalog) {
  const def = Mechanics.defs.find(item => item.id === entry.id);
  assert.equal(entry.title, def.title);
  assert.equal(entry.group, def.group);
  for (const file of entry.files) assert.ok(fs.existsSync(path.join(__dirname, file)), entry.id + ' missing ' + file);
}

const scriptsOf = html => [...html.matchAll(/<script src="([^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1]);
const page = read('mechanics.html');
assert.deepEqual(scriptsOf(page), MechanicsStaticScripts, 'mechanics.html loads only the shared core');
const library = scriptsOf(read('library.html'));
assert.ok(library.length <= 8 && !library.some(file => file.startsWith('models/')), 'library.html does not load model code');

let worst = {id: '', count: 0};
for (const entry of MechanicsCatalog) {
  const {sandbox} = domHarness(page);
  sandbox.__isolatedExperiment = entry.id;
  sandbox.location.hash = '#experiment=' + entry.id;
  for (const file of MechanicsStaticScripts) vm.runInContext(read(file), sandbox, {filename: file});
  const loaded = vm.runInContext('Mechanics.defs.map(d => d.id)', sandbox);
  assert.equal(vm.runInContext('def.id', sandbox), entry.id, entry.id + ' selected on load');
  assert.ok(loaded.length <= 32 + 4, entry.id + ' loaded only its own models: ' + loaded.length);
  try {
    vm.runInContext(`for (const f of [0, .2, .5, .8, 1]) { t = f * simulation.duration; dirty = true; render(); }
      setPlotVisible(true); collectPlotSamples(); if (typeof drawPlot === 'function') drawPlot(); setPlotVisible(false);`, sandbox);
  } catch (error) {
    throw new Error(entry.id + ' fails with only [' + entry.files.join(', ') + ']: ' + error.message);
  }
  // 下拉選單仍列出全部實驗，編號依目錄順序
  assert.equal(vm.runInContext("$('experiment').children.reduce((n, g) => n + g.children.length, 0)", sandbox), MechanicsCatalog.length);
  assert.equal(vm.runInContext("$('overline').textContent", sandbox), 'PHYSICS LAB / ' + String(MechanicsCatalog.indexOf(entry) + 4).padStart(2, '0'));
  if (entry.files.length > worst.count) worst = {id: entry.id, count: entry.files.length};
}
const original = 240;
const largest = MechanicsStaticScripts.length + worst.count;
console.log('PASS on-demand loading: ' + MechanicsCatalog.length + ' experiments each run with only their own files; page loads ' + MechanicsStaticScripts.length + '–' + largest + ' scripts (was ' + original + '), library ' + library.length + ' (was 124).');
