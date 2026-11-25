# 學生試玩總整理（2026-11-25）

10 位「學生」子代理以 agent-browser 實際開啟、播放、拉極端值、開圖表、切視角並**看截圖**，試玩全部 161 個實驗與總覽頁。各組完整報告在 [reports/](reports/)。

**總結**：各組都以公式抽查讀數，**數值幾乎全部正確**；問題集中在「畫面與數字不一致」。全站約 50 項嚴重、約 190 項中等問題，其中很多是共用程式造成的同一類問題，修一次可以改善幾十個實驗。

標記：✅ = 協調者已親自看截圖或程式確認；其餘為學生回報、修前需再重現。

---

## A. 全站共通問題（優先：一次修好、影響面最大）

| # | 問題 | 出現組別 | 可能位置 |
|---|---|---|---|
| A1 | **改參數後相機不重新取景**：拉桿推到極端，物體飛出畫面或跑到畫面頂端外；手動按「完整取景」才正常（有些實驗連按「完整取景」也沒用）。 | 1,2,3,4,5,10 | 共用相機／`setup()` 後的取景 |
| A2 | **原點 xyz 軸與 −4～4 m 地面刻度預設顯示**，和實驗標籤、物體重疊；近代物理用 nm／fm 尺度時特別違和；電磁實驗的刻度不隨場景縮放，會誤導尺寸判讀。 | 1,4,6,7,9,10 | `assets/renderer.js` / `mechanics-scenes.js` 網格標籤 |
| A3 | **3D 標籤互相重疊**（doppler、sound-elements、xray-bragg、dimensional-analysis、longitudinal-tube、bicycle-friction 等）。 | 全部 | 共用 `label()` 缺避讓 |
| A4 | **能量條「U 以最低點為零」與 HUD 總機械能矛盾**：✅ thermal-lattice 的 U 被平移到約 1e-34 J（原因不是單位錯誤，而是系綜平均 U 幾乎不變，扣掉最小值後只剩誤差）；binary-stars、orbit、projectile-cone 的總能量顯示為正，但教學重點是負的束縛能量；vertical-spring 能量條顯示 10 J，HUD 卻是 0.38 J。 | 3,4,6 | ✅ `assets/mechanics-app.js:39` `setupEnergy()` |
| A5 | **預設顯示橘色位置線**（與 AGENTS.md「不預設顯示位置／位移向量」衝突），conveyor-friction 中方向還與摩擦力相反，容易誤導。 | 5 | 顯示選項預設值 |
| A6 | **「正視」沿著裝置平面看**，畫面只剩一條線（moving-atwood、projectile-explosion、resonance-bank、spring-atwood、光學多個實驗、carnot-engine）。 | 4,5,6,8 | 各場景的 front 視角定義 |
| A7 | **開圖表後 HUD 和能量條蓋住約 1/3 的 3D 場景**（moving-atwood 會蓋住重物）。 | 4,5,7 | `lab.css` 版面 |
| A8 | **腳本載入失敗時 3D 區靜默空白**，切換實驗選單也是空的（`ReferenceError: render is not defined`）。共 3 次（emf-power、plane-mirror、某次 mechanics-scenes.js）；協調者冷啟動 3 次沒有重現，推測發生在多人同時請求時。至少要顯示錯誤提示與「重新載入」按鈕。 | 2,8,9 | `assets/experiment-loader.js`、`mechanics-controls.js:7` |
| A9 | **讀數格式**：整數顯示兩位小數（72.00 顆、5.00 次）；浮點殘差直接顯示（-4.95e-18 m）；小量顯示成 0.00（r=0.000207 m）；角度不取模（506°）。 | 1,2,7,9 | 共用 `format()` |
| A10 | **圖表**：下拉選單寫「位置—能量圖」但內容不是；單位留空括號「()」；預設觀察量是常數時只畫出一條水平線；y 軸範圍退化。 | 1,4,6,7,8 | `mechanics-plots.js` |
| A11 | **近代物理沿用力學模板**：顯示選項有軌跡、合力箭頭、參考系「地面／平台」，說明寫「所有距離採 SI」。 | 10 | 依實驗類型隱藏不適用的選項 |
| A12 | 開關型參數用 0～N 拉桿加文字代碼（「0凸透鏡／1凹透鏡…」），不直覺；建議改成下拉選單或分段按鈕。 | 6,8 | 參數定義 |

