(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('electroscope','金箔驗電器：感應、接觸與接地','電磁學','electroscope',[
P('mode','流程：0靠近移開／1接觸／2感應接地',0,2,1,0),P('rod','棒初始電荷',-12,12,1,-8,'nC'),P('initial','驗電器預充電',-8,8,1,0,'nC'),P('gap','最接近間隙',.04,1,.02,.12,'m'),P('mass','單片金箔質量',1,10,1,3,'mg'),{...P('charges','顯示示意電荷',0,1,1,1),visual:true}
],[metric('charge','驗電器淨電荷','nC'),metric('angle','金箔半張角','°'),metric('earth','大地所得電荷','nC')],
'Q驗=C V−k V棒；Q棒=C棒 V棒−k V；金箔以靜電斥力與重力力矩平衡',
'此為準靜態集中電容教學模型，非精確導體表面電場解。電荷數值以nC、電容以pF計算，因此內部V與Vr的單位為kV（nC/pF）；Cl(pF)×V(kV)得到金箔電荷nC。頭部對地電容8pF、兩金箔共2pF、棒對地10pF，互電容k=3pF/(1+間隙/0.3m)，矩陣保持正定。金箔電荷取2pF×驗電器電位，每片一半；頭部承擔其餘電荷。靠近不接觸時兩物體各自淨電荷守恆；接觸時兩者等電位，總電荷守恆。接地時驗電器電位為零，與大地交換電荷；先斷地再移棒會留下與棒反號電荷。金箔長0.65m為放大示意，電荷集中各片中點，重力作用中點，以庫侖斥力與重力力矩平衡求角度；忽略金箔慣性、空氣阻力、漏電、擊穿與棒的極化細節。圖上正負符號只示意各區淨電荷，不表示電子總數或真實密度；實際電子的移動方向與正電荷流相反。預充電與異號棒接近時，張角可先減少、閉合、再因感應過強張開，不能僅憑張角判斷電性。',
['中性驗電器靠近帶電棒，為何淨電荷仍為零卻會張開？','感應起電為何必須先斷開接地，再移開棒？'],p=>{
const C=10,Cl=2,Cr=10,length=.65,kof=g=>3/(1+g/.3),contactK=kof(0),total=p.initial+p.rod;
function isolated(Q,R,g){const k=kof(g),V=(Q+k*R/Cr)/(C-k*k/Cr),Vr=(R+k*V)/Cr;return{Q,R,V,Vr,k};}
function equilibrium(q){const target=8.9875517923e9*(q*1e-9/2)**2/((p.mass*1e-6)*9.81*length*length);let a=0,b=Math.PI/2;for(let j=0;j<70;j++){const m=(a+b)/2;if(Math.sin(m)**3/Math.cos(m)<target)a=m;else b=m;}return(a+b)/2;}
function electrical(t){let g=3,Q=p.initial,R=p.rod,earth=0,grounded=false,stage='棒遠離：初始預充電';
if(p.mode===0){g=3-(3-p.gap)*Math.sin(Math.PI*t/12)**2;stage=t<6?'帶電棒靠近（不接觸）':'帶電棒移開（淨電荷不變）';}
if(p.mode===1){if(t<4){g=3*(1-t/4);stage='帶電棒靠近';}else{Q=(C-contactK)/(C+Cr-2*contactK)*total;R=total-Q;g=t<6?0:3*(t-6)/6;stage=t<6?'接觸：等電位並交換電荷':'分離：保留接觸後電荷';}}
if(p.mode===2){if(t<3){g=3-(3-p.gap)*t/3;stage='① 棒靠近，驗電器絕緣';}else if(t<6){g=p.gap;grounded=true;Q=-kof(g)*R/Cr;earth=p.initial-Q;stage='② 接地：電子與大地交換';}else{Q=-kof(p.gap)*R/Cr;earth=p.initial-Q;g=t<8?p.gap:p.gap+(3-p.gap)*(t-8)/4;stage=t<8?'③ 先斷開接地，棒仍靠近':'④ 再移開棒：留下異號淨電荷';}}
const e=isolated(Q,R,g);if(grounded){e.V=0;e.Vr=R/Cr;}const leaf=Cl*e.V,theta=equilibrium(leaf);return{...e,g,earth,grounded,stage,leaf,head:Q-leaf,theta,angle:theta*180/Math.PI,charge:Q,rodCharge:R,conserved:Q+R+earth};}
return trajectory(12,t=>{const e=electrical(t);return{x:0,y:2,z:0,...e};},{electrical,schematic:true,minimumSceneScale:6,hideFloor:true,hidePrimary:true,hideGrid:()=>true,bounds:{min:[-4.8,0,-2],max:[3,6.3,2]},scaleNote:'電容與金箔集中電荷的準靜態模型；裝置尺寸放大示意，非精確導體場解。',endLabel:'流程完成'});
},'models/electroscope.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
