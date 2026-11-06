# 全站物理動畫重建

## 原始目標

把好好玩物理網左側所有物理動畫記錄並逐一重建，沿用本專案的 JavaScript、架構、規則、繁體中文與既有 UI。另加入使用者要求：有質量滑輪／彈簧；可調屏距、波長與狹縫長寬的雙狹縫；腳踏車前後輪的摩擦力方向。

## 狀態與範圍

進行中。116 個唯一原站動畫＋6 個使用者方向，完整範圍不得縮成力學子集或第一批成果。來源檢查已完成：97 個 HTML5、18 個 Flash 僅截圖、1 個圖片／EXE 入口。Flash 的重建從可見說明與截圖建立物理及互動規格，不執行 Flash。

## 最小續作上下文

- `research/haha90-audit/implementation-plan.json`：每一項需求、狀態、模型 ID、證據與下一步的權威追蹤。
- `research/haha90-audit/IMPLEMENTATION.md`：可快速掃描的完整清單。
- `research/haha90-audit/index.html`：原站逐項內容與截圖。
- 依項目 sourceId 讀 `results.json` 的單項，不全文讀所有原站記錄。
- 既有相近實驗只是相關參考，不代表復刻完成；每項必須做功能對照。

## 階段

1. [x] 全站記錄與截圖，逐頁檢查，去除重複 URL。
2. [ ] 先完成使用者三個新增方向，為後續光學及分布系統建立共用能力。
3. [ ] 依原站分類／項目順序，逐題建立功能對照、實作及驗證；保留全部 116 項。
4. [ ] 全清單核對、操作與視覺回歸、文件及路由同步。

## 當前檢查點

本地125題：122共用模型、3獨立拋體；最近全站回歸為115模型2891組參數通過，本批三個使用者新題只做定向檢查。來源對照core78、partial15、related3、none20，合計116；另10個使用者方向。core表示已有核心，不是原站全面驗收。逐題權威證據、缺項與下一步在implementation-plan.json。

最新核心新增至083（066方波傅立葉、067平面鏡、068兩人同鏡、069雙鏡）；065自訂八諧波已擴充，仍維持partial。以下064以前的說明及舊下一步保留為歷史，最新進度見各日期段落。063風平流、移動聲源／觀察者、遲滯交會與接收頻率；064同Fourier係數的波形／頻譜與實際合成音訊、RMS、帶限噪音。音訊明確啟用且不預設出聲；真實瀏覽器／聽感、短脈衝細緻調度及050微觀快壓仍未完成。

## 下一步

1. 050已實作均勻可逆絕熱雙活塞，24組與全79題通過；維持in-progress，原站粒子／薄片、快速非均勻壓縮與控制語意仍待補。不可把PV^γ近似冒充完整微觀快壓。
2. 063獨立108組、064獨立36組，共用93題／2108參數與Fourier音訊mock通過。下一題065頻譜與波形：已看截圖，與sound-elements大量重疊，應擴充同模型的第1至第8泛音獨立振幅與來源入口，毋須複製波形／音訊引擎；現partial/in-progress。066方波傅立葉已看截圖六排1/3/5/7/9/11項圓投影，應重用sound-elements與shm-projection，但需新增逐項部分和／圓運動投影，不可只用固定奇次音色當完成。
3. 026彈簧約束／觀察系切換、027手拉／敲擊、028Y桿滑動／鉸接約束仍未確認、036其他配置，均待補。
4. 018失效後／多車型、019多碎塊、020曲面坡、021其他裝置／牆壁、023再接觸反彈、024環／質心跟隨、030球視角、031扇形與彈簧顯示等差異仍在JSON。

## 可重用能力與定位

- models/ideal-gas.js：SI sample(t).atoms、可選硬球互撞，內部nm/ps事件堆；不互撞時跳過配對預測。
- models/maxwell-distribution.js：histogramPlot、理論密度、displayPoint速度空間；無互撞，不可冒充動態熱化。
- models/equipartition.js：預平衡經典獨立模態，忽略量子／轉振高階耦合，不能宣稱精確全分子動力學。
- assets/mechanics-plots.js：時間、位置能量、相圖、密度分布及模式柱圖；圖表一律預設隱藏於3D下方。
- 微觀displayScale／playbackScale、CSV科學記號契約在docs/PHYSICS.md；SI物理狀態與顯示座標分離。
- 用node tools/context.cjs按題定位；只讀相關模型與來源單項，勿全文掃描所有檔案。

