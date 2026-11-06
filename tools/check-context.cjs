#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),routes=require('../docs/routes.json'),{defs}=require('../mechanics-models.js');
const read=file=>fs.readFileSync(path.join(root,file),'utf8'),exists=file=>fs.existsSync(path.join(root,file));
const docs=['AGENTS.md','README.md','CURRICULUM.md','QA.md','docs/ARCHITECTURE.md','docs/PHYSICS.md','docs/WORKFLOWS.md','docs/plans/INDEX.md','docs/plans/TEMPLATE.md'];
let references=0;
for(const file of docs){assert.ok(exists(file),'missing '+file);for(const m of read(file).matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){const target=m[1].replace(/^<|>$/g,'');if(/^(https?:|#)/.test(target))continue;const resolved=path.resolve(root,path.dirname(file),target.split(/[?#]/)[0]);assert.ok(fs.existsSync(resolved),`${file}: broken link ${target}`);references++}}
for(const [key,t]of Object.entries(routes.tasks)){assert.ok(t.purpose&&Array.isArray(t.sources)&&Array.isArray(t.read)&&Array.isArray(t.checks),key+' malformed');for(const file of [...t.sources,...t.read])assert.ok(exists(file),key+' missing '+file);for(const symbol of t.symbols)assert.ok(t.sources.some(f=>read(f).includes(symbol)),key+' stale symbol '+symbol)}
for(const [alias,target]of Object.entries(routes.aliases))assert.ok(routes.tasks[target]||defs.some(d=>d.id===target),alias+' unknown alias target');
assert.equal(new Set(defs.map(d=>d.id)).size,defs.length,'duplicate experiment IDs');
for(const d of defs){assert.ok([`add('${d.id}'`,`M.register('${d.id}'`].some(anchor=>read(d.source||'mechanics-models.js').includes(anchor)),d.id+' missing model anchor');assert.ok(read('assets/mechanics-scenes.js').includes(`case '${d.kind}':`),d.id+' missing scene');}
for(const [id,files]of Object.entries(routes.modelDependencies||{})){const d=defs.find(d=>d.id===id);assert.ok(d,id+' unknown dependency route');for(const file of files){assert.ok(exists(file),file+' missing model dependency');for(const html of ['mechanics.html','library.html'])assert.ok(read(html).indexOf('src="'+file+'"')>=0&&read(html).indexOf('src="'+file+'"')<read(html).indexOf('src="'+d.source+'"'),html+' dependency load order '+id);}}
for(const d of routes.legacy){assert.ok(exists(d.entry),d.id+' entry missing');assert.ok(routes.tasks[d.task],d.id+' task missing')}
for(const [id,file]of Object.entries(routes.entryOverrides)){assert.ok(defs.some(d=>d.id===id),id+' unknown override');assert.ok(exists(file),file+' missing');assert.ok(read(file).includes('experiment='+id),file+' wrong redirect')}
// Exercise real CLI output, including a shared kind, legacy, Chinese alias,
// task route, and invocation from a directory outside the repo.
for(const args of [['--list'],['bungee'],['damped'],['basic-waves'],['階梯'],['--task','chart'],['--task','long-plan']]){const result=spawnSync(process.execPath,[path.join(__dirname,'context.cjs'),...args],{cwd:path.dirname(root),encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.ok(result.stdout.length>30)}
const unknown=spawnSync(process.execPath,[path.join(__dirname,'context.cjs'),'not-a-real-task'],{encoding:'utf8'});assert.equal(unknown.status,1);
console.log(`PASS: ${docs.length} documents, ${references} local links, ${Object.keys(routes.tasks).length} task routes, ${defs.length} model/scene mappings, entry redirects and CLI routing.`);
