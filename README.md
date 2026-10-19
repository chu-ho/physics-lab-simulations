# 物理互動實驗室 / 3D

沿用深色控制面板、薄荷綠操作色與淺色 3D 場景，涵蓋高中與大一普通物理的 35 個運動學、力學核心經典問題。無外部網路依賴，直接以瀏覽器開啟即可使用。

## 開始使用

開啟 [實驗總覽](library.html)，以主題分類或關鍵字搜尋。既有拋體頁面右上方也有「全部實驗」入口。

- 拖曳場景可自由旋轉，滾輪或雙指縮放；也能用方向鍵與加減鍵。
- 播放、暫停、重設、0.05 秒單步與時間拉桿可觀察任一時刻。
- 新增 32 個實驗支援完整取景、跟隨物體、速度／合力箭頭、可選觀察量的時間圖表與全程 CSV。圖表預設收起，播放列的「顯示圖表／隱藏圖表」按鈕可在 3D 視窗下方展開或收起圖表，不遮住場景。位置向量不預設顯示。
- 修改參數會重設運動；不自動更動鏡頭，可按「完整取景」重新取景。
- 每個實驗的側欄列出單位、公式與模型假設；「操作與探究」提供操作說明及兩個探究問題。
- 槓桿為靜力學量測，播放不會讓失衡槓桿自行轉動；各模型的停止條件見側欄。

## 實驗索引

### 原有拋體系列

| 實驗 | 內容 |
|---|---|
| [平面斜拋](index.html) | 初速、仰角、方位角、高度與重力 |
| [階梯斜拋與反彈](staircase-projectile.html) | 等寬等高階梯、恢復係數、反彈位置紀錄與 CSV |
| [斜面上的斜拋](inclined-projectile.html) | 相對斜面發射、坡面落點與離面高度 |

### 運動學

- [等加速度直線運動](mechanics.html?experiment=acceleration)
- [自由落體與鉛直上拋](mechanics.html?experiment=vertical)
- [渡河與相對速度](mechanics.html?experiment=river)
- [追及與會車](mechanics.html?experiment=pursuit)
- [空氣阻力與終端速度](mechanics.html?experiment=drag)

### 牛頓定律

- [水平受力與靜、動摩擦](mechanics.html?experiment=friction)
- [斜面滑動與摩擦](mechanics.html?experiment=incline)
- [阿特伍德機](mechanics.html?experiment=atwood)
- [桌面物塊與懸掛重物](mechanics.html?experiment=table-pulley)
- [電梯與視重量](mechanics.html?experiment=elevator)

### 能量與動量

- [變力作功與動能定理](mechanics.html?experiment=work)
- [無摩擦軌道與能量守恆](mechanics.html?experiment=energy-track)
- [一維碰撞與恢復係數](mechanics.html?experiment=collision)
- [彈道擺](mechanics.html?experiment=ballistic-pendulum)
- [火箭與變質量](mechanics.html?experiment=rocket)
- [二維偏心碰撞](mechanics.html?experiment=collision-2d)
- [質心與內力](mechanics.html?experiment=center-of-mass)

### 圓周與轉動

- [等速圓周運動](mechanics.html?experiment=circular)
- [傾斜彎道](mechanics.html?experiment=banked)
- [圓錐擺](mechanics.html?experiment=conical)
- [鉛直圓環與能量](mechanics.html?experiment=vertical-circle)
- [固定軸轉動與力矩](mechanics.html?experiment=torque)
- [斜面純滾動](mechanics.html?experiment=rolling)
- [槓桿平衡與合力矩](mechanics.html?experiment=lever)
- [收臂旋轉與角動量](mechanics.html?experiment=angular-momentum)
- [有轉動慣量的滑輪](mechanics.html?experiment=massive-pulley)

### 振動

- [高空彈跳](bungee.html)：跳台高度、繩長、質量、彈性與阻尼；繩索只能拉不能推，到達地面即停止。

- [彈簧簡諧運動](mechanics.html?experiment=spring)
- [阻尼振動](mechanics.html?experiment=damped)
- [受迫振動與共振](mechanics.html?experiment=driven)
- [單擺與大角度擺動](mechanics.html?experiment=pendulum)

### 萬有引力

- [萬有引力與軌道](mechanics.html?experiment=orbit)

## 模型與教學約定

所有物理量採 SI 單位，世界座標 y 軸向上。3D 指可自由觀察的三維場景；有些經典問題的運動仍受平面或直線約束。球體與物塊的視覺大小依模型可能為示意。箭頭以面板列出的比例繪製；速度與力使用不同尺度。

除個別題目的摩擦、阻尼與空氣阻力外，不另加入耗散。碰撞題顯示恢復係數；單擺的大角度與鉛直圓環採剛性約束，避免把鬆繩情況誤認成有效繩擺。軌道採可調 GM 的教學尺度。

解析解用於等加速、碰撞、滑輪、火箭等模型；非線性擺動、軌道與振動採 RK4，基準時間步長 1/240 秒，軌道按時間尺度縮小步長。回放以三次 Hermite 插值降低能量與速度的插值誤差。

## 驗證

執行 `node verify-all.cjs`，不需安裝第三方套件：

- 32 個新模型共 614 組參數組合，包括每個拉桿端點、同時極值與固定種子的混合設定。
- 解析參考值、動量與能量守恆、摩擦臨界條件、F = ma、軌道能量與角動量、阻尼耗散、受迫振動功率及 RK4 收斂。
- 新實驗的繪圖與播放、暫停、回放、參數更新、視角、追蹤、重設、說明與 CSV 操作流程；總覽搜尋、分類與本機連結。
- 原有平面斜拋 360 組、階梯 48 組、斜面斜拋 240 組參數檢查。

`node render-previews.cjs` 可用 @napi-rs/canvas 產生 32 個新場景的離線點陣預覽至 artifacts/（此目錄不納入版控）。這是繪圖程式輸出，不是瀏覽器截圖，也不能代替真實版面檢查。

## 檔案結構

- library.html、assets/library.js：可搜尋的實驗總覽。
- mechanics.html：32 個新實驗的共用操作頁面，以 experiment 查詢參數切換。
- mechanics-models.js：獨立於 DOM 的物理模型、參數與教學內容。
- assets/lab.css、assets/mechanics.css：共用設計與響應式介面。
- assets/renderer.js：3D 座標、透視投影與繪圖原件。
- assets/mechanics-app.js、assets/mechanics-scenes.js、assets/mechanics-controls.js：讀值圖表、場景與操作。
- CURRICULUM.md：完整課程清單與共通驗收條件。
- QA.md：驗證範圍、證據與限制。
