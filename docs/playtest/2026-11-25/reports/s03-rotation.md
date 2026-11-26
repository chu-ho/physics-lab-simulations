# 圓周與轉動＋萬有引力 試玩報告

試玩者：s03-rotation｜截圖目錄：`C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s03-rotation/`
數值核對：15 個實驗的讀數我都用公式驗算過（向心加速度、安全速率、圓錐擺週期與張力、α=τ/I、滾動 a=g sinθ/(1+k)、有慣量滑輪 a 與張力、腳踏車前後輪摩擦、皮帶輪角速度比、雙星週期與能量、偏心率等），**全部正確**。下面的問題都是「畫面」或「呈現」上的問題。
全程 `errors` 沒有 JS 錯誤，console 也沒有 error 或 warning。

## 嚴重（視覺/物理錯誤、壞掉）

- [torque] 盤面上的紅色半徑標記線在預設立體視角下大部分被圓盤吃掉（疑似和盤面 z-fighting 或埋在盤面下），轉動時這條線忽長忽短甚至消失。圓盤花紋是對稱的，所以學生幾乎看不出盤子在轉 | 播放到約 1.5～4 s，或拖時間軸到 25%／40% 的位置 | torque-2.png, torque-t250.png, torque-t400.png, torque-ext.png（紅線只畫到一半，切向力箭頭卻在盤緣）；俯視 torque-top.png 則正常 | 標記線抬高到盤面以上（y+0.02），或改用 polygonOffset／depthTest 設定；盤面加一塊不對稱的色塊
- [torque] 本實驗的核心「切向力 F」預設看不到，要到「顯示選項」勾「合力箭頭」才出現 | 開啟實驗直接看 | torque-1.png | 本實驗預設顯示 F 切向箭頭，或把它改成獨立的「施力」選項並預設開啟
- [bicycle-friction] 前輪、後輪摩擦力箭頭沒有畫在各自輪子的觸地點，都擠在車身中段，「前輪」「後輪」標籤疊在一起，文字也被箭頭壓住；而且箭頭長度和大小不成比例（1.54 N 和 63.25 N 的箭頭長度幾乎一樣，3.42 N 反而比 63.25 N 長） | 側視＋放大；再把前輪煞車調到 30、驅動力矩調到 0 | bicycle-friction-side.png, bicycle-friction-ext.png | 箭頭起點放在各輪觸地點（x_wheel, 0），長度按比例畫（或採對數縮放並註明），標籤跟著各自的箭頭
- [belt-wheels] 讓 B 輪小、C 輪大（B=0.4、C=1.8）時，B 輪整個被同軸的 C 輪擋住，AB 皮帶直接「穿過」C 輪盤面，B 的標籤也被遮住 | A=1.8、B=0.4、C=1.8、D=0.4、ω=4 | belt-wheels-ext.png | B、C 沿軸向拉開更大的間距（或讓 C 半透明），皮帶畫在 B 所在的平面
- [binary-stars / orbit / projectile-cone] 能量條寫「總 23.75 J（U 以最低點為零）」，同一畫面的讀數卻是「總機械能 −8.31 J」。束縛軌道總能量為負正是這幾個實驗的教學重點，兩個數字互相矛盾（orbit：條上 +8.33、讀數 −8.33 J/kg；projectile-cone：條上 13.00、讀數 −7.00 J/kg） | 開啟後播放即可看到 | binary-stars-2.png, orbit-2.png, projectile-cone-2.png | 萬有引力類實驗的能量條改用 U=−GMm/r（無窮遠為零），可以畫負值區；至少把讀數和能量條的單位、零點統一並標清楚
- [gravitation-g 模式 1] 地球模式的取景不對：地球（低多邊形，面很粗）塞滿整個畫面，探測器和鉛垂線偏角都看不到；畫面底部的說明文字「GM/r² … 離心 … 偏離徑向 …」被讀數面板擋住，只露出一半；頂部的探測器標籤貼在工具列上方 | 模式拉到 1、緯度 45°；再把高度拉到最大 | gravitation-g-mode1.png, gravitation-g-mode1ext.png | 切換模式時自動取景，把探測器和局部放大的鉛垂線放在畫面中；底部文字移到 HUD 之上；地球改用較高細分的球體
- [massive-pulley] 上升的重物最後撞進滑輪（方塊和滑輪環重疊），模擬卻照常結束 | 預設參數播放到結束；或左 8 kg、右 0.5 kg | massive-pulley-2.png, massive-pulley-chart.png | 停止條件改為「重物頂端距滑輪 ≥ 一個方塊高」，或把初始高度拉低
- [angular-momentum] 收臂到最小臂長時，兩顆手持物嵌進身體方塊；角速度可達 73 rad/s（約 11.6 圈/秒），60 fps 下每幀轉約 70°，會出現車輪效應（看起來轉慢或反轉）；角動量 L 只有文字標籤，看不到向量箭頭（疑似藏在身體方塊裡） | 手持物 4 kg、身體 1、初臂 3、末臂 0.5、ω0=3，拖到結尾 | angular-momentum-end.png, angular-momentum-side.png, angular-momentum-2.png | 末臂長下限設為「身體半寬＋球半徑」；高轉速時降低畫面上的播放倍率或顯示提示；L 箭頭從身體頂端往上畫

## 中等（看得到但不影響理解：重疊、取景、可讀性）

