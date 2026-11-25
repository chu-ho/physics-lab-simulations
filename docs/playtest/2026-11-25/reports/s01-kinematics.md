# 運動學＋牛頓定律 試玩報告

試玩者：s01-kinematics（高中生角度）｜視窗 1280×800，手機 390×844
截圖資料夾：`C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s01-kinematics/`
16 個實驗全部 `errors` 為空，沒有 JS 錯誤。HUD 數值都用公式手算核對過（acceleration、vertical、drag 終端速度、friction、incline、atwood、table-pulley、elevator、optimal-projectile 的最佳角 40.12°），全部正確。下面的問題都是「畫面」方面的問題。

## 嚴重（視覺/物理錯誤、壞掉）

- [atwood] 播放到結尾時，上升的 2 kg 物塊撞進橫樑和滑輪環，標籤「2 kg」和橫樑重疊（穿模）。滑輪畫成一個很大的圓環，直接穿過橫樑中央，沒有輪軸。改用正視看，橫樑還偏在繩子右側，沒有在滑輪正上方 | 預設參數，時間軸拉到最後，或按「正視」 | atwood-5end.png、atwood-6front.png、atwood-1init.png | 物塊上升的上限要扣掉滑輪半徑和物塊高度（或停在橫樑下方）；滑輪縮小成和繩距相符的輪子，裝在橫樑正下方，加上輪軸／吊架。
- [table-pulley] (1) 桌子是一塊沒有桌腳的板子，懸在半空中。(2) 滑輪不在桌緣，桌板還往外多伸出約 1 m，所以垂直的繩子和懸掛重物都穿過桌板；初始時懸掛重物的上半部嵌在桌板裡。(3) 用預設立體視角時，懸掛重物和繩子完全被桌子擋住，學生看不到「拉它的東西」 | 開啟後按「側視」；把拉桿推到極端值，時間軸拉到最後 | table-pulley-6sidedefault.png、table-pulley-7sideext-end.png、table-pulley-1init.png | 滑輪放在桌板邊緣、懸掛段放在桌外；補上桌腳；預設視角改成側前方，讓懸掛重物入鏡。
- [elevator] 電梯加速度設負值時，電梯平台直接往下穿過地面，纜繩從地底冒出來，乘客（小球）反而留在地面上方（a=−8、g=1 時乘客已和電梯分離，物理處理正確，但平台在地底下）。標籤「N = 0.00 N」也在地面下方，被 HUD 擋住 | 電梯加速度 −8，重力加速度 1，時間軸拉到中段 | elevator-5neg.png | 起始高度提高，或改用井道模型（電梯在井道中上下移動），避免 y<0；也可以讓相機跟隨電梯。
- [incline] 預設立體視角非常差：鏡頭貼近斜面，斜面佔滿整個畫面，物塊被擠在左上角邊緣；傾角調到 60° 時，斜面頂端和物塊都超出畫面上緣。按「側視」才看得清楚 | 開啟後直接看；傾角 60° 並播放 | incline-1init.png、incline-3ext.png、incline-5side.png | 預設鏡頭改成側前方，並依斜面尺寸自動取景（改傾角後重新取景）。
- [friction / incline / table-pulley / atwood / elevator] 牛頓定律這幾個實驗預設都沒有任何受力箭頭。friction 打開「合力箭頭」後也只有一支 ΣF，看不到外力 F、摩擦力 f、正向力 N、重力 mg 各自的向量，「ΣF」標籤還和 v 標籤重疊。摩擦力實驗看不到摩擦力箭頭，學生無法從畫面理解「靜摩擦隨外力改變」 | friction 勾選合力箭頭 | friction-5force.png、friction-3ext.png | 增加「各力箭頭（自由體圖）」選項，牛頓定律組預設開啟；不同的力用不同顏色並加標籤。
- [acceleration / vertical / airplane-drop / safe-parabola / optimal-projectile / incline-shadow]（共通問題）把拉桿推到極端值後，主要物體飛出畫面，鏡頭不會自動重新取景。例如 acceleration 初速 15、加速度 5 時，t=8 s 物體在 280 m 處、超出右緣；vertical 初始高度 20、初速 20 時，球（最高約 40 m）超出上緣；airplane-drop 飛行高度 60 時飛機和投放點都看不到；optimal-projectile 初速 24、高度 15 時發射點不在畫面內；safe-parabola 的包絡線和頂點橢圓也超出畫面 | 把前兩個拉桿推到最大，時間軸拉到 60% 或結尾 | acceleration-5end.png、vertical-3ext.png、airplane-drop-3ext.png、optimal-projectile-3ext.png、safe-parabola-3ext.png、incline-shadow-3ext.png | 參數改變時自動執行一次「完整取景」（按下這個按鈕確實能修正，見 acceleration-6fit.png）。

## 中等（看得到但不影響理解：重疊、取景、可讀性）

