# 模型與驗證契約

只有更動模型、數值、事件或新增實驗時需要讀本檔。圖表版面及文字小修可直接走任務路由。

## 定義一個共用實驗

`mechanics-models.js` 以 `add(id, title, group, kind, params, metrics, formula, note, questions, build)` 註冊模型。

- `id` 唯一、穩定，用於 URL、選單、總覽和 CSV 檔名；不要為改標題改掉既有 ID。
- `kind` 是 `assets/mechanics-scenes.js` 的場景分支；不一定等於 ID。多個實驗可共用裝置。
- `params` 用 `P(...)` 定義拉桿；預設值必須在上下限內，且符合 step。
- `metrics` 目前固定三項，對應播放列時間以外的三個讀值；每項 key 必須在所有時間都有有限數值。
- `formula`、`note`、`questions` 必須與實作一致；至少兩個能由操作探索的問題。
- `build(params)` 回傳可重播的 simulation，不能依賴 DOM，也不能以累積播放狀態產生不同答案。
- 純顯示參數可加 `visual:true`。它只影響場景繪製，切換不重建 simulation 或重設時間；若影響 sample、力學或讀值，不能使用此旗標。

## Simulation 與 state

擴充模型使用 `Mechanics.register`，並填入來源檔路徑。共用 helper 位於 `Mechanics.helpers`。靜態光學分布可提供 `plotAxis={key,label,unit}`，以取樣座標代替時間橫軸；教學掃描時間不代表光的傳播時間。

`def.plotMetrics` 可增加下方圖表選項，主讀值仍為三項；額外 key 必須在所有取樣時間有限。`simulation.positionPlot` 可提供 `{min,max,key,label,unit,series:[{key,label,color,value(x)}]}`，用於位置—能量圖；series 的能量與 sample 對應狀態必須一致。圖形模式切換只影響觀察，保留時間與播放。繪製程式位於 `assets/mechanics-plots.js`。

- `duration`：非負、有限；終止條件及觀察時間在介面說明。
- `sample(t)`：同一組參數及時間必須回傳同一結果；時間裁切到有效範圍。
- 基本 state：`x, y, z, vx, vy, vz, fx, fy, fz`。採 SI、y 向上；力是實際模型所定義物體的合力，不是隨意示意方向。
- 額外數值（如第二物體座標、能量、張力）放 state；CSV 會收集首尾 state 的數值 key。若有中途才出現的欄位，確保匯出也包含。
- `events`：至少 `{t, label}`；可供時間進度與側欄顯示。事件要按時間排序。
- `endLabel`：選用的停止提示，例如接觸前瞬間。不要暗中把碰撞後靜止速度當成碰撞前速度。
- 現有高空彈跳另有 `markers`：`{key,t,y,label,color}`，供高度標線使用；`elasticHeight` 是純彈力平衡參考高度。

## 數值與物理原則

- 有簡單解析解時優先使用；非線性才用現有 RK4 / 三次 Hermite 插值。
- 不把改變視角當成改變受力；箭頭、圖示及物體大小的示意比例須明示。
- 接觸、碰撞、鬆繩及張力改變要考慮事件邊界。不能以粗時間格直接冒充精確事件時刻。
- 不能把不適用的守恆量強行套用：有摩擦／阻尼時能量會耗散，有內部致動器時機械能未必守恆。
- 事件高度與時間從 `sample` 的軌跡求得。無轉折、未觸及高度、提前觸地時，不建立假的事件。
- 靜力學與教學近似須明示，不強制做成不存在的真實動態。

## 高空彈跳的重點

- 模型 ID／kind 都是 `bungee`。先解析自由落體，在首次拉直時接上積分；張力 `T ≥ 0`。
- `e = max(0,h-y-L)`；純彈力是 `ke`，阻尼作用後的總拉力是 `T = max(0,ke-cvᵧ)`（鬆繩時為零）。
- 純彈力平衡參考高度：`h-L-mg/k`。這不是有阻尼運動的固定合力零點。
- `T = mg` 才是合力零；`vᵧ = 0` 且由負轉正才是最低轉折點。阻尼模型在繩拉直時可能有力的不連續，不能把跨越不連續的變號誤認成真實零點。
- 應驗證自由落體段、接繩速度連續、無阻尼能量與最低點解析解、阻尼耗散、張力非負、精確觸地停止及事件求根。

