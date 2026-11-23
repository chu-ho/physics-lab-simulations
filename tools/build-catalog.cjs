'use strict';
// 產生 assets/catalog.js：所有共用實驗的目錄資料（標題、分類、公式、探究問題）與按需載入所需的檔案清單。
// 檔案清單 = 核心依賴（docs/routes.json modelDependencies）＋ 被引用的其他模型 ＋ 模型檔 ＋ 場景檔（含場景間引用）。
// 用法：node tools/build-catalog.cjs        重新產生
//       node tools/build-catalog.cjs --check 確認 assets/catalog.js 與目前的模型、場景一致
//       node tools/build-catalog.cjs --report 列出每個實驗的檔案
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const Mechanics = require(path.join(root, 'mechanics-models.js'));
const routes = JSON.parse(read('docs/routes.json'));
const CORE = 'mechanics-models.js';
// 不屬於單一實驗、由實驗頁固定載入的檔案
const STATIC = ['mechanics-models.js', 'assets/catalog.js', 'assets/mechanics-audio.js', 'assets/textbook-hanlin.js',
  'assets/derivations.js', 'assets/param-levels.js', 'assets/mechanics-app.js', 'assets/mechanics-plots.js', 'assets/renderer.js', 'assets/mechanics-scenes.js', 'assets/mechanics-annotations.js', 'assets/mechanics-measure.js', 'assets/experiment-loader.js', 'assets/mechanics-controls.js'];
// 只被特定實驗使用、但不是 scenes-*.js 的輔助檔
const EXTRA = {'violin-fourier': ['assets/violin-import.js']};

const defs = Mechanics.defs;
const sourceOf = new Map(defs.map(def => [def.id, def.source || CORE]));
for (const def of defs) assert.ok(fs.existsSync(path.join(root, sourceOf.get(def.id))), def.id + ' source missing');