## 驗收與限制

node verify-all.cjs；node tools/check-context.cjs；node tools/check-replication.cjs。每題須有原站功能對照、實際模型、可調操作、3D、圖表、假設、讀值與驗證入口。全部116來源與3使用者方向保留。

真實瀏覽器驗收尚未完成；離線Canvas與DOM自動檢查不能替代。先前本機file網址受工具政策限制，不以localhost等繞過。Flash僅參考截圖／文字，不執行Flash或EXE。原站Canvas控制的部分語意仍待互動確認；未驗證項不能標complete。

050定位：models/adiabatic-pistons.js、assets/scenes-adiabatic-pistons.js、verify-adiabatic-pistons.cjs。右側可選氣體／匹配初始剛度彈簧，兩側外力半餘弦斜坡；阻尼熱移至外環境。參數顯示精度已依step保留，勿再固定兩位小數。

051定位：models/basic-waves.js、models/wave-core.js、assets/scenes-basic-waves.js、verify-basic-waves.cjs。modelDependencies路由會列出波核，HTML載入順序已有檢查。原站各模式隱藏控制仍待對照。

052定位：models/standing-waves.js、assets/scenes-standing-waves.js、verify-standing-waves.cjs。無限長理想線性繩，脈衝半寬λ/3；週期模式才有頻率／相位意義。等幅才標永久波節，不等幅標極小點。

053定位：models/longitudinal-tube.js、assets/scenes-longitudinal-tube.js、verify-longitudinal-tube.cjs。線性聲學p′=−ρc²ξ_X，右閉位移反相、右開位移同相；閉管左開右閉。playbackScale=.02，gain只放大圖示。

054定位：models/string-interface.js、assets/scenes-string-interface.js、verify-string-interface.cjs。B/A密度比.125–8、等張力，反射／透射及能量係數，原站算式模式已具核心。

055／056已新增核心，不是全原站驗收：055 SHM／方向按鈕語意待核對；056看波／看面／俯瞰相機預設與未標籤控制待核對；兩者真實瀏覽器仍未驗收。

055定位：models/wave-polarization.js、assets/scenes-wave-polarization.js、verify-wave-polarization.cjs。e=(sinθ,cosθ,0)，只是受控教學方向轉換，非介質自發模式轉換。preservePlayback共用控制契約在docs/PHYSICS.md。

056定位：models/wave-function.js、assets/scenes-wave-function.js、verify-wave-function.cjs。timeToZ將四週期映成顯示1–9，SI sample的z/vz/fz保持零；surface/showYX/showYT全是visual開關。

057定位：models/string-wave-energy.js、assets/scenes-string-wave-energy.js、verify-string-wave-energy.cjs。T=μc²，eU=Tux²/2，P=−Tutux，追蹤短繩段長.2m，質心平均sinc(kΔx/2)使張力合力與F=ma精確相符。positionPlot.value(x,state)依waveTime動態重算，dynamic圖例與yUnit=J/m。

058定位：models/two-source-interference.js、assets/scenes-two-source-interference.js、verify-two-source-interference.cjs。穩態等幅不衰減的徑向相位示意，無wave-core依賴；節腹線含|路徑差|=源距的退化射線，bounds涵蓋最大視覺倍率。原站平面、能量及透明度控制仍待對照。

058場景網格按λ取N=max(32,ceil(84/λ))，14m窗至少6點／波長，避免最短波長混疊；最短λ1與預設λ2已做12組有限場景圖元檢查。

059定位：models/acoustic-core.js（複數／阻尼聲學解）、models/resonance-column.js、assets/scenes-resonance-column.js、verify-resonance-column.cjs。管口指定壓力，閉水面ξ=0；穩態驅動，不含建立過程／端部修正。裝置6倍示意，hideGrid避免虛假公尺格；位移另限幅，CSV仍SI。

060定位：models/vacuum-bell.js、assets/scenes-vacuum-bell.js、verify-vacuum-bell.cjs。模式目前重設式拉桿，原站即時閥門歷史仍待補；等溫定容質量平衡、結構傳聲示意，聲速不設0。

音訊定位：node tools/context.cjs --task audio。assets/mechanics-audio.js在app前載入，setup/setExperiment關聲，updateUI/update依播放同步；simulation.audio(s,p)給實際Hz與0–1示意gain，共用再乘.12。verify-audio用mock，不開實體裝置；共用DOM驗證實際接線。真實音響仍待驗收。

