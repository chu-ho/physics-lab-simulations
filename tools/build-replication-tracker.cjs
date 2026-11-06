'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../research/haha90-audit'),audit=require('../research/haha90-audit/results.json'),file=path.join(dir,'implementation-plan.json');
const prior=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{items:[]},old=new Map(prior.items.map(x=>[x.id,x]));
const related={'005':['inclined-projectile'],'008':['spring','circular'],'010':['spring'],'012':['drag'],'016':['atwood','massive-pulley'],'018':['banked'],'021':['center-of-mass'],'022':['conical'],'023':['vertical-circle'],'029':['collision'],'030':['collision-2d'],'031':['orbit'],'035':['center-of-mass'],'039':['damped'],'040':['driven'],'110':['rolling']};
const items=audit.map(r=>old.get('site-'+r.id)||({id:'site-'+r.id,sourceId:r.id,title:r.title,category:r.category,sourceUrl:r.url,sourceScreenshot:r.screenshot,sourceFormat:r.status,sourceDescription:r.text,relatedModelIds:related[r.id]||[],status:'planned',modelIds:[],requirements:['依原站畫面及說明逐項建立功能對照','以本專案架構實作實際模型與對應互動','原站參數、顯示模式與教學概念均需對照，不能只比名稱','物理／邊界／操作驗證與可用入口'],evidence:[],nextAction:'讀取此項原站截圖及說明，列出功能差異與可驗證規格'}));
const user=[
 {id:'user-mass',title:'考慮滑輪或彈簧質量的運動學',category:'使用者新增',requirements:['有質量滑輪的轉動慣量及兩側不同張力','有質量彈簧的分布慣性、波形及振動週期','與忽略質量的模型比較'],relatedModelIds:['massive-pulley'],modelIds:[],status:'planned',evidence:[],nextAction:'保留既有有慣量滑輪，加入分布質量彈簧模型'},
 {id:'user-double-slit',title:'可調尺寸與屏距的雙狹縫干涉',category:'使用者新增',requirements:['螢幕與狹縫距離可調','狹縫寬度、長度與縫距可調','波長可調','二維干涉／繞射光強與橫截面圖','物理尺寸及示意放大比例清楚；近似條件明示'],relatedSourceIds:['085','086','087'],modelIds:[],status:'planned',evidence:[],nextAction:'實作有限矩形雙縫的遠場模型與二維屏幕'},
 {id:'user-bicycle',title:'腳踏車輪子的摩擦力方向',category:'使用者新增',requirements:['前後輪分別顯示摩擦力及方向','可調驅動、前輪煞車、後輪煞車','滑行時無理想靜摩擦的情境','轉動慣量、平動與純滾動約束一致','停止及純滾動適用條件明示'],relatedSourceIds:['018','110','111'],modelIds:[],status:'planned',evidence:[],nextAction:'建立前後輪力矩與全車平動的聯立模型'}
];
user.push(...[
  {
    "id": "user-violin-fourier",
    "title": "小提琴聲的傅立葉分析與合成",
    "relatedModelIds": [
      "sound-elements"
    ],
    "requirements": [
      "分析小提琴聲，顯示各頻率分量及其振幅",
      "可觀察個別分量波形與逐項疊加後的合成波形",
      "明確區分實際錄音分析與示意泛音合成；使用音源及分析窗需可追溯"
    ],
    "nextAction": "確認小提琴音源與分析方式，重用既有聲音波形、頻譜及合成能力，補上分析與分量疊加介面",
    "category": "使用者新增",
    "modelIds": [],
    "status": "planned",
    "evidence": [],
    "existingComparison": {
      "level": "related",
      "modelIds": [
        "sound-elements"
      ],
      "covered": "已有相關模型可重用；尚未實作此題要求的專用比較或分析。",
      "remaining": "確認小提琴音源與分析方式，重用既有聲音波形、頻譜及合成能力，補上分析與分量疊加介面",
      "basis": [
        "目前註冊模型與使用者新增需求"
      ]
    },
    "implementationAction": "擴充相關能力並建立專用教學情境"
  },
  {
    "id": "user-floating-block-shm",
    "title": "方塊入水與浮力簡諧振盪",
    "relatedModelIds": [
      "spring",
      "vertical-spring"
    ],
    "requirements": [
      "呈現方塊落入水中及上下振盪的3D過程",
      "標示平衡位置、相對平衡的位移與重力、浮力及合力",
      "在部分浸沒且截面固定的適用區間，呈現恢復力與位移成正比且方向相反",
      "區分簡諧區間與完全浸沒、離水及阻尼等非簡諧情況，明示理想化假設"
    ],
    "nextAction": "建立浮力隨浸沒深度的分段模型，對照平衡附近的線性恢復力與簡諧運動",
    "category": "使用者新增",
    "modelIds": [],
    "status": "planned",
    "evidence": [],
    "existingComparison": {
      "level": "related",
      "modelIds": [
        "spring",
        "vertical-spring"
      ],
      "covered": "已有相關模型可重用；尚未實作此題要求的專用比較或分析。",
      "remaining": "建立浮力隨浸沒深度的分段模型，對照平衡附近的線性恢復力與簡諧運動",
      "basis": [
        "目前註冊模型與使用者新增需求"
      ]
    },
    "implementationAction": "擴充相關能力並建立專用教學情境"
  },
  {
    "id": "user-pendulum-angle-comparison",
    "title": "小角度單擺與大角度單擺比較",
    "relatedModelIds": [
      "pendulum"
    ],
    "requirements": [
      "並排比較小角度近似與大角度單擺的運動及週期",
      "可調擺長及初始角度，顯示近似週期與非線性週期及其差異",
      "說明大角度需保留sinθ非線性，可用橢圓積分或級數修正週期",
      "以相同初始條件比較線性近似與完整模型，呈現角度增加造成的誤差"
    ],
    "nextAction": "核對既有pendulum功能，擴充同步對照、週期修正與誤差呈現",
    "category": "使用者新增",
    "modelIds": [],
    "status": "planned",
    "evidence": [],
    "existingComparison": {
      "level": "related",
      "modelIds": [
        "pendulum"
      ],
      "covered": "已有相關模型可重用；尚未實作此題要求的專用比較或分析。",
      "remaining": "核對既有pendulum功能，擴充同步對照、週期修正與誤差呈現",
      "basis": [
        "目前註冊模型與使用者新增需求"
      ]
    },
    "implementationAction": "擴充相關能力並建立專用教學情境"
  }
]);
user.push(...[["user-celestial-sphere","天球模型"],["user-sun-earth","日地運動"],["user-moon-earth","月地運動"],["user-sun-earth-moon","日地月模型與日蝕月蝕"]].map(([id,title])=>({id,title,category:'使用者新增',requirements:['沿用共用3D/UI，提供可調參數與時間控制','幾何假設與尺度放大明示'],modelIds:[],status:'planned',evidence:[],nextAction:'建立專用天文模擬'})));
for(const u of user)items.push(old.get(u.id)||u);
const plan={...prior,objective:'逐一重建原站全部116個不重複動畫，並加入使用者新增'+user.length+'個方向；依既有架構、語言、規範與UI設計實作。',sourceCount:116,userRequestCount:user.length,completionRule:'只有功能對照、模型、互動、驗證與入口都具備才可標完成；既有相近題目不能自動算完成。',items};
const localModelCount=require('../mechanics-models.js').defs.length;plan.existingReview={...(plan.existingReview||{}),scope:'本地'+localModelCount+'個共用模型與3個獨立拋體頁面；數量依目前註冊模型產生。逐題功能對照、完成證據與未完成差異保存在各項existingComparison，不以相近題名當成已完成。'};
fs.writeFileSync(file,JSON.stringify(plan,null,2));
const rows=items.map(i=>`| ${i.id} | ${i.category} | ${i.sourceUrl?'['+i.title+']('+i.sourceUrl+')':i.title} | ${i.status} | ${(i.modelIds||[]).join('、')||'—'} |`).join('\n');
fs.writeFileSync(path.join(dir,'IMPLEMENTATION.md'),'# 全站重建追蹤\n\n'+plan.objective+'\n\n'+plan.completionRule+'\n\n狀態：planned 待規格／實作；in-progress 製作中；implemented 已有實作但未完整驗收；complete 驗收完成。\n\n| ID | 分類 | 題目 | 狀態 | 本專案模型 ID |\n|---|---|---|---|---|\n'+rows+'\n\n機器可讀的需求、證據與下一步見 [implementation-plan.json](implementation-plan.json)。\n');
require('./render-replication-comparison.cjs');
console.log('Wrote '+audit.length+' source topics and '+user.length+' user requests; existing progress preserved.');
