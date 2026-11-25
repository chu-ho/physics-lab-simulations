# 振動 試玩報告

截圖資料夾：`C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s04-oscillation/`
（檔名規則：`<id>-0-init.png` 初始、`-1-play.png` 播放約 3 秒、`-2-ext.png` 極端參數（第 1 支拉桿設最大、第 2 支設最小）後播放、`-3-plot.png` 開啟圖表）

18 個實驗全部開過，`errors` 和 `console` 都沒有 JS 錯誤，HUD 也沒有出現 NaN、Infinity 或 undefined。數值都有抽樣驗算（週期、能量、加速度等），都和理論一致。問題集中在「畫面」和「標示」。

## 嚴重（視覺/物理錯誤、壞掉）
- [damped] 質量最大（10 kg）、k 最小（1 N/m）時，平衡伸長 mg/k ≈ 98 m。支架和彈簧衝出畫面上方，只剩一根很長的線，看不到裝置全貌；改參數後鏡頭不會自動重新取景 | 開啟 → m 拉到 10、k 拉到 1 → 播放 | damped-2-ext.png、damped-3-plot.png | 參數改變後自動完整取景；或者顯示時把彈簧長度壓縮，另外標「伸長 98 m」
- [bungee] 跳台高度拉到 140 m、繩長 5 m 時，跳台和跳躍者（高度約 130 m）都跑到畫面頂端外面。事件標籤的導引線也指向畫面外。主要物體不在視野內 | 開啟 → h=140、L=5 → 播放 | bungee-2-ext.png、bungee-3-plot.png | 參數改變後自動重新取景（按「完整取景」雖然拍得到，但塔頂被事件標籤卡遮住，見 bungee-h140-fit.png）
- [measurement-uncertainty] 這個實驗的核心（測量值散佈點、平均 ± 標準誤的直條、週期刻度 1.554/1.781/2.007/2.233/2.460）直接畫在世界座標尺和 xyz 軸上。週期刻度和「1.00 m、2.00 m」座標標籤互相重疊，點又很小、彼此疊在一起，學生幾乎讀不出分布 | 開啟 → 播放 3 秒 | measurement-uncertainty-0-init.png、-1-play.png | 這個實驗隱藏座標尺和軸；分布改成面向鏡頭、放大的 2D 直方圖或點圖
- [dimensional-analysis] 擺錘上方的公式標籤「甲擺 L=1.0 m」「乙擺（4L=2m）…g^0」「因次：M^0 L^1 T^0 不是時間 ✗」「k = 2.008 乙擺預測…」幾乎疊成一團，字蓋字無法閱讀。偏偏這正是本實驗要學生看的結論 | 開啟即可看到；開圖表後更擠 | dimensional-analysis-0-init.png、-2-ext.png、-3-plot.png | 公式改放在 HUD 卡或固定的 2D 面板，不要用 3D 浮動標籤；或者每行之間拉開
- [vertical-spring] 預設畫面標籤嚴重重疊：「平衡點 q=0」蓋住「q=1.00 m」；「自動架高・最低質心 1.20 m・彈簧原長隨振幅調整」壓在座標軸上；「水平等效振子 Ueq=½kq²」和尺標 1.00/2.00 m 疊在一起。另外，能量條「總 10.00 J」和 HUD「總機械能 0.38 J」並列，兩個「總能量」數字互相矛盾（零點不同但沒說明）。m=4、k=8 時支架升到畫面頂，被視角按鈕列擋住 | 開啟即可看到 | vertical-spring-0-init.png、-1-play.png、-2-ext.png | 標籤分層或錯開；能量條改名為「等效 ½kq²」，或和 HUD 統一零點；參數改變後自動取景
- [spring-atwood]（疑似）跑到結束狀態（右側 2 kg 接近滑輪，停止）時，左側 3 kg 重物已經掉到地面高度，速度箭頭指向地板下方。依繩長估算（每側 6 m，滑輪高約 11 m），左物可能已穿入地面約 1 m。停止條件好像只檢查右物碰滑輪 | 開啟 → 時間軸拖到最後 → 側視、放大 | spring-atwood-end-side.png、spring-atwood-end-side-zoom.png、spring-atwood-1-play.png | 停止條件加上「任一重物觸地」；或者把滑輪架高

