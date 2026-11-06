# 全站重建追蹤

逐一重建原站全部116個不重複動畫，並加入使用者新增10個方向；依既有架構、語言、規範與UI設計實作。

只有功能對照、模型、互動、驗證與入口都具備才可標完成；既有相近題目不能自動算完成。

## 現有檔案比對（2026-10-20）

本地122個共用模型與3個獨立拋體頁面；數量依目前註冊模型產生。逐題功能對照、完成證據與未完成差異保存在各項existingComparison，不以相近題名當成已完成。

原站 116 題：**78 題核心已做出、15 題部分涵蓋、3 題僅相關模型、20 題未找到對應**。使用者新增 10 個方向另外計算，其中 10 個已有核心實作；其餘仍待製作。

後續工作分流：78 題沿用核心並核對差異；15 題擴充現有功能；23 題需新增專用題型，其中 3 題可重用相關能力。

core 表示核心題型已有實作，partial 表示部分功能，related 只有可參考模型，none 無專用模型；不等同原站功能全部驗收。

重建狀態：planned 待規格／實作；in-progress 製作中；implemented 已有核心實作但未完整驗收；complete 驗收完成。涵蓋程度另列；部分涵蓋不表示已開始專用重建，也不計為完整實作。

共用模型位於 mechanics.html，可從連結或總覽選單開啟，不是每個模型都有獨立 HTML。部分／相關列中的模型連結是參考入口。

## 逐題比對

