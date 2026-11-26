# 幾何光學 試玩報告（s08-geo-optics）

截圖資料夾：`C:/Users/user/AppData/Local/Temp/claude/789677cd54e0b286/06c814df-9908-4f84-878c-c9dfedc09307/scratchpad/shots/s08-geo-optics/`
已實測 20 個實驗，全部 `errors` 無 JS 錯誤。每個實驗的數值讀數我都自己用公式驗算過（鏡像距離、透鏡公式、司乃耳定律、Fresnel、δmin、NA、虹角等），讀數本身都正確；以下問題大多屬於「數字對、畫面不對」。

## 嚴重（視覺/物理錯誤、壞掉）
- [image-drawing] 凹面鏡與凸面鏡的「形狀畫反了」。選「3 凹面鏡」時，鏡面中央最靠近物體、邊緣往遠離物體的方向彎（外觀是凸面）；選「2 凸面鏡」時，邊緣反而彎向物體（外觀是凹面）。光線、F、像的位置與正倒立都對（凹面鏡 v=6 m 倒立實像在物體同側；凸面鏡 v=-1.2 m 正立縮小虛像在鏡後），只有鏡面曲線方向相反，會讓學生記錯「哪一種是凹面鏡」。 | 元件=3 → 側視 → 播放 → 放大 | image-drawing-concmirror-zoom.png、image-drawing-convmirror-rays.png、image-drawing-concmirror.png、image-drawing-convmirror.png | 把面鏡曲線的弧度符號反過來：凹面鏡的曲率中心要在物體那一側（2F 處）。
- [half-lens] 透鏡外框的圓環「平躺在地上」，沒有立起來垂直於主軸。側視時圓環只剩一條水平扁橢圓，俯視時反而是正圓。遮擋用的半圓板和光線都是垂直主軸的，因此遮板看起來立在一個平放的圓環中間。從光線打在透鏡平面的範圍看，光學計算用的仍是垂直的透鏡，只有外框的方向錯了。 | 開啟 → 側視/俯視 | half-lens-side.png、half-lens-top.png、half-lens-3.png | 圓環 mesh 要旋轉 90°，讓環面法線沿光軸（x）。
- [optical-parallax] 同上：透鏡圓環平躺在地面（側視是水平扁環）。視差的讀數與眼中所見都對（頭右移時，較近的像相對棒向左）。 | 開啟 → 側視 | optical-parallax-2.png、optical-parallax-side.png | 同上；這兩個實驗和下一個應該共用同一個 torus 方向的 bug。
- [dolly-zoom] 「自由3D構圖」中，主環與背景環都平躺在地上（側視只剩一條水平帶），但攝影機視錐朝 +x 方向看，攝影機畫面裡的環也是正對鏡頭的圓，兩種畫面互相矛盾。 | 視圖=1 → 立體/側視 | dolly-zoom-3d.png、dolly-zoom-3d-side.png | 3D 構圖中的環要立起來，面向攝影機的軸。
- [prism-dispersion]（疑似；畫面和文字矛盾）設定 A=80°、重火石、θ₁=0 時，光線從左面垂直射入後，先打到「底面」，在底面全反射，再幾乎垂直地從右面射出（畫面上光確實離開了稜鏡，徽章也顯示「光線已射出稜鏡」）。但文字與表格寫「全反射：紅…紫光在第二面…無法由右面射出」「第二面無法射出的色光數 7」，各色 δ 都寫「全反射」。學生會看到「說射不出去，卻射出去了」。 | A=80、材料=3、θ₁=0、放大 | prism-dispersion-theta0.png（θ₁=40 時一致：prism-dispersion-3.png） | 判斷 TIR 時考慮光是否先打到底面；或在這種情況加註「光經底面反射後從右面射出，不屬於兩面折射模型」。