## B. 個別實驗的嚴重問題

**物體穿模／幾何錯誤**
- ✅ atwood：上升物塊撞進橫樑；滑輪是巨大圓環、沒有輪軸，而且穿過橫樑。
- table-pulley：桌子沒有桌腳；滑輪不在桌緣；繩子和重物穿過桌板。
- elevator：a<0 時電梯穿過地面，乘客卻留在原處。
- massive-pulley：重物最後撞進滑輪才結束。
- spring-atwood（疑似）：結束時左側重物可能穿入地面約 1 m。
- angular-momentum：收臂時手持物嵌進身體；高轉速時出現車輪效應；看不到 L 向量。
- vertical-circle：球在最低點時沉進地板一半。
- belt-wheels：B 輪被同軸 C 輪擋住，皮帶穿過盤面。
- conveyor-friction：箱子在立體視角下陷進半透明輸送帶（疑似透明物件的繪製順序問題）。
- slip-or-tip：斜面幾乎看不見，懸在空中。
- joule-experiment：重錘落地後，繩子與滑輪脫開或整條消失。

**光學形狀與方向錯誤**
- ✅ image-drawing：凹面鏡與凸面鏡的曲面畫反（光線與像的位置正確）。
- ✅ half-lens、optical-parallax、dolly-zoom：透鏡圓環平躺在地上，沒有垂直於主軸（疑似同一個 torus 方向 bug）。
- michelson：沒有畫出分光鏡到屏幕的輸出光束。
- prism-dispersion（疑似）：畫面上光已經射出，文字卻寫「無法由右面射出」。

**現象看不見或不一致（教學核心）**
- electroscope：金箔張角最大 3.5°，看不出張開。
- parallel-capacitor：εr 從 1 變到 8，沒有畫介電質，場線也不變。
- eddy-current：時間顯示播放秒數而不是物理時間，會讀錯「導電管掉得比較慢」這個重點。
- blackbody-radiation：只有兩顆顏色固定的球，3000 K 呈青綠色。
- matter-wave：沒有電子槍和雙縫，也看不出條紋。
- carnot-engine：P–V 圖畫在 3D 平面上，只有側視看得到完整循環。
- two-source-interference、newton-rings、straw-cup、sphere-lens：網格解析度低，摩爾紋看起來像假條紋。
- xray-bragg：標籤疊成一團；強度圖在 θ=0° 有一個峰（疑似把 n=0 當成反射）。
- measurement-uncertainty、dimensional-analysis：資料點和公式標籤疊在座標刻度上，讀不出來。
- bicycle-friction：摩擦力箭頭不在觸地點；1.5 N 和 63 N 的箭頭一樣長。
- torque：半徑線 z-fighting，看不出盤子在轉；預設不顯示切向力。
- 牛頓定律組：預設沒有受力箭頭；friction 只有合力箭頭，沒有分力。
- work：沒有外力 F 箭頭。
- gravitation-g 模式 1：地球塞滿畫面，看不到探測器。
- rutherford-scattering：軌跡太小，按「完整取景」沒有效果。
- sound-speed：拉距離拉桿，場景完全不變。

## C. 總覽頁
- 學習地圖與「全部實驗」有兩個搜尋框，結果不同步；搜「X光」找不到「X 射線」。
- 從實驗頁回總覽，搜尋字和捲動位置都不見。
- 「切換實驗」選單有 161 項且沒有分組（optgroup）；總覽頁寫 164 個，數量對不上。
- 頁面過長：桌面約 2.6 萬 px，手機約 7.2 萬 px。

## D. 建議修正順序
1. **A1 自動取景、A2 座標刻度預設隱藏或縮放、A8 載入失敗提示**：都在共用程式，影響面最大。
2. **A4 能量條零點、A5 位置線預設關閉、A9 讀數格式**：都是小改動，可以消除數字矛盾。
3. **B 組幾何錯誤**：torus 方向、凹凸鏡曲面、穿模，逐實驗修正並加視覺回歸截圖。
4. **B 組教學核心現象**：electroscope、parallel-capacitor、blackbody、matter-wave 等，需要重新設計畫面。
5. A3 標籤避讓、A6 正視方向、A7 版面、C 總覽頁。

