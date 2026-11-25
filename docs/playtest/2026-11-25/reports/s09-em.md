# 電磁學 試玩報告（s09-em）

截圖目錄：`C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s09-em/`
（輔助腳本 em_run.sh / tl.sh / sl.sh / chart.sh 也放在同一資料夾）

整體結論：15 個實驗的數值我都用公式驗算過（庫侖力、C=ε0εrA/d、RC、f0=1/2π√LC、μ0I/2πr、r=mv/qB、ε=NBAω、變壓比、F=ILB、e/m、E/B=c 等），全部正確；右手定則／力方向／場方向在我檢查的畫面裡**都一致**（細節見最後「已驗證的方向」）。問題主要在「畫面看不到重點」「時間或尺度標示會誤導」，以及一個冷啟動載入失敗。

## 嚴重（視覺/物理錯誤、壞掉）
- [全站，於 emf-power 遇到] 冷啟動（新開瀏覽器第一次載入）時頁面初始化失敗：3D 場景整片空白、「切換實驗」下拉選單是空的、標題變成「經典力學 / 3D」，console 出現 `ReferenceError: render is not defined at frame (mechanics-controls.js?v=20261124-p1e:7:14)`；按重新整理後就正常。在全新的 agent-browser 工作階段裡重現了 2 次 | 關閉瀏覽器 → 開 `mechanics.html?experiment=emf-power` → 等 1.5～4.5 秒 | emf-power-1.png、emf-power-reload2.png | 疑似 experiment-loader 用 document.write 依序插入腳本，在冷快取下時序有競態，mechanics-controls.js 的 `frame()` 早於 `render` 定義就開始跑。建議：等 loader 的 promise 完成後才 requestAnimationFrame(frame)，或在 frame 裡加 `typeof render==='function'` 防護，並在失敗時顯示「重新載入」提示。
- [eddy-current] 主讀數「時間」與圖表時間軸顯示的是「播放秒數」，不是物理時間，所以讀數會誤導：導電管情況 3D 標籤寫「3.700 s 落到底」，下方時間卻是 6.00 s；絕緣管物理上 0.32 s 就自由落體到底（v=3.13 m/s），讀數與圖表卻還是用 0～6 s 的尺度（例如 1.20 s 時標籤寫 0.064 s）。這個實驗本來就要比較「導電管掉得比較慢」，兩種管材的時間軸卻一樣長，學生會讀錯落下時間 | 管材=0 與 1 各播放一次後比較時間讀數與 3D 標籤 | eddy-current-2.png、eddy-current-4b / eddy-current-5chart.png | 主讀數與圖表改成物理時間，或明確標成「播放時間（慢動作 ×N）」，另加一格「物理時間」。
- [electroscope] 這個實驗主要要看金箔張開，但張角太小、肉眼看不出來：靠近移開最大約 0.9°，接觸 -4 nC 也只有 3.5°，感應接地 1.9°。畫面上兩片金箔幾乎重疊成一條金色細條，學生看不出「張開／閉合」的變化 | 預設參數播放；流程=1、2 | electroscope-2.png、electroscope-4zoom.png、electroscope-6contact-mid.png | 金箔張角加視覺放大倍率（例如 ×10，並註明「張角已誇大」），或加一個張角刻度弧。
- [parallel-capacitor] 時間軸會把 εr 從 1 漸變到 8（插入介電質），但兩板之間**沒有畫出介電質**；而且電場線一直都是 3 條，t=0 時 E=3000 V/m，結束時 E=375 V/m（差 8 倍），畫面卻完全一樣，看不出「固定電荷時插入介電質，電場減弱」 | 接線=1、εr=8、d=12、俯視，比較 t=0 與 t=8 s | parallel-capacitor-6top-start.png vs parallel-capacitor-5top-end.png | 畫出半透明介電質板（厚度或插入比例隨時間變化），電場線密度或箭頭長度跟著 E 縮放。