## 中等（看得到但不影響理解：重疊、取景、可讀性）
共 17 條
- [plane-mirror] 第一次開頁整頁空白（場景沒畫、切換實驗選單是空的、沒有參數拉桿），重新整理後正常；之後再開其他實驗沒有重現。疑似載入競態（也可能是同時多人連線造成的）。 | plane-mirror-1.png vs plane-mirror-1c.png
- [plane-mirror] 立體視角中「1 虛像 可見」和「2 虛像 可見」兩個標籤互相重疊；俯視時「有限平面鏡 · 可見3/3」壓在 2 號光線和眼睛標籤上。沒有畫出可見範圍（視野錐），學生較難理解為什麼鏡子變短後像會消失。 | plane-mirror-1c.png、plane-mirror-top.png、plane-mirror-3.png
- [多個實驗共通] 圖表標題與下拉選單出現空單位殘字，例如「可見虛像數 /」「可見虛像數（）」「目前介質折射率（）」。plane-mirror 這類靜態實驗的時間圖只有一條水平線，沒有教學意義。 | plane-mirror-chart.png、layered-refraction-chart.png
- [shared-mirror] 側視仍是透視投影，160 cm 的乙因為比較靠近鏡頭，看起來比 180 cm 的甲還高，學生會誤會。側視預設取景太遠，兩個人只占畫面一小塊。另外，按「立體視角」會保留先前的放大倍率。 | shared-mirror-side.png、shared-mirror-side2.png、shared-mirror-3.png
- [double-mirror] 預設立體視角中，物體和像都很小；選定像的反射光路是幾乎垂直的細線，又被「可見3像 · 選像查看反射路徑」標籤壓住。選到不存在的像號（24，只有 11 像）時沒有任何提示。 | double-mirror-2.png、double-mirror-top.png、double-mirror-24.png
- [conic-mirror、image-drawing] 「正視」看的是光線平面的側邊，畫面只剩一條線，沒有用處；能看懂的 2D 圖要按「側視」。「F₂ / 參考焦點」標籤被大量光線蓋住；拋物面只有一個焦點，卻標成 F₂。凹面鏡預設顯示鏡後的反向延長虛線，畫面很雜亂。 | conic-mirror-front.png、conic-mirror-side.png、image-drawing-front.png
- [image-drawing] 改參數後時間歸零，畫面上只剩箭頭、沒有光線，要再按播放才會畫出，學生可能以為壞了。預設取景太遠，透鏡圖只占畫面中央一小塊。 | image-drawing-virtual.png、image-drawing-2.png
- [refraction-cart] 「介質2：1 m/s」和「理想光線比較：出射角 18.7°」重疊；極端值（慢→快、80°）時，俯視下軌跡起點超出畫面上緣，按「完整取景」後「介質1」「介質2」標籤又疊在一起（變成「介介質2」）。 | refraction-cart-2.png、refraction-cart-3.png、refraction-cart-fit.png
- [layered-refraction] 立體視角中光線只是平躺在地面色帶上的一小段，幾乎看不到；n1…n4 標籤擠成一串（「n1=1.2n2=1.8n3=1.4n4=1.00」），俯視時標題被視角按鈕蓋住。1× 播放下，光線走完約需 20 秒。全反射後的路徑跑到 HUD 底下。 | layered-refraction-2.png、layered-refraction-top.png、layered-refraction-3.png
- [straw-cup] 光線追蹤的畫面解析度低：吸管呈鋸齒狀，地板有明顯摩爾紋。用預設的側視、正視看不出「斷吸管」（視線剛好在吸管所在平面內），要斜上方放大才看得到。 | straw-cup-2.png、straw-cup-front.png、straw-cup-side.png、straw-cup-3d-zoom.png
- [apparent-depth] 預設取景太遠：眼睛/眼睛2、表觀/表觀像、實距、近軸參考、真實物體的標籤全部疊在一起，至少要放大 4 次才看得清楚。 | apparent-depth-2.png、apparent-depth-side.png、apparent-depth-side-zoom.png
- [sphere-lens] 選「內看外」時背景變深色，左上角的深色說明文字（標題、操作提示）幾乎看不見；地板摩爾紋嚴重。 | sphere-lens-3.png、sphere-lens-2.png
- [fresnel] 圖表下拉選單寫「位置—能量圖」，實際內容卻是「功率比例對入射角」；圖例只有文字 R/T/Rs/Rp，沒有線條色樣。中央的「局部偏振電場」標籤壓在入射點上。 | fresnel-chart.png、fresnel-top.png
- [eye-lens] 切到平面鏡、凹面鏡、凸面鏡時，攝影機仍停在鏡子背面，只看到一個灰色圓盤，提示要自己旋轉視角；應自動換到物體那一側。 | eye-lens-plane.png、eye-lens-plane-3d.png
- [dancing-image] 物體跨過焦點時，像速度高達上萬 m/s，圖表 y 軸被拉到 ±1.35e+4，物體與透鏡的速度曲線被壓成一條平線，完全看不出來；下拉選單同樣寫「位置—能量圖」。 | dancing-image-chart.png
- [dolly-zoom、prism-dispersion、rainbow] 畫面頂部的說明標籤和視角按鈕列重疊或被切掉，例如 dolly-zoom 的「移動+變焦：主環像高固定」、rainbow 正視時的主虹/次虹標籤。prism 全反射時的光線延伸到 HUD 底下。 | dolly-zoom-2.png、rainbow-front.png、prism-dispersion-3.png
- [prism-dispersion、optical-fiber] 角度與公式標籤密集重疊，例如 θ₁/r₁/r₂/頂角擠在稜鏡頂端；fiber 逸出時「φ=64.4°<θc」壓在 NA 公式上。prism 在「所有角度都全反射」的設定下，圖表是空白，y 軸寫「0.00–0.00」，應改成文字說明。 | prism-dispersion-2.png、optical-fiber-3.png、prism-dispersion-chart.png

