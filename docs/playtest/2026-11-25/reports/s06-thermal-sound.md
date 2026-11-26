# 熱學＋聲音 試玩報告

（session：s06-thermal-sound；截圖都在 `C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s06-thermal-sound/`。16 個實驗的 `errors`／`console` 都沒有 JS 錯誤或警告。）

## 嚴重（視覺/物理錯誤、壞掉）

- [thermal-lattice] 能量列的位能 U 永遠接近 0（約 1e-34～1e-33 J），動能 K 卻約 4e-19 J（300 K），能量條整段都是 K。簡諧晶格熱平衡時應該 ⟨U⟩≈⟨K⟩：用畫面上的均方根偏移 64.36 pm、k=10 N/m 估算，U≈½k⟨r²⟩×64 顆 ≈1.3e-18 J，剛好等於 K（1000 K、10 u 時 K=1.33e-18）。所以 U 小了約 10¹⁵ 倍，疑似單位換算錯誤（pm/nm 沒換成 m） | 開啟後播放，或拖時間軸到 4.8e-12 s，看能量列「U（最低點為零）」 | thermal-lattice-1-init.png, thermal-lattice-3-extreme.png, thermal-lattice-5-sites.png | 檢查 U 的計算單位（位移應換成 m）；修好後能量條應約一半 K、一半 U，正好拿來教能量均分。
- [carnot-engine] P–V 循環圖是畫在 3D 場景裡的一張平面，預設斜視下看起來只是一條細長弧線，四段過程幾乎分不開。按「正視」會沿著圖面看，整個循環縮成一條直線（完全看不到）；按「完整取景」也救不回來，只有「側視」才看得到正面。另外 V 軸下方疊著世界座標刻度「-4.00 m … 4.00 m」，看起來像 V 的單位是公尺 | 開啟 → 正視／完整取景；或直接看預設畫面 | carnot-engine-2-play.png, carnot-engine-5-front.png, carnot-engine-6-fit.png, carnot-engine-7-side.png | 預設鏡頭改成正對 P–V 平面（或讓「正視」對準它）；在 P–V 圖附近隱藏世界座標刻度；四個角點標 1–4，等溫線、絕熱線用不同顏色並加圖例；圖表加「P–V 圖」選項（pv-path 已經有）。
- [joule-experiment] 重錘落地後繩子畫錯：左側繩段跟滑輪脫開，飄在半空，右側的繩子整條消失（落下途中兩條繩都正常） | 播放到結束（約 2.8 s），按「側視」 | joule-experiment-2-play.png, joule-experiment-5-side.png（對照落下途中 joule-experiment-6-side-mid.png） | 重錘落地後，繩子應從滑輪接到重錘（或畫成鬆弛的繩子）。

## 中等（看得到但不影響理解：重疊、取景、可讀性）