061定位：models/sound-speed.js、assets/scenes-sound-speed.js、verify-sound-speed.cjs。M.Acoustics.soundSpeed(TC)與pulseEnvelope供重用；正常1×以物理秒同步、聆聽位置visual只改音訊觀察。兩山與人物示意，避免假造風速／地形繞射。

062定位：models/echo.js、assets/scenes-echo.js、verify-echo.cjs。r為非負壓力反射振幅，能量r²；判準是delay−聲長≥設定空隙，不是普遍人耳閾值。純音包絡相加不模擬相干相消，最短脈衝與快播放的音訊事件調度仍待實測。

共用時間圖新增def.defaultPlotMetric，061/062展開時預設接收包絡；位置／相圖等模式不變，所有圖仍預設隱藏在3D下方。

063定位：models/doppler.js、assets/scenes-doppler.js、verify-doppler.cjs。遲滯方程|ro(t)−rs(τ)−w(t−τ)|=c(t−τ)，接收比率=(c−n·(vo−w))/(c−n·(vs−w))；次音速平行錯開路徑，第一波面前顯示0Hz／靜音。代表性波面整數周期抽樣，已增強顏色及可見範圍。

064定位：models/sound-elements.js、assets/scenes-sound-elements.js、verify-sound-elements.cjs。sin/cos係數共用圖形與PeriodicWave；noise為64條120–6000Hz／10Hz頻格，100ms重複的帶限示意。plotCursor=0留在相對觀察窗內，waveTime只偏移波形；scopeLabel專屬時間窗圖例。

預覽工具：tools/dom-harness.cjs已從verify-mechanics抽成無測試副作用的共用DOM支架；render-previews直接載入，避免只調場景時自動重跑整套模型參數檢查。verify-mechanics仍引用相同支架、完整物理及桌面／行動操作檢查未刪；verify-all照常跑。

## 2026-10-21 使用者新增待做題目

以下三題已加入權威清單，狀態均為 planned，尚未製作完成；原有三個方向保留。

- user-violin-fourier：小提琴聲的傅立葉分析、各頻率振幅及分量疊加合成。重用 sound-elements，另補音源分析與分量展示。
- user-floating-block-shm：方塊入水與浮力振盪，展示平衡附近反向且正比於位移的恢復力；區分非簡諧區段。
- user-pendulum-angle-comparison：小角度與大角度單擺同步比較、週期公式的適用範圍及大角度修正。擴充既有 pendulum。

詳細需求及下一步見 implementation-plan.json 的上述 ID。

### 2026-10-21 頻譜與波形進度

sound-elements增加音色4自訂八條諧波相對振幅；全零靜音、單獨第二諧波、等權與混合權重的獨立波形和／RMS／音訊係數測試通過。065維持partial/in-progress：控制改動仍重設時間及音訊，原站完整互動與瀏覽器驗收待補；066仍待製作。

自訂h1至h8已支援即時修改：自動選音色4、保留時間與播放及已啟用音訊；音訊不會隱式啟用，切換實驗維持關閉。音訊mock測試通過，共用DOM補入連續修改檢查。

### 066 方波傅立葉

新增fourier-square：六排奇次諧波圓投影、串接圓及逐項部分和，1至6項、基頻及振幅可調，理想方波與同係數聲音。27組獨立數學測試通過，離線Canvas已檢視；原站完整控制及瀏覽器驗收仍待完成。

### 067 平面鏡成像

新增plane-mirror，有限鏡寬及橫移、眼睛位置、物距、三點虛像可見判定、實際反射與虛延長線。81組幾何測試通過、離線場景已檢視。原站延伸物體與拖曳、完整顯示控制及瀏覽器驗收仍待補；下一題068兩人同鏡。

### 068 兩人同鏡

新增shared-mirror：兩人身高、眼高比例、離鏡距離、鏡面高度／鏡底，可見身體線段與頭腳反射光路、個別及共用所需鏡面區間。72組必要／充分最小性、距離獨立與反射測試通過，離線Canvas已檢視。人物快捷視角與原站額外顯示控制、瀏覽器驗收待核對。下一題069雙鏡成多像，須處理反射序列與有限鏡面的可見性，不能只套360/θ公式。

### 069 雙鏡成多像

