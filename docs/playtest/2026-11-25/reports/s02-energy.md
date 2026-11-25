# 能量與動量＋靜力學 試玩報告（session: s02-energy）

截圖資料夾：`C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s02-energy/`
測試方式：1280×800，每個實驗看初始、中段／結尾（拖時間軸）、極端拉桿，部分實驗試了側視／俯視／正視／完整取景與圖表，手機 390×844 看了 hydrostatic-buoyancy。數值都用公式手算核對過，**13 個實驗的讀數全部正確**，問題都出在畫面與取景。

## 嚴重（視覺/物理錯誤、壞掉）
- [slip-or-tip] 斜面幾乎看不見，而且懸在半空：它只是一條很淡的半透明細帶，下端離地大約 1 m，底下沒有楔形或支撐。學生看到的是「方塊浮在空中轉」，完全看不出它站在 35° 的斜面上 | 打開後按側視 | slip-or-tip-1.png、slip-or-tip-side-0.png、slip-or-tip-side-end.png | 把斜面畫成實心楔形（或有厚度、不透明的板），底端接地，坡面顏色要和方塊、地板分得開
- [slip-or-tip] 靜摩擦設 0 時方塊會滑動，但相機不跟，結束時方塊早就滑出畫面，只剩一條軌跡線 | 靜摩擦 0、塊高 0.5，拖到結尾 | slip-or-tip-slide-end.png | 滑動模式自動跟隨或完整取景；或縮短斜面、觀察時間
- [power-hoist] 吊升高度調到 20 m 後相機不重新取景，吊車與 A 重物衝出畫面頂端，上方的作功／功率標籤也看不到；要手動按「完整取景」才正常 | 吊升高度 max、A 時間 4 s，拖到 0.08 | power-hoist-ext-q.png（對照 power-hoist-ext-fit.png） | 改幾何尺寸的拉桿時自動呼叫 fitCamera
- [center-of-mass] 質心初速設 ±2 m/s 時，整組物體一路移到約 15 m 外，相機不跟，結尾畫面完全空白 | 質心初速 max、初始伸長 max，拖到結尾 | center-of-mass-ext-end.png | 預設跟隨質心，或依整段軌跡取景
- [collision-2d] 按「俯視」時兩球在結尾都跑出可視範圍：球 2 卡在右上角，被「觀察結束」徽章蓋住，還被透視拉成橢圓；球 1 被下方讀數面板蓋住。按「完整取景」後才正常 | 預設參數 → 俯視 → 拖到結尾 | collision-2d-top-end.png（對照 collision-2d-fit-end.png） | 俯視／側視也要依軌跡範圍取景，不要固定距離