## 中等（看得到但不影響理解：重疊、取景、可讀性）
- [共通：多數電磁實驗] 地面座標軸的刻度永遠標「-4.00 m … 4.00 m」，但場景其實已經縮放：線圈半徑 0.08 m（wire-magnetic-field）畫成約 1.1 m；r=0.000207 m 的迴旋圓（charged-particle）畫成約 1.5 m；80 cm² 的電容板看起來約 1 m 寬。學生會照刻度讀出錯的尺寸 | wire-3top0.png、cp-ext2 / cp-chart.png、parallel-capacitor-1.png | 縮放場景裡要嘛隱藏 m 刻度，要嘛刻度跟著縮放並標上比例尺。
- [共通] 座標軸的刻度文字、x/y/z 字母常常和實驗標籤疊在一起：two-charges「A 2 nC」、magnetic-induction「ε = 0.00 mV」、rlc「交流源 … A」、gauss「綠色向外 紫色向內」、eddy「綠/橘表示環電流相反方向」、wire「磁針偏角」、generator「磁通…/匝·負載」、em-wave 俯視資訊列 | 各實驗的 -1/-2 截圖 | 電磁組預設不顯示地面刻度，或讓標籤避開座標軸。
- [共通] 主要物體在預設取景下偏小，只佔畫面中央約 1/4（electroscope、two-charges、gauss-surface、wire-magnetic-field、generator-transformer、charged-particle）。建議預設「完整取景」時把主體放大到填滿約 60%。
- [electroscope] 底部「淨電荷 0.00 nC」與「大地 0.00 nC」兩個標籤重疊；「張角」標籤蓋到金箔與 ±電荷數字；最上方說明「電荷符號為各區淨電荷示意」放大後會跑到視角按鈕列旁邊 | electroscope-1.png、electroscope-4zoom.png。
- [two-charges] 同號電荷、距離 1 m 時兩個標籤合併成「A 5 B 5 nC」；預設播放時「掃描點」標籤會壓到「觀察點」標籤；電位地形預設是正面視角，地形被看成一條扁線，要按「立體視角」才看得懂 | two-charges-2.png、two-charges-3.png、two-charges-4.png。
- [magnetic-induction] 磁鐵在 -1.5 m 時，3D 標籤寫 Φ=0.004 mWb，讀數卻顯示 0.00 mWb（小數位不夠）；線圈顏色在橘↔青之間切換，但沒有圖例說明顏色代表什麼 | magnetic-induction-1.png。
- [circuit-rc] RC 模式裡的電容只用兩條細線表示，預設取景幾乎看不到；放電＋開關斷開時，R₁ 標示 0.00 V（沒有壓降），但 R₁ 兩側導線顏色一紅一灰，像是有電位差（疑似電位著色錯誤）；R₁ 的電流標籤「A」被電阻方塊擋住 | circuit-rc-4charge / circuit-rc-6zoom.png、circuit-rc-7discharge-open.png。
- [parallel-capacitor] 兩板中間的「V / 能量」標籤被板子擋住，或與座標刻度重疊（例如「12.00 … 75.0 pJ」被截斷）| parallel-capacitor-1.png、parallel-capacitor-5top-end.png。
- [gauss-surface] 高斯球面本身看不見，只有點和箭頭；最好畫一個淡色半透明球殼 | gauss-surface-1.png。
- [rlc-resonance] 「交流源 … V · … A」標籤和 y/x 軸文字、2.00 m 刻度重疊 | rlc-resonance-1.png。
- [wire-magnetic-field] 標題寫「磁針」，但畫面上只有一顆探針球加一支合磁場箭頭，看不到磁針；距離從 0.08 m 改成 0.02 m（縮小 4 倍）時，圓圈只縮小約 1.5 倍 | wire-3top0.png、wire-5ext.png。
- [charged-particle] 迴旋半徑讀數小數位不夠：r=0.000207 m 顯示成「0.00 m」，圖表 y 軸變成「0.00～0.00」；主讀數「時間 10 s」是播放時間，週期卻是 μs 等級，沒有說明是慢動作；俯視時因透視，+y 方向的 B 箭頭看起來像指向 -x | cp-chart.png、cp-top-a.png。
- [current-balance] 電流與力最大時，上方「I = … F = …」標籤會跑到視角按鈕後面被擋住（開圖表時更明顯）；F 箭頭長到超出畫面；「F=IL×B」與「未放砝碼」標籤互相重疊；仰角標籤被 S 磁鐵擋住 | cb-chart.png、cb-ext.png。
- [cathode-ray] 「陽極 +2000 V」標籤被陽極方塊擋住，只剩「陽極 -000 V」，像是負電壓；「光點 Y = 16.4 mm」標籤疊在螢光幕上 | cathode-ray-1.png、cr-5Bonly.png。
- [em-wave] 三行資訊文字疊在波形和「傳播方向 +x」上；30 MHz 時「λ=9.99 m」與「B」重疊；E₀=1 與 E₀=100 時畫出的波振幅一樣大（自動正規化但沒有說明）| emw-ext.png、emw-chart.png、emw-俯視.png。
- [emf-power] 圖表三條曲線的圖例文字散在上緣，不容易對應到曲線；燈泡在 0.45 W 與 4.5 W 時光芒看起來一樣亮 | emf-power-5chart.png、emf-power-3par.png。
- [手機 390×844，current-balance] 排版正常、沒有橫向捲動；場景偏小，讀數標題「磁力（向上…」被截斷 | mobile-cb-1.png。