新增double-mirror：有限單面鏡30至150度、眼睛／物體位置、選像光路、最多12次交替反射與重合像合併、奇偶手性標記。162組獨立反射定律／光路等長／鏡長單調性／典型像數測試通過，60與90度離線預覽已產生。原站懸停、雙視圖及完整顯示控制與瀏覽器驗收待補；下一題070請按需讀取單項來源。

### 070 曲面鏡反射

新增conic-mirror四種曲線精確法線、有限口徑、平行／焦點點源、偏移及傾角，排除先碰其他弧段的入射路徑；只算首次反射。108組獨立焦點恆等式、法線／切線反射及球面像差測試通過，四種離線預覽已產生並檢視橢圓／雙曲。原站多次反射、完整顯示控制與瀏覽器驗收待補；下一題071成像作圖。

### 070 多次反射補齊

conic-mirror新增reflections 1至12，解析曲線根求下個有效交點，每次重新計算法線，離有限弧後逃逸；若達上限仍有交點，畫到該點停止並標紅，避免穿鏡假象。96組多次反射測試加上原108組通過；球面90%口徑傾斜20度、12次設定離線預覽已檢視，實際最多11次。早先單次反射限制已解除；其餘顯示模式、完整旋轉面與瀏覽器驗收仍待核對。

071截圖已檢視：凸／凹透鏡、凸／凹面鏡四模式，特殊光線、端點光線、成像開關及繪圖／清除。需求已寫入JSON；下一步共用近軸成像核心，焦點位置須呈現平行出射及無限遠而非大數替身，並保留繪圖功能待實作。

### 071 成像作圖核心

新增image-drawing四種薄元件、有號像距／放大率、五種光線顯示、物距／物高／焦距及成像開關；正焦點以null image及零像方光焦度表示無限遠，不造有限大數。有限近焦點仍保留真實數值，超窗則文字標示。144組獨立成像及交會測試通過，六狀態離線預覽已產生。下一步補原站自由繪圖／標註、清除及操作驗收，不能將目前核心當完整復刻。

071標註續作定位：指標旋轉／縮放在assets/mechanics-controls.js第15行附近；project及camera basis在assets/renderer.js。標註應投影到作圖平面z=0並存世界座標，切換視角仍附著光學圖；明確切換繪圖／轉視角模式，支援清除、取消指標與單筆撤回，不改模擬時間／播放。勿直接存螢幕像素讓旋轉後筆跡漂移，也勿截斷既有觸控旋轉／縮放。

### 071 手繪標註補齊

新增assets/mechanics-annotations.js與成像專用側欄：手繪／轉視角模式、四色、撤回及清除。逆透視投影到z=0世界平面，筆跡隨鏡頭旋轉縮放保留；改參數及切換實驗仍保留筆跡，離開成像頁自動關手繪，重新載入頁面不保存。pointercancel與lostcapture丟棄未完成筆畫，多指不混成筆跡；操作不改時間／播放。verify-annotations.cjs三視角投影、手勢、撤回、清除及作用域測試通過，離線圖已檢視。原站完整操作與實際觸控／瀏覽器驗收仍待完成。

071標註加入後，共用96模型、2284組參數及操作回歸通過。下一題072折射的原因：原站以二輪車跨快慢介面說明偏向／偏離法線及全反射；應保留雙輪跨界過程，不可只畫Snell光線替代原教學機制。

### 072 折射的原因核心

新增refraction-cart，解析三階段：兩輪介質1直行、跨界不同速圓弧、兩輪進介質2或返回1。由輪速約束推得Snell速度關係，精確處理正入射、等速、臨界及超臨界；輪距固定、輪上無側滑。135組測試通過，四情況離線預覽已產生；TIR預覽背景先畫避免大平面蓋住軌跡。色散多車模式及原站完整控制仍待補，實際瀏覽器未驗收。

### 072 七色色散補齊

refraction-cart加入七色色散與0至20%強度。v2(λ)=v2(550)/[1+D((550/λ)^2−1)]，420至650nm，每色重用同模型dispersion=0分支，無第二套軌跡；觀察時間取所有車共同時間，rawState使短事件車在後續仍持續運動而不凍結。550nm主讀值不變，場景各色獨立軌跡及折返／透射。12組七色測試加原135組通過，正常與混合情況預覽已產生，混合已檢視。原站精確參數、完整控制及瀏覽器驗收待核對；未校準正常色散不得說成特定材料。

