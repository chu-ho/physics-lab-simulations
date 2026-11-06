# 架構與檔案路由

本文件只說明依賴；任務入口用 `node tools/context.cjs --list`。實驗清單從 `Mechanics.defs` 動態取得，不在這裡再複製一份。

## 網頁的執行路由

```text
library.html + assets/library.js
  ├─ index.html                        獨立平面斜拋
  ├─ staircase-projectile.html          獨立階梯斜拋
  ├─ inclined-projectile.html           獨立斜面斜拋
  ├─ bungee.html → mechanics.html?experiment=bungee
  └─ mechanics.html?experiment=<id>     共用實驗
```

`assets/library.js` 從 `Mechanics.defs` 產生新實驗卡片。共用頁內的 `experiment` 下拉選單也來自同一份定義。普通新增模型不需要手動複製卡片；只有獨立入口或例外路由才改總覽程式。

## 共用頁的載入順序

原站運動學新題拆成 `models/airplane-drop.js`、`models/safe-parabola.js`、`models/relative-motion.js`、`models/shoot-monkey.js`。對應繪圖位於 `assets/scenes-<id>.js`，在通用場景之後、controls 初始化之前載入，通用場景的 case 負責轉呼叫。各題獨立物理驗證為 `verify-<id>.cjs`，也由 verify-all 執行。`docs/routes.json` 的 sceneExtensions、modelVerifiers 讓上下文路由直接帶到小檔案。

核心模型之後、應用程式之前載入 `models/extended-mechanics.js`（分布質量彈簧、腳踏車）及 `models/wave-optics.js`（雙狹縫）。擴充檔透過 `Mechanics.register` 註冊，最後一個參數記錄來源檔；Node 核心入口會載入相同擴充，避免瀏覽器與驗證器清單不同。新增領域優先放在對應擴充檔，路由工具依定義的 `source` 定位。

| 順序 | 檔案 | 責任／主要搜尋符號 |
|---|---|---|
| 1 | `mechanics-models.js` | 無 DOM 的模型、參數、教學內容；`add('id'`、`trajectory`、`integrated` |
| 2 | `assets/mechanics-app.js` | DOM、實驗切換、取樣、讀值、圖表與取景；`selectExperiment`、`setup`、`updateUI`、`drawPlot`、`fitCamera` |
| 3 | `assets/renderer.js` | 三維向量、相機、投影及繪圖原件；`project`、`polygon`、`segment`、`label`、`sphere`、`arrow` |
| 4 | `assets/mechanics-scenes.js` | 裝置與實驗場景；`apparatus` 的 `case`、`render`、`bungeeMarkers` |
| 5 | `assets/mechanics-controls.js` | 按鈕、手勢、動畫、匯出及初始化；`setPlotVisible`、`frame`、`zoom` |

這些是依序載入且共享 lexical scope 的傳統 script，不是獨立 ES modules。變更載入順序前先確認符號依賴，例如 `fitCamera` 依賴投影函式，初始化在最後執行。`mechanics-models.js` 另外支援 CommonJS，供 Node 驗證器使用。

## 畫面與樣式

`assets/mechanics-plots.js` 位於 app 之後、controls 之前載入，提供位置—能量多曲線與游標。一般時間圖仍由 app 繪製；額外圖表讀值透過 def.plotMetrics 擴充，不增加主畫面固定三項讀值的負擔。

```text
.workspace
  ├─ .simulation-column
  │    ├─ .viewport       3D canvas、視角按鈕、讀值、播放列
  │    └─ #plotPanel      獨立下方圖表；預設 hidden
  └─ .sidebar             參數、模型假設、公式、事件及匯出
```

- `assets/lab.css`：沿用原始 index 的共用設計；含響應式及 `.fullscreen`。
- `assets/mechanics.css`：共用實驗頁的覆寫、下方圖表及窄視窗調整。
- 三個獨立拋體頁面仍使用內嵌樣式與腳本，不會自動繼承共用頁的所有修改。只有明確跨頁需求才同步修改。

## 資料流

```text
參數拉桿 → params → def.build(params) → simulation
simulation.sample(time) → 讀值 / 3D 裝置 / 軌跡 / 圖表 / CSV
simulation.events / markers → 事件文字 / 高度標線
相機與圖表開關 → 只影響觀察及版面，不改物理時間
```

## 驗證依賴與產物

- `verify-mechanics.cjs`：新模型、守恆量、操作替身、圖表切換、投影邊界、總覽及 CSV；匯出 `domHarness`。
- `verify-projectile.cjs`：會先載入上項，再測原始平面斜拋。
- `verify-stairs.cjs`、`verify-incline.cjs`：獨立拋體的專用檢查。
- `verify-all.cjs`：組合上述入口，避免手動重複跑同一組檢查。
- `render-previews.cjs`：也會載入共用驗證器，使用 `@napi-rs/canvas` 產生離線 PNG。
- `artifacts/`：忽略版控、可重建。不是文件或模型來源。

## 共用波動核心

`models/wave-core.js`提供無DOM的諧波、有限cos⁴脈衝、反射與等張力介面匹配，必須先於使用它的模型載入。依賴寫入`docs/routes.json`的`modelDependencies`，context CLI會一併列出，check-context檢查兩個HTML的載入順序。`models/basic-waves.js`、`models/standing-waves.js`、`models/longitudinal-tube.js`、`models/string-interface.js`、`models/wave-polarization.js`、`models/wave-function.js`與`models/string-wave-energy.js`使用此核心。管內聲學以材質座標X計位移與壓力；繩介面接點需維持位移及等張力斜率連續。

`models/two-source-interference.js`為等幅二維徑向相位示意，不依賴一維wave-core，也不套用一維或精確二維水波PDE。節腹線按路徑差推導，與雙縫遠場屏幕模型不同。

`models/acoustic-core.js`提供無DOM的複數運算及阻尼一維受迫聲管解，需先於`models/resonance-column.js`載入，modelDependencies會列出。`models/vacuum-bell.js`是等溫定容質量平衡與示意聲耦合，並非PV等溫壓縮實驗。

`assets/mechanics-audio.js`在app前載入，只在明確啟用時建立音訊裝置；app.setup負責setExperiment，updateUI負責更新與靜音。音訊契約與故障處理在docs/PHYSICS.md；專用route為audio，mock驗證入口verify-audio.cjs。

`models/acoustic-core.js`另提供乾空氣soundSpeed(°C)與有限pulseEnvelope，供sound-speed／echo重用；models/sound-speed.js是靜止源單程延遲，models/echo.js是一次平面反射，不可冒充移動源都卜勒。

`models/doppler.js`重用聲速，另解均勻風下的移動源／接收者遲滯時間；不以當前位置方向替代發射波線。`models/sound-elements.js`同一Fourier係數產生畫面及PeriodicWave，屬schematic訊號觀察空間；後續頻譜／方波題應擴充重用。

`tools/dom-harness.cjs`為無測試副作用的共用Canvas／DOM支架。verify-mechanics與render-previews都直接使用；完整驗證仍由verify-all或verify-mechanics明確執行，預覽不隱式重跑全部物理測試。
