(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
const encode=v=>v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055,decode=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
const centers=[[0,.48],[.48,-.38],[-.48,-.38]];
function mix(p,mask,subtractive=false){const values=subtractive?[p.cyan,p.magenta,p.yellow]:[p.red,p.green,p.blue];return values.map((v,j)=>subtractive?1-(mask[j]?v/100:0):(mask[j]?v/100:0));}
M.RGBLight={encode,decode,mix,centers,css:rgb=>'rgb('+rgb.map(v=>Math.round(255*encode(Math.max(0,Math.min(1,v))))).join(',')+')'};
M.register('rgb-lights','光的三原色：加色與減色比較','波動光學','rgb-lights',[
P('red','紅光線性強度',0,100,1,100,'%'),P('green','綠光線性強度',0,100,1,100,'%'),P('blue','藍光線性強度',0,100,1,100,'%'),P('cyan','青色濾片吸收率（紅通道）',0,100,1,100,'%'),P('magenta','洋紅濾片吸收率（綠通道）',0,100,1,100,'%'),P('yellow','黃色濾片吸收率（藍通道）',0,100,1,100,'%'),P('separation','三色圓心分離倍率',0,2,.05,1),P('radius','光斑／濾片半徑',.6,1.3,.05,1,'m')
],[metric('redLinear','紅光線性輸入',''),metric('greenLinear','綠光線性輸入',''),metric('blueLinear','藍光線性輸入','')],
'加色：I=I紅+I綠+I藍（線性光）；減色：T=(1−C,1−M,1−Y)，顯示前做sRGB編碼',
'左側黑屏為RGB線性光相加，右側白屏為理想CMY濾片疊放；青只吸收紅、洋紅只吸收綠、黃只吸收藍，因此三片完整重疊為黑。這是理想選擇性吸收的減色示意，並非真實顏料散射或顏料混合定量模型。六支拉桿為線性強度或吸收率百分比，50%線性光的sRGB顯示約188/255，不是128/255。光斑為平面圓形、邊緣理想銳利，忽略光束衰減與光譜；轉動3D視角只改觀察，不能改變疊色。時間8秒是讀值觀察，不代表光傳播；數據列為三支光的線性輸入；只有在三圓共同覆蓋區才同時收到三支光，分離過大時不存在共同覆蓋區。',
['為何紅加綠是黃，而青加洋紅卻是藍？','把各光強都設50%，共同交疊處的顯示值會是128還是188？'],p=>{
const masks=(u,v)=>centers.map(c=>(u-c[0]*p.separation)**2+(v-c[1]*p.separation)**2<=p.radius**2),field=(u,v,sub)=>mix(p,masks(u,v),sub);
return trajectory(8,()=>({redLinear:p.red/100,greenLinear:p.green/100,blueLinear:p.blue/100,cyanTransmission:1-p.cyan/100,magentaTransmission:1-p.magenta/100,yellowTransmission:1-p.yellow/100}),{schematic:true,hidePrimary:true,hideGrid:()=>true,hideFloor:true,field,masks,bounds:{min:[-5.2,0,-.5],max:[5.2,6,.5]},endLabel:'靜態疊色觀察結束',scaleNote:'左右皆為3D空間中的平面示意屏；RGB顯示採線性光相加後sRGB編碼。'});
},'models/rgb-lights.js');M.defs.find(d=>d.id==='rgb-lights').initialView={yaw:0,pitch:.06};
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