中等問題合計：18 條。

## 建議（教學體驗改進）
- magnetic-induction、eddy-current、generator-transformer：在線圈或環上畫出**感應電流方向的小箭頭**（目前只有顏色），學生才能真正用冷次定律或右手定則對照方向。
- eddy-current：多一格「物理落下時間」，並在同一張圖上疊出「絕緣管」對照曲線，一眼就能比較。
- electroscope：每個流程步驟加上步驟條（①靠近 ②接觸/接地 ③移開），讓 3D 標籤與步驟同步；目前在 t≈7.8 s 標籤已寫「帶電棒移開」，棒子卻還在原位。
- wire-magnetic-field：畫一根真正的磁針，並在俯視時顯示 ⊙/⊗ 標示電流方向；圖表預設改成「磁針偏角」，不要用固定不變的 |B_wire|。
- charged-particle：俯視時把 B 改用 ⊙/⊗ 表示；讀數加上「物理時間（μs）」。
- parallel-capacitor：說明這個時間軸代表「插入介電質＋拉開板距」的過程，目前沒有任何提示。
- em-wave：圓偏振時圖表預設可以改看 Ey、Ez 分量，|E| 是一條水平線，看不出變化。
- two-charges：電位地形模式預設改用立體視角。
- current-balance：已經有「右手：四指由 I 彎向 B」的提示，很好；其他磁力實驗（cathode-ray、charged-particle）也可以加上同樣的提示。

## 已驗證的方向（畫面與物理一致）
two-charges 電力線由 + 指向 −、同號電荷互斥；magnetic-induction 的 ε 正負號符合 −NdΦ/dt；circuit-rc 與 emf-power 電池長板為 +、電流箭頭方向正確；rlc 電流箭頭會隨 i 的正負翻轉；gauss-surface 球外電荷時近側向內、遠側向外（正負電荷都對）；wire-magnetic-field 電流 +y 時磁場在 +x 處為 −z（逆時針），電流反向時磁場也反向；charged-particle 正電荷從 +y 往下看為順時針、負電荷為逆時針，螺距沿 B 方向；current-balance 的 F = IL×B 方向（向上／向下）正確；cathode-ray 的 E 由高電位板指向低電位板，電子往正板偏，B 沿 −z 時電子受力向下，可與電場抵消；em-wave 的 E⊥B、E×B 指向 +x，E 與 B 同相；generator 磁通最大時 ε=0；transformer 電壓比等於匝數比。

## 沒問題的實驗
- 無「完全沒問題」的實驗；物理與數值全部正確，問題都屬於上面列的可讀性或標示類。相對最完整的是：rlc-resonance、cathode-ray、emf-power（重新整理後）、generator-transformer。
