# 波動＋波動光學 試玩報告（s07-waves）

測試環境：http://127.0.0.1:8810/，桌面 1280×800，另測 390×844 手機寬度。18 個實驗全部打開過，每個都有播放／拖時間軸，另把拉桿推到極端值試過。`errors` 與 `console` 全程沒有 JS 錯誤。
截圖資料夾：C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s07-waves/

## 嚴重（視覺/物理錯誤、壞掉）
- [michelson] 畫面上看不到分光鏡到屏幕的「輸出光束」。只畫了雷射→M₁、分光鏡→M₂ 兩段，學生看不出兩道反射光如何重合後打到屏上（疑似漏畫）。| 打開即可見；放大三次並設傾角 0.1 mrad 後更明顯 | michelson-2-play.png, michelson-3-zoom-tilt.png | 補畫 M₁、M₂ 回到分光鏡後射向屏幕的合成光束，最好兩道用不同顏色或虛實線區分。
- [longitudinal-tube] 兩端開管、n=5、L=4 m 時，「位移節／位移腹」標籤全部擠在一起，又和刻度標籤 -2.00 m、-1.00 m 疊在一起，完全讀不出來。| mode=5, n=5, L=4 | longitudinal-tube-5-ext.png | 標籤改放在管子上方對應的 x 位置，間距不夠時只留記號（▲/●）並把文字收進圖例；也可讓相鄰標籤上下交錯。
- [longitudinal-tube] 讀數「追蹤質點位移」顯示 `-4.95e-18 m`，是浮點誤差直接印出來，學生會以為是有意義的數字。| 同上設定，t≈0.01 s | longitudinal-tube-5-ext.png | 數值絕對值小於 1e-9 倍振幅時直接顯示 0。
- [two-source-interference] 水面網格解析度不夠：俯視時呈現馬賽克方塊。λ 調到 1 m 時出現嚴重疊紋，條紋圖案反而被方塊淹沒，看不出節線。| 俯視；λ=1, 間距=8, A=0.5 | two-source-3-top.png, two-source-4-extreme.png | 讓網格密度跟 λ 連動（每個波長至少 12–16 格），或改用 shader 逐像素著色。
- [newton-rings] 俯視牛頓環圖外圈出現明顯的疊紋假象（四角有弧形帶）。學生可能誤以為那是真實的條紋。| 預設打開 | newton-rings-2-play.png | 提高貼圖解析度，或在環距小於 2 像素的區域做平均（改顯示平均灰度）。

## 中等（看得到但不影響理解：重疊、取景、可讀性）（共 14 條）
- [全部波動實驗] 世界座標軸（x/y/z 箭頭與 "x" 字）畫在原點，正好跟波繩、交界點、固定端重疊。「2.00 m」刻度和 "x" 軸字疊成「2.00x」。string-interface 的「接點x=0」也壓在 y 軸上。| basic-waves-1-init.png, basic-waves-3-fixed.png, string-interface-5-t450.png | 座標軸移到場景角落，或預設隱藏。
- [wave-function / two-source-interference] 3D 標籤用白邊淺色字畫在淺色地板上，對比太低，看起來像疊影（例如「時間 t (s)·表面z」、「0.00 s」、「等幅波相位：白…」）。部分還被下方讀數面板蓋住（8.00 s）。| wave-function-3-zoom.png, two-source-3-top.png | 標籤加深色半透明底框。
- [wave-function] 「y-x：目前 t=…」的標籤貼在 z=0 的實際繩子上，而不是曲面上那條會移動的 y-x 切片。兩條橘色曲線同時存在，容易搞混。| wave-function-4-mid.png | 兩條線分別標註（「實際繩子」與「曲面切片」），或改用不同顏色。
- [string-wave-energy] 「兩波長總能 … J」和「下方圖表：動能／彈性位能／總能密度」兩個標籤跟 1.00 m、2.00 m 刻度及 x 軸疊在一起。而且圖表預設隱藏，卻寫「下方圖表」。| string-wave-energy-2-play.png | 標籤往上移；圖表隱藏時文字改成「按『顯示圖表』看能量密度」。
- [michelson] 上方三行說明（中心亮度／ΔL=Nλ/2／實際位移）在預設距離下互相重疊。「鏡 M₁（可動）」和「d = 32.02 µm」疊在一起；雷射標籤被桌面切掉，只剩「633 n」。| michelson-2-play.png, michelson-chart.png | 加大行距，或改放 HUD。
- [michelson] 圖表縱軸標題是「屏中心相對亮度 /」，觀察量選單是「屏中心相對亮度 ()」，單位空白卻留著斜線和空括號。| michelson-chart.png | 無單位時省略「/」與「()」。
- [optical-polarizers] 末片的「90°」標籤被上方「入射 100%·輸出 12.50%」蓋住。光束經過偏振片後顏色和粗細不變，看不出強度在下降。| optical-polarizers-2-play.png | 錯開標籤位置；光束透明度或粗細隨強度變化。
- [optical-grating] 中心的「穿透半空間」「光線表示允許方向，不代表級次效率」和入射光、波前刻線、光柵切線疊在一起。| optical-grating-2-play.png, optical-grating-3-ext.png | 說明文字移到角落。
- [waveplate] 「偏振軌跡」「傳播 +x」「慢軸 e 光」等標籤壓在波形和檢偏片上，畫面很擠。| waveplate-2-play.png | 減少常駐標籤，或在 hover 時才顯示。
- [newton-rings] 透鏡底下的「接觸點 t=0」「掃描點 r=… t=…」被玻璃板遮住一部分。屏幕下緣的「第 5 條暗環 r=…」被圖片蓋住；楔形模式也有同樣問題。| newton-rings-2-play.png, newton-rings-3-wedge.png | 標籤移到物件外側，並設定 depthTest=false。
- [aperture-pattern] 正視時「矩形孔 1×1 陣列」標籤被屏幕上緣蓋住一半，孔板也被屏幕擋住。| aperture-3-front.png | 標籤改放在屏幕外上方，或做側向偏移。
- [basic-waves] 水波模式（mode 3）的水面幾乎透明，從預設視角很難看到波形。縱波模式（mode 2）的疏密也不明顯。| basic-waves-6-water.png, basic-waves-7-long.png | 水面不透明度提高；縱波可加疏密著色或間隔標記。
- [全部] 開啟圖表後 3D 區縮成約 400 px 高，讀數面板與播放列又蓋住 3D 區下半，實際可見的場景不到一半。手機寬度時 3D 區只剩約 260 px，讀數標題被截斷成「掃描點相對…」。| string-wave-energy-chart.png, double-slit-chart.png, double-slit-mobile.png | 開圖表時讀數面板改成單行或可收合；手機版讀數改兩欄。
- [string-interface / basic-waves] 側視時鏡頭太遠，0.15 m 的脈衝只是一條細線上的小凸起。| basic-waves-5b-full.png, string-interface-3-ratio8.png | 側視時依繩長與振幅自動取景。