## 中等（看得到但不影響理解：重疊、取景、可讀性）
- [work] 主題是「變力作功」，畫面上卻沒有外力 F 箭頭，「合力箭頭」預設也是關的；速度箭頭在物塊裡幾乎看不到，只露出一個「v」字。建議預設顯示長度隨位置變長的 F 箭頭（work-mid.png、work-end.png）
- [work] t=0 時世界座標軸 x/z 從物塊中間穿出來，「2.00 m」刻度被物塊擋住（work-1.png）
- [work][collision] 速度很小時箭頭比物體半徑短，整支縮在物體裡（collision-1.png 右球 v=−1 m/s 看不到箭頭）。建議箭頭從物體表面起算，或設最小可見長度
- [energy-track] 起點高度 8 m＋側視時，起點與左端軌道被左上的視角按鈕列遮住（energy-track-ext-side.png）；預設視角下「−6.00 m」刻度被能量條蓋住（energy-track-1.png）
- [energy-track][work] 打開圖表後 3D 區變矮，能量條＋讀數面板＋控制列佔掉 3D 區下方近一半，軌道底部被蓋住（energy-track-chart.png、work-chart.png）
- [ballistic-pendulum] 擺角讀數沒有折回範圍：整圈轉時顯示 506°、980°（ballistic-pendulum-ext-0.25.png）。建議顯示 −180°～180°，另加「已轉圈數」
- [ballistic-pendulum] 模型用的是剛性擺桿（說明文字有寫），但畫面上是一條細線，擺塊也不跟著轉。擺塊轉到上半圈時，「線」接在方塊角上，看起來像繩子把方塊撐在頭頂，學生會以為繩子能推（ballistic-pendulum-slack-0.15.png）。建議畫成有粗細的桿子，擺塊隨桿旋轉；支點也沒有天花板或支架
- [ballistic-pendulum] 擺塊初始時貼在地面上，支點懸空沒有支撐（ballistic-pendulum-1.png）
- [rocket] 火箭在 45 m 的場景裡只是一顆小灰方塊，推力不為零時也看不到噴氣；初始時「10.00 kg」標籤壓在 y 軸上（rocket-1.png、rocket-mid.png）。建議放大火箭模型、加尾焰（長度跟推力成正比）、預設跟隨
- [collision-2d] 只有球 1 有軌跡線，球 2 沒有。等質量彈性斜碰最重要的「兩球分開成 90°」因此看不出來（collision-2d-end.png、collision-2d-fit-end.png）
- [collision] e=0 結尾時兩球在畫面右上角邊緣，「m₁ 8 kg」「m₂ 0.5 kg」標籤疊在一起（collision-ext-e0.png）
- [center-of-mass] 質心標記剛好落在世界原點，和 x/y/z 座標軸、「0.00 m」標籤疊在一起，幾乎看不出來（center-of-mass-1.png、center-of-mass-side-0.png）。建議把座標軸移到別處，或把質心畫成醒目的立體標記
- [ball-rod] 物體在預設視角和俯視下都很小，「自由棒」「v棒」「2.00 m」「x」幾個標籤擠在一起（ball-rod-1.png、ball-rod-top-0.3.png）
- [rough-bounce] 預設視角下球很小，要按側視才看得懂（rough-bounce-1.png 對照 rough-bounce-side-end.png）。按正視時是沿著運動方向看，軌跡壓成一條直線，1.00 m～7.00 m 的刻度全部疊在一起（rough-bounce-front-mid.png）
- [power-hoist] 上方的「A：平均功率…」標籤和「每台作功…拉力…」標籤疊在一起；「A 1080 W」被柱子擋住；t=0 時看不到 A 的藍色重物（power-hoist-1.png、power-hoist-ext-fit.png）
- [power-hoist] 讀數用科學記號「2.16e+4 J」「2.75e+4 W」，高中生不好讀。建議改成 21.6 kJ、27.5 kW
- [rough-bounce][block-stack] 整數量也帶兩位小數：「碰撞次數 5.00 次」「最危險界面（由上數）1.00」
- [block-stack] 數值不一致：同一時刻場景標籤寫「第 3 界面臨界」，讀數卻寫「最危險界面 1.00」（block-stack-ext-0.png，10 層、長 4 m、偏移比例 1）
- [block-stack] 偏移比例＝1 時一開始就到臨界，「再次播放」按鈕在 t=0 變灰、不能按，也沒有說明原因
- [block-stack] 預設視角下木塊堆很小，每層的餘裕標籤（.35 m…）互相重疊，被截掉；「圓點：上方子堆質心…」圖例被桌子擋住。正視是沿著懸伸方向看，看不出懸伸（block-stack-1.png、block-stack-front-fit.png）
- [self-pull] 「離地門檻 T > 784.8 N」標籤被座標軸的「0.00 m」「z」和平台擋住（self-pull-1.png）
- [hydrostatic-buoyancy] 液體只有線框，沒有半透明的水體，看不出方塊哪部分泡在水裡；方塊（0.3 m）相對 4 m 寬的水槽太小；也沒有地板格線，水槽像是浮在空中（hydrostatic-buoyancy-1.png、hydrostatic-buoyancy-side.png）
- [hydrostatic-buoyancy] 手持模式有「額外向上支持力 88 N」，畫面上卻沒有手，也沒有支持力箭頭；「底面…Pa・頂面…Pa」標籤被座標軸蓋住
- [通用] 有一次載入時 mechanics-scenes.js 沒讀到（推測是伺服器同時被多人存取），結果整個 3D 區空白，只在 console 留一行 `ReferenceError: render is not defined`，頁面上沒有任何提示（work-1b.png，重新整理後就好）。建議腳本載入失敗時在場景區顯示「載入失敗，請重新整理」
- [手機] hydrostatic-buoyancy 在 390 寬下排版正常，沒有橫向捲動。唯一的小問題是讀數標題「額外向上支…」被截斷（mobile-buoyancy.png）

## 建議（教學體驗改進）
- work：加一張 F–x 圖，把曲線下面積塗色，直接對照讀數的「外力作功」，比 W–t 圖更貼近課本
- energy-track：在軌道上標出起點高度的水平虛線，讓學生看到球回到同一高度
- ballistic-pendulum：碰撞瞬間暫停一下，或標出「碰撞前後動量／動能」對照；擺到最高點時標出 h
- rocket：同時顯示 Δv = u·ln(m₀/m) 的理論曲線，和模擬值對照
- collision-2d：結尾時把兩球的速度方向畫出來並標出夾角（等質量彈性碰撞是 90°）
- slip-or-tip：在坡面上畫出底面接觸範圍，再畫一條從質心往下的鉛垂線，讓學生直接看到「鉛垂線超出底面 → 翻倒」；兩個臨界角都被超過時，提示「同時滿足滑動條件，此處只模擬翻倒」
- self-pull：出現「需要負支持力」時，畫面上提示「人會被拉離平台」，比單純停止播放更有教學效果
- block-stack／hydrostatic-buoyancy：預設改用側視並自動取景，效果會比立體視角好
- 正視／側視的定義在不同實驗裡不一致（有時是沿著運動方向看）。建議每個實驗都把「最能看清楚運動平面」的視角設成預設

## 沒問題的實驗
- 沒有一個實驗完全沒問題，但數值與物理全部正確：work、energy-track、collision、ballistic-pendulum、rocket、collision-2d、center-of-mass、ball-rod、rough-bounce、power-hoist、slip-or-tip、block-stack、self-pull、hydrostatic-buoyancy
- 問題比較少的：self-pull（各種極端設定都處理得當，有提示）、rough-bounce（側視下效果很好）、collision（只有小問題）
- 頁面已正常載入後，在各實驗切換與拖拉時間軸都沒有出現 JS 錯誤