| ID | 分類 | 題目 | 重建狀態 | 現有涵蓋 | 現有模型／入口 | 已有內容 | 差異／下一步 |
|---|---|---|---|---|---|---|---|
| site-001 | 運動學 | [飛機投彈](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/airplaneBoom2024/airplaneBoom2024.html) | implemented | 核心已做出 | [飛機投彈](../../airplane-drop.html) | 已新增等速飛機、多顆球分次投放、逐球解析落地、飛行與落點軌跡。 | 原站 x1/x10/x20 行為尚未互動確認；目前提供1至20球數拉桿，原站視角按鈕以共用自由視角替代。 |
| site-002 | 運動學 | [安全拋物線](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/safeParabola2023/safeParabola2023.html) | implemented | 核心已做出 | [安全拋物線、同時圓與頂點橢圓](../../safe-parabola.html) | 已新增72顆等初速拋體、安全包絡、同時圓、頂點橢圓、指定角度與三個可保留時間的顯示開關。 | 原站爆炸／單一顯示等控制尚未逐項互動驗收；目前使用同時發射族與角度選擇。 |
| site-003 | 運動學 | [相對運動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/relativeMotion2023/relativeMotion2023.html) | implemented | 部分涵蓋 | [雙球與移動參考系](../../relative-motion.html) | 已新增紅藍雙球、地面／平台／紅球／藍球四參考系；座標、速度、軌跡、圖表與CSV隨參考系變換，切換保留時間與播放。 | 目前從同一平台同時拋出，首次回到平台高度即結束；原站週期反彈與特定初始條件尚未重建及操作核對。 |
| site-004 | 運動學 | [射猴子](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/shootMonkey2023/shootMonkey2023.html) | implemented | 核心已做出 | [射猴子：共同自由落體](../../shoot-monkey.html) | 已新增同時射擊／猴子自由落下、初始瞄準線偏角、解析相遇與最接近事件、各自觸地停止。 命中後完全非彈性黏合、動量守恆、共同拋體與0.4秒撞擊光圈／星芒，均支援時間回放。 | 原站角色預設視角以共用自由視角替代；完整原站控制與本機瀏覽器驗收待做。 |
| site-005 | 運動學 | [斜面上的斜拋](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/projectileOnBevel2023/projectileOnBevel2023.html) | implemented | 核心已做出 | [斜面上的斜拋](../../inclined-projectile.html) | 斜面角、相對坡面發射角、初速、方位角、落點與離面高度已有實作。 | 原站的輔助分解／顯示模式仍須逐項驗收；不能視為畫面功能完全一致。 |
| site-006 | 運動學 | [斜面上的投影](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/shadowOnBevel2023/shadowOnBevel2023.html) | implemented | 部分涵蓋 | [斜面上的投影](../../incline-shadow.html) | 可調坡角、平行光方向、發射角與初速；線面交點、影子軌跡／速度／加速度已實作。 | 原站反彈、其他平面投影模式仍待補；本版於首次觸坡結束。 |
| site-007 | 運動學 | [斜拋幾度拋最遠](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/howToProjectleFar2026/howToProjectleFar2026.html) | implemented | 核心已做出 | [斜拋幾度拋最遠](../../optimal-projectile.html) | 解析最佳向前仰角與射程，選定／最佳球同步；高度、坡角及完整角度落點掃描已提供。 | 原站按鈕操作改為共用拉桿與同步對照；掃描資料已計算但獨立角度－射程圖尚未另設顯示。 |
| site-008 | 運動學 | [簡諧運動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/SHM2022/SHM2022.html) | implemented | 核心已做出 | [圓周運動與簡諧投影](../../shm-projection.html) | 圓周、水平與垂直正交投影同步；可調振幅、週期、初相位、質量及保留時間的顯示開關。 | 原站速度拉桿以週期參數替代；垂直投影數據可CSV，圖表目前以水平讀值為主。 |
| site-009 | 運動學 | [鉛直彈簧SHM](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/vSHM2024/vSHM2024.html) | implemented | 核心已做出 | [鉛直彈簧與等效簡諧位能](../../vertical-spring.html) | 鉛直雙向彈簧、原長／平衡參考與同步水平等效振子；Us、Ug、合成位能及平衡點等效位能、動能皆可選圖表。 | 原站專屬位置／受力／能量單選模式由本專案通用控制與圖表替代；原站全部控制及實際瀏覽器驗收仍待核對。 |
| site-010 | 運動學 | [彈簧力學能守恆](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springEnergy/springEnergy.html) | implemented | 核心已做出 | [彈簧簡諧運動](../../spring.html) | 沿用spring解析模型，新增下方位置—能量圖；K、U、E三曲線與當前位置游標同步，亦可選各能量時間圖。 | Flash原圖內容已按位能／動能／總能對位置重建；原站互動無法執行，保留本機實際瀏覽器驗收。 |
| site-011 | 運動學 | [飛輪組](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/rotationWheel/rotationWheel.html) | implemented | 核心已做出 | [飛輪組與皮帶傳動](../../belt-wheels.html) | 四輪可調半徑、AB及CD無滑動皮帶、BC同軸、指定主動角速度、輪上色標與皮帶標記、角速度／圈數比已實作。 | 依Flash說明及截圖重建運動學；不含皮帶滑動、啟動力矩或耗能，實際瀏覽器驗收仍待完成。 |
| site-012 | 運動學 | [終端速度](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/terminalVelocity2023/terminalVelocity2023.html) | implemented | 核心已做出 | [空氣阻力與終端速度](../../mechanics.html?experiment=drag) | 由靜止下落、線性阻力 bv、可調質量／阻力係數／重力，含終端速率與速度圖。 | 原站角色、釋放及圖形呈現不同；物理核心已具備，完整操作對照尚待驗收。 |
| site-013 | 靜力學 | [滑下或倒下](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/slipOrFall2023/slipOrFall2023.html) | implemented | 核心已做出 | [滑下或倒下](../../slip-or-tip.html) | 有限矩形塊、滑動與翻倒臨界、支持點／質心投影、底面滑動及繞坡下角轉動；接觸失效精確停止。 | 固定坡角釋放，兩門檻皆超過時依首次失穩分支並檢查接觸；不是一般多接觸剛體求解，失去接觸／側面接坡後碰撞未做。 |
| site-014 | 靜力學 | [堆木塊](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/stackBlock2023/stackBlock2023.html) | implemented | 部分涵蓋 | [堆木塊與最大懸伸](../../block-stack.html) | 2至10層、每層獨立偏移、選層推移、子堆質心與實際支持重疊、最大懸伸及首個臨界推距已實作。 | 播放為靜力推移掃描，失穩臨界停止；原站掉落與剛體倒塌動力尚未做。 |
| site-015 | 靜力學 | [把自己拉起來](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/pullSelf2024/pullSelf2024.html) | implemented | 部分涵蓋 | [把自己拉起來：內力與外力](../../self-pull.html) | 依原站截圖辨識腳下動滑輪的自拉裝置，聯立人／平台分力、離地門檻、接觸支持力、繩長與有限拉繩行程；另有頂端定滑輪比較。 | 原站彈簧、人1、人2模式尚未逐項重建；本版平台連接為明示理想化，人台所需支持力為負則停止，不含離台後運動。 |
| site-016 | 動力學 | [阿特伍機](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/atwoodMachine2024/atwoodMachine2024.html) | implemented | 核心已做出 | [會動的阿特伍機：四重物與雙動滑輪](../../moving-atwood.html) | 已確認原站為頂端大輪下懸兩個小動滑輪、四重物；三繩約束、四物體受力、上下繩張力、支承外力作功及接觸停止已實作。 | 原站換組態與輪質量相關控制仍待互動核對；目前三輪無質量。另可調支點加速度是拓展，預設固定。 |
| site-017 | 動力學 | [輸送帶與摩擦力](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/conveyorFriction2023/conveyorFriction2023.html) | implemented | 部分涵蓋 | [輸送帶與摩擦力](../../conveyor-friction.html) | 可調等加速／正弦帶速與靜動摩擦，分段解析滑動、捕獲黏住／再脫離，提供帶速／箱速／摩擦、熱量與驅動功。 | 原站鉗子升降／放箱尚未做；本版箱子全程接觸無限長輸送帶，示意窗延伸而不模擬帶端掉落。 |
| site-018 | 動力學 | [過彎摔車](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/bikeAndDriver2023/bikeAndDriver2023.html) | implemented | 部分涵蓋 | [過彎傾身與失去接觸](../../bike-turn.html) | 可調速度、半徑、質心高度、摩擦與初傾角；圓形接觸路徑下的傾倒方程、平衡傾身、摩擦圓與接觸失效時刻已實作，預設跟隨人車。 | 本版為指定圓形接觸路徑的點質量支架模型，未含輪胎、陀螺及轉向自穩；原站多車型、自由轉向與失效後滑出／撞地尚未做。 |
| site-019 | 動力學 | [斜拋空中爆](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/projectileAndExplode2024/projectileAndExplode2024.html) | implemented | 部分涵蓋 | [斜拋空中爆](../../projectile-explosion.html) | 兩碎塊瞬時爆炸、可調質量比例／方向／相對速度／時刻，另有B瞬停對照；空中動量與質心、內能轉動能、各塊落地停止已實作。 | 原站多碎塊模式及右側獨立比較視窗尚未做；本版為兩點質量，任一落地後不再套用自由拋體質心。 |
| site-020 | 動力學 | [光滑斜面向後滑](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/bevelSlideBack2024/bevelSlideBack2024.html) | implemented | 核心已做出 | [光滑斜面向後滑](../../recoiling-wedge.html) | 自由楔形與滑下質點聯立，解析反衝、接觸力、坡底時刻、水平動量及能量；可比較固定斜面。 | 目前直線坡面，未加入原站曲面坡道／視角快捷模式；明示光滑質點無自轉，不以純滾動冒充。 |
| site-021 | 動力學 | [雙體運動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/twoBodyMotion2024/twoBodyMotion2024.html) | implemented | 核心已做出 | [人走船退與合質心](../../person-boat.html) | 人物在船內以平滑指定行程走動，船反向平移；可調質量、行程、時間、共同漂移及往返，提供相對岸速度、合質心、內力及內部作功。 | 目前主模式人船運動；原站其他雙體裝置、起始牆壁與獨立跟隨質心／船體視角仍待做；腳底摩擦假設足夠，不模擬船俯仰及腳步衝擊。 |
| site-022 | 動力學 | [錐動擺的角動量](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/angularMomentumOfCircle2023/angularMomentumOfCircle2023.html) | implemented | 核心已做出 | [圓錐擺與角動量](../../conical.html) | 沿用現有圓錐擺，新增懸點／圓心兩組角動量與力矩、受力分解、圖表及CSV；顯示切換保留時間。81組獨立參考點、叉積、dL/dt與守恆檢查通過。 | 原站右手定則圖解與實際瀏覽器操作仍待對照；本地提供可旋轉3D向量與數值圖表。 |
| site-023 | 動力學 | [鉛直半圓軌道運動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/verticalHalfCircle2023/verticalHalfCircle2023.html) | implemented | 部分涵蓋 | [鉛直半圓軌道](../../half-circle.html) | 已有專用單面半圓軌道：正向力非負、低速回轉、N=0 脫離、頂端飛出、後續拋體與首次再接觸／觸地事件。117組獨立物理檢查通過。 | 目前在首次再接觸或觸地前停止；原站後續反彈／再接觸模式與互動控制仍需逐項對照。 |
| site-024 | 動力學 | [環球碰撞](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/ringBall2024/ringBall2024.html) | implemented | 核心已做出 | [環球碰撞與自由圓環](../../ring-ball.html) | 自由平移圓環內有限半徑球的多次精確碰撞；可調質量比、初速、偏心與恢復係數；合質心、碰撞標示、圖表與回放。225 組獨立檢查涵蓋幾何、衝量、線／角動量、能量與合質心。 | 補原站跟隨圓環／合質心視角與實際瀏覽器功能對照。 |
| site-025 | 動力學 | [向左滾？向右滾？](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/theAxis/theAxis.html) | implemented | 核心已做出 | [線軸向左滾？向右滾？](../../pulled-spool.html) | 內外圈線軸、下側繞線切點、可調拉力仰角、左右純滾動與臨界角；聯立平動、轉動及靜摩擦可行性。972組驗證涵蓋功—能與無滑動條件。 | 依Flash截圖與文字重建，未執行Flash；待瀏覽器視覺操作驗收。模型不推演打滑、離地或繩長耗盡。 |
| site-026 | 動力學 | [離心力與柯氏力](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/centrifugalForce2022/centrifugalForce2022.html) | in-progress | 部分涵蓋 | [離心力與柯氏力](../../noninertial.html) | 自由質點的精確平移加速／等角速旋轉座標轉換，三項假想力、可調慣性初速、向量、時間圖與CSV。108組獨立檢查涵蓋相對F=ma、反轉換、柯氏力零功與極限情況。 | 補原站彈簧約束裝置、人物跟隨／慣性系觀察切換，並核對四種原站模式與瀏覽器操作。 |
| site-027 | 動力學 | [桌子上有洞](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/holeOnTable2024/holeOnTable2024.html) | in-progress | 部分涵蓋 | [桌子上有洞：懸掛重物](../../hole-table.html) | 已實作桌面球與懸掛重物的繩長耦合、徑向與角向運動、張力與能量圖表；81組獨立檢查涵蓋繩長、角動量、總機械能、兩物體受力及圓周平衡。 | 補原站手拉與敲擊兩模式、控制項與實際瀏覽器對照；懸掛物導向與原站幾何仍需核實。 |
| site-028 | 動力學 | [轉動的Y形桿](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/rotatingY2024/rotatingY2024.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 截圖可確認Y形旋轉桿、紅球與彈簧、固定轉速／自由轉動選項；尚不能確定紅球與桿的滑動／鉸接約束及彈簧端點，需查原站模型或操作證據後建立運動方程，不以推測裝置冒充。 |
| site-029 | 動力學 | [直線碰撞](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/linearCollision2023/linearCollision2023.html) | implemented | 核心已做出 | [一維碰撞與恢復係數](../../collision.html) | 沿用既有collision，新增無質量彈簧的有限接觸解析解、連續速度、接觸力、最大壓縮與分離事件、彈性位能及總機械能圖表。162組獨立檢查通過，原瞬時恢復係數模式保留。 | 核對原站彈簧參數、顯示選項及實際瀏覽器操作；本地有限接觸模式為完全彈性，恢復係數僅作用於瞬時模式。 |
| site-030 | 動力學 | [平面彈性碰撞](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/collision2D2023/collision2D2023.html) | implemented | 核心已做出 | [二維偏心碰撞與自轉](../../collision-2d.html) | 已擴充原模型：兩球各自初速／方向、帶正負偏心、初始自轉、精確碰撞或未命中、光滑／有限摩擦／切向不滑衝量，轉動動能與總角動量。432組獨立檢查（108命中、324未命中）通過。 | 待原站視角（球1／球2／地面）、控制選項及實際瀏覽器對照；本地已加兩球任意入射與粗糙接觸，地面不提供水平摩擦。 |
| site-031 | 萬有引力 | [行星軌道N次方](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/orbitalGravityN2024/orbitalGravityN2024.html) | implemented | 核心已做出 | [行星軌道與距離指數](../../orbit.html) | 沿用orbit，距離指數N可調−1到4，含N=1對數位能、初始引力正規化、非平方反比軌道進動、自適應RK4及內外界線。48組守恆／力學檢查與N=−1解析簡諧橢圓交叉驗證通過。 | 原站等面積速率的面積扇區、彈簧示意及控制顯示仍待對照；實際瀏覽器驗收待完成。 |
| site-032 | 萬有引力 | [洲際斜拋](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/intercontinentalProjectile2024/intercontinentalProjectile2024.html) | implemented | 核心已做出 | [洲際斜拋與球面落點](../../intercontinental.html) | 球面星球平方反比引力、可調圓軌道速率比與當地仰角，通用Kepler橢圓／拋物／雙曲解，首次返回地表停止、球面落點及大圓弧讀值；60組獨立檢查通過。 | 原站真實地圖、軌道焦點顯示及攝影機跟隨仍待補；實際瀏覽器與控制項對照待驗收。 |
| site-033 | 萬有引力 | [雙星互繞](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/twoStar2024/twoStar2024.html) | implemented | 核心已做出 | [雙星互繞與總機械能](../../binary-stars.html) | 兩顆星繞共同質心，質量比0.001–1、近日／遠日比、軌道尺度、重力與質心漂移可調；兩星軌跡、速度、引力、動能／位能及質心系機械能。81組獨立Kepler、力學與守恆檢查通過。 | 原站控制與實際瀏覽器視覺操作仍待核對；本地採教學SI尺度、質點兩星與精確橢圓解。 |
| site-034 | 萬有引力 | [平拋與圓錐](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/projectileCone2025/projectileCone2025.html) | implemented | 核心已做出 | [平拋與圓錐曲線](../../projectile-cone.html) | 重用洲際斜拋Kepler核心，水平初速平方比1–2對應圓／橢圓／拋物線；軌道等距嵌入45°圓錐切平面，球體／圓錐顯示切換不重設時間。36組獨立幾何與力學檢查通過。 | 原站地圖、完整講解標記與實際瀏覽器操作對照尚待補；本地已有星球／圓錐切換及切平面。 |
| site-035 | 彈簧與木塊 | [水平彈簧雙振子](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springBlockAH/springBlockAH.html) | implemented | 核心已做出 | [水平彈簧雙振子：貼牆釋放](../../wall-spring-pair.html) | 修正初始對照：截圖035顯示左塊貼牆、內部彈簧連接兩塊，不能據此宣稱有牆端彈簧。已新增單面牆支撐與離牆後自由雙體兩階段解析解，含支撐力、外部衝量、動量及能量。81組獨立檢查通過。 | 原站壓／放按鈕與實際瀏覽器操作待對照；本地以初始壓縮量拉桿及播放／重設完成壓縮釋放。 |
| site-036 | 彈簧與木塊 | [彈簧木塊細線](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springBlockAndWire2024/springBlockAndWire2024.html) | in-progress | 部分涵蓋 | [彈簧木塊與細線：剪線比較](../../spring-wire-cut.html) | 已新增並排彈簧／細線兩組雙木塊，靜力平衡後同步剪掉上方支撐，精確比較加速度、張力、質心與能量；81組獨立檢查與接觸前停止。 | 補原站其他側向／支撐配置、剪線按鈕語意及實際瀏覽器驗收；目前完成主畫面的雙木塊鉛直比較。 |
| site-037 | 彈簧與木塊 | [落下物體壓彈簧](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springBlockCV/springBlockCV.html) | implemented | 核心已做出 | [落下物體壓彈簧](../../falling-spring.html) | 兩組同高釋放、單面彈簧接觸、解析壓縮回彈、自然長分離及重複拋上／下落；可調兩質量、k、h、g，附接觸／最大壓縮／分離／最高點事件與能量圖。54組獨立檢查通過。 | 原站兩組隱藏質量／彈簧參數與剪線按鈕語意、實際瀏覽器操作仍待對照；本地提供可調兩質量的同高比較。 |
| site-038 | 彈簧與木塊 | [鉛直雙振子壓放](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springBlockDVPress/springBlockDVPress.html) | implemented | 核心已做出 | [鉛直雙振子壓放與離地](../../vertical-spring-pair.html) | 上下木塊與內部彈簧、額外壓力與總重量之比、單面地面支撐、精確離地時刻、自由雙體、再次落地及重複跳動；分別記錄機械能與落地耗能，90組獨立檢查通過。 | 原站壓／放操作、受力合成顯示與實際瀏覽器對照待完成；本地下塊落地採不反彈假設，需核對原站接觸慣例。 |
| site-039 | 彈簧與木塊 | [阻尼振盪](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/dampingOscillation2022/dampingOscillation2022.html) | implemented | 核心已做出 | [阻尼振動：鉛直彈簧與阻尼器](../../damped.html) | 修正先前對照：039截圖是鉛直彈簧與阻尼器並聯，不是單擺。已沿用damped線性模型並改為對應鉛直幾何、平衡位移、彈簧／重力／阻尼分解、阻尼比與耗能。36組獨立三種阻尼解析驗證通過。 | 待核對原站阻尼比滑桿的範圍及實際瀏覽器操作；本地直接調c，另提供ζ與臨界c讀值。 |
| site-040 | 彈簧與木塊 | [受迫振盪](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/forcedOscillation2022/forcedOscillation2022.html) | implemented | 核心已做出 | [受迫振盪：十振子共振比較](../../resonance-bank.html) | 已新增十個不同自然頻率振子同步底板驅動，頻率／振幅／阻尼可調，逐振子位移圖與CSV、共振增幅、底板功與阻尼耗能；18組×10振子的獨立解析檢查通過。單一driven另保留。 | 原站SHM選項、自然頻率範圍與實際瀏覽器互動仍待核對；本地為十振子同底板驅動，完整顯示暫態。 |
| site-041 | 彈簧與木塊 | [耦合振盪](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/couplingOscillation2022/couplingOscillation2022.html) | implemented | 核心已做出 | [耦合振盪與能量交換](../../coupled-oscillators.html) | 兩端固定彈簧與中央耦合彈簧、獨立初始位移／速度、不同質量、精確正常模態疊加、能量交換與左右位移相圖；162組獨立模態／力學驗證及圖形切換DOM檢查通過。 | 原站特徵模式選項與實際瀏覽器控制待對照；本地可用獨立初值設定同／反相模式，並提供兩模態能量與下方位移相圖。 |
| site-042 | 彈簧與木塊 | [彈簧阿特伍機](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springAtwood2023/springAtwood2023.html) | implemented | 核心已做出 | [彈簧阿特伍機：可動支點](../../spring-atwood.html) | 無質量滑輪由上方彈簧支承，兩側重物固定繩長；精確支點振動及相對阿特伍運動、動態平衡初值、張力／彈力及能量，81組獨立檢查通過。 | 待原站分解顯示與實際瀏覽器對照；本地圖表已分別提供滑輪與相對運動座標。繩鬆弛、輪慣量不在目前理想模型內。 |
| site-043 | 剛體碰撞 | [質點撞棒](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/ballHitRod/ballHitRod.html) | implemented | 核心已做出 | [質點撞棒：平動與轉動](../../ball-rod.html) | 自由棒／上端固定×彈性／合體四組合，質量、長度、初速及撞擊位置可調；平動與轉動動能、合體耗能、角動量及支點衝量，108組獨立檢查通過。 | 原站操作與實際瀏覽器驗收待完成；本地以質點／零厚度棒處理，彈性模式再次接觸前停止，未模擬多次碰撞。 |
| site-044 | 剛體碰撞 | [彈跳球](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/superBall2022/superBall2022.html) | implemented | 核心已做出 | [桌下彈跳球：平動與自轉](../../rough-bounce.html) | 已新增桌底／地面多次精確碰撞、光滑／理想粗糙彈性切換、切向速度反向的平動自轉耦合、初始自轉與法向恢復係數、能量分解；108組獨立檢查通過，未以階梯球替代。 | 原站初始發射、跟隨選項與實際瀏覽器操作待對照；本地表面為無限平行面，不含桌緣或桌腳碰撞。 |
| site-045 | 熱學 | [焦耳實驗](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/JouleExperiment/JouleExperiment.html) | implemented | 核心已做出 | [焦耳實驗：功與水溫上升](../../joule-experiment.html) | 兩側重錘、繞線輪、攪拌器與溫度計；解析下降／轉軸減速，水與容器吸熱、卡焦換算、動能及落地損失收支。36組獨立動力學／量熱檢查通過。 | 由Flash截圖及說明重建，未執行Flash／EXE；原站隱藏參數及實際瀏覽器驗收仍待對照。 |
| site-046 | 熱學 | [熱運動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/thermal3D/thermal3D.html) | implemented | 核心已做出 | [熱運動：固體晶格振動](../../thermal-lattice.html) | 64粒子三維固體諧振系綜、可調溫度與質量／彈簧常數、rms速度及振幅、均分能量、零溫極限；nm顯示與ps慢放而CSV保留SI。36組物理與微觀播放／CSV檢查通過。 | 由Flash截圖／文字重建；原站加熱／降溫按鈕的漸變過程未確認。本地溫度拉桿設定新系綜，不模擬熱傳導；實際瀏覽器待驗收。 |
| site-047 | 熱學 | [理想氣體模型](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/airDynamics2024/airDynamics2024.html) | implemented | 核心已做出 | [理想氣體模型與壁面壓力](../../ideal-gas.html) | 100至1000粒子、箱壁彈性反射、可開關等質量硬球互撞、碰撞標記、粒子0跟隨／CSV、Gaussian初速與精確溫度正規化、壁面衝量壓力及理想值比較。獨立解析／守恆／壓力與1000粒子8022事件壓力測試通過。 | 原站顯示選項及實際瀏覽器操作仍待核對；本地有限半徑硬球近似理想氣體，壓力量測有有限時間與排除體積差異。 |
| site-048 | 熱學 | [氣體分子速率分布](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/MaxwellBoltzmannDistribution2024/MaxwellBoltzmannDistribution2024.html) | implemented | 核心已做出 | [氣體分子速率分布](../../maxwell-distribution.html) | 重用ideal-gas壁面核心，100–5000粒子、Gaussian分量／Maxwell速率／動能分布、有限樣本正規化直方圖與理論曲線、全部速度對照、位置／速度空間及三方向平均動能。6組與5000粒子獨立機率／矩檢查通過。 | 原站顯示與能量均分選項的操作仍待實際瀏覽器對照。本地無互撞粒子保持速率分布，未模擬非平衡熱化。 |
| site-049 | 熱學 | [能量均分定理](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/equipartitionTheorem2024/equipartitionTheorem2024.html) | implemented | 核心已做出 | [能量均分：平動轉動與振動](../../equipartition.html) | 單原子／剛性雙原子／含伸縮雙原子、100–5000分子、單分子放大、3D轉動與伸縮構型、平動／轉動／振動能量柱圖及理論均分值；12組及5000分子獨立模態檢查通過。 | 原站操作及實際瀏覽器驗收待完成。本地為已平衡的經典解耦模態系綜，未推演碰撞熱化、量子凍結或轉動振動高階耦合。 |
| site-050 | 熱學 | [鉛直汽缸壓縮](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/verticalPiston2025/verticalPiston2025.html) | in-progress | 部分涵蓋 | [鉛直絕熱汽缸：快慢壓縮比較](../../adiabatic-pistons.html) | 汽缸＋彈簧／汽缸＋汽缸、左右獨立加壓時間、活塞慣性與可選外部阻尼、非線性均勻絕熱狀態、溫度及作功耗能收支。24組熱力學／受力／對稱／準靜態極限檢查通過。 | 本地先完成均勻、內部可逆絕熱的雙活塞比較；尚需原站粒子／薄片模型、快速非均勻壓縮與控制語意對照，以及實際瀏覽器驗收。不能把PVγ模型宣稱成完整微觀快壓。 |
| site-051 | 波動 | [基礎波動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/wave2DBasic/wave2DBasic.html) | implemented | 核心已做出 | [基礎波動：傳播反射與介質](../../basic-waves.html) | 波浪舞、橫波、縱波、深水波、固定端／自由端反射、粗入細／細入粗8模式；共用解析波核、追蹤點、入射反射分色、深度軌跡與能量係數。32組獨立運動／邊界／介面能量檢查通過。 | 原站各模式隱藏參數、控鍵及實際瀏覽器互動待對照；本地水波採深水線性近似，脈衝與粗細比值已在介面明示。 |
| site-052 | 波動 | [駐波的產生](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/wave2DStandingWave/wave2DStandingWave.html) | implemented | 核心已做出 | [駐波的產生與波的疊加](../../standing-waves.html) | 兩反向波疊加、建設／破壞脈衝干涉、週期駐波，振幅比、相位、節腹與三列分量比較。 | 原站下拉選單與隱藏控制語意仍待互動核對；真實瀏覽器驗收未完成。 |
| site-053 | 波動 | [管內縱波](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/wave2DLongitudinal/wave2DLongitudinal.html) | implemented | 核心已做出 | [管內縱波、反射與駐波](../../longitudinal-tube.html) | 六模式：縱波、反向波駐波、閉口／開口反射、一端閉管／兩端開管駐波；位移與壓力、頻率、模態序號及節腹。 | 原站完整控制範圍與隱藏互動仍待逐項核對；真實瀏覽器驗收未完成。 |
| site-054 | 波動 | [A繩入B繩](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/wave2DAtoB/wave2DAtoB.html) | implemented | 核心已做出 | [A繩入B繩：反射與透射](../../string-interface.html) | 可調B/A線密度比、A波速、脈衝振幅／半寬、追蹤位置；分量、振幅算式／能量算式、反射透射讀值。 | 原站完整控制範圍與隱藏互動仍待逐項核對；真實瀏覽器驗收未完成。 |
| site-055 | 波動 | [橫波變縱波](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/waveT2WaveL/waveT2WaveL.html) | implemented | 核心已做出 | [橫波變縱波：振動方向轉換](../../wave-polarization.html) | 同一相位下連續調整振動角0–90°，粒子陣列、全體同相SHM、圓投影與雙向行波；角度保留t/播放並更新物理向量。 | 原站SHM與方向按鈕的完整語意、控制範圍仍待互動確認；真實瀏覽器尚未驗收。 |
| site-056 | 波動 | [橫波波函數](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/waveFunction/waveFunction.html) | implemented | 核心已做出 | [橫波波函數：空間、時間與曲面](../../wave-function.html) | y(x,t)三維時空曲面、目前t空間波形與固定x時間曲線，獨立視覺開關、雙向波、初相位與追蹤點。 | 原站看波／看面／俯瞰相機預設與未標籤控制待核對；真實瀏覽器尚未驗收。 |
| site-057 | 波動 | [橫波的力學能](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/waveEnergyOnString/waveEnergyOnString.html) | implemented | 核心已做出 | [橫波的力學能與能流](../../string-wave-energy.html) | 左右行波／駐波的動能、彈性位能、總能密度與局部能流；兩波長總能、精確短繩段質心與兩端張力；下方動態空間能量圖。 | 原站播放倍率、張力／速度圖示與完整控制範圍仍待逐項操作核對；真實瀏覽器尚未驗收。 |
| site-058 | 波動 | [雙點波源干涉](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/interferenceTwoSource2023/interferenceTwoSource2023.html) | implemented | 核心已做出 | [雙點波源干涉](../../two-source-interference.html) | 雙點穩態等幅徑向波面、初相位差、源距／波長／振幅／速度、單源與合成視圖、節腹雙曲線及退化射線、等相位波前。 | 原站完整控制、平面模式、能量相關顯示與透明度仍待對照；真實瀏覽器尚未驗收。 |
| site-059 | 聲音 | [共鳴氣柱實驗](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/resonanceExperiment/resonanceExperiment.html) | implemented | 核心已做出 | [共鳴氣柱：水位與音叉](../../resonance-column.html) | 水位／氣柱長度、固定音叉頻率、阻尼穩態受迫聲學、共鳴長度標記與長度響應曲線，手動啟用物理Hz純音。 | 未重現原版Flash的即時拖杯與聲音建立過程；本模型採已達穩態的壓力驅動近似，端部修正／輻射未計。真實瀏覽器與音響待驗收。 |
| site-060 | 聲音 | [波以耳實驗](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/bell/bell.html) | implemented | 核心已做出 | [波以耳實驗：玻璃罩抽氣鈴聲](../../vacuum-bell.html) | 玻璃罩／泵／持續振動鈴體、抽氣／進氣／封閉／循環、泵極限與漏氣、傳聲衰減與結構傳聲、可選純音播放。 | 原版即時抽放按鈕目前以重設式模式拉桿替代，需補動態閥門歷史；聲強採簡化耦合近似，非真實聲場／音色。真實瀏覽器及音響待驗收。 |
| site-061 | 聲音 | [聲速](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/speedSound/speedSound.html) | implemented | 核心已做出 | [聲速：溫度與聲音抵達時間](../../sound-speed.html) | 兩山聲源／接收者、冷熱溫度控制、乾空氣聲速、有限聲包前後緣、精確d/c抵達、可選聆聽位置及接收包絡圖。 | 原版哭聲、太陽／北風互動細節與地形美術未逐項重現；本題純音與地形為示意，未計風速、濕度、反射／繞射。真實瀏覽器及聽感待驗收。 |
| site-062 | 聲音 | [回聲](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/backSound/backSound.html) | implemented | 核心已做出 | [山壁與回聲](../../echo.html) | 可調山壁距離、溫度、聲長、反射係數及辨識間隔；精確2d/c前後事件、一次反射波前／包絡、原聲與延遲回聲提示。 | 原站拖曳山壁目前以距離拉桿替代；音訊為包絡相加提示，未模擬重疊相干相消或哭聲音色。實際可辨性不以單一閾值保證，真實瀏覽器／聽感待驗收。 短脈衝音訊目前按動畫幀更新並平滑gain，最短聲包的事件調度／聽感需補實測。 |
| site-063 | 聲音 | [都卜勒效應](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/DopplerEffect2024/DopplerEffect2024.html) | implemented | 核心已做出 | [都卜勒效應：移動聲源與觀察者](../../doppler.html) | 聲源／觀察者對地速度、均勻風、遲滯波面交會、前後波長、接收頻率、代表性發射波面中心及分析路徑；可選源／接收音高。 | 目前次音速、平行錯開路徑與均勻風，未含超音速震波／多重遲滯解；原站完整控制範圍與分析面板仍待逐項對照。真實瀏覽器／聽感待驗收。 |
| site-064 | 聲音 | [聲音三要素](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/soundCHCH/soundCHCH.html) | implemented | 核心已做出 | [聲音三要素：音高、振幅與音色](../../sound-elements.html) | 基頻／振幅、純音／八次諧波／奇次諧波／64部分音帶限噪音、3D波形與振幅頻譜、密集時間窗圖；與合成音訊共用Fourier係數。 | 原站sound A／B錄音不可得，改用明示諧波合成而非原聲還原；噪音為100ms重複的64部分音示意，非理想白噪音。真實瀏覽器與音色／聽感待驗收。 |
| site-065 | 聲音 | [頻譜與波形](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/soundWaveform/soundWaveform.html) | in-progress | 部分涵蓋 | [聲音三要素：音高、振幅與音色](../../sound-elements.html) | sound-elements已有基頻、音量、八條諧波獨立相對振幅、波形、頻譜及同係數合成聲音；選音色4使用自訂，係數依絕對值和歸一，全零靜音。 | 原站逐控制語意與實際瀏覽器驗收仍待完成；基頻、音量及預設音色切換目前仍重設。 |
| site-066 | 聲音 | [方波傅立葉](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/fourierSqareWave/fourierSqareWave.html) | in-progress | 核心已做出 | [方波傅立葉：圓投影與逐項疊加](../../fourier-square.html) | 六排奇次諧波圓投影、串接圓向量及逐項部分和；可調基頻、振幅、項數，理想方波、音訊與下方密集波形圖。 | 原站完整控制語意、實際瀏覽器與聽感驗收待完成；離線預覽非瀏覽器。 |
| site-067 | 幾何光學 | [平面鏡成像](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/mirrorImage2021/mirrorImage2021.html) | in-progress | 核心已做出 | [平面鏡成像與可見範圍](../../plane-mirror.html) | 有限矩形鏡面、三個點物體、等距虛像、眼睛位置、鏡寬與橫向位置拉桿；反射光路、虛線延長及可見性。 | 原站延伸物體造型與逐點可見範圍、拖曳互動、完整顯示控制及實際瀏覽器驗收仍待補。 |
| site-068 | 幾何光學 | [兩人同鏡](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/twoPersonOneMirror2021/twoPersonOneMirror2021.html) | in-progress | 核心已做出 | [兩人同鏡：全身像與最小鏡高](../../shared-mirror.html) | 兩人各自看自己全身，身高、眼高比例、距離與鏡面高度／位置；最小共同鏡面範圍、反射端點及可見虛像線段。 | 原站人物外觀、各人物視角快捷與額外顯示模式、實際瀏覽器操作驗收仍待核對。 |
| site-069 | 幾何光學 | [雙鏡成多像](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/doubleMirrorImage2021/doubleMirrorImage2021.html) | in-progress | 核心已做出 | [雙鏡成多像：反射次數與可見光路](../../double-mirror.html) | 30至150度有限鏡面、物體及眼睛極座標拉桿、最多12次交替反射的可見性追跡；重合像合併、選像光路、奇偶手性標記。 | 原站懸停選像、雙視圖及原站完整顯示控制、實際瀏覽器驗收仍待完成；目前以選像拉桿替代懸停，交線退化光路排除。 |
| site-070 | 幾何光學 | [曲面鏡反射](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/curveMirrorReflection2021/curveMirrorReflection2021.html) | in-progress | 核心已做出 | [曲面鏡反射與焦點性質](../../conic-mirror.html) | 四種精確曲線、有限口徑、尺度、平行／點光源、偏移／傾角；最多1至12次反射、每次下一交點與法線、離弧逃逸及上限截停標記、反向延長與焦點。 | 原站完整顯示控制與實際瀏覽器驗收仍待核對；目前為有限右側弧的子午截面、最多12次反射，未模擬完整旋轉面。 |
| site-071 | 幾何光學 | [成像作圖](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/imageDrawing2023/imageDrawing2023.html) | in-progress | 核心已做出 | [成像作圖：透鏡與面鏡](../../image-drawing.html) | 四種薄元件模式、物距／物高／焦距、三條特殊光線及上下端光線開關、成像開關；有號像距、放大率、實虛像與焦點無限遠。 自由手繪、四色筆、撤回／清除，筆跡附著作圖平面並隨視角變換；作畫不改時間與播放。 | 原站完整操作與顯示模式、實際瀏覽器／觸控驗收仍待完成；標註僅在本次頁面內保存。 |
| site-072 | 幾何光學 | [折射的原因](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/deflection2023/deflection2023.html) | in-progress | 核心已做出 | [折射的原因：雙輪車跨介面](../../refraction-cart.html) | 雙輪規定速度依介質改變的解析剛性無側滑車，含先後跨界、轉向、折射、精確臨界及折返；輪距／入射角／兩速可調，輪跡／軸歷程／理想光線顯示。 七色色散比較使用同一解析車模型，420至650nm各自依明示速度函數改速、折射或折返，共用時間軸；強度可調，主讀值550nm。 | 原站精確色散參數與完整控制語意、實際瀏覽器操作驗收仍待核對；目前以未校準Cauchy形速度比呈現正常色散，非特定材料。 |
| site-073 | 幾何光學 | [多層折射](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/mutiLayer/mutiLayer.html) | in-progress | 核心已做出 | [多層平行介質折射](../../layered-refraction.html) | 四層n值、入射角／位置拉桿、Snell主光路、全反射返回、臨界掠射、奈秒光程播放及局部反射方向；4組預設與自訂同步控制。 | 原站前三組Flash內部預設數值不可讀，目前以明示教學預設替代；拖曳光線與完整控制語意、實際瀏覽器操作驗收仍待核對。不追跡部分反射分支或Fresnel能量。 |
| site-074 | 幾何光學 | [杯中吸管](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/strawInCup2026/strawInCup2026.html) | in-progress | 核心已做出 | [杯中吸管：容器與折射外觀](../../straw-cup.html) | 零壁厚圓柱／長方形液體容器、條紋吸管、n／水深／傾角，自由視角逆向光線追蹤水面與側面，含全反射與最多8次交互作用；真實位置疊加。 | 原站魚物件、完整顯示及相機控制語意、實際瀏覽器效能與觸控驗收待補；不含玻璃殼、部分反射與Fresnel能量。 |
| site-075 | 幾何光學 | [視深與實深](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/realAndApparentDepth2026/realAndApparentDepth2026.html) | in-progress | 核心已做出 | [視深與實深：雙光線反向延長](../../apparent-depth.html) | 平面界面精確Snell眼端連接、空氣／水雙方向、兩取樣光束反延長交點、物體／觀察者位置、取樣間距、真實與表觀距離標記及近軸參考。 | 原站泳池外觀、物件／視角及完整顯示控制、實際瀏覽器操作驗收待補。兩光線子午交點不代表所有離軸光線的唯一虛像。 |
| site-076 | 幾何光學 | [球形透鏡](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/sphereLens2026/sphereLens2026.html) | in-progress | 核心已做出 | [球形透鏡：內外觀察與全反射](../../sphere-lens.html) | 球面交點與最多8次向量Snell/TIR逆追跡、內外觀察、n及內部眼點與外觀魚位置，內部首界面最大入射角／臨界角／均勻立體角TIR比例。 | 原站環境圖、魚游動、網格及完整控制語意、實際瀏覽器效能與觸控驗收待補；不含玻璃殼或Fresnel部分反射。 |
| site-077 | 幾何光學 | [Fresnel Equation](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/FresnelEquation2024/FresnelEquation2024.html) | in-progress | 核心已做出 | [Fresnel：偏振與反射透射能量](../../fresnel.html) | 無吸收非磁介質複數Fresnel係數、s/p/非偏振/相干線混合、R/T功率與角度掃描、Brewster角、全反射相位；E及相對cB波形與反射／透射顯示。 | 原站完整控制語意及實際瀏覽器操作驗收仍待核對；不畫消逝場，波形採明示相位放大／慢放示意。 |
| site-078 | 幾何光學 | [眼看透鏡成像](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/lensImage2026/lensImage2026.html) | in-progress | 核心已做出 | [眼看透鏡成像：有限口徑外觀](../../eye-lens.html) | 六薄元件模式、有限圓孔與逆向視角追跡、物距／焦距／口徑／圖案尺寸；非對稱程式圖案、鏡外構圖像及無限遠處理，鏡背面不反射。 | 原站側面遠看／觀察視野快捷、球物件、完整顯示與視角控制、實際瀏覽器效能及觸控驗收待補；曲面模式採近軸薄元件，非大角度精確曲面。 |
| site-079 | 幾何光學 | [成像之舞](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/dancingImage/dancingImage.html) | in-progress | 核心已做出 | [成像之舞：物體與透鏡的運動](../../dancing-image.html) | 凸／凹透鏡，物體及透鏡獨立固定／SHM／等速／圓周平移；解析像位置／速度／加速度、光線／軌跡／成像與共軛位置切換。焦點空值、速度圖斷線與CSV留空。 | 原站完整操作與控制語意、實際瀏覽器驗收待核對；物距至0.05m停止，不模擬物體穿越元件或透鏡轉動。 |
| site-080 | 幾何光學 | [透鏡遮一半](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/lensFilterHalf2021/lensFilterHalf2021.html) | in-progress | 核心已做出 | [透鏡遮一半：完整像與光量](../../half-lens.html) | 圓弓形精確面積及CDF開孔抽樣、逐物點加權光線、有限孔徑薄透鏡屏幕成像；點／十字／三色、遮板／焦距／物距比／半徑／屏距比、光線／屏幕／固定曝光。 | 原站觀看面／側視快捷、遠看與完整操作語意、實際瀏覽器驗收待核對；物體離散取樣、幾何光學不含繞射。 |
| site-081 | 幾何光學 | [視差法找成像位置](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/opticalParallax/opticalParallax.html) | in-progress | 核心已做出 | [視差法：移動眼睛找成像位置](../../optical-parallax.html) | 六種實／虛透鏡及面鏡模式、左右擺頭與參考棒、精確角投影與鏡孔檢查，手動／校準、3D與眼中視野、水平角曲線。 | 原站完整操作／視角語意與實際瀏覽器驗收待核對；標棒為旁路直接觀察的理想參考，未做元件遮擋與人眼調焦。 |
| site-082 | 幾何光學 | [光學儀器](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/opticalInstruments2021/opticalInstruments2021.html) | in-progress | 核心已做出 | [光學儀器：多透鏡與成像](../../optical-instruments.html) | ABCD多元件核心、物鏡／目鏡的啟閉／凸凹／焦距／口徑及間距；四教學預設、有限／無限遠物體、成像與角放大率區分、固定視網膜幾何光斑及子午孔徑通過。 | 原站完整三維物體／視野、尺與各快捷控制及實際瀏覽器驗收待補；目前子午光線取樣，非三維孔徑能量或完整視覺成像。 |
| site-083 | 幾何光學 | [虹與霓](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/rainbow3D2022/rainbow3D2022.html) | in-progress | 核心已做出 | [虹與霓：水滴光路與觀察角](../../rainbow.html) | 精確球滴光路及s/p各別Fresnel通量連乘、主／次虹極值與七色色序；觀察者角錐、太陽仰角、平地／懸崖全圓、單水滴光點、固定亮度與角錐線。 | 原站完整天空外觀、觀察視野、亮度角分布及各控制、實際瀏覽器驗收待補；未計Alexander暗帶及超數虹亮度，色散為明示教學函數。 |
| site-084 | 幾何光學 | [希區考克變焦](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/hitchcock2026/hitchcock2026.html) | in-progress | 核心已做出 | [希區考克變焦：主體不變、背景改變](../../dolly-zoom.html) | 固定3D環、3:2感光面聚焦透視投影、f/d同步、三比較模式、往返／手動、距離／焦距／圓環參數及自由3D取景範圍。 | 原站完整視野控制及實際瀏覽器操作驗收待核對；省略景深、像差及真實內對焦鏡頭呼吸。 |
| site-085 | 波動光學 | [雙狹縫繞射](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/doubleSlit2016/doubleSlit2016.html) | in-progress | 核心已做出 | [雙狹縫干涉與有限縫長繞射](../../double-slit.html) | 擴充原double-slit，加入孔徑面內旋轉、水平入射傾角、兩縫獨立薄相位片、複振幅與2D強度；保留真實縫長寬／縫距／波長／屏距與掃描。 | 原站波形／波前及強度／圖形的過程顯示、旋轉控制完整語意與實際瀏覽器驗收仍待核對；純量Fraunhofer且薄片不含吸收／反射／傾斜校正。 |
| site-086 | 波動光學 | [干涉繞射條紋](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/diffractionPattern2023/diffractionPattern2023.html) | in-progress | 核心已做出 | [方孔、圓孔與多孔陣列干涉繞射](../../aperture-pattern.html) | 矩形／圓孔、1..8×1..8陣列、兩軸孔尺寸及淨距、屏距波長亮度與示意放大；矩形sinc、圓孔Bessel/Airy及相干陣列和。 | 原站精確控制範圍及放大操作語義尚未完全核對；遠場近似及中心峰歸一，無近場或不同孔板絕對功率比較；瀏覽器操作待驗收。 |
| site-087 | 波動光學 | [干涉繞射的強度](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/diffractionIntensity2022/diffractionIntensity2022.html) | in-progress | 核心已做出 | [干涉繞射：電場向量與孔徑疊加](../../diffraction-amplitudes.html) | 五模式：電場向量、多縫、單縫、雙縫、雙光柵；有限孔分區解析積分、首尾相接向量、A/B/A+B、瞬時場／強度及手動自動掃描。 | 雙光柵目前定義為兩組有限狹縫，原站精確語義與各控制仍需逐項對齊；實際瀏覽器操作待驗收。 |
| site-088 | 波動光學 | [轉狹縫轉雷射](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/rotateSlitLaserScreen/rotateSlitLaserScreen.html) | in-progress | 部分涵蓋 | [雙狹縫干涉與有限縫長繞射](../../double-slit.html) | double-slit現有孔徑面內旋轉、小角度雷射斜入射，以及±60°平面屏水平轉動；以屏上實際位置求出射方向及複數振幅。 | 原站波長倍數尺寸範圍、狹縫法向轉動、廣角雷射、圓弧屏、角度尺及波程差輔助尚未重建；原站完整控制與瀏覽器操作待驗收。 |
| site-089 | 波動光學 | [光柵](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/opticalGrating2026/opticalGrating2026.html) | in-progress | 核心已做出 | [光柵：廣角級次與波前](../../optical-grating.html) | 廣角向量光柵級次、穿透／反射、轉角、密度、綠／紅藍光、波前、指定方向及切線；縮放沿用共用視角操作。 | 原站精確動畫/控制語義與瀏覽器操作仍待核對；採理想點溝槽相干陣列，未建模閃耀、偏振、單槽包絡及能量效率。 |
| site-090 | 波動光學 | [光的三原色](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/color3Origin2022/color3Origin2022.html) | in-progress | 核心已做出 | [光的三原色：加色與減色比較](../../rgb-lights.html) | 左右RGB加色及CMY減色、六拉桿、可調光斑半徑與分離，線性光相加後編碼sRGB。 | 原站未證實的拖曳/隱含操作及實際瀏覽器仍待核對；CMY僅理想濾片減色，非真顏料散射。 |
| site-091 | 電磁學 | [金箔驗電器](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/electroScope2024/electroScope2024.html) | in-progress | 核心已做出 | [金箔驗電器：感應、接觸與接地](../../electroscope.html) | 正負棒、預充電、靠近移開、接觸分電、先接地/斷地/移棒感應起電、電荷顯隱；集中電容及金箔力矩平衡。 | 原站拖曳棒操作一致性與瀏覽器仍待驗收；集中電容準靜態模型，非精確導體表面場，無金箔慣性漏電。 |
| site-092 | 電磁學 | [雙點電荷](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/twoCharge2025/twoCharge2025.html) | in-progress | 核心已做出 | [雙點電荷：電場、等位線與電位](../../two-charges.html) | 可調正負電量與距離、觀察點；庫侖場與電位、RK4電力線、電場方向、截面等位線、軸對稱空間線及壓縮電位地形。 | 原站電位立體/空間視圖的精確語義、完整等位面及原站拖曳等控制尚未對齊；瀏覽器待驗收。場圖省略電荷近區且線數非通量定量。 |
| site-093 | 電磁學 | [ILB LvB](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/ILBLVB2022/ILBLVB2022.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-094 | 電磁學 | [電場單擺](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/electricPendulum/electricPendulum.html) | planned | 僅相關模型 | [單擺與大角度擺動](../../mechanics.html?experiment=pendulum) | 已有純重力非線性擺。 | 缺電荷、水平電場、電力與等效重力；現有擺不能替代電場單擺。 |
| site-095 | 電磁學 | [電荷在場中運動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/qInEBFields2025/qInEBFields2025.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-096 | 電磁學 | [電磁感應](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/electromagneticInduction2022/electromagneticInduction2022.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-097 | 電磁學 | [旋轉感應](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/rotationalEMF2026/rotationalEMF2026.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-098 | 電磁學 | [電動機](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/dcMotor2022/dcMotor2022.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-099 | 電磁學 | [發電機](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/acGenerator2022/acGenerator2022.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-100 | 電磁學 | [法拉第悖論](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/FaradayParadox2024/FaradayParadox2024.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-101 | 電磁學 | [電磁波與偏極柵](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/EMWandPolarization2023/EMWandPolarization2023.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-102 | 電磁學 | [電磁波的能量](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/energyEMWave2026/energyEMWave2026.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-103 | 電磁學 | [波的邊界條件](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/waveBoundary2024/waveBoundary2024.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-104 | 近代物理 | [光電效應實驗](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/photoelectricEffectExperiment/photoelectricEffectExperiment.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-105 | 近代物理 | [原子模型的演進](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/allAtoms2025/allAtoms2025.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-106 | 近代物理 | [EPR實驗](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/EPRexperimant2022/EPRexperimant2022.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-107 | 近代物理 | [1s2s躍遷禁止](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/forbidden1s2s/forbidden1s2s.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-108 | 近代物理 | [混成軌域](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/orbitalHybridization2023/orbitalHybridization2023.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-109 | 其它 | [永動機](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/cork/cork.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-110 | 其它 | [滾動摩擦](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/tire/tire.html) | planned | 僅相關模型 | [斜面純滾動](../../mechanics.html?experiment=rolling)、[腳踏車前後輪的摩擦力](../../bicycle-friction.html) | 已有理想純滾動與輪子摩擦力方向。 | 現有模型不含滾動阻力／形變接觸力矩；不能回答無驅動輪胎自行減速的原站問題。 |
| site-111 | 其它 | [輪的純滾動](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/IPHO2008/IPHO2008.html) | planned | 部分涵蓋 | [斜面純滾動](../../mechanics.html?experiment=rolling)、[腳踏車前後輪的摩擦力](../../bicycle-friction.html) | 已有 v=Rω 的輪子平動、自轉、轉動慣量及摩擦力；腳踏車可設定等速滑行。 | 缺原站單輪指定點與軌跡的獨立觀察；2008 題目對應控制仍待確認。 |
| site-112 | 其它 | [雷射冷卻](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/ultraCold/ultraCold.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-113 | 其它 | [面截方體](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/cubeAndPlane/cubeAndPlane.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-114 | 其它 | [天空中的日行跡](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/Analemma/Analemma.html) | planned | 未找到對應 | — | 現有實驗中未找到對應的專用模型。 | 需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。 |
| site-115 | 其它 | [追蹤曲線](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/pursuitCurves2023/pursuitCurves2023.html) | planned | 僅相關模型 | [追及與會車](../../mechanics.html?experiment=pursuit) | 已有同一直線上的追及／會車。 | 缺二維追逐的速度方向持續指向目標、互相追逐與追蹤曲線。 |
| site-116 | 計算模擬 | [彈簧質量SHM](https://www.haha90.url.tw/content/TeachAnime/allTeachinfAnimation/springMassSHM/springMassSHM.html) | implemented | 核心已做出 | [有質量彈簧的振動](../../massive-spring.html) | 彈簧總質量、端點質量、剛度可調；12 段分布慣性、節點形變、最低模態與 mₛ/3 近似比較已有實作。 | 原站截圖的週期計算圖與參數範圍未逐項重現；採離散分布模型，尚待原站公式對照。 |
| user-mass | 使用者新增 | 考慮滑輪或彈簧質量的運動學 | implemented | 核心已做出 | [有轉動慣量的滑輪](../../mechanics.html?experiment=massive-pulley)、[有質量彈簧的振動](../../massive-spring.html) | 使用者新增需求已有實際模型、操作與入口。 | 保留原有 implemented 狀態，實際瀏覽器驗收尚待完成。 |
| user-double-slit | 使用者新增 | 可調尺寸與屏距的雙狹縫干涉 | implemented | 核心已做出 | [雙狹縫干涉與有限縫長繞射](../../double-slit.html) | 使用者新增需求已有實際模型、操作與入口。 | 保留原有 implemented 狀態，實際瀏覽器驗收尚待完成。 |
| user-bicycle | 使用者新增 | 腳踏車輪子的摩擦力方向 | implemented | 核心已做出 | [腳踏車前後輪的摩擦力](../../bicycle-friction.html) | 使用者新增需求已有實際模型、操作與入口。 | 保留原有 implemented 狀態，實際瀏覽器驗收尚待完成。 |
| user-violin-fourier | 使用者新增 | 小提琴聲的傅立葉分析與合成 | implemented | 核心已做出 | [小提琴聲：傅立葉分析與合成](../../violin-fourier.html) | 12個整數諧波的振幅/相位、個別波形、合成波形、開關/倍率及聲音；預設明示示意小提琴音色，另可本機匯入錄音做指定基頻與窗的Hann加權最小平方擬合。 | 屬指定基頻的諧波分析，並非完整FFT或非整數部分音/弓噪/時變音高分析。 |
| user-floating-block-shm | 使用者新增 | 方塊入水與浮力簡諧振盪 | implemented | 核心已做出 | [方塊入水與浮力簡諧振盪](../../floating-block-shm.html) | 從水面上落下的分段浮力運動，以及保證部分浸沒的平衡附近情境；可調密度/尺寸/落高/振幅/阻尼，平衡、位移、浮力、重力、合力及離水/全浸界線。 | 忽略波浪、入水衝擊、附加質量及浮體轉動；僅部分浸沒無阻尼區域為理想SHM。 |
| user-pendulum-angle-comparison | 使用者新增 | 小角度單擺與大角度單擺比較 | implemented | 核心已做出 | [小角度與大角度單擺比較](../../pendulum-angle-comparison.html) | 同初始角/擺長/重力並排比較線性近似與完整非線性擺，含精確橢圓積分週期、四階修正及誤差、同步角度雙曲線。 | 初角1..175度、觀察上限180秒，線性大角度運動為比較用假想模型，忽略阻尼。 |
| user-celestial-sphere | 使用者新增 | 天球模型 | implemented | 核心已做出 | [天球模型：恆星周日運動](../../celestial-sphere.html) | 觀測緯度、赤經、赤緯與地方恆星時；地平圈、天赤道、天極、天頂、周日軌跡及高度/方位；拱極、永不升起與掠地平線判定 | 示意恆星座標，無日期星曆、折射/歲差 |
| user-sun-earth | 使用者新增 | 日地運動 | implemented | 核心已做出 | [日地運動：地軸、晝夜與四季](../../sun-earth.html) | 固定慣性地軸、自轉/公轉、地軸傾角及四季；可調緯度/日期/太陽時，公轉與日照近景；晝夜、赤緯、白晝長與極晝夜 | 理想圓軌道與平行光，無精密曆日/折射 |
| user-moon-earth | 使用者新增 | 月地運動 | implemented | 核心已做出 | [月地運動與月相](../../moon-earth.html) | 月球公轉與同步自轉標記；月相、相位角及地球視角月相盤；傾角、交點與時間可調，區分恆星月與會合月 | 理想等速圓軌道，未含天秤動/地影/月面地形 |
| user-sun-earth-moon | 使用者新增 | 日地月模型與日蝕月蝕 | implemented | 核心已做出 | [日地月：日蝕、月蝕與軌道交點](../../sun-earth-moon.html) | 日全蝕/日環蝕/月全蝕/錯過交點與自訂情境；可調月軌傾角/交點/相位/月地距離與觀察時間窗；本影、半影、偽本影與月相分開呈現，全景/地月近景 | 近軸中心截面相交教學判定，非地表可見地點/實際蝕日期/混合蝕預報；球面半影線性明暗示意 |

## 目前專案全部 125 個實驗的反向索引

| 本地實驗入口 | 程式來源 | 對應追蹤項目與涵蓋程度 |
|---|---|---|
| [平面斜拋](../../index.html) | [index.html](../../index.html) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [階梯斜拋與反彈](../../staircase-projectile.html) | [staircase-projectile.html](../../staircase-projectile.html) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [斜面上的斜拋](../../inclined-projectile.html) | [inclined-projectile.html](../../inclined-projectile.html) | site-005（核心已做出） |
| [等加速度直線運動](../../mechanics.html?experiment=acceleration) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [自由落體與鉛直上拋](../../mechanics.html?experiment=vertical) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [渡河與相對速度](../../mechanics.html?experiment=river) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [追及與會車](../../mechanics.html?experiment=pursuit) | [mechanics-models.js](../../mechanics-models.js) | site-115（僅相關模型） |
| [空氣阻力與終端速度](../../mechanics.html?experiment=drag) | [mechanics-models.js](../../mechanics-models.js) | site-012（核心已做出） |
| [水平受力與靜、動摩擦](../../mechanics.html?experiment=friction) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [斜面滑動與摩擦](../../mechanics.html?experiment=incline) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [阿特伍德機](../../mechanics.html?experiment=atwood) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [桌面物塊與懸掛重物](../../mechanics.html?experiment=table-pulley) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [電梯與視重量](../../mechanics.html?experiment=elevator) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [變力作功與動能定理](../../mechanics.html?experiment=work) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [無摩擦軌道與能量守恆](../../mechanics.html?experiment=energy-track) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [一維碰撞與恢復係數](../../collision.html) | [mechanics-models.js](../../mechanics-models.js) | site-029（核心已做出） |
| [彈道擺](../../mechanics.html?experiment=ballistic-pendulum) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [火箭與變質量](../../mechanics.html?experiment=rocket) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [等速圓周運動](../../mechanics.html?experiment=circular) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [傾斜彎道](../../mechanics.html?experiment=banked) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [圓錐擺與角動量](../../conical.html) | [mechanics-models.js](../../mechanics-models.js) | site-022（核心已做出） |
| [鉛直圓環與能量](../../mechanics.html?experiment=vertical-circle) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [固定軸轉動與力矩](../../mechanics.html?experiment=torque) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [斜面純滾動](../../mechanics.html?experiment=rolling) | [mechanics-models.js](../../mechanics-models.js) | site-110（僅相關模型）、site-111（部分涵蓋） |
| [槓桿平衡與合力矩](../../mechanics.html?experiment=lever) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [彈簧簡諧運動](../../spring.html) | [mechanics-models.js](../../mechanics-models.js) | site-010（核心已做出） |
| [阻尼振動：鉛直彈簧與阻尼器](../../damped.html) | [mechanics-models.js](../../mechanics-models.js) | site-039（核心已做出） |
| [受迫振動與共振](../../mechanics.html?experiment=driven) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [單擺與大角度擺動](../../mechanics.html?experiment=pendulum) | [mechanics-models.js](../../mechanics-models.js) | site-094（僅相關模型） |
| [行星軌道與距離指數](../../orbit.html) | [mechanics-models.js](../../mechanics-models.js) | site-031（核心已做出） |
| [二維偏心碰撞與自轉](../../collision-2d.html) | [mechanics-models.js](../../mechanics-models.js) | site-030（核心已做出） |
| [質心與內力](../../mechanics.html?experiment=center-of-mass) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [收臂旋轉與角動量](../../mechanics.html?experiment=angular-momentum) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [有轉動慣量的滑輪](../../mechanics.html?experiment=massive-pulley) | [mechanics-models.js](../../mechanics-models.js) | user-mass（核心已做出） |
| [高空彈跳](../../bungee.html) | [mechanics-models.js](../../mechanics-models.js) | 目前清單無直接對應題目；保留為專案既有實驗 |
| [月地運動與月相](../../moon-earth.html) | [models/moon-earth.js](../../models/moon-earth.js) | user-moon-earth（核心已做出） |
| [小角度與大角度單擺比較](../../pendulum-angle-comparison.html) | [models/pendulum-angle-comparison.js](../../models/pendulum-angle-comparison.js) | user-pendulum-angle-comparison（核心已做出） |
| [有質量彈簧的振動](../../massive-spring.html) | [models/extended-mechanics.js](../../models/extended-mechanics.js) | site-116（核心已做出）、user-mass（核心已做出） |
| [腳踏車前後輪的摩擦力](../../bicycle-friction.html) | [models/extended-mechanics.js](../../models/extended-mechanics.js) | site-110（僅相關模型）、site-111（部分涵蓋）、user-bicycle（核心已做出） |
| [雙狹縫干涉與有限縫長繞射](../../double-slit.html) | [models/wave-optics.js](../../models/wave-optics.js) | site-085（核心已做出）、site-088（部分涵蓋）、user-double-slit（核心已做出） |
| [飛機投彈](../../airplane-drop.html) | [models/airplane-drop.js](../../models/airplane-drop.js) | site-001（核心已做出） |
| [安全拋物線、同時圓與頂點橢圓](../../safe-parabola.html) | [models/safe-parabola.js](../../models/safe-parabola.js) | site-002（核心已做出） |
| [雙球與移動參考系](../../relative-motion.html) | [models/relative-motion.js](../../models/relative-motion.js) | site-003（部分涵蓋） |
| [射猴子：共同自由落體](../../shoot-monkey.html) | [models/shoot-monkey.js](../../models/shoot-monkey.js) | site-004（核心已做出） |
| [斜面上的投影](../../incline-shadow.html) | [models/incline-shadow.js](../../models/incline-shadow.js) | site-006（部分涵蓋） |
| [斜拋幾度拋最遠](../../optimal-projectile.html) | [models/optimal-projectile.js](../../models/optimal-projectile.js) | site-007（核心已做出） |
| [圓周運動與簡諧投影](../../shm-projection.html) | [models/shm-projection.js](../../models/shm-projection.js) | site-008（核心已做出） |
| [鉛直彈簧與等效簡諧位能](../../vertical-spring.html) | [models/vertical-spring.js](../../models/vertical-spring.js) | site-009（核心已做出） |
| [飛輪組與皮帶傳動](../../belt-wheels.html) | [models/belt-wheels.js](../../models/belt-wheels.js) | site-011（核心已做出） |
| [滑下或倒下](../../slip-or-tip.html) | [models/slip-or-tip.js](../../models/slip-or-tip.js) | site-013（核心已做出） |
| [堆木塊與最大懸伸](../../block-stack.html) | [models/block-stack.js](../../models/block-stack.js) | site-014（部分涵蓋） |
| [把自己拉起來：內力與外力](../../self-pull.html) | [models/self-pull.js](../../models/self-pull.js) | site-015（部分涵蓋） |
| [會動的阿特伍機：四重物與雙動滑輪](../../moving-atwood.html) | [models/moving-atwood.js](../../models/moving-atwood.js) | site-016（核心已做出） |
| [輸送帶與摩擦力](../../conveyor-friction.html) | [models/conveyor-friction.js](../../models/conveyor-friction.js) | site-017（部分涵蓋） |
| [過彎傾身與失去接觸](../../bike-turn.html) | [models/bike-turn.js](../../models/bike-turn.js) | site-018（部分涵蓋） |
| [斜拋空中爆](../../projectile-explosion.html) | [models/projectile-explosion.js](../../models/projectile-explosion.js) | site-019（部分涵蓋） |
| [光滑斜面向後滑](../../recoiling-wedge.html) | [models/recoiling-wedge.js](../../models/recoiling-wedge.js) | site-020（核心已做出） |
| [人走船退與合質心](../../person-boat.html) | [models/person-boat.js](../../models/person-boat.js) | site-021（核心已做出） |
| [環球碰撞與自由圓環](../../ring-ball.html) | [models/ring-ball.js](../../models/ring-ball.js) | site-024（核心已做出） |
| [鉛直半圓軌道](../../half-circle.html) | [models/half-circle.js](../../models/half-circle.js) | site-023（部分涵蓋） |
| [線軸向左滾？向右滾？](../../pulled-spool.html) | [models/pulled-spool.js](../../models/pulled-spool.js) | site-025（核心已做出） |
| [離心力與柯氏力](../../noninertial.html) | [models/noninertial.js](../../models/noninertial.js) | site-026（部分涵蓋） |
| [桌子上有洞：懸掛重物](../../hole-table.html) | [models/hole-table.js](../../models/hole-table.js) | site-027（部分涵蓋） |
| [雙星互繞與總機械能](../../binary-stars.html) | [models/binary-stars.js](../../models/binary-stars.js) | site-033（核心已做出） |
| [洲際斜拋與球面落點](../../intercontinental.html) | [models/intercontinental.js](../../models/intercontinental.js) | site-032（核心已做出） |
| [平拋與圓錐曲線](../../projectile-cone.html) | [models/projectile-cone.js](../../models/projectile-cone.js) | site-034（核心已做出） |
| [水平彈簧雙振子：貼牆釋放](../../wall-spring-pair.html) | [models/wall-spring-pair.js](../../models/wall-spring-pair.js) | site-035（核心已做出） |
| [彈簧木塊與細線：剪線比較](../../spring-wire-cut.html) | [models/spring-wire-cut.js](../../models/spring-wire-cut.js) | site-036（部分涵蓋） |
| [落下物體壓彈簧](../../falling-spring.html) | [models/falling-spring.js](../../models/falling-spring.js) | site-037（核心已做出） |
| [鉛直雙振子壓放與離地](../../vertical-spring-pair.html) | [models/vertical-spring-pair.js](../../models/vertical-spring-pair.js) | site-038（核心已做出） |
| [受迫振盪：十振子共振比較](../../resonance-bank.html) | [models/resonance-bank.js](../../models/resonance-bank.js) | site-040（核心已做出） |
| [耦合振盪與能量交換](../../coupled-oscillators.html) | [models/coupled-oscillators.js](../../models/coupled-oscillators.js) | site-041（核心已做出） |
| [彈簧阿特伍機：可動支點](../../spring-atwood.html) | [models/spring-atwood.js](../../models/spring-atwood.js) | site-042（核心已做出） |
| [質點撞棒：平動與轉動](../../ball-rod.html) | [models/ball-rod.js](../../models/ball-rod.js) | site-043（核心已做出） |
| [桌下彈跳球：平動與自轉](../../rough-bounce.html) | [models/rough-bounce.js](../../models/rough-bounce.js) | site-044（核心已做出） |
| [焦耳實驗：功與水溫上升](../../joule-experiment.html) | [models/joule-experiment.js](../../models/joule-experiment.js) | site-045（核心已做出） |
| [熱運動：固體晶格振動](../../thermal-lattice.html) | [models/thermal-lattice.js](../../models/thermal-lattice.js) | site-046（核心已做出） |
| [理想氣體模型與壁面壓力](../../ideal-gas.html) | [models/ideal-gas.js](../../models/ideal-gas.js) | site-047（核心已做出） |
| [氣體分子速率分布](../../maxwell-distribution.html) | [models/maxwell-distribution.js](../../models/maxwell-distribution.js) | site-048（核心已做出） |
| [能量均分：平動轉動與振動](../../equipartition.html) | [models/equipartition.js](../../models/equipartition.js) | site-049（核心已做出） |
| [鉛直絕熱汽缸：快慢壓縮比較](../../adiabatic-pistons.html) | [models/adiabatic-pistons.js](../../models/adiabatic-pistons.js) | site-050（部分涵蓋） |
| [基礎波動：傳播反射與介質](../../basic-waves.html) | [models/basic-waves.js](../../models/basic-waves.js) | site-051（核心已做出） |
| [駐波的產生與波的疊加](../../standing-waves.html) | [models/standing-waves.js](../../models/standing-waves.js) | site-052（核心已做出） |
| [管內縱波、反射與駐波](../../longitudinal-tube.html) | [models/longitudinal-tube.js](../../models/longitudinal-tube.js) | site-053（核心已做出） |
| [共鳴氣柱：水位與音叉](../../resonance-column.html) | [models/resonance-column.js](../../models/resonance-column.js) | site-059（核心已做出） |
| [波以耳實驗：玻璃罩抽氣鈴聲](../../vacuum-bell.html) | [models/vacuum-bell.js](../../models/vacuum-bell.js) | site-060（核心已做出） |
| [聲速：溫度與聲音抵達時間](../../sound-speed.html) | [models/sound-speed.js](../../models/sound-speed.js) | site-061（核心已做出） |
| [山壁與回聲](../../echo.html) | [models/echo.js](../../models/echo.js) | site-062（核心已做出） |
| [都卜勒效應：移動聲源與觀察者](../../doppler.html) | [models/doppler.js](../../models/doppler.js) | site-063（核心已做出） |
| [聲音三要素：音高、振幅與音色](../../sound-elements.html) | [models/sound-elements.js](../../models/sound-elements.js) | site-064（核心已做出）、site-065（部分涵蓋） |
| [小提琴聲：傅立葉分析與合成](../../violin-fourier.html) | [models/violin-fourier.js](../../models/violin-fourier.js) | user-violin-fourier（核心已做出） |
| [日地月：日蝕、月蝕與軌道交點](../../sun-earth-moon.html) | [models/sun-earth-moon.js](../../models/sun-earth-moon.js) | user-sun-earth-moon（核心已做出） |
| [方波傅立葉：圓投影與逐項疊加](../../fourier-square.html) | [models/fourier-square.js](../../models/fourier-square.js) | site-066（核心已做出） |
| [平面鏡成像與可見範圍](../../plane-mirror.html) | [models/plane-mirror.js](../../models/plane-mirror.js) | site-067（核心已做出） |
| [兩人同鏡：全身像與最小鏡高](../../shared-mirror.html) | [models/shared-mirror.js](../../models/shared-mirror.js) | site-068（核心已做出） |
| [雙鏡成多像：反射次數與可見光路](../../double-mirror.html) | [models/double-mirror.js](../../models/double-mirror.js) | site-069（核心已做出） |
| [曲面鏡反射與焦點性質](../../conic-mirror.html) | [models/conic-mirror.js](../../models/conic-mirror.js) | site-070（核心已做出） |
| [成像作圖：透鏡與面鏡](../../image-drawing.html) | [models/image-drawing.js](../../models/image-drawing.js) | site-071（核心已做出） |
| [折射的原因：雙輪車跨介面](../../refraction-cart.html) | [models/refraction-cart.js](../../models/refraction-cart.js) | site-072（核心已做出） |
| [多層平行介質折射](../../layered-refraction.html) | [models/layered-refraction.js](../../models/layered-refraction.js) | site-073（核心已做出） |
| [杯中吸管：容器與折射外觀](../../straw-cup.html) | [models/straw-cup.js](../../models/straw-cup.js) | site-074（核心已做出） |
| [視深與實深：雙光線反向延長](../../apparent-depth.html) | [models/apparent-depth.js](../../models/apparent-depth.js) | site-075（核心已做出） |
| [球形透鏡：內外觀察與全反射](../../sphere-lens.html) | [models/sphere-lens.js](../../models/sphere-lens.js) | site-076（核心已做出） |
| [Fresnel：偏振與反射透射能量](../../fresnel.html) | [models/fresnel.js](../../models/fresnel.js) | site-077（核心已做出） |
| [眼看透鏡成像：有限口徑外觀](../../eye-lens.html) | [models/eye-lens.js](../../models/eye-lens.js) | site-078（核心已做出） |
| [成像之舞：物體與透鏡的運動](../../dancing-image.html) | [models/dancing-image.js](../../models/dancing-image.js) | site-079（核心已做出） |
| [透鏡遮一半：完整像與光量](../../half-lens.html) | [models/half-lens.js](../../models/half-lens.js) | site-080（核心已做出） |
| [視差法：移動眼睛找成像位置](../../optical-parallax.html) | [models/optical-parallax.js](../../models/optical-parallax.js) | site-081（核心已做出） |
| [光學儀器：多透鏡與成像](../../optical-instruments.html) | [models/optical-instruments.js](../../models/optical-instruments.js) | site-082（核心已做出） |
| [虹與霓：水滴光路與觀察角](../../rainbow.html) | [models/rainbow.js](../../models/rainbow.js) | site-083（核心已做出） |
| [希區考克變焦：主體不變、背景改變](../../dolly-zoom.html) | [models/dolly-zoom.js](../../models/dolly-zoom.js) | site-084（核心已做出） |
| [日地運動：地軸、晝夜與四季](../../sun-earth.html) | [models/sun-earth.js](../../models/sun-earth.js) | user-sun-earth（核心已做出） |
| [天球模型：恆星周日運動](../../celestial-sphere.html) | [models/celestial-sphere.js](../../models/celestial-sphere.js) | user-celestial-sphere（核心已做出） |
| [方塊入水與浮力簡諧振盪](../../floating-block-shm.html) | [models/floating-block-shm.js](../../models/floating-block-shm.js) | user-floating-block-shm（核心已做出） |
| [金箔驗電器：感應、接觸與接地](../../electroscope.html) | [models/electroscope.js](../../models/electroscope.js) | site-091（核心已做出） |
| [光的三原色：加色與減色比較](../../rgb-lights.html) | [models/rgb-lights.js](../../models/rgb-lights.js) | site-090（核心已做出） |
| [方孔、圓孔與多孔陣列干涉繞射](../../aperture-pattern.html) | [models/aperture-pattern.js](../../models/aperture-pattern.js) | site-086（核心已做出） |
| [干涉繞射：電場向量與孔徑疊加](../../diffraction-amplitudes.html) | [models/diffraction-amplitudes.js](../../models/diffraction-amplitudes.js) | site-087（核心已做出） |
| [雙點電荷：電場、等位線與電位](../../two-charges.html) | [models/two-charges.js](../../models/two-charges.js) | site-092（核心已做出） |
| [光柵：廣角級次與波前](../../optical-grating.html) | [models/optical-grating.js](../../models/optical-grating.js) | site-089（核心已做出） |
| [A繩入B繩：反射與透射](../../string-interface.html) | [models/string-interface.js](../../models/string-interface.js) | site-054（核心已做出） |
| [橫波變縱波：振動方向轉換](../../wave-polarization.html) | [models/wave-polarization.js](../../models/wave-polarization.js) | site-055（核心已做出） |
| [橫波波函數：空間、時間與曲面](../../wave-function.html) | [models/wave-function.js](../../models/wave-function.js) | site-056（核心已做出） |
| [橫波的力學能與能流](../../string-wave-energy.html) | [models/string-wave-energy.js](../../models/string-wave-energy.js) | site-057（核心已做出） |
| [雙點波源干涉](../../two-source-interference.html) | [models/two-source-interference.js](../../models/two-source-interference.js) | site-058（核心已做出） |

機器可讀的需求、證據與下一步見 [implementation-plan.json](implementation-plan.json)。原站說明及截圖見 [index.html](index.html)。先更新 JSON 的 existingComparison 欄位，再執行 node tools/build-replication-tracker.cjs 產生本表。
