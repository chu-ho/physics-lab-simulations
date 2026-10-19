# 驗證紀錄

日期：2026-10-20（Asia/Taipei）。

## 範圍與證據

| 驗收項目 | 證據 |
|---|---|
| 原有設計語言與操作架構 | assets/lab.css 沿用 index 的樣式；共用頁保留場景、側欄、底部讀值、時間軸與播放控制 |
| 35 個核心經典問題 | CURRICULUM.md 的 35 項對應原有三個 HTML 與 mechanics-models.js 的 32 個模型；總覽連結檢查涵蓋全部入口 |
| 每題均為實際模型 | 每個模型有參數、單位、sample(time)、三個讀值、公式、假設、兩個探究問題與對應 3D 裝置 |
| 參數有效性 | 新模型 614 組：預設、每一個拉桿兩端、同時極值及固定種子混合值；所有讀值與繪圖座標為有限值，預設值符合 range 的 step |
| 物理正確性 | 解析參考值、動量、能量、質心、角動量、摩擦臨界值、F = ma、滑輪繩長／張力／力矩、阻尼能量與驅動功率等獨立檢查 |
| 數值方法 | RK4 加三次 Hermite 插值；與解析簡諧解比較並以減半步長驗證收斂；檢查軌道 GM、半徑與速率比的端點組合 |
| 新頁操作 | 32 題逐一執行實際 JS 的播放、暫停、回放、單步、重設、參數更新、視角、跟隨／完整取景、說明對話框及 CSV 流程；另驗證桌面及 390 × 480 場景的投影取景邊界 |
| CSV 與檔案 | 32 份匯出檢查欄數一致、無 NaN／Infinity／undefined；所有總覽入口與 HTML 引用的本機檔案存在 |
| 原有頁面 | 平面斜拋 360 組的落點與能量；階梯 48 組的地形穿透；斜面斜拋 240 組的落點、穿透及水平面極限 |
| 3D 場景畫面 | render-previews.cjs 使用真正 Canvas 點陣繪圖，逐題輸出到 artifacts/scenes-*.png；依預覽改善取景與裝置邊界 |
| 瀏覽器代表性操作與版面 | 使用者在目前瀏覽器重新整理、進入總覽並開啟新實驗後，回覆「正常顯示與操作」 |

執行 `node verify-all.cjs` 重現自動驗證。執行 `node render-previews.cjs` 產生離線場景預覽（需要 @napi-rs/canvas；Codex 工作環境已有）。

## 證據的限制

- 自動操作檢查使用 DOM 測試替身，能驗證實際程式的事件與狀態轉換，不能證明瀏覽器排版的每個像素。
- 離線場景預覽只驗證 3D 繪圖，不包含 CSS 面板，也不是瀏覽器截圖。
- 瀏覽器工具拒絕 file: 協定，未繞過該限制；實際瀏覽器的代表性確認來自使用者。尚未逐一在所有螢幕尺寸／瀏覽器組合進行截圖比對。
- 測試不表示數值模型為任意精度解；各題的理想化假設、終止條件及例外均於介面標明。尤其大角度擺採剛性擺桿、圓環採雙面導軌、階梯低速接觸採停止近似，不能直接當成其他接觸條件的模型。

## 核心題目對應

原有：平面斜拋 → index.html；階梯斜拋 → staircase-projectile.html；斜面斜拋 → inclined-projectile.html。

新增模型 ID：acceleration、vertical、river、pursuit、drag、friction、incline、atwood、table-pulley、elevator、work、energy-track、collision、ballistic-pendulum、rocket、circular、banked、conical、vertical-circle、torque、rolling、lever、spring、pendulum、damped、driven、orbit、collision-2d、center-of-mass、angular-momentum、massive-pulley、bungee。

每個 ID 皆可用 mechanics.html?experiment=ID 直接進入，並可從實驗總覽或下拉選單切換。

## 圖表版面更新

圖表改為 3D viewport 後方的獨立區塊，預設 hidden；播放列按鈕以 aria-expanded 與 aria-controls 表達狀態。32 題均驗證展開時能繪製圖表、收起時隱藏，且保持模擬時間與播放狀態。短視窗也可主動開啟圖表，不再由高度媒體查詢強制隱藏。

## 高空彈跳

自由落下使用解析解，在繩索首次拉直的時刻接上 RK4。張力取非負值，避免繩索推動人物。驗證鬆繩階段與自由落體相符、拉直時速度連續、無阻尼時最低點符合能量解析解、阻尼不增加機械能、張力非負，以及繩長超過跳台高度時在地面準確停止。依原有圖表設定，預設隱藏、展開於 3D 視窗下方。

高空彈跳高度標記：以數值軌跡的交點求出首次繩索拉直、純彈力 ke = mg、總拉力 T = mg、首次最低點與反彈最高點。檢查各標記的時間及高度與取樣一致、最低點速度為零且由下落轉為上升、力平衡事件符合對應力相等。含阻尼時區分純彈力與總拉力，避免把合力為零誤認成最低點；未發生的轉折不建立事件。