1. [共通：joule, thermal-lattice, ideal-gas, maxwell, equipartition, adiabatic-pistons, pv-path, carnot, vacuum-bell] 原點的座標軸和刻度標籤（如 -2.00 m … 2.00 m、-0.80 nm … 0.80 nm）預設就顯示，而且正好擠在主角中央，跟實驗標籤互相重疊。例如 joule 的「20.00→20.14 °C」被軸刻度蓋住；pv-path 的「Q 649 J · W 200 J」壓在 0.00 m、2.00 m 上；carnot 的「淨作功…效率…」壓在 y 軸箭頭上。建議預設隱藏世界座標刻度，或把座標軸移到角落（joule-experiment-1-init.png, pv-path-2-play.png, carnot-engine-2-play.png, ideal-gas-2-play.png）。
2. [ideal-gas / maxwell-distribution / equipartition] 氣體箱中心放在原點，地板正好從箱子中間切過去，下半箱的粒子穿到地板下面（ideal-gas-2-play.png, maxwell-distribution-3-extreme.png, equipartition-3-extreme.png）。建議把箱子底部放在地板上。
3. [thermal-lattice] 把「顯示平衡位置」設成 1，畫面上看不出任何差別（平衡點標記被球擋住，或根本沒畫）。另外 300 K 時均方根偏移只有約 35 pm，振動太小，眼睛看不出來（thermal-lattice-5-sites.png）。建議平衡點用小十字或線框標示，振動位移加「示意放大倍率」。
4. [maxwell-distribution] 圖表預設是「時間圖：理論最概然速率」，只是一條水平線。真正的重點「樣本分布與理論」直方圖要自己切換才看得到（切過去以後很好看）（maxwell-distribution-4-chart.png 對照 maxwell-distribution-5-hist.png）。建議這個實驗的圖表預設就是分布圖。
5. [equipartition / thermal-lattice / ideal-gas] 圖表裡的各量都是一條完全不動的理論常數水平線（例如每分子平動能固定 38.78 meV），學生看不出這是統計平均，圖表等於沒有資訊（equipartition-4-chart.png, thermal-lattice-4-chart.png）。建議改畫樣本的瞬時平均（會有漲落），或者預設改成分布圖。
6. [共通] 很多開關型參數用 0～N 的拉桿加文字代碼，不直覺：例如「粒子互撞：0關／1開」「分布：0vx／1vy／2vz／3速率／4動能／5全部速度」「分子：0單原子／1剛性雙原子／2可振動雙原子」「閥門：0抽氣／1進氣／2封閉／3循環」「音色：0純音／1鋸齒…」「右側：0彈簧／1氣體」「第1分量：0關／1開」。建議改成切換按鈕或下拉選單（doppler 已經有的「入門／探究／進階」分段按鈕就是很好的範例）。
7. [carnot-engine] 3D 標籤寫「淨作功 703.9 J · 效率 40.0%」，但循環進行到一半時，這個數字是累積作功，不是整個循環的淨功（整圈淨功約 115 J），跟效率並排容易讓人誤會（carnot-engine-7-side.png）。建議改成「累積作功」，或循環結束後才顯示「淨功」。
8. [adiabatic-pistons] 初始取景太遠，兩支汽缸又細又小，佔不到畫面的 1/10（adiabatic-pistons-1-init.png）。動手探究問「快速與緩慢加壓的活塞動能如何不同」，但讀數只有左氣體溫度、壓力和右活塞高度，沒有活塞動能，圖表預設也是溫度。建議拉近鏡頭，讀數或圖表預設改成兩個活塞的動能。
9. [sound-speed] 把「兩人之間的直線距離」從 600 m 拉到 100 m，兩座山和兩個人在畫面上的位置完全不變，只有文字改了（sound-speed-1-init.png 對照 sound-speed-3-extreme.png）。人物很小；角落的灰色球和金色球（雲、太陽？）沒有說明。建議距離要反映在場景裡（或標明比例尺），人物放大。
10. [doppler] 聲源和觀察者只是兩個很小的點；中央的「風 0 m/s · c=343.23 m/s」和「每92週期取一波面，不改變真實頻率」兩行字互相重疊，極端值時還跟波面重疊，完全看不清。俯視時「聲源 60 m/s」也跟「f源→f收」重疊。波面圓弧有部分斷掉，疑似和地板 z-fighting（doppler-2-play.png, doppler-3-extreme.png, doppler-5-top.png）。建議用車或喇叭、人偶等模型，把說明文字移到 HUD，波面稍微抬離地面。
11. [sound-elements] 3D 裡是一張斜放的波形加頻譜板，上方標籤嚴重重疊：「音高看基頻…」和「RMS 0.424…」疊在一起，「時間T觀察窗·純音」和「部分音振幅頻譜（非功率）」疊在一起，時間刻度也被板子擋住（sound-elements-1-init.png）。建議正面取景，標籤錯開或移到 HUD。
12. [violin-fourier] 12 個分量的標籤和波形線互相壓住，分量振幅小的幾乎是一條平線；淺色字放在淺色背景上，對比不足（violin-fourier-1-init.png）。圖表時間軸終點顯示「0.00 s」（視窗只有 4.55 ms，四捨五入後變成 0），刻度失去意義（violin-fourier-4-chart.png）。
13. [fourier-square] 「前N項部分和」標籤被理想方波框線和部分和曲線蓋住（fourier-square-1-init.png）。
14. [圖表命名：resonance-column / sound-elements / violin-fourier / fourier-square] 圖形選單叫「位置—能量圖」，圖例寫「目前時間的空間分布／追蹤位置」，但實際內容是響應對氣柱長度的關係，或時間波形，名稱不對（resonance-column-4-chart.png, sound-elements-4-chart.png）。
15. [sound-speed / echo] 圖表觀察量顯示「姊姊收到包絡 ()」「耳邊回聲包絡 ()」，括號裡空著，軸標題結尾也只剩「/」（sound-speed-4-chart.png, echo-4-chart.png）。建議寫「相對振幅（無單位）」。
16. [resonance-column / sound-elements / violin-fourier] 這幾個實驗是極慢動作，播放 3 秒後時間還顯示「0.00 s」或「0.01 s」，看起來像卡住（resonance-column-2-play.png, violin-fourier-2-play.png）。建議改用 ms 顯示，並標示「慢動作 ×N」。
17. [共通圖表] y 軸一律從 0 開始，變化量小的時候看不出變化。例如 adiabatic-pistons 的溫度 300→332 K 幾乎是平線；pv-path 的 P–V 圖只有 150 一個刻度（adiabatic-pistons-4-chart.png, pv-path-4-chart.png）。建議自動縮放，或加中間刻度。
18. [vacuum-bell] 鈴聲的波紋圓環畫到玻璃罩外面，穿過罩壁和抽氣機；底座文字（「室溫聲…」「…作示意」）被軸刻度擋住；t=0 還沒播放時，抽氣機已經標「抽氣中」（vacuum-bell-1-init.png）。
19. [echo] 地面尺只看得到 0、12、24 m（或 0、30、60 m），後面的刻度被牆或其他標籤擋住，只露出「…m）」（echo-1-init.png）。
20. [resonance-column] 極端值（L=1.15 m）時，「調水杯高度／水位」和「1: 0.850 m」兩個標籤重疊（resonance-column-3-extreme.png）。手機寬度下讀數「管口位移響…」和標題都被截斷，但沒有橫向捲動，可以接受（resonance-column-mobile-1.png）。
21. [ideal-gas / maxwell / equipartition / thermal-lattice] 時間顯示成「4.80e-12 s」，高中生不好讀，建議改用 ps。

