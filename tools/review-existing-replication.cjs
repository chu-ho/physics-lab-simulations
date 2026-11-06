'use strict';
// 本次人工比對紀錄。僅在初次或明確更新審查時執行；一般產表使用 build-replication-tracker。
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../research/haha90-audit'),file=path.join(dir,'implementation-plan.json');
const plan=JSON.parse(fs.readFileSync(file,'utf8'));
// 等級指現有程式的涵蓋程度，與原站逐項驗收狀態分開。
const review={
 '005':['core',['inclined-projectile'],'斜面角、相對坡面發射角、初速、方位角、落點與離面高度已有實作。','原站的輔助分解／顯示模式仍須逐項驗收；不能視為畫面功能完全一致。'],
 '010':['core',['spring'],'水平無阻尼彈簧解析解，state 提供 K、U、E；可用下方圖表比較能量。','原站以位置為橫軸的能量曲線及同步位置指示尚未重建；現有圖表以時間為橫軸。'],
 '012':['core',['drag'],'由靜止下落、線性阻力 bv、可調質量／阻力係數／重力，含終端速率與速度圖。','原站角色、釋放及圖形呈現不同；物理核心已具備，完整操作對照尚待驗收。'],
 '116':['core',['massive-spring'],'彈簧總質量、端點質量、剛度可調；12 段分布慣性、節點形變、最低模態與 mₛ/3 近似比較已有實作。','原站截圖的週期計算圖與參數範圍未逐項重現；採離散分布模型，尚待原站公式對照。'],
 '007':['partial',['projectile','inclined-projectile'],'可調初速、仰角、高度及斜面角，已有射程讀值，可逐次尋找最大射程。','缺最佳角自動求解、不同角度的同步軌跡比較。'],
 '008':['partial',['circular','spring'],'等速圓周與簡諧運動各自已有實際模型。','缺同一畫面的直徑投影、相位連動及投影線；兩個獨立模型不等於完成本題。'],
 '016':['partial',['atwood','massive-pulley'],'固定軸阿特伍機與有慣量滑輪均已有質量、加速度和張力模型。','原站為「會動的阿特伍機」；現有滑輪支點固定，缺移動支點及其約束。'],
 '022':['partial',['conical'],'圓錐擺的位置、速度、張力及週期已有模型。','缺關於不同參考點的角動量向量、力矩與其時間變化。'],
 '023':['partial',['vertical-circle'],'已有鉛直圓環中的速度、能量及法向約束力。','現有雙面導軌允許負約束力；缺半圓終點、單面接觸脫離與後續拋體。'],
 '029':['partial',['collision'],'兩球一維碰撞、可調兩側質量／初速／恢復係數、碰撞前後動量及能量已有實作。','採瞬間衝量；原站圖中接觸彈簧的有限時間壓縮與速度過渡尚未實作。'],
 '030':['partial',['collision-2d'],'光滑球二維偏心碰撞與彈性極限已有實作。','初始第二球固定靜止、入射方向固定；原站其他初速／方向控制及摩擦擴充待核對。'],
 '031':['partial',['orbit'],'已有平方反比中心力、圓／橢圓／逃逸軌道及角動量、能量。','缺重力距離指數 N 拉桿與非平方反比軌道，本題主要比較尚未完成。'],
 '039':['partial',['damped'],'線性阻尼彈簧的欠阻尼、臨界、過阻尼及能量耗散已有模型。','原站畫面使用擺動裝置；缺對應擺動幾何、阻尼方程及其控制核對。'],
 '040':['partial',['driven'],'單一受迫阻尼振子、頻率／阻尼／驅動振幅可調，含暫態及共振。','缺原站多個不同自然頻率的振子同步驅動、共振幅度並排比較。'],
 '085':['partial',['double-slit'],'已有有限矩形雙縫、可調波長／縫長寬／間距／屏距、二維條紋與光強曲線。','缺狹縫／雷射旋轉與狹縫填入介質後的相位差。'],
 '086':['partial',['double-slit'],'已有雙縫有限孔徑的二維干涉／繞射光強與橫截面。','目前限定兩個矩形孔；原站單孔、多孔或孔形選擇等控制仍須核對及補齊。'],
 '087':['partial',['double-slit'],'已有解析光強公式、強度橫截面、干涉及繞射零點驗證。','缺原站波振幅疊加與強度生成的過程展示／顯示模式對照。'],
 '111':['partial',['rolling','bicycle-friction'],'已有 v=Rω 的輪子平動、自轉、轉動慣量及摩擦力；腳踏車可設定等速滑行。','缺原站單輪指定點與軌跡的獨立觀察；2008 題目對應控制仍待確認。'],
 '003':['related',['river','pursuit'],'有相對速度與兩物體位置模型。','原站紅藍球及移動參考系未實作；渡河／直線追及僅能參考。'],
 '009':['related',['spring','bungee'],'已有水平彈簧及重力下單向彈性繩。','缺鉛直雙向彈簧、重力位能與平移後等效彈性位能；高空彈跳不能替代。'],
 '013':['related',['incline'],'已有斜面滑動與靜／動摩擦。','缺有限尺寸木塊、質心／支承面與翻倒臨界條件。'],
 '018':['related',['banked','bicycle-friction'],'已有無摩擦傾斜彎道及直線腳踏車輪受力。','缺人車過彎、傾身、側向摩擦極限與摔車；現有腳踏車明確不模擬翻車。'],
 '021':['related',['center-of-mass'],'已有兩物體內力與質心守恆。','原站人走船退的相對位移與人物／船裝置未實作；彈簧雙物塊不等價。'],
 '025':['related',['rolling','torque'],'已有純滾動及固定軸力矩的工具模型。','缺內外半徑線軸、拉線角度與左右滾動臨界角。'],
 '035':['related',['center-of-mass'],'已有兩物塊由內部彈簧連接的運動。','原站含牆端彈簧；現有自由雙體只有一根內部彈簧，邊界條件與模態不同。'],
 '041':['related',['center-of-mass','massive-spring'],'已有雙體相對振動及分布彈簧模態。','缺原站耦合裝置、獨立初始條件與能量交換觀察；不能用一般模態分析算本題完成。'],
 '044':['related',['stairs'],'已有階梯碰撞、反彈及接觸紀錄。','原站是桌下粗糙超彈性球，需平動自轉耦合及上下表面碰撞；階梯球不能替代。'],
 '058':['related',['double-slit'],'已有同相波干涉的光強計算。','缺空間雙點波源、隨時間傳播的波面、節線腹線；孔徑遠場屏幕不同。'],
 '088':['related',['double-slit'],'已有固定朝向雙狹縫的場景及光強。','缺轉動狹縫、雷射、屏幕及相應幾何光程。'],
 '089':['related',['double-slit'],'已有兩縫干涉／繞射。','缺可調多縫數目的光柵模型及主極大寬度／級次。'],
 '094':['related',['pendulum'],'已有純重力非線性擺。','缺電荷、水平電場、電力與等效重力；現有擺不能替代電場單擺。'],
 '110':['related',['rolling','bicycle-friction'],'已有理想純滾動與輪子摩擦力方向。','現有模型不含滾動阻力／形變接觸力矩；不能回答無驅動輪胎自行減速的原站問題。'],
 '115':['related',['pursuit'],'已有同一直線上的追及／會車。','缺二維追逐的速度方向持續指向目標、互相追逐與追蹤曲線。']
};
for(const item of plan.items){
 if(item.existingComparison)continue;
 if(!item.sourceId){item.existingComparison={level:'core',modelIds:item.modelIds,covered:'使用者新增需求已有實際模型、操作與入口。',remaining:'保留原有 implemented 狀態，實際瀏覽器驗收尚待完成。',basis:['本地模型定義','verify-mechanics.cjs','獨立 HTML 入口']};continue;}
 const [level,modelIds,covered,remaining]=review[item.sourceId]||['none',[],'現有 38 個實驗中未找到對應的專用模型。','需建立本題專用模型、場景與操作；不能將來源截圖或紀錄頁當成模擬。'];
 item.existingComparison={level,modelIds,covered,remaining,basis:['results.json 中的原站說明',item.sourceScreenshot,'本地模型定義、場景分支與入口']};
 item.relatedModelIds=[...new Set([...(item.relatedModelIds||[]),...modelIds])];
 if(level==='core'&&item.status==='planned'){item.status='implemented';item.modelIds=modelIds;item.evidence.push('2026-10-20 現有程式比對：'+covered);}
 item.nextAction=remaining;
}
plan.existingReview??={date:'2026-10-20',scope:'本地 35 個共用模型及 3 個獨立拋體頁面；比對已保存的原站說明與截圖，未重新操作原站或本機瀏覽器。',rule:'core 表示核心題型已有實作，partial 表示部分功能，related 只有可參考模型，none 無專用模型；不等同原站功能全部驗收。'};
fs.writeFileSync(file,JSON.stringify(plan,null,2));
console.log('Recorded existing implementation comparison for all '+plan.items.length+' items.');
