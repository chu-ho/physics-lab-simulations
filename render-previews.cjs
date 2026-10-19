// Offline raster previews of the drawing code, not browser screenshots.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let createCanvas;try{({createCanvas}=require('@napi-rs/canvas'))}catch{({createCanvas}=require(path.resolve(path.dirname(process.execPath),'../node_modules/@napi-rs/canvas')))}
const {domHarness}=require('./verify-mechanics.cjs');
const {defs}=require('./mechanics-models.js');
const html=fs.readFileSync('mechanics.html','utf8'),{sandbox,ids}=domHarness(html,1000,700),scene=createCanvas(1000,700),plot=createCanvas(240,118);
ids.scene.getContext=()=>scene.getContext('2d');ids.plot.getContext=()=>plot.getContext('2d');
for(const m of html.matchAll(/<script src="([^"]+)"/g))vm.runInContext(fs.readFileSync(m[1],'utf8'),sandbox,{filename:m[1]});
fs.mkdirSync('artifacts',{recursive:true});
for(let batch=0;batch<Math.ceil(defs.length/9);batch++){
 const sheet=createCanvas(1350,1050),c=sheet.getContext('2d');c.fillStyle='#101c25';c.fillRect(0,0,1350,1050);
 for(let j=0;j<9;j++){const d=defs[batch*9+j];if(!d)break;vm.runInContext(`selectExperiment('${d.id}',false);t=simulation.duration*.35;updateUI();$('forces').checked=true;render();`,sandbox);const x=j%3*450,y=Math.floor(j/3)*350;c.drawImage(scene,x+6,y+30,438,307);c.fillStyle='#ecf2f4';c.font='15px "Microsoft JhengHei", sans-serif';c.fillText(String(batch*9+j+1).padStart(2,'0')+' '+d.title,x+12,y+21);}
 fs.writeFileSync(`artifacts/scenes-${batch+1}.png`,sheet.toBuffer('image/png'));
}
if(defs.some(d=>d.id==='bungee')){vm.runInContext("selectExperiment('bungee',false);t=Math.sqrt(2*params.L/params.g)+1;updateUI();$('forces').checked=true;render();",sandbox);fs.writeFileSync('artifacts/bungee.png',scene.toBuffer('image/png'))}
console.log('Saved '+Math.ceil(defs.length/9)+' offline scene contact sheets to artifacts/.');
