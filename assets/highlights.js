/* Entry-page shelves: 從這裡開始 (curated starters) and 最近更新 (newest first). Hand-maintained data only. */
'use strict';
// 新增或更新實驗時，把它加到 recent 最前面（日期用 YYYY-MM-DD）；超過 12 筆時刪掉最舊的。
// verify-mechanics 會檢查每個 id 都存在。
const LibraryHighlights = {
  start: [
    { id: 'acceleration', note: '先從位置、速度、加速度三張圖開始' },
    { id: 'incline', note: '畫力圖、判斷會不會滑，有推導分頁' },
    { id: 'pendulum', note: '能量條看位能與動能互換' },
    { id: 'spring', note: '簡諧運動的週期與能量' },
    { id: 'double-slit', note: '用探針讀亮暗紋的光程差' },
    { id: 'two-charges', note: '電場、電力線與等位線' }
  ],
  recent: [
    { id: 'michelson', date: '2026-11-24', note: '新增' },
    { id: 'newton-rings', date: '2026-11-24', note: '新增' },
    { id: 'em-wave', date: '2026-11-22', note: '新增' },
    { id: 'xray-bragg', date: '2026-11-22', note: '新增' },
    { id: 'millikan-oil-drop', date: '2026-11-22', note: '新增' },
    { id: 'cathode-ray', date: '2026-11-22', note: '新增' },
    { id: 'current-balance', date: '2026-11-22', note: '新增' },
    { id: 'emf-power', date: '2026-11-22', note: '新增' },
    { id: 'gravitation-g', date: '2026-11-22', note: '新增' },
    { id: 'power-hoist', date: '2026-11-22', note: '新增' },
    { id: 'measurement-uncertainty', date: '2026-11-22', note: '新增' },
    { id: 'dimensional-analysis', date: '2026-11-22', note: '新增' }
  ]
};
if (typeof module !== 'undefined' && module.exports) module.exports = { LibraryHighlights };