七色加入後共用97模型、2313組參數回歸通過。下一題073多層折射為Flash截圖題，僅從已存截圖／說明取規格，不執行Flash或EXE。已知四介質折射率、入射位置／角度可調，四預設與界面全反射問題須核對；不得只作單介面模型。

### 073 多層折射核心

新增layered-refraction四平行介質、入射位置／角度、n值拉桿與4預設；第4依來源截圖1.2/1.8/1.4/1，其他3明示教學替代。逐界面Snell主光路、臨界掠射及全反射回返；物理時間c/n，playbackScale=1e-9。局部反射短線不算完整反射分支。243組Snell／光程／可達性與實際預設控件測試通過，TIR離線場景已檢視。app.setOnInput支援函式回傳連動參數並同步滑桿。原站拖曳及完整預設控制、瀏覽器驗收待核對；Flash/EXE未執行。

### 074 杯中吸管核心

新增straw-cup與WaterOptics（bend、waterHit、inside、strawHit），向量Snell／TIR、有限圓柱／盒液體邊界、條紋吸管。場景從renderer目前相機逐像素逆向追跡最多8交互作用，CPU取樣cache，拖曳低取樣／release dirty後靜態高取樣。容器無玻璃壁，n=1方向與顏色不加入界面衰減。99組獨立光學／幾何測試通過，圓柱／方形／n1離線預覽產生且圓柱已檢視。原站魚物件、完整顯示、瀏覽器效能與觸控待補；075已由none轉related，需專用視深／反向延長場景，不能只用近軸數值當完成。

### 075 視深與實深核心

新增apparent-depth，WaterOptics.planeRay以80次二分求唯一平面折射點；空氣看水中／水中看空氣，兩眼端取樣線反延長求表觀位置，與d*n眼/n物近軸值比較。物體、觀察者距離／橫移、取樣間距及n可調，魚／點、光路／參考可切換並加距離尺。324組Snell／向量、費馬極小、交點、折射率匹配、近軸與子午微分極限通過；三狀態離線預覽已產生，空氣模式已檢視。modelDependencies顯式路由straw-cup.js作WaterOptics核心。原站泳池外觀與完整控制、瀏覽器驗收待補；不要把雙子午光線交點宣稱全部離軸光線共同虛像。

### 076 球形透鏡核心

新增sphere-lens，WaterOptics.sphereHit可處理非單位方向，球面法線與既有bend重用；外部魚由橢球幾何、眼睛等組合，內看外省略魚物件、眼點移到指定半徑比例，視角沿用相機朝向，zoom控制內視FOV。最多8次逆追跡，未連外界TIR方向深色並文字說明；數學欄為全立體角首界面TIR比例，不是畫面或能量比例。12配置×10000方向、入射不變量、球心無TIR、連續反射及獨立球透鏡焦距檢查通過；三情況離線預覽產生，外部與TIR已檢視。原站環境圖／游動／網格、完整控制及瀏覽器效能待補。

### 077 Fresnel方程核心

新增fresnel-core.js（M.Fresnel.calculate/abs2）與fresnel，複數r/t、正確n2cosθt/(n1cosθi)通量，s/p/非偏振及相干線混合、Brewster、TIR相位、E與相對cB=n d×E，非偏振不畫固定相位假波。下方角掃描圖預設隱藏，Rs/Rp比較可切。63係數配置與12場模型的複數邊界／能量／互易、時均Poynting獨立核對通過；四狀態離線預覽產生，TIR已檢視。原站完整控制與瀏覽器驗收待核對，不含消逝場或吸收。

### 078 眼看透鏡成像核心

新增eye-lens，重用ParaxialOptics並加入ThinOptics.transfer/symbol/apertureHit。六模式近軸有限圓孔逆追跡，孔外直見原物、面鏡背面灰色，非對稱箭頭與左右色塊可辨倒像。初始視角在透鏡後軸上，程式支援def.initialView通用設定（選實驗時、fit前套yaw/pitch），預設尺寸0.5m與居中圖案讓有限鏡孔收得到物光。72組光線與可逆檢查、實際畫面取樣通過；離線倒像已檢視。原站側面遠看／觀察視野快捷、球物件、完整控制及瀏覽器驗收待補。

