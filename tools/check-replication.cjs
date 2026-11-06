'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'research/haha90-audit');
const audit=JSON.parse(fs.readFileSync(path.join(dir,'results.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(dir,'implementation-plan.json'),'utf8'));
const models=new Set(require('../mechanics-models.js').defs.map(d=>d.id));
const unique=new Set(plan.items.map(i=>i.id));
assert.equal(audit.length,116);assert.equal(plan.userRequestCount,plan.items.filter(x=>!x.sourceId).length);assert.equal(plan.items.length,116+plan.userRequestCount);assert.equal(unique.size,plan.items.length);
for(const id of ['user-violin-fourier','user-floating-block-shm','user-pendulum-angle-comparison','user-celestial-sphere','user-sun-earth','user-moon-earth','user-sun-earth-moon'])assert.ok(unique.has(id),`Missing user topic ${id}`);
for(const r of audit){
 const item=plan.items.find(i=>i.id==='site-'+r.id);assert.ok(item,`Missing source ${r.id}`);
 assert.equal(item.sourceUrl,r.url);assert.ok(fs.existsSync(path.resolve(dir,r.screenshot)),`Missing screenshot ${r.id}`);
}
for(const item of plan.items){
 assert.ok(['planned','in-progress','implemented','complete'].includes(item.status));
 assert.ok(item.nextAction&&item.requirements.length,`Missing continuation ${item.id}`);
 for(const id of item.modelIds||[])assert.ok(models.has(id)||['index','staircase-projectile','inclined-projectile'].includes(id),`Unknown model ${id}`);
 if(['implemented','complete'].includes(item.status))assert.ok(item.evidence.length&&item.modelIds.length,`Missing evidence ${item.id}`);
 if(plan.existingReview){
  const c=item.existingComparison;
  assert.ok(c&&['core','partial','related','none'].includes(c.level),`Missing comparison ${item.id}`);
  assert.ok(c.covered&&c.remaining&&c.basis.length,`Missing comparison basis ${item.id}`);
  for(const id of c.modelIds)assert.ok(models.has(id)||['projectile','stairs','inclined-projectile'].includes(id),`Unknown comparison model ${id}`);
  assert.equal(c.modelIds.length===0,c.level==='none',`Comparison coverage mismatch ${item.id}`);
 }
}
if(plan.existingReview){
 const text=fs.readFileSync(path.join(dir,'IMPLEMENTATION.md'),'utf8');
 for(const link of text.matchAll(/\]\(([^)]+)\)/g)){
  if(/^https?:/.test(link[1]))continue;
  assert.ok(fs.existsSync(path.resolve(dir,link[1].split(/[?#]/)[0])),`Missing comparison link ${link[1]}`);
 }
 assert.ok(text.includes('全部 '+(models.size+3)+' 個實驗的反向索引'));
}
console.log('PASS: all 116 source topics, screenshots, '+plan.userRequestCount+' user directions, progress evidence and model references.');
