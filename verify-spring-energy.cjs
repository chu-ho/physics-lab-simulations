'use strict';
const assert=require('node:assert/strict'),M=require('./mechanics-models.js'),d=M.defs.find(d=>d.id==='spring');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const m of [.5,2,10])for(const k of [1,8,30])for(const A of [.1,1.5,3]){
 const sim=d.build({m,k,A}),plot=sim.positionPlot,value=(key,x)=>plot.series.find(s=>s.key===key).value(x),E=.5*k*A*A;
 near(plot.min,-A);near(plot.max,A);near(value('K',0),E);near(value('U',0),0);near(value('K',A),0);near(value('U',-A),E);
 for(const q of [-A/Math.sqrt(2),A/Math.sqrt(2)])near(value('K',q),value('U',q));
 for(let i=0;i<=100;i++){const s=sim.sample(sim.duration*i/100);near(value('K',s.q),s.K);near(value('U',s.q),s.U);near(value('E',s.q),s.E);near(value('K',s.q)+value('U',s.q),E);}
}
console.log('PASS: spring position-energy curves, equipartition positions, extrema and synchronized physical states in 27 configurations.');
