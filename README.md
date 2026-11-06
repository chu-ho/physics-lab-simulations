# 物理互動實驗室 / 3D

沿用深色控制面板、薄荷綠操作色與淺色 3D 場景，涵蓋高中與大一普通物理的 56 個運動學、力學與波動光學問題。無外部網路依賴，直接以瀏覽器開啟即可使用。

## 開始使用

[物理學習地圖](library.html#learning-map) 以力學、波動與光學、電與磁、近代物理四個主幹展開。點選章節可查看概念、建議先備與實驗，也可直接搜尋「腳踏車煞車」「鏡頭遮一半」或「光電管」。

開啟 [實驗總覽](library.html)，以主題分類或關鍵字搜尋。既有拋體頁面右上方也有「全部實驗」入口。

- 拖曳場景可自由旋轉，滾輪或雙指縮放；也能用方向鍵與加減鍵。
- 播放、暫停、重設、0.05 秒單步與時間拉桿可觀察任一時刻。
- 新增 39 個實驗支援完整取景、跟隨物體、速度／合力箭頭、可選觀察量的時間圖表與全程 CSV。圖表預設收起，播放列的「顯示圖表／隱藏圖表」按鈕可在 3D 視窗下方展開或收起圖表，不遮住場景。位置向量不預設顯示。
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

- 53 個共用模型共 1137 組參數組合，包括每個拉桿端點、同時極值與固定種子的混合設定。
- 解析參考值、動量與能量守恆、摩擦臨界條件、F = ma、軌道能量與角動量、阻尼耗散、受迫振動功率及 RK4 收斂。
- 新實驗的繪圖與播放、暫停、回放、參數更新、視角、追蹤、重設、說明與 CSV 操作流程；總覽搜尋、分類與本機連結。
- 原有平面斜拋 360 組、階梯 48 組、斜面斜拋 240 組參數檢查。

`node render-previews.cjs` 可用 @napi-rs/canvas 產生 53 個共用場景的離線點陣預覽至 artifacts/（此目錄不納入版控）。這是繪圖程式輸出，不是瀏覽器截圖，也不能代替真實版面檢查。

## 檔案結構

- library.html、assets/library.js：可搜尋的實驗總覽。
- mechanics.html：53 個共用實驗的共用操作頁面，以 experiment 查詢參數切換。
- mechanics-models.js：獨立於 DOM 的物理模型、參數與教學內容。
- assets/lab.css、assets/mechanics.css：共用設計與響應式介面。
- assets/renderer.js：3D 座標、透視投影與繪圖原件。
- assets/mechanics-app.js、assets/mechanics-scenes.js、assets/mechanics-controls.js：讀值圖表、場景與操作。
- CURRICULUM.md：完整課程清單與共通驗收條件。
- QA.md：驗證範圍、證據與限制。

## 後續開發與上下文入口

先讀 [AGENTS.md](AGENTS.md)，再按任務取得最小相關檔案，無需重翻全部實驗與對話：

```text
node tools/context.cjs --list
node tools/context.cjs bungee
node tools/context.cjs pendulum
node tools/context.cjs --task chart
```

- [架構與執行路由](docs/ARCHITECTURE.md)：檔案責任、script 載入順序與資料流。
- [模型與驗證契約](docs/PHYSICS.md)：物理、事件、狀態及測試的要求。
- [工作與交接流程](docs/WORKFLOWS.md)：新增題目、修正與長時間計畫的續作方式。
- [長計畫索引](docs/plans/INDEX.md)：只載入目前相關的活動計畫。

路由工具動態尋找行號，不自動讀入整份來源或執行模擬。修改文件、符號或入口後，以 `node tools/check-context.cjs` 檢查文件連結、模型與場景映射及 CLI 路由。

## 全站重建與新增實驗

原站 116 個不重複題目已逐頁記錄（97 HTML5、18 Flash 截圖、1 圖片／EXE 入口）。[來源圖文索引](research/haha90-audit/index.html)、[全部製作進度](research/haha90-audit/IMPLEMENTATION.md)。清單記錄不代表復刻完成。

- [有質量彈簧](massive-spring.html)：12 段分布質量、形變與模態週期；有效質量 mₛ/3 僅作近似比較。
- [雙狹縫干涉](double-slit.html)：屏距、波長、縫寬、縫距、縫長與二維遠場光強；下方圖表為線性光強，屏幕亮度另作對比增強。
- [腳踏車輪子摩擦力](bicycle-friction.html)：後輪驅動、前後輪獨立煞車、兩輪摩擦力方向與純滾動。

新模型已通過自動檢查與離線場景檢視；本機瀏覽器操作尚待驗收。原站各題功能對照與重建繼續按追蹤表逐項進行。

### 原站重建第一批

- [飛機投彈](airplane-drop.html)：分次投放、水平同步與逐球落地。
- [安全拋物線](safe-parabola.html)：等初速拋體族、同時圓及頂點橢圓。
- [雙球相對運動](relative-motion.html)：四個參考系，切換保留時間與播放。
- [射猴子](shoot-monkey.html)：同時釋放、解析命中、碰撞後共同拋體與來不及命中的情況。

以上已具實際模型與入口，尚非原站所有控制完整驗收。已知差異保存在全站追蹤表。

### 原站重建第二批

- [斜面投影](incline-shadow.html)：可調平行光與坡角，解析影子速度／加速度。
- [最佳拋射角](optimal-projectile.html)：任意發射高度、上下坡面與最佳角同步對照。
- [圓周與簡諧投影](shm-projection.html)：同步正交投影與速度／加速度，顯示切換不重設。

射猴子已加入完全非彈性碰撞及撞擊光圈，子彈嵌入後一起落下；質量各1kg，命中動量守恆。

### 原站重建第三批

- [鉛直彈簧](vertical-spring.html)：重力與彈性位能、平衡點等效位能及水平對照。
- [飛輪組](belt-wheels.html)：四輪半徑、同軸與兩組無滑動皮帶、圈數比。
- [滑下或倒下](slip-or-tip.html)：有限塊體的臨界比較及有效接觸範圍內的滑動／翻倒。

既有水平彈簧的下方圖表新增位置—能量圖，同時顯示K、U、E及當前位置；圖形切換保留播放與時間。

### 原站重建第四批

- [堆木塊](block-stack.html)：逐層偏移、靜力推移、子堆質心與最大懸伸。
- [把自己拉起來](self-pull.html)：腳下動滑輪、人台受力與離地門檻。
- [四重物阿特伍機](moving-atwood.html)：雙動滑輪、三繩約束與四物體聯立。
- [輸送帶摩擦](conveyor-friction.html)：等加速／週期帶速、黏住／滑動切換及摩擦熱。

原站掉落、彈簧／人物模式、換組態與抬箱等差異仍在追蹤表，不代表原站所有控制完成。

### 原站重建第五批

- [過彎傾身](bike-turn.html)：平衡傾角、無轉向自穩的傾倒與接觸／摩擦限制。
- [斜拋空中爆](projectile-explosion.html)：兩碎塊、B瞬停、內能轉動能與空中質心。
- [光滑斜面反衝](recoiling-wedge.html)：自由／固定楔形、接觸力、動量及能量。
- [人走船退](person-boat.html)：指定平滑行程、質心、反向船速、往返與漂移。

模型適用範圍與原站未對齊模式逐項列於追蹤表。

新增：[環球碰撞](ring-ball.html)，可調球／環質量比、初速、偏心與恢復係數，觀察自由圓環內的連續碰撞。

新增：[鉛直半圓軌道](half-circle.html)（單面接觸、脫離與拋體）及[拉線軸](pulled-spool.html)（仰角、摩擦與左右滾動臨界）。

[圓錐擺與角動量](conical.html)：沿用原圓錐擺，新增參考點及受力／角動量／力矩切換。

新增：[離心力與柯氏力](noninertial.html)，以自由質點比較平移加速、旋轉與綜合座標中的假想力。

新增：[桌子上有洞](hole-table.html)，懸掛重物與桌面球由固定長度的繩耦合，觀察半徑、張力、角動量及能量。

[直線碰撞](collision.html)新增「接觸」拉桿：0為瞬時碰撞，1為有限時間的彈性彈簧接觸，可調彈簧常數。

[二維碰撞與自轉](collision-2d.html)已加入兩球速度與方向、自轉、接觸摩擦及切向不滑模式。

[行星軌道與距離指數](orbit.html)已加入N=−1到4、自適應步長、對數位能及面積速率圖表，可比較平方反比與進動軌道。

新增：[雙星互繞與總機械能](binary-stars.html)，兩星共同運動，質量比、近日／遠日距離比及質心漂移可調。

新增：[洲際斜拋與球面落點](intercontinental.html)，採球形星球與平方反比引力，可調發射仰角及相對圓軌道初速。

新增：[平拋與圓錐曲線](projectile-cone.html)，同一引力軌道可切換球體／圓錐對照，觀察圓、橢圓與拋物線。

新增：[水平彈簧雙振子：貼牆釋放](wall-spring-pair.html)，調整初始壓縮量，觀察牆支撐消失與雙塊離牆運動。

新增：[彈簧木塊與細線：剪線比較](spring-wire-cut.html)，並排比較剪斷支撐後的加速度與連接力。

新增：[落下物體壓彈簧](falling-spring.html)，並排比較兩種質量的接觸、最大壓縮、分離與重複彈跳。

新增：[鉛直雙振子壓放與離地](vertical-spring-pair.html)，比較壓力與總重量，觀察離地、落地及後續跳動。

[阻尼振盪](damped.html)已改為鉛直彈簧與阻尼器裝置，新增阻尼比、臨界係數、受力與耗能觀察。

新增：[受迫振盪：十振子共振比較](resonance-bank.html)，調整共同底板頻率、振幅與阻尼，比較不同自然頻率的反應。

新增：[耦合振盪與能量交換](coupled-oscillators.html)，可獨立設定兩球初值，展開圖表後可選左右位移相圖。

新增：[彈簧阿特伍機](spring-atwood.html)，可調兩側質量、支承彈簧及初始伸長，同時觀察支點升降與相對運動。

新增：[質點撞棒](ball-rod.html)，比較自由棒／固定上端與彈性／撞後合體，觀察平動、轉動與碰撞耗能。

新增：[桌下彈跳球：平動與自轉](rough-bounce.html)，比較光滑／理想粗糙表面，以及地面／桌底反彈的速度交換。

新增：[焦耳實驗：功與水溫上升](joule-experiment.html)，重錘帶動攪拌器，量測位能、吸熱、動能與水溫。

新增：[熱運動：固體晶格振動](thermal-lattice.html)，可調溫度、粒子質量與彈簧常數；畫面採nm、每播放秒代表1ps，CSV保留SI。

新增：[理想氣體模型與壁面壓力](ideal-gas.html)，支援100–1000粒子、互撞切換、標記粒子追蹤及壁面衝量壓力量測。

新增：[氣體分子速率分布](maxwell-distribution.html)，支援100–5000粒子、分量／速率／動能直方圖與理論曲線，並可切換3D速度空間。圖表預設隱藏，展開後顯示分布。

新增：[能量均分：平動轉動與振動](equipartition.html)，切換單原子／剛性雙原子／可振動雙原子，展開圖表比較模式能量，也可單看一個分子。

新增：[鉛直絕熱汽缸壓縮比較](adiabatic-pistons.html)，支援汽缸／彈簧或雙汽缸、左右加壓時間與阻尼；目前採均勻絕熱近似。

新增：[基礎波動](basic-waves.html)，可切換波浪舞、橫波、縱波、水波、固定／自由端反射及粗細繩交界。

新增：[駐波與波的疊加](standing-waves.html)，比較兩個反向行波與合成波，調整振幅比、波長、波速、相位及追蹤點，觀察脈衝干涉與波節／波腹。

新增：[管內縱波](longitudinal-tube.html)提供行波、駐波、閉口／開口反射與管內模態，並列壓力擾動及位移節腹；[A繩入B繩](string-interface.html)可調密度比，查看反射／透射振幅與能量比例。

新增：[橫波變縱波](wave-polarization.html)可在同一時間連續調整振動方向，切換粒子陣列與SHM比較；[橫波波函數](wave-function.html)可切換時空曲面、y-x空間波形及y-t時間曲線。

新增：[橫波的力學能](string-wave-energy.html)比較左右行波與駐波的動能／彈性位能密度和能流；[雙點波源干涉](two-source-interference.html)提供可調源距與相位的時變波面、節線和腹線。

新增：[共鳴氣柱](resonance-column.html)可調水位與音叉頻率，查看受迫響應及共鳴長度；[玻璃罩抽氣鈴聲](vacuum-bell.html)比較抽氣、進氣、封閉及漏氣。聲音預設關閉，按「開啟聲音」後僅播放中發聲，音訊用物理Hz。

新增：[聲速與溫度](sound-speed.html)以冷熱控制乾空氣聲速，觀察聲音何時抵達另一座山；[山壁與回聲](echo.html)可調山壁距離、發聲時間及反射，觀察原聲／回聲是否重疊。兩題可手動啟用純音提示，展開圖表預設顯示接收包絡。

新增：[都卜勒效應](doppler.html)分開設定聲源、觀察者與風速，觀察波面及接收音高；[聲音三要素](sound-elements.html)調整基頻、振幅與諧波音色，並比較帶限噪音、波形、頻譜和RMS。音訊需手動啟用。

新增：[方波傅立葉](fourier-square.html)呈現六排奇次諧波圓投影及部分和；[平面鏡成像](plane-mirror.html)判定有限鏡面內的反射與虛像可見性；[兩人同鏡](shared-mirror.html)比較身高、眼高及共用最小鏡面區間。

新增：[雙鏡成多像](double-mirror.html)可調夾角、鏡長、眼睛與物體位置，逐像查看有限鏡面的多次反射及手性。

新增：[曲面鏡反射](conic-mirror.html)比較球面像差、拋物面平行光會聚、橢圓雙焦點及雙曲虛焦點；可調口徑、尺度及光源。

曲面鏡新增「最多反射次數」拉桿，1至12次；紅點表示達上限後下一撞鏡位置，軸交點分散讀值仍只統計第一次反射。

新增：[成像作圖](image-drawing.html)提供四種薄透鏡／面鏡、物距／物高／焦距及各光線顯示，明示焦點無限遠；附世界座標手繪、撤回及清除。

新增：[折射的原因](refraction-cart.html)以雙輪車跨越快慢介面，觀察兩輪先後改速、折射、臨界掠射與折返；可調輪距、速度及角度。

折射雙輪車新增七色色散比較與色散強度；各色共用時間並沿用解析跨界模型，可比較部分顏色折返、其餘透射。速度比為明示教學函數。

新增：[多層折射](layered-refraction.html)可調四層折射率、入射角及位置，觀察逐界面折射、臨界掠射與全反射返回；第4預設依原站可見截圖重建。

新增：[杯中吸管](straw-cup.html)用目前3D視角追跡圓柱／長方形液體容器的折射外觀，可調水深、折射率與吸管傾角，疊加真實位置比較。

新增：[視深與實深](apparent-depth.html)求取兩條折射光線的反向交點，雙方向比較真實、表觀及近軸距離；可調物體、眼端及取樣間距。

新增：[球形透鏡](sphere-lens.html)以精確球面光線追蹤切換外看內／內看外，調整折射率及內部位置，觀察全反射視區。

新增：[Fresnel方程](fresnel.html)比較s、p、非偏振與線偏振混合的反射／透射功率，提供E／相對cB示意、全反射相位及下方角度掃描圖。

新增：[眼看透鏡成像](eye-lens.html)以有限鏡孔逆向追跡六種近軸元件的外觀，提供非對稱圖案與鏡外構圖像；面鏡請轉至物體側觀察。

新增：[成像之舞](dancing-image.html)讓物體與透鏡各自簡諧、等速或圓周運動，比較像速／加速度及共軛位置；焦點處圖表斷線、匯出留空。

新增：[透鏡遮一半](half-lens.html)按剩餘圓孔面積追跡每個物點到屏幕，觀察遮半後完整變暗、離焦孔徑光斑；提供點／十字／三色與固定曝光。

新增：[視差法找成像位置](optical-parallax.html)可左右擺頭、調整標示棒，對照自由3D與圖中眼睛所見；實像與虛像都能比較無視差位置。

新增：[光學儀器](optical-instruments.html)以ABCD多透鏡模型提供望遠鏡、顯微鏡、放大鏡與簡化眼鏡預設，物鏡／目鏡可調焦距、凸凹、口徑及間距，區分橫向與角放大率。

新增：[虹與霓](rainbow.html)提供主／次虹3D觀察角錐與單水滴光路，可調太陽仰角、色散、偏心距及平地／全圓，內反射支路使用Fresnel功率。

新增：[希區考克變焦](dolly-zoom.html)比較只移動、同步變焦及只變焦，主環維持大小時背景透視仍改變；可切攝影機畫面與自由3D構圖。

雙狹縫模型已擴充狹縫面內旋轉、雷射小角度斜入射，以及兩縫各自薄片折射率／厚度；相位差會改變條紋，保留同一實驗入口。

- [方孔、圓孔與多孔陣列](aperture-pattern.html)：二維遠場干涉繞射，可調孔數與幾何。
- [干涉繞射電場疊加](diffraction-amplitudes.html)：觀察孔徑分量、複數電場及合成強度。

- [光柵](optical-grating.html)：廣角穿透/反射級次與波前。
- [光的三原色](rgb-lights.html)：RGB加色與CMY濾片減色。
- [金箔驗電器](electroscope.html)：感應、接觸及接地流程。
- [雙點電荷](two-charges.html)：電場、電力線、等位線與電位地形。

### 使用者新增的三個模擬

- [小提琴傅立葉分析與合成](violin-fourier.html)：各泛音振幅、分量波形、合成聲與本機錄音分析。
- [方塊入水與浮力振盪](floating-block-shm.html)：從水面上落下，或切換平衡附近的簡諧情境。
- [小角度與大角度單擺比較](pendulum-angle-comparison.html)：同初始條件比較近似、完整運動及週期修正。

### 天文模擬

- [天球模型](celestial-sphere.html)：緯度、赤經赤緯、地方恆星時與周日軌跡。
- [日地運動](sun-earth.html)：地軸、公轉、自轉、四季、晝夜與極晝夜。
- [月地運動](moon-earth.html)：同步自轉、恆星月/會合月與地球所見月相。
- [日地月與日蝕月蝕](sun-earth-moon.html)：交點、傾角、本影/半影/偽本影及四種預設情境。