## 試玩方法（可重複使用）
- 用獨立的 `python -m http.server <port> --directory <repo>` 提供網站（注意舊埠可能還在提供舊 worktree 的檔案）。
- 每位學生使用獨立的 `agent-browser --session <name>`，截圖後用 Read 讀 PNG 檢視畫面；任務說明見本次 scratchpad 的 student-brief.md（核心步驟：初始畫面 → 播放 → 拉桿推到極端 → 開圖表 → 切視角 → 看 console → 手機寬度）。
- 10 位學生並行時會撞到 5 小時用量上限，續跑要分批或改用較小的模型。

---

## 修正進度（分支 `claude/playtest-fixes`）

**已修正並截圖確認**
- 共通：A1 自動重新取景、A2 網格與座標軸預設關閉、A3 標籤避讓、A4 能量條零點、A6 平面裝置停用正視、A7 圖表展開保留 3D 高度、A8 載入失敗提示、A9 讀數格式、A10 圖表名稱與空單位。
- A8 的根因：`python -m http.server` 在 Windows 會偶發掉檔（8 次冷啟動失敗 3 次）；改用 `node tools/serve.cjs`（0 次），`.claude/launch.json` 已更新。
- 幾何：ring() 缺 yz 平面（half-lens、optical-parallax、dolly-zoom）、image-drawing 凹凸面鏡、atwood／massive-pulley 滑輪、table-pulley 桌腳與滑輪、elevator 穿地、slip-or-tip 實心斜面、conveyor 箱子陷入帶面、joule 繩子、michelson 輸出光束。
- 細節：electroscope 張角示意放大、parallel-capacitor 介電質與場線密度、ballistic 擺角取模、eddy-current 顯示物理時間、xray-bragg θ=0 假峰。
- 取景與標示（第二輪）：rutherford-scattering 只框軌跡平面並由上方俯看；sun-earth 取景收緊；sound-speed 距離拉桿會改變場景中的距離；bicycle-friction 摩擦箭頭畫在觸地點並按比例；torque 施力箭頭常駐、盤面圖樣跟著轉；angular-momentum 手持物與身體分開並加 L 箭頭；belt-wheels 輪 C/D 移到前方不再遮擋。
- 教學內容：牛頓定律組（friction、incline、atwood、table-pulley、elevator）與 work 勾選「合力」時畫出各分力（施力、摩擦、正向力、重力、張力）與合力，共用同一比例，畫在物體朝向鏡頭的一面。
- 重新設計：blackbody-radiation 球色依溫度、場景內畫兩溫度光譜與峰值、可見光帶、掃描波長；carnot-engine 正對 P–V 平面並填色標出淨作功面積；matter-wave 加入電子槍、雙縫板、光束示意，落點改為方點並在屏上方即時累積直方圖。
- 總覽頁：兩個搜尋框共用同一比對規則並互相同步（「X光」→「X射線」、忽略空白與全半形，並納入學習地圖別名）；從實驗頁返回保留搜尋字與捲動位置；標題數字說明 164 = 161 個 3D 實驗＋3 個拋體專頁。實驗選單分組已由 main 的 #24 完成。

**查證後不是錯誤**
- thermal-lattice「單位錯 10¹⁵ 倍」：實際是能量條零點平移造成（已在 A4 修正）。
- vertical-circle「球沉入地板」：球半徑 0.3、環底 y=0.3，球剛好接觸地面。
- A5「預設顯示位置線」：那是運動軌跡，不是位置向量。

**尚未處理**
- 解析度與疊紋：two-source-interference、newton-rings、straw-cup、sphere-lens。
- 標籤擁擠：xray-bragg、dimensional-analysis、measurement-uncertainty。
- 待核對：prism-dispersion 文字與畫面是否一致；moon-earth 月相是否鏡像。
- 共通介面：近代物理沿用力學模板的顯示選項（A11）、開關型參數改為選單（A12）；這兩項會動到大量實驗的參數與顯示選項，建議另開一輪處理。
- 總覽頁過長（桌面約 2.6 萬 px）。
- matter-wave 與 blackbody 場景在預設取景下偏小（共用取景較保守），可再調。