079截圖已檢視並改列related：已有靜態公式／眼看外觀，不可算成像之舞。需物體與透鏡各自SHM／等速／圓周，I=L+fu/(u−f), u=L−O；vI=vL−f²(vL−vO)/(u−f)²；aI=aL−f²(aL−aO)/(u−f)²+2f²(vL−vO)²/(u−f)³。須驗證速度反轉與焦點奇異，不用大數替代無限遠。後續完整功能見JSON。

### 079 成像之舞核心

新增dancing-image，兩物各自固定／SHM／等速／圓周，解析x/y像速度與加速度、整支箭頭平移成像、實像共軛交換。u(t)為線性+同頻sin/cos，按導數極值分段找焦點與0.05m域界，處理相切根；焦點image=null、CSV留空。位置類圖表新增null略過與series.breakBetween斷線，主讀值仍有限。64配置微分／共軛／根與原站概念、實際DOM焦點開圖與匯出通過，共用104模型2514參數通過；離線預設及焦點圖表已檢視。原站完整操作與瀏覽器驗收待補；下一題080按需讀取。

### 080 透鏡遮一半核心

新增half-lens與ApertureOptics.fraction/pupil：圓弓形面積CDF逆取樣開孔，每條光線權重open/N，不重新歸一。ThinOptics逐物點傳到屏幕，焦平面仍完整像點，離焦是開孔映射；取樣點／十字／三色及幕底板／光線／曝光控制。54配置及半孔重心、各色通量、焦平面逐點獨立像素測試通過，共用105模型2543參數回歸通過；半孔離線圖已檢視。屏幕以單一深度primitive含底板與像素，避免大多邊形蓋住像點，固定曝光1避免遮半仍飽和。原站觀看面／側面快捷及瀏覽器驗收待補。下一題081視差法找像位置。

### 081 視差法核心

新增optical-parallax，六種成像模式重用ParaxialOptics，眼睛在實像之後／虛像出射側；獨立眼位與3D相機，手動棒與精確像位校準。按atan水平投影比較、有限鏡孔光線、眼後標棒空值；3D與眼中視野可切，視角圖預設隱藏。54配置加實際DOM連動／切視圖保留播放測試通過；3D及眼中視野未校準差已離線檢視。標棒旁路觀察為明示理想參考，原站完整操作／視角及瀏覽器驗收待核對。

082截圖已檢視，改列related：望遠鏡／顯微鏡／放大鏡／眼鏡四按鈕，物鏡與目鏡啟閉、凸凹、f及D控制；下方物像、光、尺、視野與快捷。已有單薄鏡傳播可重用，下一步應新增ABCD多元件核心並分別定義各儀器放大率；不要用單鏡改標題當完成。原預設實際參數不可僅從目前截圖猜成全部已知。

### 082 光學儀器核心

新增ray-matrix.js（ABCD傳播／透鏡／孔徑trace）及optical-instruments四預設，所有內部m與斜率，UI mm，顯示按模式同比例放大。望遠鏡C0角放大D；有限物角放大參考0.25/B、橫向1/D、最終像v=−B/D；顯微鏡預設20mm物鏡、u22mm、40mm目鏡間隔260mm，輸出平行且角放大−62.5。近視眼17mm薄眼球／18mm視網膜，15mm前方−291mm矯正鏡精確聚焦；關眼球不搬視網膜。48矩陣／逆／逐段與四儀器獨立物理及實際DOM預設檢查通過，四種離線預覽產生，望遠鏡已檢視。原站完整3D物件／視野、尺／快捷及瀏覽器驗收待補。

### 083 虹與霓核心

新增rainbow，重用sphereHit/bend及Fresnel，一次／二次部分內反射支路按s/p分別連乘，再平均。解析極值cos²i=(n²−1)/[p(p+2)]形成主／次七色角錐，教學Cauchy色散，主紅外次紅內。太陽仰角與地平線／全圓、單滴反射與偏心距、波長可調；完整天空強度／暗帶／超數虹未算。30支路加極值／色序／錐面及實際重取景DOM通過；天空與次滴預覽已檢視。共用refit旗標與hideFloor裝飾地板切換加入，視覺重取景仍保留t/running。原站完整天空視野、亮度與控制及瀏覽器驗收待補。

### 084 希區考克變焦核心

