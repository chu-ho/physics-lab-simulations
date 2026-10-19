'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d'),TAU=Math.PI*2;
let W=1,H=1,scale=30,dirty=true,t=0,running=false,last=null,def,params,simulation,plotSamples=[],velocityScale=.25,forceScale=.1,following=false;
const camera={yaw:-.65,pitch:.48,zoom:1,target:[0,3,0]};
function stateAt(time){return simulation.sample(time)}
function point(s){return [s.x,s.y,s.z]}
function sceneBounds(){const top=H>480?125:90;return{left:Math.min(30,W*.05),right:W-Math.min(30,W*.05),top,bottom:Math.max(top+55,H-180)}}
function format(v){if(!Number.isFinite(v))return '—';return Math.abs(v)<.0005?'0.00':Math.abs(v)>=10000?v.toExponential(2):v.toFixed(2)}
function selectExperiment(id,updateURL=true){
 def=Mechanics.defs.find(d=>d.id===id)||Mechanics.defs[0];params=Mechanics.defaults(def);
 document.title=def.title+' · 3D 互動實驗室';$('title').textContent=def.title+' / 3D';$('title').setAttribute('title',def.title);$('category').textContent=def.group+' / SETTINGS';$('overline').textContent='PHYSICS LAB / '+String(Mechanics.defs.indexOf(def)+4).padStart(2,'0');$('sceneTitle').firstChild.textContent=def.title;
 $('experiment').value=def.id;$('controls').replaceChildren();
 for(const p of def.params){const label=document.createElement('label');label.className='control';const head=document.createElement('span');head.className='label';head.append(document.createTextNode(p.label));const output=document.createElement('output');output.id=p.id+'Out';head.append(output);const input=document.createElement('input');Object.assign(input,{type:'range',id:'param-'+p.id,min:p.min,max:p.max,step:p.step,value:p.value});input.setAttribute('aria-label',p.label);input.addEventListener('input',()=>{params[p.id]=+input.value;setup(false)});const limits=document.createElement('span');limits.className='limits';for(const v of [p.min,p.max]){const span=document.createElement('span');span.textContent=v+' '+p.unit;limits.append(span)}label.append(head,input,limits);$('controls').append(label)}
 $('plotMetric').replaceChildren();for(const m of def.metrics){const option=document.createElement('option');option.value=m.key;option.textContent=m.label+'（'+m.unit+'）';$('plotMetric').append(option)}
 def.metrics.forEach((m,i)=>{$('m'+i+'label').textContent=m.label;$('m'+i+'unit').textContent=m.unit});
 $('note').textContent=def.note;$('formula').textContent=def.formula;$('helpNote').textContent=def.note;$('helpFormula').textContent=def.formula;$('helpTitle').textContent=def.title;$('questions').replaceChildren();for(const q of def.questions){const li=document.createElement('li');li.textContent=q;$('questions').append(li)}
 if(updateURL){const url=new URL(location.href);url.searchParams.set('experiment',def.id);history.replaceState(null,'',url)}setup(true);
}
function setup(fit){
 simulation=def.build(params);for(const p of def.params)$(p.id+'Out').textContent=Number(params[p.id]).toFixed(p.step<.1?2:p.step<1?1:0)+' '+p.unit;
 plotSamples=Array.from({length:481},(_,i)=>({time:i/480*simulation.duration,...simulation.sample(i/480*simulation.duration)}));
 if(fit)fitCamera();
 $('duration').textContent=format(simulation.duration)+' s';$('extraInfo').textContent='';
 if('mus' in params)$('extraInfo').textContent='有效靜摩擦係數 μₛ = '+Math.max(params.mus,params.mu).toFixed(2);
 if(def.kind==='bungee'){
  const reference=document.createElement('p');reference.className='note';reference.textContent='純彈力平衡高度：'+format(simulation.elasticHeight)+' m（ke = mg，不含阻尼）。有阻尼時，合力為零須滿足繩索總拉力 T = mg；這與最低點 v = 0 不同。';$('extraInfo').append(reference);
  for(const event of simulation.markers){const row=document.createElement('p');row.className='note';row.textContent=(simulation.markers.indexOf(event)+1)+'. '+event.label+'：'+format(event.y)+' m，'+format(event.t)+' s';$('extraInfo').append(row)}
  if(!simulation.markers.some(e=>e.key==='lowest')){const row=document.createElement('p');row.className='note';row.textContent='本次觀察內未出現離地的最低轉折點。';$('extraInfo').append(row)}
 }
 const maxV=Math.max(1,...plotSamples.map(s=>Math.hypot(s.vx,s.vy,s.vz,s.rdot||0,s.radius?s.radius*s.omega:0))),maxF=Math.max(1,...plotSamples.map(s=>Math.hypot(s.fx,s.fy,s.fz)));velocityScale=Math.min(.4,scale*.12/maxV);forceScale=Math.min(.25,scale*.12/maxF);
 if(def.kind==='lever')forceScale=2/(Math.max(params.m1,params.m2)*params.g);
 $('scaleNote').textContent='速度箭頭：1 m/s → '+velocityScale.toPrecision(2)+' m；合力箭頭：1 N → '+forceScale.toPrecision(2)+' m。兩者採不同尺度。改參數不自動改鏡頭；可按「完整取景」。';
 if(def.kind==='orbit')$('scaleNote').textContent+=' 軌道模型合力按 1 kg 測試質點計。';
 reset();
}
function fitCamera(){
 const positions=plotSamples.flatMap(s=>{const pts=[point(s)];if(Number.isFinite(s.x2))pts.push([s.x2,s.y2??s.y,s.z2??(def.kind==='two-carts'?2.5:0)]);return pts});positions.push([0,0,0]);
 // Include apparatus, not only moving objects.
 if(['pendulum','conical','ballistic'].includes(def.kind))positions.push([0,(params.L||4)+2,0]);
 if(def.kind==='ballistic')positions.push([-3,1,0]);
 if(def.kind==='bungee')positions.push([-8,0,-2],[22,params.h+10,2],[0,params.h-params.L/2,0]);
 if(def.kind==='spring')positions.push([Math.min(-5,...plotSamples.map(s=>s.x-2))-.5,2,0]);
 if(def.kind==='elevator')for(const s of plotSamples)positions.push([-2,s.floor,0],[2,s.floor+7,0]);
 if(def.kind==='table-pulley')positions.push([-7.5,5.4,-2.5],[3.5,6,2.5]);
 if(['pulley','massive-pulley'].includes(def.kind))positions.push([-3,10,0],[3,0,0]);
 if(def.kind==='skater'){const r=Math.max(params.r0,params.r1)+.4;positions.push([-r,0,-r],[r,2,r])}
 if(def.kind==='lever')positions.push([-params.L1,3,0],[params.L2,3,0]);
 if(def.kind==='torque'||def.kind==='rotor')positions.push([-params.R,1,-params.R],[params.R,1,params.R]);
 const mins=[0,1,2].map(i=>Math.min(...positions.map(p=>p[i]))),maxs=[0,1,2].map(i=>Math.max(...positions.map(p=>p[i])));
 camera.target=mins.map((v,i)=>(v+maxs[i])/2);scale=Math.max(9,...maxs.map((v,i)=>v-mins[i]))*1.05;camera.zoom=1.25;
 // Fit projected geometry to the usable region above the transport controls.
 const margin=Math.max(.65,Math.min(1.2,scale*.014)),bounds=sceneBounds(),fitPoints=positions.flatMap(p=>[p,[p[0]-margin,p[1],p[2]],[p[0]+margin,p[1],p[2]],[p[0],p[1]-margin,p[2]],[p[0],p[1]+margin,p[2]]]);
 for(let i=0;i<35;i++){updateCamera();const points=fitPoints.map(project);if(points.every(p=>p&&p.x>=bounds.left&&p.x<=bounds.right&&p.y>=bounds.top&&p.y<=bounds.bottom))break;camera.zoom*=.88}
 following=false;$('follow').setAttribute('aria-pressed','false');dirty=true;
}
function reset(){t=0;running=false;last=null;updateUI()}
function updateUI(){const s=stateAt(t),ended=t>=simulation.duration;$('time').textContent=format(t);def.metrics.forEach((m,i)=>$('m'+i).textContent=format(s[m.key]));$('timeline').value=simulation.duration?t/simulation.duration*1000:0;$('timeline').disabled=simulation.duration===0;$('step').disabled=ended;$('play').disabled=simulation.duration===0;$('play').textContent=running?'Ⅱ 暫停':ended?'↻ 再次播放':t>0?'▶ 繼續':'▶ 播放';$('status').textContent=def.kind==='lever'?(Math.abs(s.net)<1e-8?'力矩平衡':'需要外加約束力矩'):ended?(simulation.endLabel||'觀察結束'):running?'● 實驗進行中':t>0?'已暫停':'準備實驗';$('events').textContent=(simulation.events||[]).filter(e=>e.t<=t).map(e=>format(e.t)+' s · '+e.label).join(' / ');dirty=true}
function advance(dt){t=Math.min(simulation.duration,t+dt);if(t>=simulation.duration)running=false;updateUI()}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=Math.max(1,r.width);H=Math.max(1,r.height);canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);dirty=true}
function drawPlot(){
 if($('plotPanel').hidden)return;
 const c=$('plot'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=Math.max(1,r.width),h=Math.max(1,r.height);c.width=w*d;c.height=h*d;const g=c.getContext('2d');g.setTransform(d,0,0,d,0,0);
 const m=def.metrics.find(m=>m.key===$('plotMetric').value)||def.metrics[0],values=plotSamples.map(s=>s[m.key]),low=Math.min(0,...values),high=Math.max(0,...values),range=high-low||1,pad=range*.1,min=low-pad,max=high+pad,left=43,right=w-8,top=10,bottom=h-18;
 const px=time=>left+(right-left)*(simulation.duration?time/simulation.duration:0),py=v=>bottom-(v-min)/(max-min)*(bottom-top);
 $('plotLabel').textContent=m.label+' / '+m.unit;c.setAttribute('aria-label',m.label+'隨時間圖，橫軸秒，縱軸'+m.unit+'，目前 '+format(stateAt(t)[m.key]));
 g.strokeStyle='#546c76';g.lineWidth=.6;g.beginPath();g.moveTo(left,top);g.lineTo(left,bottom);g.lineTo(right,bottom);g.stroke();g.font='9px system-ui';g.fillStyle='#c1d1d7';g.textAlign='right';g.fillText(format(high),left-4,top+5);g.fillText(format(low),left-4,bottom-2);g.textAlign='left';g.fillText('0',left,bottom+13);g.textAlign='right';g.fillText(format(simulation.duration)+' s',right,bottom+13);
 g.strokeStyle='#8ee0c0';g.lineWidth=1.5;g.beginPath();plotSamples.forEach((s,i)=>i?g.lineTo(px(s.time),py(s[m.key])):g.moveTo(px(s.time),py(s[m.key])));g.stroke();g.strokeStyle='#ffb36b88';g.beginPath();g.moveTo(px(t),top);g.lineTo(px(t),bottom);g.stroke();g.fillStyle='#ffb36b';g.beginPath();g.arc(px(t),py(stateAt(t)[m.key]),3,0,TAU);g.fill();
}