## 中等（看得到但不影響理解：重疊、取景、可讀性）
- [全部實驗] 開啟「顯示圖表」後 3D 視窗縮短，但能量條和 HUD 數值卡仍然浮在 3D 畫面下半部，蓋住約 1/3 的場景（例如 spring 的牆底、bungee 的地面、pendulum 小擺長時整個擺錘）。圖表本身有放在 3D 視窗下方，沒有遮擋 | 任何實驗按「顯示圖表」 | spring-3-plot.png、pendulum-3-plot.png、wall-spring-pair-3-plot.png | 圖表展開時把 HUD 收成一列，或移到圖表區上方
- [多數實驗] 原點的 xyz 座標軸和地面米尺預設顯示，經常和主要物體或標籤重疊（spring/driven 的「1.00 m」和 x 軸標籤疊在方塊後面；wall-spring-pair 的 m₁ 標籤壓在軸上；vertical-spring-pair 的「M=2 kg」疊在尺標上）。鉛直系統（damped、falling-spring）的水平地面米尺對理解沒有幫助 | 開啟即可看到 | spring-0-init.png、damped-0-init.png、vertical-spring-pair-0-init.png | 鉛直實驗改成鉛直尺；座標軸預設隱藏，或移到角落
- [spring、driven、massive-spring、coupled-oscillators、damped 等水平或與重力無關的系統] 能量條標「U（最低點為零）」，但水平彈簧沒有「最低點」。spring 一開始顯示「U」，改參數後才變成「U（最低點為零）」，前後不一致 | spring 拉任一拉桿 | spring-2-ext.png、massive-spring-1-play.png | 改成「U（平衡位置為零）」並統一
- [vertical-spring-pair、falling-spring、resonance-bank、spring-atwood] 能量條的「總」和 HUD 的「總機械能／機械能＋碰撞耗能」差很多（例如 24.31 J 對 85.68 J、49.53 J 對 142.59 J、9.32 J 對 483.75 J），沒有說明零點不同，或只算其中一個物體 | 開啟即可看到 | vertical-spring-pair-0-init.png、falling-spring-1-play.png、resonance-bank-1-play.png | 能量條標明對象和零點，或改成和 HUD 同一定義
- [spring、driven、damped、falling-spring、vertical-spring-pair] 方塊上有一支沒有標籤的橘色箭頭（從方向看應該是彈力或合力，例如 x<0 時指向 +x）。學生不知道它代表什麼；只有速度箭頭有標「v」 | 播放 | spring-1-play.png、driven-2-ext.png、falling-spring-maxcomp-side.png | 加上「F彈」或「a」標籤，或在圖例裡說明
- [pendulum] 擺長拉到 1 m 時，擺小到縮在原點座標軸旁，鏡頭不會跟著拉近；擺錘和「v」「y」軸標籤重疊 | L=1 → 播放 | pendulum-3-plot.png | 改參數後自動取景
- [pendulum-angle-comparison] 擺長 0.5 m、角度 175° 時，標題文字「T₀ 1.419 s T 4.082 s 四階 2.688 s」和「線性近似 sinθ≈θ」「完整單擺 sinθ」三個標籤疊在一起；圖表預設觀察量是「小角度週期 T₀」，只是一條水平線，沒有教學價值 | 角度 175、L=0.5 → 顯示圖表 | pendulum-angle-comparison-3-plot.png | 預設改看兩擺擺角對時間；標籤錯開
- [shm-projection] R=4 m、T=1 s 時，圓的上半部超出畫面，「圓周質點」標籤被切掉；θ 顯示 1470.0° 而且壓在尺標 2.00/3.00 m 上。另外「顯示圓周與投影速度」預設是 0，畫面上卻仍有一支「v」箭頭（疑似開關沒有作用，或者那是另一支預設速度箭頭）| R 最大、T 最小 → 播放 | shm-projection-3-plot.png、shm-projection-1-play.png | θ 取 mod 360 或顯示「第 n 圈」；自動取景；確認 showV 開關
- [bungee] 高度對時間圖的縱軸固定為 0–跳台高度，h=140 m 時振盪被壓成一條近乎平的線；初始能量用科學記號「1.98e+4」，播放後又變成「1992.00 J」，格式不一致；「跳台 80 m」「自由落下・繩索鬆弛」的標籤和跳躍者重疊 | 開啟、播放、改參數 | bungee-0-init.png、bungee-1-play.png、bungee-3-plot.png | 縱軸依資料範圍自動縮放；數字格式統一
- [resonance-bank]「正視」是沿著振子排列方向看，十個振子完全疊成一根，看不出哪個共振；圖表預設觀察量是「共同驅動角頻率」（一條水平線）| 時間拖到 16 s → 按正視 | resonance-bank-late-front.png、resonance-bank-3-plot.png | 正視改成側面看整排；圖表預設改成各振子振幅對自然頻率的共振曲線
- [spring-atwood]「正視」同樣是沿著軸線看，兩條繩重疊，下半部又被 HUD 擋住 | 按正視 | spring-atwood-end-front.png | 調整正視方向
- [floating-block-shm] 方塊附近的「B」「合力」「平衡位置」「吃水界線」「q=…」等標籤疊在方塊頂部；水只畫了一片透明水面，沒有水體，看不太出「浸沒多少」；水槽側線延伸到地板下面，看起來像浮在空中的玻璃板 | 開啟、播放 | floating-block-shm-0-init.png、-1-play.png | 加半透明藍色水體；標籤分開放
- [vertical-spring-pair] 狀態標籤「下塊貼地」浮在場景上方很遠，和「上 m=1 kg」重疊；m=5 kg 時跑到視角按鈕列附近 | 播放、改 m | vertical-spring-pair-1-play.png、-3-plot.png | 狀態改放在右上狀態膠囊，或貼近下塊
- [spring-wire-cut]（疑似）剪線後彈簧組被壓到幾乎零長度，兩塊木塊貼在一起，看起來像疊在一起或穿模（數值 a 正確，但彈簧在畫面上消失了）| 預設播放到結束 | spring-wire-cut-1-play.png | 給彈簧最小顯示長度，或加入「彈簧壓到極限」的提示
- [falling-spring] 能量條沒有說明只算左木塊（總 49.53 J 對 HUD 142.59 J）；m=5 kg 時彈簧被壓縮 3.5 m，壓到只剩很短一截，不太真實 | m1=5 → 拖到 t≈1.3 s → 側視 | falling-spring-maxcomp-side.png | 能量條標明對象
- [dimensional-analysis] 圖表縱軸兩端都是 0.00、單位顯示「/ 」空白（無因次量）| 開圖表 | dimensional-analysis-3-plot.png | 給無因次量合理的縱軸範圍，並標「無單位」
- [bungee]「完整取景」在較矮的視窗（約 1264×569）下雖然框到整座塔，但事件標籤卡遮住塔頂和跳躍者 | h=140 → 完整取景 | bungee-h140-fit.png | 事件標籤卡改成可收合，或放到 3D 外面