1. [acceleration / pursuit / friction / drag] 物塊、車子、小球在畫面上只有約 10–15 px，棋盤格反而很顯眼，主體不突出。截圖：acceleration-1init.png、pursuit-1init.png、drag-1init.png
2. [acceleration] 「物塊」標籤和尺規的「0.00 m」「20.00 m」標籤互相重疊；尺規只畫到 80 m，物體跑超過 80 m 後就沒有刻度了（按完整取景後刻度才延伸）。acceleration-2play.png、acceleration-3ext.png
3. [pursuit] 兩台車在同一條線上，追上時互相穿過重疊，「後車」「前車」標籤疊成「後車前車」。建議改成相鄰的兩條車道。pursuit-3ext.png
4. [river] 只畫出「水流」和「船／水」兩支箭頭，缺少最關鍵的「船／地」合速度箭頭；兩支箭頭的標籤重疊（「船 水流」疊字），箭頭還被船身蓋住。尺規的 0 m 和船的出發點沒有對齊，看起來很混亂。river-3ext.png、river-5top.png
5. [river] 俯視時近岸被切掉，座標軸貼在畫面上緣；預設立體視角看不到對岸。river-5top.png、river-1init.png
6. [airplane-drop] 第一顆球落地後，能量條就顯示 K 0、U 0、總 0 J，但其他球還在空中（能量條只追蹤第一顆球），容易讓人誤會。能量條也蓋住原點附近的「已落地 0/10」和尺規標籤。airplane-drop-2play.png、airplane-drop-1init.png
7. [airplane-drop / safe-parabola] 球數用小數顯示，例如「9.00 顆」「72.00 顆」，應改為整數。
8. [safe-parabola] 「同時圓」標籤和「45° 安全包絡」標籤重疊；開關（安全包絡、同時圓、頂點橢圓）是用 0/1 拉桿做的，應改成勾選框。safe-parabola-2play.png
9. [shoot-monkey] 初始時「猴子（質點標於腳下）」和「初始瞄準位置 · 15 m」兩個標籤疊成亂字；「子彈」標籤壓在 y 軸和槍上。shoot-monkey-1init.png
10. [optimal-projectile] 「最佳 40.1°」「選定 40.0°」兩行標籤緊貼重疊；「坡角 0° · 射程沿面量度」標籤蓋住尺規的 8.00 m；極端值時「發射高度 15.0 m」標籤和左上角操作說明重疊，「最佳／選定」標籤壓到右上角的座標方位球。optimal-projectile-1init.png、optimal-projectile-4chart.png
11. [incline-shadow] 地面尺規被斜面擋住，只露出「m」「.00 m」等殘字；「坡面影子」和「影」標籤重疊；坡角 45°、高度 10 時，小球和標籤跑到左上角的視角按鈕下面；底部說明「斜面 45° · 影子在坡面內」被能量條蓋住。incline-shadow-1init.png、incline-shadow-3ext.png
12. [relative-motion] HUD 的「藍球座標 x′、y′」「v′」其實是地面座標系的數值（例如 x′ = (u+vx)t = 8.90 m），撇號通常代表移動座標系，容易混淆；藍球標「v藍′」，紅球卻只標「v」，標示不一致；平台輪子是橘色，和紅球顏色接近。relative-motion-2play.png
13. [elevator] 乘客只是一顆約 10 px 的小球，沒有電梯車廂，也沒有磅秤刻度。「N = 23.62 N」標籤壓在 y 軸標籤和速度箭頭上。a 很大時電梯往上飛出畫面（纜繩只畫一小段，沒接到任何東西）。elevator-1init.png、elevator-3ext.png
14. [friction / atwood] 圖表的物理量是常數（位置一直是 0、加速度不變）時，y 軸上下兩端都標「0.00」，範圍退化成一條線。friction-4chart.png、atwood-4chart.png
15. [vertical / drag] 球心在 y=0 時球有一半埋進地面（落地瞬間），v 標籤和 z 軸標籤重疊。vertical-6end.png
16. [table-pulley] 「桌面位移」從 −3.00 m 開始，學生會覺得奇怪，建議從 0 開始。table-pulley-1init.png
17. [共通] 開啟圖表後 3D 視窗變矮，HUD 加上控制列幾乎蓋住下半部約 40% 的場景（例如 drag、incline-shadow、airplane-drop 的物體被擋住）。手機寬度（390）下排版沒有破版，也沒有水平捲動，但 3D 區只剩上半部，船很小，標籤疊在一起。mobile-river-1.png、mobile-river-2full.png

中等問題共 17 條。

## 建議（教學體驗改進）

- 牛頓定律組預設顯示自由體圖（F、f、N、mg、T），箭頭長度和數值同步；friction 可以加「靜摩擦力 vs 外力」的圖，讓學生看到 f 先跟著外力變大、超過最大靜摩擦後跳到動摩擦值。
- 圖表預設的觀察量應挑最有教學意義的量：
  - pursuit 同時畫兩車的 x–t 曲線並標出交點（追上時刻）；
  - drag 預設顯示 v–t，並畫出終端速度漸近線；
  - optimal-projectile 預設的「最佳向前仰角」對時間是常數，沒有用，建議改成「射程對仰角」曲線並標出最大值；
  - atwood 預設的「加速度」也是常數，建議改看位移或速度。
- river 加上「船／地」合速度箭頭，以及抵達對岸的落點標記；用勾選框切換「水的參考系／岸的參考系」。
- airplane-drop 預設顯示飛機正下方的鉛直參考線，強調「炸彈永遠在飛機正下方」；能量條改為顯示「選定的球」或全部球的總和。
- shoot-monkey 做得很好（命中提示、空中最小距離、兩質點距離隨時間線性下降的圖都很清楚），只需要修標籤重疊。
- relative-motion 建議加一個「平台座標系／地面座標系」的切換鈕，直接比較兩個座標系裡的軌跡差異。
- safe-parabola 的 72 顆球和多條曲線一次全部出現，資訊有點多。可以先只顯示安全包絡，再讓學生逐步開啟同時圓和頂點橢圓。
- 「操作與探究」裡的說明清楚，「動手探究」的提問很好，但只有兩題；可以加一題引導學生「調到剛好不滑動的臨界值」。
- 參數改變時自動「完整取景」，或者至少顯示一個提示「物體已離開畫面，按完整取景」。

## 沒問題的實驗

- 沒有完全沒問題的實驗。比較接近「只有小問題」的是：shoot-monkey、drag、vertical（物理和動畫都正確，只有取景和標籤的小問題）。