## 驗證的選擇

| 變更 | 最小合理檢查 |
|---|---|
| 單一新模型／新場景 | 加入獨立解析或物理不變量檢查，跑 `node verify-mechanics.cjs` |
| 共用數值、控制或投影 | `node verify-all.cjs` |
| 單一獨立拋體頁面 | 對應的 `verify-*.cjs`；注意平面斜拋 verifier 會載入共用檢查 |
| 圖表展開／收起 | 檢查預設隱藏、展開可繪製、收起隱藏、時間與播放狀態不變，再查 CSS 結構 |
| 視覺／取景 | 必要的離線預覽加實際瀏覽器代表性操作；若工具不可用，明確區分已驗證與未驗證 |
| 只有文件／路由 | `node tools/check-context.cjs`，不重跑物理模型 |

成功的測試是證據，不是規格本身。新增題目需要新增有意義的驗證；不要只修改預期數量讓測試變綠。

## 位移相圖

可用 `simulation.phasePlot={xKey,yKey,xLabel,yLabel,unit}` 提供兩狀態量的參數曲線；由全程plotSamples繪製，當前狀態以橘點標示。模式選項在setup依simulation能力建立；切換僅更新顯示，不重建模型或重設時間。相圖與時間圖均保留在預設隱藏的下方圖表。

## 微觀顯示與播放尺度

狀態與sample時間仍採SI。可設定 `simulation.displayScale` 將point投影到顯示座標，並用 `displayLengthUnit` 標示格線；bounds亦採顯示座標。`minimumSceneScale`可取代預設9m的最小取景範圍。`playbackScale`為每播放秒前進的物理秒數，單步同樣套用；時間軸仍保留物理秒。`scientificNumbers`使微小非零讀值顯示科學記號。CSV依播放尺度取樣，微小非零值以科學記號保存；參數輸入單位由parameter_units列出。自訂原子場景用point轉換位置，勿把顯示nm寫回SI物理狀態。

## 分布圖與觀察座標

`simulation.histogramPlot.data(state,params)`回傳 `{min,max,width,series:[{label,color,bins,theory}],xLabel,unit,densityUnit,N}`；bins為密度而非個數，必須驗證Σbins×width=1。`def.defaultPlotMode=distribution`只決定展開後圖形，不自動展開。`displayPoint(state,params)`可提供速度空間等純觀察座標，不能更改sample中的SI狀態；同時給bounds涵蓋兩種觀察，並以hideGrid(params)隱藏不適用的長度刻度。

## 模式能量柱狀圖

`simulation.barPlot.data(state,params)`回傳 `{labels,values,expected,unit,title}`。柱高為樣本／系綜值，分段虛線為同單位理論比較值。`def.defaultPlotMode=bars`只設定展開後圖形；不預設顯示圖表。每次drawPlot明確clearRect，避免原生離線Canvas在同尺寸重設後保留舊筆跡。

## 保留播放的物理參數

`p.preservePlayback=true`用於需要連續比較的物理參數，例如振動方向角。它會重新build、更新plotSamples與箭頭比例，再把t截到新duration內並還原未結束的播放狀態；不等同`visual:true`，後者不重建模型也不更改SI樣本。方向角變換需驗證物理向量分量及暫停狀態，不能把改變實際運動分量包裝成純顯示。

## 動態空間能量圖

positionPlot可指定title與yUnit（預設能量對位置／J）；dynamic:true以目前時間的空間分布標示圖例。每個series.value(x,state)可依當前SI狀態重算空間分布，series.visible()可控制分量。隱藏分量只影響曲線，不改模型或時間。繩上能量密度採J/m、整段積分採J；不得把單質點SHM位能當成繩的彈性位能。

## 可選聲音與聲學時間

