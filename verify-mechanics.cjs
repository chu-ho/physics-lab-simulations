'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {defs,defaults}=require('./mechanics-models.js');
const byId=id=>defs.find(d=>d.id===id),build=(id,override={})=>{const d=byId(id),p={...defaults(d),...override};return {p,sim:d.build(p)}};
const near=(a,b,tol=1e-6,message='')=>assert.ok(Math.abs(a-b)<=tol,`${message}: ${a} vs ${b}`);
let configurations=0;let seed=12345;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
// Every slider endpoint, simultaneous extrema, and reproducible mixed settings.
for(const d of defs){
 for(const p of d.params){near((p.value-p.min)/p.step,Math.round((p.value-p.min)/p.step),1e-7,d.id+' slider default must match step');assert.ok(p.value>=p.min&&p.value<=p.max)}
 const base=defaults(d),cases=[base,Object.fromEntries(d.params.map(p=>[p.id,p.min])),Object.fromEntries(d.params.map(p=>[p.id,p.max]))];
 for(const p of d.params)for(const v of [p.min,p.max])cases.push({...base,[p.id]:v});
 for(let i=0;i<8;i++)cases.push(Object.fromEntries(d.params.map(p=>[p.id,p.min+Math.round(random()*(p.max-p.min)/p.step)*p.step])));
 for(const p of cases){const sim=d.build(p);assert.ok(Number.isFinite(sim.duration)&&sim.duration>=0&&sim.duration<=120,d.id+' duration');for(let i=0;i<=30;i++){const s=sim.sample(sim.duration*i/30);for(const key of ['x','y','z','vx','vy','vz','fx','fy','fz',...d.metrics.map(m=>m.key)])assert.ok(Number.isFinite(s[key]),d.id+' non-finite '+key+' '+JSON.stringify(p));}configurations++;}
}
// Independent reference cases and physical invariants.
{
 const {sim}=build('acceleration',{v:4,a:-2,T:5});near(sim.sample(2).vx,0);near(sim.sample(4).x,0);
 const {sim:fall}=build('vertical',{h:20,v:0,g:10});near(fall.duration,2);near(fall.sample(2).vy,-20);
 const {sim:up}=build('vertical',{h:0,v:10,g:10});near(up.duration,2);near(up.sample(1).y,5);
 const {sim:boat}=build('river',{v:5,u:3,angle:Math.asin(.6)*180/Math.PI,width:20});near(boat.duration,5);near(boat.sample(5).x,0);near(boat.sample(5).z,20);
 const {sim:cars}=build('pursuit',{v:5,v2:3,a:0,gap:10});near(cars.sample(5).gap,0);
 const {p,sim:drag}=build('drag');const tau=p.m/p.b;near(drag.sample(tau).down,p.m*p.g/p.b*(1-Math.exp(-1)));assert.ok(drag.sample(10).down<drag.sample(10).terminal);
 const {sim:stuck}=build('friction',{m:2,g:10,F:5,mu:.2,mus:.4});near(stuck.sample(6).x,0);near(stuck.sample(6).friction,-5);
 const {sim:slide}=build('friction',{m:2,g:10,F:10,mu:.2,mus:.4});near(slide.sample(1).ax,3);
 const {sim:flat}=build('incline',{angle:0,mu:0,mus:0});near(flat.sample(3).s,0);
 const {sim:incline}=build('incline',{angle:30,mu:0,mus:0,g:10});near(incline.sample(1).ax,5);near(incline.sample(incline.duration).s,12);
 const {sim:pulley}=build('atwood',{m1:2,m2:3,g:10});near(pulley.sample(1).a,2);near(pulley.sample(1).tension,24);near(pulley.sample(1).y+pulley.sample(1).y2,8);
 const {sim:table}=build('table-pulley',{m:2,m2:1,mu:0,g:10});near(table.sample(1).ax,10/3);near(table.sample(table.duration).s,5);
 const {sim:elev}=build('elevator',{m:2,g:5,a:-8});near(elev.sample(1).N,0);near(elev.sample(1).a,-5);
 for(const k of [0,.5,3]){const {sim}=build('work',{k});for(let i=0;i<10;i++)near(sim.sample(i/10*sim.duration).error,0,1e-7)}
 for(const id of ['energy-track','spring','rolling','pendulum','vertical-circle']){const {sim}=build(id),E0=sim.sample(0).E;for(let i=0;i<=100;i++)near(sim.sample(i/100*sim.duration).E,E0,Math.max(1e-4,Math.abs(E0)*2e-5),id+' energy')}
 for(const e of [0,.25,.75,1]){const {p,sim}=build('collision',{e}),s0=sim.sample(0),s1=sim.sample(sim.duration);near(s0.momentum,s1.momentum);near(s1.v2-s1.vx,e*(p.v-p.v2));near(s1.loss,.5*p.m1*p.m2/(p.m1+p.m2)*(1-e*e)*(p.v-p.v2)**2);}
 const {p:bp,sim:ballistic}=build('ballistic-pendulum'),hit=3/bp.v,V=bp.m*bp.v/(bp.m+bp.M);near(ballistic.sample(hit).vx,V,1e-6);near(ballistic.sample(hit).loss,.5*bp.m*bp.v**2-.5*(bp.m+bp.M)*V**2);
 const {p:rp,sim:rocket}=build('rocket');near(rocket.sample(rp.burn).vx,rp.ve*Math.log(1/(1-rp.fuel)));const dt=.0001,q=rocket.sample(2),vNum=(rocket.sample(2+dt).x-rocket.sample(2-dt).x)/(2*dt);near(q.vx,vNum,1e-6);
 const {p:cp,sim:circle}=build('circular');near(circle.sample(1).acc,cp.v**2/cp.R);near(Math.hypot(circle.sample(1).x,circle.sample(1).z),cp.R);
 const {p:bankp,sim:bank}=build('banked'),bank0=bank.sample(0);near(bank0.N*Math.cos(bankp.angle*Math.PI/180),bankp.m*bankp.g);near(bank0.N*Math.sin(bankp.angle*Math.PI/180),bankp.m*bank0.acc);
 const {p:conp,sim:cone}=build('conical');near(cone.sample(0).tension*Math.cos(conp.angle*Math.PI/180),conp.m*conp.g);
 const {p:tp,sim:torque}=build('torque');near(torque.sample(1).alpha,2*tp.F/(tp.m*tp.R));
 for(const e of [0,.5,1])for(const b of [0,.5,.9]){const {p,sim}=build('collision-2d',{e,b}),s0=sim.sample(0),s1=sim.sample(sim.duration);near(s1.px,s0.px);near(s1.pz,0);if(e===1){near(s1.K,s0.K);near(s1.vx*s1.vx2+s1.vz*s1.vz2,0,1e-7,'equal-mass elastic outgoing velocities perpendicular')}const nx=Math.sqrt(1-b*b),nz=-b;near((s1.vx2-s1.vx)*nx+(s1.vz2-s1.vz)*nz,e*p.v*nx)}
 const {sim:com,p:comP}=build('center-of-mass',{v:1.2});for(let i=0;i<=50;i++){const t=i/50*com.duration,s=com.sample(t);near((comP.m1*s.x+comP.m2*s.x2)/(comP.m1+comP.m2),s.com);near(s.com,comP.v*t);near(s.momentum,(comP.m1+comP.m2)*comP.v);near(s.E,com.sample(0).E)}
 const {sim:skater}=build('angular-momentum');for(let i=0;i<=50;i++){const s=skater.sample(i/50*skater.duration);near(s.inertia*s.omega,s.angular)}assert.ok(skater.sample(8).omega>skater.sample(0).omega);
 const {sim:heavy,p:heavyP}=build('massive-pulley');const hs=heavy.sample(1);near((hs.T2-hs.T1)*heavyP.R,.5*heavyP.mp*heavyP.R*heavyP.R*hs.a/heavyP.R);near(hs.T1-heavyP.m1*heavyP.g,heavyP.m1*hs.a);near(heavyP.m2*heavyP.g-hs.T2,heavyP.m2*hs.a);
 const {p:bpJump,sim:jump}=build('bungee'),taut=Math.sqrt(2*bpJump.L/bpJump.g),free=jump.sample(taut*.7);near(free.y,bpJump.h-.5*bpJump.g*(taut*.7)**2);near(free.tension,0);near(jump.sample(taut).vy,-bpJump.g*taut);assert.ok(Math.abs(jump.sample(taut+1e-6).vy-jump.sample(taut-1e-6).vy)<1e-4,'rope engagement must not instantaneously stop the jumper');
 const {p:idealP,sim:idealJump}=build('bungee',{h:140,c:0}),stretch=idealP.m*idealP.g/idealP.k+Math.sqrt((idealP.m*idealP.g/idealP.k)**2+2*idealP.m*idealP.g*idealP.L/idealP.k);let lo=taut+.01,hi=lo;while(idealJump.sample(hi).vy<0)hi+=.01;lo=hi-.01;for(let i=0;i<40;i++){const mid=(lo+hi)/2;if(idealJump.sample(mid).vy<0)lo=mid;else hi=mid}near(idealJump.sample((lo+hi)/2).y,idealP.h-idealP.L-stretch,1e-4,'bungee lowest point from energy conservation');
 let lastJumpEnergy=jump.sample(0).E;for(let i=0;i<=600;i++){const s=jump.sample(i/600*jump.duration),ideal=idealJump.sample(i/600*idealJump.duration);assert.ok(s.tension>=0&&s.y>=0);assert.ok(s.E<=lastJumpEnergy+.05,'bungee damping must dissipate energy');lastJumpEnergy=s.E;near(ideal.E,idealJump.sample(0).E,.1,'undamped bungee energy')}
 const {sim:groundJump}=build('bungee',{h:20,L:60});near(groundJump.duration,Math.sqrt(40/bpJump.g),1e-8);near(groundJump.sample(groundJump.duration).y,0,1e-8);near(groundJump.sample(groundJump.duration).tension,0);assert.ok(groundJump.endLabel.includes('地面'));
 for(const sim of [jump,idealJump,groundJump])for(const marker of sim.markers){const s=sim.sample(marker.t);near(s.y,marker.y,1e-7);assert.ok(marker.t>=0&&marker.t<=sim.duration);if(marker.key==='lowest'){near(s.vy,0,1e-6);assert.ok(sim.sample(marker.t-.001).vy<0&&sim.sample(marker.t+.001).vy>0)}if(marker.key==='balance')near(s.tension,bpJump.m*bpJump.g,.001);if(marker.key==='elastic')near(bpJump.k*s.extension,bpJump.m*bpJump.g,.001);if(marker.key==='rebound')near(s.vy,0,1e-6)}
 assert.ok(jump.markers.some(e=>e.key==='lowest')&&jump.markers.some(e=>e.key==='balance'));assert.ok(!groundJump.markers.some(e=>e.key==='lowest'));near(idealJump.elasticHeight,idealP.h-idealP.L-idealP.m*idealP.g/idealP.k);
 const {sim:lever}=build('lever',{m1:2,m2:3,L1:3,L2:2});near(lever.sample(0).net,0);
 const {sim:damped}=build('damped');let E=damped.sample(0).E;for(let i=1;i<=200;i++){const next=damped.sample(i/10).E;assert.ok(next<=E+1e-5);E=next}
 const {p:dp,sim:driven}=build('driven',{A:.1,c:2,w:2,F:3});const h=.001,ts=6,s=driven.sample(ts),energyRate=(driven.sample(ts+h).E-driven.sample(ts-h).E)/(2*h);near(energyRate,s.drive*s.vx-dp.c*s.vx**2,.008,'driven energy balance');
 for(const ratio of [.65,1,1.4,1.6])for(const GM of [20,300])for(const R of [3,12]){const {sim}=build('orbit',{ratio,GM,R}),s0=sim.sample(0);for(let i=0;i<=100;i++){const s=sim.sample(i/100*sim.duration);near(s.angular,s0.angular,2e-5);near(s.energy,s0.energy,1e-4);if(ratio===1)near(s.r,R,2e-5)}}
 // Independent equation-of-motion checks: acceleration from finite differences of velocity.
 const masses={acceleration:p=>1,vertical:p=>1,pursuit:p=>1,drag:p=>p.m,friction:p=>p.m,incline:p=>p.m,atwood:p=>p.m1,'table-pulley':p=>p.m,elevator:p=>p.m,work:p=>p.m,'energy-track':p=>p.m,circular:p=>p.m,banked:p=>p.m,conical:p=>p.m,'vertical-circle':p=>p.m,rolling:p=>p.m,spring:p=>p.m,damped:p=>p.m,driven:p=>p.m,pendulum:p=>p.m,orbit:p=>1};
 for(const [id,mass] of Object.entries(masses)){const {p,sim}=build(id),time=sim.duration*.31,h=1e-4,s=sim.sample(time),before=sim.sample(time-h),after=sim.sample(time+h),m=mass(p);for(const [v,f]of [['vx','fx'],['vy','fy'],['vz','fz']])near((after[v]-before[v])/(2*h)*m,s[f],.002,id+' '+f+' = ma')}
 const {integrated}=require('./mechanics-models.js');const make=dt=>integrated(8,[1,0],(_,s)=>[s[1],-9*s[0]],s=>({x:s[0],vx:s[1]}),dt);const coarse=make(1/60),fine=make(1/120),ref=Math.cos(3*7.91),e1=Math.abs(coarse.sample(7.91).x-ref),e2=Math.abs(fine.sample(7.91).x-ref);assert.ok(e2<e1/8&&e2<1e-6,'RK4/Hermite convergence against harmonic analytic solution');
}

