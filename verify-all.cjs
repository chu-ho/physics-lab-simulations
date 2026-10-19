'use strict';
const {spawnSync}=require('node:child_process');
// The projectile verifier imports the mechanics verifier, so each runs once.
for(const file of ['verify-projectile.cjs','verify-stairs.cjs','verify-incline.cjs']){
 const result=spawnSync(process.execPath,[file],{cwd:__dirname,stdio:'inherit'});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);
}
console.log('PASS: complete '+(require('./mechanics-models.js').defs.length+3)+'-experiment verification suite.');