中等問題共 17 條。

## 建議（教學體驗改進）
- 好幾個實驗用 0/1 的「拉桿」當開關或模式選擇（shm-projection 的顯示投影/速度/加速度、vertical-spring 的顯示參考、resonance-bank 的顯示自然頻率、floating-block-shm 的「情境 0/1」、顯示受力）。學生會以為它是連續參數，建議改成勾選框或分段按鈕。
- 參數改變造成場景尺度大幅變化時（damped、bungee、vertical-spring、pendulum、shm-projection），建議自動執行一次「完整取景」，或在右上提示「按完整取景」。
- 共振（resonance-bank）：效果太弱、要等很久才看得出來。建議把 ω≈Ω 的振子用醒目顏色標出，並畫出振幅包絡或歷史最大位移刻線。
- damped：「初始伸長量」在鉛直裝置中其實是「相對平衡點的位移」（方塊初始位置在平衡標記上方），名稱容易誤解（疑似）。建議改成「相對平衡位置的初始位移」。
- 多數圖表的預設觀察量最好選最能看出物理現象的量（例如 pendulum-angle-comparison 選兩擺擺角、resonance-bank 選振幅），不要選常數。
- measurement-uncertainty：建議用動畫逐次加入新的點，並在旁邊標「第 n 次：t = … s」。
- 擺類實驗（pendulum、measurement-uncertainty、dimensional-analysis）的支點懸在半空，可以加一個簡單的支架，比較真實。
- 手機寬度（390×844，spring）：版面正常，按鈕自動縮寫（取景、跟隨、歸零、預設、圖表），設定面板收到下方，可以用。不過 3D 區被 HUD 佔掉約一半，主要物體偏小（spring-mobile.png）。

## 沒問題的實驗
- coupled-oscillators、massive-spring、wall-spring-pair（物理與畫面大致正確，只有上述共通的座標軸重疊、U 標示問題）