// DOM/control smoke test: execute the actual scripts with strict finite canvas arguments.
function domHarness(html,width=1100,height=760){
 const ids={},contexts=[],downloads=[];
 const context=()=>new Proxy({}, {get(o,k){if(k==='createLinearGradient')return()=>({addColorStop(){}});if(k==='setTransform'||k==='beginPath'||k==='closePath'||k==='fill'||k==='stroke'||k==='setLineDash')return()=>{};return(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a),'canvas '+k+' nonfinite');if(k==='arc')assert.ok(args[2]>=0)}},set(o,k,v){o[k]=v;return true}});
 class Element{constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.value='';this.textContent='';this.checked=false;this.disabled=false;this.style={};this.attrs={};this._first={textContent:''};const active=new Set;this.classList={add:x=>active.add(x),remove:x=>active.delete(x),toggle:x=>{if(active.has(x)){active.delete(x);return false}active.add(x);return true}}}set id(v){this._id=v;ids[v]=this}get id(){return this._id}get firstChild(){return this.children[0]||this._first}append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=nodes}setAttribute(k,v){this.attrs[k]=v}getBoundingClientRect(){return this.id==='plot'?{width:240,height:118}:{width,height}}getContext(){if(!this.ctx){this.ctx=context();contexts.push(this.ctx)}return this.ctx}addEventListener(k,f){this.listeners[k]=f}setPointerCapture(){}focus(){}click(){this.onclick?.()}showModal(){this.open=true}close(){this.open=false}}
 for(const match of html.matchAll(/<([\w]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const el=new Element(match[1]);el.id=match[2];el.value=(match[0].match(/\bvalue="([^"]*)"/)||[])[1]||'';el.checked=match[0].includes('checked')}
 class TestURL extends URL{static createObjectURL(blob){downloads.push(blob.content);return 'blob:test'}static revokeObjectURL(){}}
 class TestBlob{constructor(parts){this.content=parts.join('')}}
 ids.rate&&(ids.rate.value='1');const sandbox={console,URL:TestURL,URLSearchParams,Blob:TestBlob,Math,devicePixelRatio:1,location:{href:'https://example.test/mechanics.html',search:''},history:{replaceState(){}},requestAnimationFrame(){},ResizeObserver:class{observe(){}},setTimeout(){},document:{getElementById:id=>ids[id],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener(){}}};vm.createContext(sandbox);return{sandbox,ids,downloads};
}
const html=fs.readFileSync('mechanics.html','utf8'),{sandbox,ids,downloads}=domHarness(html);
for(const match of html.matchAll(/<script src="([^"]+)"/g)){const name=match[1];vm.runInContext(fs.readFileSync(name,'utf8'),sandbox,{filename:name})}
vm.runInContext(`
for(const d of Mechanics.defs){selectExperiment(d.id,false);render();const bounds=sceneBounds();for(const s of plotSamples){const q=project(point(s));if(!q||q.x<bounds.left||q.x>bounds.right||q.y<bounds.top||q.y>bounds.bottom)throw Error('default fit clips '+d.id)}
 if(!$('plotPanel').hidden)throw Error('plot should start collapsed');
 $('play').onclick();if(!running)throw Error('play');advance(Math.min(.2,simulation.duration));$('play').onclick();
 $('timeline').value='500';$('timeline').oninput();if(Math.abs(t-simulation.duration*.5)>1e-9)throw Error('scrub');
 const savedTime=t,savedRunning=running;$('togglePlot').onclick();if($('plotPanel').hidden||$('togglePlot').attrs['aria-expanded']!=='true')throw Error('show plot');render();$('togglePlot').onclick();if(!$('plotPanel').hidden||$('togglePlot').attrs['aria-expanded']!=='false'||t!==savedTime||running!==savedRunning)throw Error('hide plot must preserve simulation');
 $('forces').checked=true;render();$('vectors').checked=false;render();$('vectors').checked=true;
 t=simulation.duration;updateUI();render();$('reset').onclick();if(t!==0)throw Error('reset');
 $('step').onclick();if(t>0.05000001)throw Error('step');
 const p=d.params[0];$('param-'+p.id).value=p.max;$('param-'+p.id).listeners.input();if(params[p.id]!==p.max||t!==0)throw Error('parameter change');render();
 $('help').onclick();if(!$('helpDialog').open)throw Error('help');$('closeHelp').onclick();
 $('side').onclick();render();$('top').onclick();render();$('front').onclick();render();$('perspective').onclick();$('fit').onclick();
 $('follow').onclick();render();if(!following)throw Error('follow');$('fit').onclick();if(following)throw Error('fit must exit follow');
 $('export').onclick();
}
`,sandbox);
assert.equal(downloads.length,defs.length);for(const csv of downloads){assert.ok(csv.includes('time_s,x,y,z,vx,vy,vz,fx,fy,fz'));assert.ok(!/NaN|undefined|Infinity/.test(csv));const lines=csv.replace(/^\ufeff/,'').split('\r\n').filter(line=>!line.startsWith('#'));const columns=lines[0].replace(/^\ufeff/,'').split(',').length;for(const line of lines.slice(1))assert.equal(line.split(',').length,columns)}
const mobile=domHarness(html,390,480);
for(const m of html.matchAll(/<script src="([^"]+)"/g))vm.runInContext(fs.readFileSync(m[1],'utf8'),mobile.sandbox);
vm.runInContext(`for(const d of Mechanics.defs){selectExperiment(d.id,false);render();const bounds=sceneBounds();for(const s of plotSamples){const q=project(point(s));if(!q||q.x<bounds.left||q.x>bounds.right||q.y<bounds.top||q.y>bounds.bottom)throw Error('mobile fit clips '+d.id)}}`,mobile.sandbox);
const libraryHtml=fs.readFileSync('library.html','utf8'),library=domHarness(libraryHtml);
for(const file of ['mechanics-models.js','assets/library.js'])vm.runInContext(fs.readFileSync(file,'utf8'),library.sandbox);
assert.equal(library.ids.cards.children.length,defs.length+3);library.ids.search.value='不存在的實驗';library.ids.search.listeners.input();assert.equal(library.ids.cards.children.length,1);assert.ok(library.ids.cards.children[0].textContent.includes('找不到'));
library.ids.search.value='';library.ids.filters.children.find(b=>b.textContent==='振動').onclick();assert.equal(library.ids.cards.children.length,defs.filter(d=>d.group==='振動').length);
// All actual local assets and catalog paths resolve; existing pages remain independent.
for(const file of ['library.html','mechanics.html','index.html','inclined-projectile.html','staircase-projectile.html']){const content=fs.readFileSync(file,'utf8');for(const m of content.matchAll(/(?:href|src)="([^"#]+)"/g)){if(/^(https?:|data:)/.test(m[1]))continue;assert.ok(fs.existsSync(m[1].split('?')[0]),file+' missing '+m[1])}}
console.log(`PASS: ${defs.length} models, ${configurations} parameter configurations, physical references/conservation, ${defs.length} scenes and playback/control flows, catalog filters and local links.`);
module.exports={domHarness};