## 建議（教學體驗改進）

- 「操作與探究」的說明是各實驗共用的模板，提到「薄荷綠箭頭為速度，紫色箭頭為合力…橘色軌跡」，但熱學和聲音的實驗大多沒有這些箭頭，會讓學生困惑。建議只顯示和本實驗有關的段落。
- joule-experiment：水溫只上升約 0.13 °C（物理上合理），但溫度計標籤很小、離容器又遠。建議用大字的 ΔT 讀數加「功 → 熱」的能量長條，讓「1 卡 = 4.186 J」的比例一目了然。
- carnot-engine：P–V 循環旁加 Q_H、Q_C、W 的能量流向圖（熱源 → 引擎 → 冷源）。
- maxwell-distribution：在直方圖上標出 v_p、v̄、v_rms 三條垂直線，對照 HUD 的三個讀數。
- pv-path：數值完全正確（W=PΔV、ΔU=3/2 Δ(PV)、Q=ΔU+W 都驗算過），建議在 P–V 圖上把 A、B 兩條路徑下方的功面積用兩種顏色區分。
- doppler：建議在俯視圖上標出「前方波長／後方波長」的量尺，配合 HUD 的 0.64 m／0.92 m。
- sound-speed、echo：聲包前緣、後緣的標記很好，建議也在時間軸上標出「發聲」「抵達」的時間點。
- 熱學的粒子模擬中，可以讓學生點一顆粒子來追蹤速度（目前已有 v 箭頭，但不知道是哪一顆）。

## 沒問題的實驗

- pv-path（物理與畫面都正確，只有共通的座標刻度重疊）
- resonance-column（共鳴長度 λ/4、3λ/4、5λ/4 = 0.193／0.580／0.966 m 正確，水杯高度跟著水位連動，響應圖的峰值位置正確）
- echo（往返時間、溫度對聲速的影響、反射能量比 0.8²=64% 都正確；只有中等的命名和刻度問題）
- sound-speed、vacuum-bell、doppler、equipartition、ideal-gas、maxwell-distribution、adiabatic-pistons、fourier-square、sound-elements、violin-fourier 的物理數值都驗算正確（例如 c=331.3√(T/273)、v_rms=432.5 m/s、都卜勒 f=561～564 Hz、能量均分 3/2kT、kT、kT），只有上面列的視覺或可讀性問題。