// 場景檔：定義的函式名稱
const sceneFiles = fs.readdirSync(path.join(root, 'assets')).filter(name => /^scenes-.*\.js$/.test(name)).map(name => 'assets/' + name).sort();
const strip = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
const sceneText = new Map(sceneFiles.map(file => [file, strip(read(file))]));
// 只有函式宣告會被其他檔案呼叫；const/let 多為區域變數，只把較長的名稱列為快取等共用狀態的候選
const definedIn = new Map();
const stateIn = new Map();
const addName = (map, name, file) => { if (!map.has(name)) map.set(name, new Set()); map.get(name).add(file); };
for (const [file, text] of sceneText) {
  for (const match of text.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) addName(definedIn, match[1], file);
  for (const match of text.matchAll(/(?:^|[;\n])(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)) if (match[1].length >= 8) addName(stateIn, match[1], file);
}
const ownNames = file => [...definedIn, ...stateIn].filter(([, files]) => files.has(file)).map(([name]) => name);
const escapeName = name => name.replace(/\$/g, '\\$');
// 名稱出現在程式中（排除屬性存取與字串內的同名詞）
const referenced = (text, name) => new RegExp('(^|[^\\w$.\'"-])' + escapeName(name) + '\\b(?![\'"-])').test(text);
// 名稱以函式呼叫出現
const called = (text, name) => new RegExp('(^|[^\\w$.\'"-])' + escapeName(name) + '\\s*\\(').test(text);
// 場景間引用（寬鬆估計：多載入無害，漏載才會出錯）
const sceneDeps = new Map();
for (const [file, text] of sceneText) {
  const own = new Set(ownNames(file));
  const deps = new Set();
  for (const [name, files] of [...definedIn, ...stateIn]) {
    if (own.has(name) || name.length < 4) continue;
    const others = [...files].filter(other => other !== file);
    if (others.length !== 1) continue; // 多個檔案都定義的名稱多半是區域變數
    if (referenced(text, name)) deps.add(others[0]);
  }
  sceneDeps.set(file, deps);
}

// 通用場景 switch：每個 kind 的分支用到哪些場景函式
const scenes = strip(read('assets/mechanics-scenes.js'));
const caseFiles = new Map();
const cases = [...scenes.matchAll(/case\s+'([\w-]+)'\s*:/g)];
cases.forEach((match, index) => {
  const end = index + 1 < cases.length ? cases[index + 1].index : scenes.length;
  const body = scenes.slice(match.index, Math.min(end, match.index + 4000));
  const files = new Set();
  for (const [name, owners] of definedIn) if (owners.size === 1 && name.length >= 4 && called(body, name)) files.add([...owners][0]);
  caseFiles.set(match[1], files);
});
// 固定載入的共用程式呼叫場景函式時，必須由 def.kind／def.id 或 typeof 判斷保護，只在該實驗開啟時執行
const guardedCalls = [];
for (const file of STATIC.filter(file => file.startsWith('assets/') && fs.existsSync(path.join(root, file)) && file !== 'assets/mechanics-scenes.js')) {
  const text = strip(read(file));
  for (const [name, owners] of definedIn) {
    if (owners.size !== 1 || name.length < 4) continue;
    for (const match of text.matchAll(new RegExp('(^|[^\\w$.\'"-])' + escapeName(name) + '\\s*\\(', 'g'))) {
      const before = text.slice(Math.max(0, match.index - 160), match.index);
      const guard = /def\.(kind|id)\s*===\s*'[\w-]+'|typeof\s+/.test(before);
      if (!guard) throw new Error(file + ' calls ' + name + ' from ' + [...owners][0] + ' without a def.kind/def.id/typeof guard');
      guardedCalls.push(file + ' → ' + name);
    }
  }
}

// 模型間引用：M.defs.find(d => d.id === 'other')
const modelRefs = new Map();
for (const file of new Set(sourceOf.values())) {
  if (file === CORE) continue;
  const ids = new Set([...strip(read(file)).matchAll(/d\s*\.\s*id\s*===\s*'([\w-]+)'/g)].map(match => match[1]));
  modelRefs.set(file, [...ids].filter(id => sourceOf.has(id) && sourceOf.get(id) !== file && sourceOf.get(id) !== CORE));
}

function filesFor(id, seen = new Set()) {
  const def = defs.find(item => item.id === id);
  const list = [];
  const add = file => { if (file && file !== CORE && !list.includes(file)) list.push(file); };
  for (const dep of routes.modelDependencies[id] || []) add(dep);
  const source = sourceOf.get(id);
  for (const other of modelRefs.get(source) || []) {
    if (seen.has(other)) continue;
    seen.add(id);
    for (const file of filesFor(other, seen).filter(file => !file.startsWith('assets/'))) add(file);
  }
  add(source);
  const visit = file => { for (const dep of sceneDeps.get(file) || []) { visit(dep); add(dep); } add(file); };
  const extension = routes.sceneExtensions[id];
  for (const file of [...(caseFiles.get(def.kind) || []), ...(extension ? [extension] : [])]) visit(file);
  for (const file of EXTRA[id] || []) add(file);
  return list;
}

const catalog = defs.map(def => ({
  id: def.id, title: def.title, group: def.group, kind: def.kind,
  formula: def.formula || '', question: (def.questions && def.questions[0]) || '',
  files: filesFor(def.id)
}));
// 每個場景檔都要被某個實驗用到，避免漏載
const used = new Set(catalog.flatMap(entry => entry.files));
const orphans = sceneFiles.filter(file => !used.has(file));
assert.deepEqual(orphans, [], 'scene files not reachable from any experiment: ' + orphans.join(', '));

if (process.argv.includes('--report')) {
  for (const entry of catalog) console.log(entry.id.padEnd(28), entry.kind.padEnd(26), entry.files.join(' '));
  process.exit(0);
}
const body = '\'use strict\';\n// 由 tools/build-catalog.cjs 產生，請勿手動修改。\n' +
  'const MechanicsCatalog = ' + JSON.stringify(catalog, null, 1).replace(/\n\s*/g, ' ').replace(/\}, \{/g, '},\n{').replace(/^\[ /, '[\n').replace(/ \]$/, '\n]') + ';\n' +
  'const MechanicsStaticScripts = ' + JSON.stringify(STATIC) + ';\n' +
  'if (typeof module === \'object\' && module.exports) module.exports = {MechanicsCatalog, MechanicsStaticScripts};\n';
const target = path.join(root, 'assets/catalog.js');
if (process.argv.includes('--check')) {
  assert.equal(fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '', body, 'Run node tools/build-catalog.cjs');
} else fs.writeFileSync(target, body);
console.log('PASS: catalog of ' + catalog.length + ' experiments, ' + used.size + ' on-demand files, ' + sceneFiles.length + ' scene files reachable.');