模型可提供`simulation.audio(state,params)=>({frequency,gain,type})`，frequency採物理Hz、gain為0–1示意幅度、type可為sine、triangle或harmonics（Fourier係數見下節）。`assets/mechanics-audio.js`只在使用者按啟用後建立／恢復AudioContext；updateUI同步更新，暫停／seek／結束靜音，重新build或換題關閉。不能把動畫playbackScale乘到音高；音量非校準聲壓。無API或resume失敗應保留動畫。聲學微小位移與毫秒時間可用scientificNumbers，CSV仍採SI。`node tools/context.cjs --task audio`定位聲音控制與mock驗證。

## 聲音延遲與包絡

`M.Acoustics.soundSpeed(temperatureC)`使用乾空氣√(γRT/M)，必須先轉Kelvin；拒絕絕對零度以下。`pulseEnvelope(time,start,duration)`提供有限sin²包絡；前緣不等於空氣質點。可用`def.defaultPlotMetric`指定展開時間圖的初始觀察量，避免聲速等靜態讀值掩蓋抵達包絡。純音包絡提示不自動等同相干聲壓疊加，人耳回聲辨識門檻須明示為教學近似。

## Fourier合成音訊

音訊描述可用`type: "harmonics"`搭配`harmonics:[a1,...]`（正弦係數），或`real/imag`含DC索引0，對應Σ(real[n]cos+imag[n]sin)，DC忽略。PeriodicWave使用disableNormalization保留振幅，係數表快取；超過裝置Nyquist的高次被裁除，不改基頻，基頻本身不可表示則靜音。聲音三要素的噪音用同一帶限部分音表，無「一邊白噪音、一邊不同波形」替代。`positionPlot.scopeLabel`可為時間觀察窗提供圖例，游標必須在該窗內；慢放波形相位不與實時音訊游標強行同步。

### 空值與不連續的位置類圖表

positionPlot.series的value可回傳null，表示該點物理量無有限定義；範圍、折線及目前標記均略過。可提供breakBetween(a,b)在兩個橫軸取樣間遇到奇異點時斷線，即使端點都是有限值也不連接。這不放寬主metrics／plotMetrics的有限數值契約；可空量留在專用曲線，CSV以空白欄輸出。使用例：dancing-image的焦點像速度。

### 多透鏡空氣中ABCD核心

models/ray-matrix.js提供RayMatrix：multiply、propagate、lens、apply、system與trace。光線向+x，向量[高度m,近軸斜率]，矩陣按實際順序左乘；system從x=0參考面至最後啟用元件，trace另檢查口徑。optical-instruments在物平面加入P(u)，v=−B/D，D=0時無有限像；有限物的眼靠末元件角放大參考為0.25/B（裸眼角度定義為−h/0.25），不等於橫向放大1/D。無限遠望遠鏡僅C=0時使用D為角放大率。關閉眼球薄鏡不搬動眼鏡模式的既定視網膜位置。

### 構圖重取景與天空地板

參數refit:true可在該控制變動後完整取景；visual參數仍保留時間及播放，物理參數仍按既有規則重建。simulation.hideFloor可為布林或params函式，僅關閉裝飾棋盤地板，hideGrid仍控制格線與標籤。rainbow的全圓視圖以動態bounds與hideFloor呈現地平線以下角錐，不改光學樣本。

## 雙點電荷場與場圖

`models/two-charges.js`的PointCharges.solve採SI：q為C、位置m、V為V、E為N/C；距點電荷零距離回傳null，不軟化庫侖核。教學控制nC須乘1e-9。場線採歸一化E的RK4方向積分，非粒子軌跡；反向追蹤負電荷時箭頭仍沿E。場圖近區省略與壓縮地形不得回寫物理值。截面等位線不是完整等位面，軸對稱場線可繞兩電荷軸旋轉。觀察點讀值與播放掃描點分開，圖表scanPotential/scanField對應後者。獨立驗證負電位梯度、高斯球面通量及同號/偶極中點極限。

## 天文時間與尺度

四個天文模型的共用時間列為動畫秒，狀態另提供sidereal/day/elapsedDays等讀值及圖軸；各模型note必須明示動畫秒到物理日/恆星小時的換算。球體半徑與軌道距離可能分開放大，角度、月相與蝕判定不可從畫面距離反推。sun-earth-moon的km幾何與shadowScale展示分離，陰影近軸半徑與目標中心截面判定不等於地表可見範圍或實際星曆。