## 建議（教學體驗改進）
- 「正視」在波動實驗是沿 x 軸看，所有波會縮成一條直線（standing-waves-4-front.png），對學生沒有用。建議波動實驗的「正視」改看 x-y 平面，或在提示中說明「看波形請按側視」。
- basic-waves 的圖表預設觀察量是「入射相速度」，只是一條水平線。建議預設改成「追蹤點位移」。
- thin-film：只畫一道入射和一道反射，看不出「上表面反射」與「下表面反射」兩道光的干涉。建議畫出兩道反射光並標出相位差。正入射時入射箭頭和反射箭頭重疊在同一條線上，「入射」標籤又放在交點處，容易誤會。另外光線顏色固定，不隨掃描波長改變（540 nm 時是紫色）。
- optical-polarizers 圖表標題「強度對偏振軸」沒寫清楚是哪一片，實際上是末片角度。建議寫成「輸出強度對末片偏振軸」。
- longitudinal-tube 在 A=0.02 m 時壓力擾動約 8800 Pa（約大氣壓的 9%），已遠超線性聲學範圍。可提示「振幅已誇大」，或降低上限。
- rgb-lights 是靜態實驗，時間軸、播放鍵和「時間」讀數沒有意義。建議隱藏，或改成自動輪播亮度。
- diffraction-amplitudes 的電場複數平面上有個「3」字（看起來是固定標記），意義不明，學生看不懂。
- two-source-interference：改參數會把時間歸零（狀態回到「準備實驗」）。調整時想維持動畫的學生會覺得中斷。
- 說明問題（question）大致有幫助。例如 basic-waves 問「追蹤質點是否也持續向右」，正好可對照追蹤點只上下動；但追蹤點的「v」箭頭很小，建議加軌跡線。

## 沒問題的實驗（物理與畫面大致正確，只有上面列的小問題）
- standing-waves：側視時合成波振幅為各行波的 2 倍，節／腹位置正確。
- string-interface：輕繩反射同相 R=+0.48、T=1.48、透射脈衝變寬；重繩反射反相 R=-0.48。
- wave-polarization
- double-slit：條紋距 5.5 mm 與畫面一致，圖表有單縫包絡。
- rgb-lights：加色與減色的疊色都正確。
- aperture-pattern：8×8 陣列的條紋距 12.5／6.9 mm 與畫面一致，次極大數目正確。
- diffraction-amplitudes
- optical-grating：600 條/mm 時 m=±3 正確，旋轉 75° 時級次合理。
- thin-film：MgF₂ 100 nm 的反射極小值在約 550 nm。
- optical-polarizers：50→25→12.5% 正確。
- waveplate：λ/4 片得到圓偏振、檢偏後 50%。
- basic-waves：固定端反射倒立正確。
