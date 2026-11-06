#!/usr/bin/env node
'use strict';
// Small, read-only context router. Resolve paths relative to this repository,
// not the caller's working directory. No shell commands or tests are executed.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),routes=require('../docs/routes.json'),{defs}=require('../mechanics-models.js');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const lines=file=>read(file).split(/\r?\n/);
function hits(file,symbol){return lines(file).flatMap((s,i)=>s.includes(symbol)?[i+1]:[])}
function block(file,start,end){const text=lines(file),a=text.findIndex(s=>s.includes(start));if(a<0)return null;let b=a+1;while(b<text.length&&!end(text[b]))b++;return `${file}:${a+1}-${b}`}
function list(){console.log('Tasks:');for(const [key,t]of Object.entries(routes.tasks))console.log(`  ${key.padEnd(20)} ${t.purpose}`);console.log('\nExperiments (IDs → model/scene routes):');for(const d of defs)console.log(`  ${d.id.padEnd(22)} ${d.title} [${d.kind}]`);console.log('\nLegacy: '+routes.legacy.map(d=>d.id).join(', '));console.log('Usage: node tools/context.cjs bungee | --task chart | pendulum')}
const args=process.argv.slice(2);if(!args.length||args.includes('--list')||args.includes('--help')){list();process.exit(0)}
const explicit=args[0]==='--task',requested=explicit?args[1]:args[0],key=routes.aliases[requested]||requested;
const experiment=explicit?null:defs.find(d=>d.id===key||d.title===requested),legacy=routes.legacy.find(d=>d.id===key||d.title===requested);
let taskKey=explicit?key:experiment?(routes.tasks[experiment.id]?experiment.id:null):legacy?legacy.task:key;
const task=taskKey?routes.tasks[taskKey]:null;
if(!task&&!experiment){console.error('Unknown task or experiment: '+requested+'\nUse --list to see available routes.');process.exit(1)}
console.log('Project: '+root+'\nTask: '+(experiment?`${experiment.title} (${experiment.id})`:task.purpose));
if(experiment){console.log('Entry: '+(routes.entryOverrides[experiment.id]||'mechanics.html?experiment='+experiment.id));console.log('Model: '+block(experiment.source||'mechanics-models.js',(read(experiment.source||'mechanics-models.js').includes("M.register('"+experiment.id+"'")?"M.register('"+experiment.id+"'":"add('"+experiment.id+"'"),s=>/^add\('|^const api=/.test(s)));console.log('Scene: '+block('assets/mechanics-scenes.js',`case '${experiment.kind}':`,s=>/^ case '/.test(s)));console.log('Contract: docs/PHYSICS.md');}
const sourceFiles=task?task.sources:[experiment?.source||'mechanics-models.js','assets/mechanics-scenes.js','assets/mechanics-app.js',...(routes.modelDependencies?.[experiment?.id]||[]),...(routes.sceneExtensions?.[experiment?.id]?[routes.sceneExtensions[experiment.id]]:[]),...(routes.modelVerifiers?.[experiment?.id]?[routes.modelVerifiers[experiment.id]]:[]),'verify-mechanics.cjs'];
console.log('\nRead only as needed:');for(const file of [...new Set([...(task?.read||[]),...sourceFiles])])console.log('  '+file);
if(task?.symbols.length){console.log('\nDynamic symbol locations (first 3 hits per file):');for(const symbol of task.symbols)for(const file of sourceFiles){const found=hits(file,symbol).slice(0,3);if(found.length)console.log(`  ${file}:${found.join(',')}  ${symbol}`)}}
if(experiment){console.log('\nRelated test locations:');const found=hits('verify-mechanics.cjs',experiment.id);console.log(found.length?'  verify-mechanics.cjs:'+found.join(','):'  verify-mechanics.cjs: generic parameter/control checks; add independent physical assertions when modifying the model.');}
console.log('\nChecks (run after relevant edits, not automatically):');for(const cmd of task?.checks||['node verify-mechanics.cjs'])console.log('  '+cmd);
console.log('\nSkip by default: '+routes.excludeByDefault.join(', '));