新增dolly-zoom：固定3D環，攝影機d(t)與f(t)同比例同步，v=fd/(d−f)為24×36mm片幅的投影距離；只移動與只變焦可比較。54配置及實際arc命令證明主環像素大小恆定、遠環改變；共用109模型2693參數通過，遠端畫面已離線檢視。完整視野控制、景深／像差及瀏覽器驗收待核對。下一批085至087已有double-slit，先擴充差異，不重複新建同公式。

### 085 雙狹縫既有模型擴充

不新增重複模型。wave-optics.js的double-slit加入rotation/laserAngle與兩片n,t；q為出入射方向差在孔寬／孔長軸投影，振幅是兩矩形積分和，強度含相對薄片相位。amplitudes/phasePlus/phaseMinus可給087過程展示重用。216配置及192×192數值孔積分、共同相位／交換片位移驗證通過；旋轉90度離線圖已檢視。085改core/in-progress，原站波形／波前及強度／圖形過程控制仍未完成；086多孔／孔形、087振幅生成仍各自保留缺項。

### 088 旋轉平面屏（部分涵蓋）

double-slit加入screenYaw與screenPoint，旋轉屏實際坐標進入Fraunhofer方向差；texturedScreen支援水平基底，掃描點跟隨屏面。獨立方向等價性及掃描幾何通過，55°屏離線預覽已檢視。088由related改partial，並未當作完整原站重建：波長倍數尺寸、法向轉狹縫、廣角雷射、圓弧屏與波程差等仍缺。086/087由並行代理建立專用題目，整合後更新最新數量。

### 086／087 專用核心

新增aperture-pattern（矩形/圓孔與二維陣列）及diffraction-amplitudes（五模式電場疊加）。分別36及45配置、獨立孔積分或整縫解析和及DOM檢查通過；兩個離線預覽已檢視。來源各改core/in-progress，未宣稱全功能驗收。完整控制語義及瀏覽器仍缺，權威差異在各項existingComparison。並行改檔期間的共用檢查快照不一致已作廢，穩定檔案後統一驗證1400通過111模型2781組參數與場景/播放/目錄/CSV操作。

下一步：089光柵需穿透/反射波前、指定方向/切線、綠光/紅藍、光柵密度及轉動幾何；新多孔與振幅能力只算partial，不能替代專用廣角光柵。086/087原站細節與全站瀏覽器驗收仍未完成。

### 089–092 光柵、色彩與靜電

新增optical-grating、rgb-lights、electroscope、two-charges四核心，均有共用UI/3D/入口/路由與專用驗證。專用90、288、180、27配置及控制檢查通過，離線預覽已檢視。原站隱含操作、完整等位面、驗電器拖曳及實際瀏覽器驗收仍留各項缺口；不是原站全面完成。共用驗證85889發現光柵positionPlot讀取不存在的angle，已補sample.angle及四情況開圖表/游標座標測試；57797重驗通過115模型2891組參數及115場景與共用操作。

下一批093 ILB/LvB：原站圖顯示載流導線/運動電荷、磁極/電池方向切換、電壓與磁力線。需建立Iℓ×B與qv×B的向量關係及磁場疊加，不能只畫受力箭頭；094電場單擺、095電荷在場中運動等仍需逐項核對。

### 優先調整：使用者新增三題

使用者要求先忽略全站驗收，優先交付小提琴傅立葉分析、方塊入水浮力振盪、大小角度單擺比較三題。這一批只做必要物理與操作檢查，不執行全站耗時回歸或以原站逐項驗收作為交付門檻；全站目標及原有缺項仍保留。三題並行新增，統一在穩定後更新入口與追蹤。

使用者三題已交付核心入口violin-fourier、floating-block-shm、pendulum-angle-comparison，六個使用者方向皆有核心實作。預覽均已檢視；本批依要求不跑全站驗收。小提琴預設是示意音色，匯入本機錄音後只做指定基頻12諧波擬合，不能宣稱完整FFT。先保留使用者優先順序；恢復全站工作時下一來源093–095規格已整理。

### 使用者新增四個天文題

天球模型、日地運動、月地運動、日地月/蝕已新增四個入口，user方向擴增至10個，均有核心實作。celestial-sphere/sun-earth/moon-earth/sun-earth-moon定向49/168/27/45配置與DOM通過；離線場景已檢視。日地月預設近景、半徑12倍示意，60動畫秒對應所選1..60模型日，蝕預設對準時刻在30秒。模型均非精密星曆；原站全站目標仍未完成，本批仍依偏好只做定向檢查。
