'use strict';
// 實驗頁的按需載入：依 assets/catalog.js 只載入目前實驗需要的模型、核心依賴與場景檔。
// 開頁時在解析階段以 document.write 依序插入，因此在 mechanics-controls.js 初始化之前就已執行完畢；
// 切換實驗時再以 <script> 依序動態載入。沒有 document.write 的環境（DOM 測試支架）視為檔案已由呼叫端載入。
const ExperimentLoader = (() => {
  const byId = new Map(MechanicsCatalog.map(entry => [entry.id, entry]));
  const loaded = new Set();
  const pending = new Map();
  const canWrite = typeof document !== 'undefined' && typeof document.write === 'function' && document.readyState === 'loading';
  let assumeLoaded = !canWrite;

  function requestedId() {
    if (typeof location === 'undefined') return '';
    const fromHash = new URLSearchParams((location.hash || '').slice(1)).get('experiment');
    return fromHash || new URLSearchParams(location.search || '').get('experiment') || '';
  }
  function has(id) { return byId.has(id); }
  function files(id) { return byId.has(id) ? byId.get(id).files.slice() : []; }
  function isReady(id) {
    if (!byId.has(id)) return true;
    if (assumeLoaded) return true;
    return byId.get(id).files.every(file => loaded.has(file));
  }
  function inject(file) {
    if (loaded.has(file)) return Promise.resolve();
    if (pending.has(file)) return pending.get(file);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = file;
      script.async = false;
      script.onload = () => { loaded.add(file); pending.delete(file); resolve(); };
      script.onerror = () => { pending.delete(file); reject(new Error('無法載入 ' + file)); };
      document.head.append(script);
    });
    pending.set(file, promise);
    return promise;
  }
  // 依序載入（後面的檔案可能依賴前面的核心或模型）
  function load(id) {
    return files(id).reduce((chain, file) => chain.then(() => inject(file)), Promise.resolve());
  }
  function writeInitial() {
    if (!canWrite) return;
    const entry = byId.get(requestedId()) || MechanicsCatalog[0];
    for (const file of entry.files) {
      document.write('<script src="' + file + '"><\/script>');
      loaded.add(file);
    }
  }
  return {has, files, isReady, load, writeInitial, requestedId, loaded, get assumeLoaded() { return assumeLoaded; }, set assumeLoaded(value) { assumeLoaded = Boolean(value); }};
})();
ExperimentLoader.writeInitial();
// DOM 測試支架（tools/dom-harness.cjs）提供 __loadScript：預設依目錄順序載入全部實驗檔案，等同完整頁面；
// 設定 __isolatedExperiment 時只載入該實驗的檔案，用來驗證按需載入的檔案清單完整。
if (typeof __loadScript === 'function') {
  const isolated = typeof __isolatedExperiment === 'string' ? __isolatedExperiment : '';
  const all = [];
  for (const entry of isolated ? MechanicsCatalog.filter(item => item.id === isolated) : MechanicsCatalog)
    for (const file of entry.files) if (!all.includes(file)) all.push(file);
  for (const file of all) { __loadScript(file); ExperimentLoader.loaded.add(file); }
  if (isolated) ExperimentLoader.assumeLoaded = false;
}
