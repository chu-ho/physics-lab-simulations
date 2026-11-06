'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js');require('./models/block-stack.js');const d=M.defs.find(x=>x.id==='block-stack'),near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);let count=0;
for(const n of[2,4,7,10])for(const L of[1,2,4])for(const spread of[0,.65,1])for(const layer of[1,Math.ceil(n/2),n])for(const push of[-1,.5,1]){
 const p={...M.defaults(d),n,L,spread,layer,push},sim=d.build(p);for(const f of[0,.2,.7,1]){const s=sim.sample(sim.duration*f);near(s.maxOverhang,L/2*Array.from({length:n},(_,i)=>1/(i+1)).reduce((a,b)=>a+b,0));for(let j=1;j<=n;j++){const q=s.interfaces[j-1],com=s.centers.slice(0,j).reduce((a,b)=>a+b,0)/j;near(q.com,com);near(q.margin,Math.min(com-q.left,q.right-com));assert.ok(q.margin>=-1e-8)}near(s.travel,push*L*sim.duration*f/8)}
 if(sim.criticalLayer){near(sim.sample(sim.duration).margin,0);const delta=push*L*(sim.criticalFraction+1e-5),after=sim.initial.map((x,i)=>x+(i===layer-1?delta:0));assert.ok(sim.inspect(after).some(q=>q.margin<0))}count++;
}
// Independent contact COM check, optimal harmonic construction and translation symmetry away from table.
for(let n=2;n<=10;n++){const p={...M.defaults(d),n,spread:1,push:0},sim=d.build(p),s=sim.sample(0);near(s.overhang,sim.maxOverhang);for(let j=1;j<n;j++)near(s.interfaces[j-1].com,s.centers[j]+p.L/2);const shifted=sim.inspect(s.centers.map(x=>x+3));for(let j=0;j<n-1;j++){near(shifted[j].com,s.interfaces[j].com+3);near(shifted[j].margin,s.interfaces[j].margin)}}
// Aligned two blocks: pushing top right reaches precisely L/2; bottom-to-table reaches L/2 too.
for(const layer of[1,2]){const sim=d.build({...M.defaults(d),n:2,spread:0,layer,push:1});near(sim.criticalFraction,.5)}
const invalid=d.build({...M.defaults(d),n:2,spread:1,offset1:.5});assert.equal(invalid.duration,0);assert.equal(invalid.sample(0).invalid,1);
console.log('PASS: block-stack '+count+' configurations; contact COM, harmonic optimum, first critical distance, translation invariance and invalid start.');