- [circular] 地面刻度「1.00 m」和 x 軸標籤「x」重疊；半徑 1 m、質量 10 kg 時，球大到幾乎占滿半徑並蓋住中心（circular-ext.png）
- [circular, banked] 向心力或合力箭頭預設關閉；這兩個實驗的重點是「誰提供向心力」，預設只看得到 v（banked-1.png）
- [banked] 側視取景太遠，地面在畫面下方提早結束，露出背景色（banked-side.png）
- [conical] 預設取景太遠，擺錘很小；地面尺標文字擠在中心，和軸標籤、繩子重疊；角度 65°、繩長 8 m 時，「τ 142.25 N·m」和「參考點：懸點」兩個標籤疊在一起（conical-1.png, conical-ext.png, conical-zoom.png）
- [conical] 懸點浮在空中，沒有支架或天花板
- [vertical-circle] 圓環最低點和球心在地面高度，球有一半沉進地板（vertical-circle-1.png）；圓環畫成一條細線，看不出它是允許 N<0 的「雙面導軌」，預設 12 m/s 時頂點出現 N=−1.68 N，容易讓學生以為是錯誤（說明寫在「進階」裡）
- [vertical-circle, rolling 等] 改了半徑或傾角後不會自動取景（rolling 傾角 45° 時斜面頂端超出畫面，rolling-chart.png）
- [rolling] 球是單色的，看不出在轉，無法分辨「滾動」和「滑動」；軌跡線有一段被斜面遮住（rolling-2.png）；「正視」時看不到球（疑似被斜面擋住，rolling-front.png）
- [lever] 「正視」是沿著槓桿長軸看過去，只看到端面（lever-front.png）；「需外加 −389.95 N·m」的標籤壓在視角工具列上，被按鈕擋住（lever-ext.png, lever-side.png）；右側力臂 0.5 m 時，方塊和支點三角形相交；方塊大小不隨質量改變，10 kg 和 0.5 kg 一樣大
- [massive-pulley] 滑輪畫成細圓環，看起來像「環」（I=MR²），模型卻用圓盤 ½MR²，視覺和模型不一致；滑輪沒有支架；圖表預設的「加速度」是一條貼著下緣的水平線，不好讀（massive-pulley-chart.png）
- [belt-wheels] 角速度、「圈」標籤和地面刻度互相重疊（「52.43 圈」壓在「8.00 m」上），頂端的「B・C 固定同軸」「CD 帶速」「B・0.60 rad/s」擠成一團（belt-wheels-2.png）
- [bike-turn] 預設「跟隨物體」，世界座標軸和地面刻度直接畫在腳踏車身上；有兩個紅點，只有一個是「等效質心」，容易混淆；說明文字壓在 x 軸箭頭上（bike-turn-2.png, bike-turn-front.png）
- [orbit] 中心天體坐在棋盤地板上，參數大時行星直接飛出畫面（orbit-ext.png）
- [binary-stars] 小星的軌跡很淡幾乎看不見；半長軸 10 m 時主星被畫面左緣切掉，「M=10.00 kg」標籤也被切掉（binary-stars-chart.png）
- [intercontinental] 星球放在棋盤地板上（R=6 時剛好貼地，R=3 時懸空），不符合「星球」情境；拋射軌跡相對畫面很小；「發射點」「落點 50.4°」標籤重疊（intercontinental-2.png, intercontinental-ext.png）
- [projectile-cone] 「完整取景」反而把場景拉得很遠；切回「星球」顯示、速度比 1（圓軌道）時，整個系統縮成畫面中央一個點（projectile-cone-fit.png, projectile-cone-ext2.png）
- [gravitation-g 模式 0] 立體視角下「小球 m」的標籤靠近大球，容易誤讀，要切到俯視才分得清（gravitation-g-zoom.png 對照 gravitation-g-top.png）；俯視時「扭秤示意」標籤壓在橫桿上；「由偏轉反推 G」在 t=3 s 時顯示 0.42×10⁻¹¹（還在暫態），沒有標示「尚未平衡」；讀數面板的標題太長（「重力加速度（模式 0 為大球在小球處的 GM/R²）」）會換行
- [手機 390px，bicycle-friction] 沒有水平捲動，排版沒有崩；但腳踏車很小，前後輪力的標籤和座標軸疊成一團，讀數標題被截斷（「前輪摩擦力…」）（mobile-1.png）

中等問題共 20 條。

## 建議（教學體驗改進）

- 天文和萬有引力類實驗（orbit、binary-stars、intercontinental、projectile-cone、gravitation-g）隱藏棋盤地板和地面尺標，改用星空或無地板背景。
- 地面尺標（±4 m 數字）幾乎在每個實驗都會和物體、軸標籤重疊，建議預設淡化，或只在「參考網格」開啟時顯示。
- 轉動類實驗（torque、rolling、angular-momentum、massive-pulley、belt-wheels）的物體都加上不對稱的標記（色塊或條紋），讓學生看得出轉動。
- banked、conical、circular 提供「受力圖」模式：只顯示 mg、N/T 和它們的合力，凸顯「合力＝向心力」。
- lever 可以加一個「放開約束」按鈕，讓合力矩不為零時看到槓桿轉動，比只顯示「需外加力矩」更直觀。
- gravitation-g 的「入門／探究／進階」分頁只出現在這個實驗，介面和其他實驗不一致。
- 拖曳拉桿後 aria-live 的狀態文字常常慢一拍（有時播放中仍顯示「準備實驗」），不影響畫面，但讀屏或自動測試會讀到過時的狀態。

## 沒問題的實驗

- 沒有完全無問題的實驗；物理數值全部正確。只有小問題的：circular、banked、conical、orbit
