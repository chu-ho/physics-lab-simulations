'use strict';
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../research/haha90-audit'),plan=JSON.parse(fs.readFileSync(path.join(dir,'implementation-plan.json'),'utf8'));
if(!plan.existingReview)return;
const M=require('../mechanics-models.js'),routes=require('../docs/routes.json'),items=plan.items;
const allModels=[...routes.legacy,...M.defs.map(d=>({id:d.id,title:d.title,source:d.source,entry:routes.entryOverrides[d.id]||'mechanics.html?experiment='+d.id}))];
const labels={core:'核心已做出',partial:'部分涵蓋',related:'僅相關模型',none:'未找到對應'};
const escape=s=>String(s||'—').replaceAll('|','\\|').replaceAll('\n',' ');
function modelLink(id){const d=allModels.find(d=>d.id===id);if(!d)throw Error('Unknown comparison model '+id);return `[${d.title}](../../${d.entry})`;}
const counts=Object.fromEntries(Object.keys(labels).map(k=>[k,items.filter(i=>i.sourceId&&i.existingComparison?.level===k).length]));
const rows=items.map(i=>{const c=i.existingComparison;return `| ${i.id} | ${i.category} | ${i.sourceUrl?'['+i.title+']('+i.sourceUrl+')':i.title} | ${i.status} | ${c?labels[c.level]:'未比對'} | ${(c?.modelIds||i.modelIds||[]).map(modelLink).join('、')||'—'} | ${escape(c?.covered)} | ${escape(c?.remaining||i.nextAction)} |`;}).join('\n');
const inventory=allModels.map(d=>{const refs=items.filter(i=>i.existingComparison?.modelIds.includes(d.id));return `| ${modelLink(d.id)} | [${d.source||d.entry}](../../${d.source||d.entry}) | ${refs.map(i=>i.id+'（'+labels[i.existingComparison.level]+'）').join('、')||'目前清單無直接對應題目；保留為專案既有實驗'} |`;}).join('\n');
const text=`# 全站重建追蹤

${plan.objective}

${plan.completionRule}

## 現有檔案比對（${plan.existingReview.date}）

${plan.existingReview.scope}

原站 116 題：**${counts.core} 題核心已做出、${counts.partial} 題部分涵蓋、${counts.related} 題僅相關模型、${counts.none} 題未找到對應**。使用者新增 ${plan.userRequestCount} 個方向另外計算，其中 ${items.filter(i=>!i.sourceId&&i.existingComparison?.level==='core').length} 個已有核心實作；其餘仍待製作。

後續工作分流：${counts.core} 題沿用核心並核對差異；${counts.partial} 題擴充現有功能；${counts.related+counts.none} 題需新增專用題型，其中 ${counts.related} 題可重用相關能力。

${plan.existingReview.rule}

重建狀態：planned 待規格／實作；in-progress 製作中；implemented 已有核心實作但未完整驗收；complete 驗收完成。涵蓋程度另列；部分涵蓋不表示已開始專用重建，也不計為完整實作。

共用模型位於 mechanics.html，可從連結或總覽選單開啟，不是每個模型都有獨立 HTML。部分／相關列中的模型連結是參考入口。

## 逐題比對

| ID | 分類 | 題目 | 重建狀態 | 現有涵蓋 | 現有模型／入口 | 已有內容 | 差異／下一步 |
|---|---|---|---|---|---|---|---|
${rows}

## 目前專案全部 ${allModels.length} 個實驗的反向索引

| 本地實驗入口 | 程式來源 | 對應追蹤項目與涵蓋程度 |
|---|---|---|
${inventory}

機器可讀的需求、證據與下一步見 [implementation-plan.json](implementation-plan.json)。原站說明及截圖見 [index.html](index.html)。先更新 JSON 的 existingComparison 欄位，再執行 node tools/build-replication-tracker.cjs 產生本表。
`;
fs.writeFileSync(path.join(dir,'IMPLEMENTATION.md'),text);
console.log('Existing source coverage: '+JSON.stringify(counts)+'; local inventory: '+allModels.length);
