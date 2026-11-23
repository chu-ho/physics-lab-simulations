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

入口頁縮圖：`assets/thumbs/<實驗id>.webp`由`node tools/thumb-server.cjs`啟動本機伺服器後，在瀏覽器開啟它印出的`tools/capture-thumbs.html`按「開始產生」重新擷取（真實場景、預設參數）；新增實驗後須補縮圖，verify-mechanics會檢查。入口頁小橫列資料在`assets/highlights.js`（手動維護，library.js的mountShelves渲染）。

`assets/derivations.js`在app前載入，無DOM：以實驗id取出的Derivations函式接收params與simulation，回傳steps（title／text／math，算式代入參數）與checks（derived／simulated／tolerance或approx）。app.renderDerivation在setup後且推導面板展開時才計算；verify-derivations.cjs以多組參數檢查推導＝模擬。新增題目只需在此檔加一個函式。

`assets/param-levels.js`在app前載入，只放資料（ParamLevels：實驗id→參數id→最低層次1／2，未列為3）；app.selectExperiment建立拉桿時給每個label id `control-<參數>`，setupParamLevel／applyParamLevel依層次切換hidden，syncURL後重算提示。新增試做題只需在此檔加一筆，verify-mechanics會檢查id與參數存在。

`assets/mechanics-measure.js`在annotations後、controls前載入：尺／量角器／探針的點存為3D世界座標並放在開啟時最正對鏡頭的座標平面上，controls的pointer事件先交給annotation再交給measure（命中把手才攔截），mechanics-scenes的render在場景primitives之後呼叫drawMeasure()疊畫；碼錶讀模擬時間t。個別實驗探針寫在measureProbes（目前double-slit）。selectExperiment時measureReset()。

`assets/mechanics-audio.js`在app前載入，只在明確啟用時建立音訊裝置；app.setup負責setExperiment，updateUI負責更新與靜音。音訊契約與故障處理在docs/PHYSICS.md；專用route為audio，mock驗證入口verify-audio.cjs。

`models/acoustic-core.js`另提供乾空氣soundSpeed(°C)與有限pulseEnvelope，供sound-speed／echo重用；models/sound-speed.js是靜止源單程延遲，models/echo.js是一次平面反射，不可冒充移動源都卜勒。

`models/doppler.js`重用聲速，另解均勻風下的移動源／接收者遲滯時間；不以當前位置方向替代發射波線。`models/sound-elements.js`同一Fourier係數產生畫面及PeriodicWave，屬schematic訊號觀察空間；後續頻譜／方波題應擴充重用。

`tools/dom-harness.cjs`為無測試副作用的共用Canvas／DOM支架。verify-mechanics與render-previews都直接使用；完整驗證仍由verify-all或verify-mechanics明確執行，預覽不隱式重跑全部物理測試。

## 課本章節標籤

`assets/textbook-hanlin.js` 保存翰林版 108 課綱必修與選修Ⅰ–Ⅴ的章節，以及每個實驗 ID 對應的 1–3 個節次（第一個為主要章節）。library.html 與 mechanics.html 在 library.js／mechanics-app.js 之前載入；新增實驗時同步補上標籤，否則 `verify-textbook-tags.cjs` 會失敗。

## 學習地圖（入口）

library.html 的 `#learning-map` 由 `assets/atlas.js` 的 `mountAtlas` 掛載，載入順序為 learning-map.js → course-route.js → star-map.js → atlas.js → library.js。

| 檔案 | 責任 |
|---|---|
| `assets/learning-map.js` | 唯一的章節資料：`learningBranches`、`buildLearningMap`、`prerequisites`、`learningFocus`、`aliases`、`experimentPrerequisites`、`learningActivities` |
| `assets/atlas.js` | 共用篩選列（主線、搜尋、課本章節）、路線圖／星圖切換（localStorage 記憶）、`#map-章節/實驗` 深連結 |
| `assets/course-route.js` | `createCourseRoute`：四欄路線、19 個站點與實驗列表 |
| `assets/star-map.js` | `starLayout` 依資料計算星座版面（固定、無亂數）；`createStarMap` 處理 SVG 縮放平移、三層聚焦、標籤避讓與側欄 |
| `assets/atlas.css` | 入口、路線圖、星圖與備援樣式；星圖文字以 `--u`（每像素對應的座標單位）換算成固定螢幕大小 |

`#map-fallback` 是 `tools/build-map-fallback.cjs` 產生的無腳本章節清單，腳本載入後隱藏。修改章節資料後執行該工具，`verify-learning-map.cjs` 會以 `--check` 確認一致。驗證：`verify-learning-map.cjs`（資料）、`verify-course-route.cjs`（入口與路線圖）、`verify-star-map.cjs`（星圖）。

## 按需載入

實驗頁只固定載入 11 個共用檔（清單見 `assets/catalog.js` 的 `MechanicsStaticScripts`）；各實驗的模型、核心依賴與場景檔記錄在 `MechanicsCatalog[].files`，由 `assets/experiment-loader.js` 在解析階段以 `document.write` 依序插入（位於 mechanics-controls.js 之前，初始化流程維持同步），切換實驗時再動態載入缺少的檔案。總覽頁只讀 `catalog.js`，不載入任何模型程式。

- `tools/build-catalog.cjs` 由模型定義、`docs/routes.json` 的 modelDependencies／sceneExtensions、`mechanics-scenes.js` 的 kind 分支與場景函式引用產生 catalog；新增或修改實驗後執行，`--check` 驗證一致。共用程式呼叫場景函式時必須以 `def.kind`／`def.id`／`typeof` 保護，否則產生器會報錯。
- 實驗編號（PHYSICS LAB / NN、卡片序號）依 `mechanics-models.js` 的 require 順序，與原本 HTML 的載入順序一致。
- DOM 測試支架提供 `__loadScript`，載入器在測試中預設載入全部實驗檔案；`verify-loading.cjs` 以 `__isolatedExperiment` 讓每個實驗只載入自己的檔案，確認清單完整。