## 建議（教學體驗改進）
- 幾何光學大多是 2D 光路圖，建議預設或加一個「光路平面正視」按鈕，直接對準光線平面並自動取景（目前要猜是側視還是正視，而且還得放大好幾次）。這類圖的側視建議改用正交投影，避免透視造成大小錯覺。
- 播放前就先畫出靜態光路（目前改參數後光線會消失），動畫只負責「光走過去」的效果。
- plane-mirror／double-mirror：用半透明色塊畫出「能看到該像的眼睛範圍」，對應題目問的「鏡子變短，哪些像先消失」。
- image-drawing：凹面鏡和凸面鏡加上「反射面」標記（例如背面畫斜線），配合修正後的曲線方向。
- straw-cup：預設視角改成斜上方、看得到斷吸管的角度，並提高渲染解析度。
- rainbow：加一個「觀察者視角」（從觀察者背對太陽看出去），色序的判斷會更直覺。目前要用正視才能確認主虹外紅內紫、次虹外紫內紅（兩者都正確）。
- dancing-image：速度圖改用對數或截斷的 y 軸，並標示 u=f 的斷點。
- 手機寬度（390×844）版面正常、沒有橫向捲動，但 3D 光路圖非常小（image-drawing-mobile.png），手機上建議預設放大。

## 沒問題的實驗（物理與畫面基本正確，只有上面列的中等或建議項目）
- plane-mirror, shared-mirror, double-mirror, conic-mirror, refraction-cart, layered-refraction, straw-cup, apparent-depth, sphere-lens, fresnel, eye-lens, dancing-image, optical-instruments, rainbow, optical-fiber
- 驗算紀錄：平面鏡像距=物距、兩人同鏡共用鏡高 0.99 m／鏡底 0.72 m、雙鏡 90° 3 像與 30° 11 像的位置、拋物面平行光匯聚與球面像差、凸透鏡 u=3 f=2 → v=6 m=-2 的三條特殊光線、雙輪車 40°→18.75° 以及慢→快 80° 折返、多層 n sinθ=0.688／1.182（含全反射）、視深近軸值 1.13 與斜視值 0.91、球內臨界角 41.8°、Fresnel Rs=6.61% 與布魯斯特角 56.31° 時 Rp=0、眼看透鏡的倒立實像（上下左右都翻轉）、u<f 時遠景反轉而近物正立、成像之舞 v'=-m²v、半遮透鏡光量 50% 仍成完整像、視差方向、望遠鏡 -6×、顯微鏡 -62.5×、主虹 42.1°／次虹 50.8° 與色序、δmin=48.19°（紫光偏折最多）、光纖 θc=69.98°、NA=0.51、θa=30.66°、θ₀>θa 時逸出、彎曲時從外側逸出。全部正確。
