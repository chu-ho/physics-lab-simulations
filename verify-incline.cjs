const fs=require('fs'),vm=require('vm'),assert=require('assert');const html=fs.readFileSync('inclined-projectile.html','utf8'),code=html.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(code);const els={};for(const m of html.matchAll(/<([\w]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const tag=m[0];els[m[2]]={value:(tag.match(/\bvalue="([^"]*)"/)||[])[1]||'9.81',checked:tag.includes('checked'),textContent:'',style:{},addEventListener(){},append(){},getBoundingClientRect(){return{width:1100,height:750}},classList:{add(){},remove(){},toggle(){return false}}}}const ctx=new Proxy({}, {get(o,k){return k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}}});els.scene.getContext=()=>ctx;const sandbox={document:{getElementById:id=>els[id],createElement:()=>({}),addEventListener(){}},window:{devicePixelRatio:1},ResizeObserver:class{observe(){}},requestAnimationFrame(){},console};vm.createContext(sandbox);vm.runInContext(code,sandbox);vm.runInContext('render()',sandbox);
vm.runInContext(`
let checks=0;
for(const slope of [-45,0,20,60])for(const angle of [0,15,45,90])for(const azimuth of [-180,-90,0,90,180])for(const speed of [1,15,30]){
 $('slope').value=slope;$('angle').value=angle;$('azimuth').value=azimuth;$('v').value=speed;setup();
 const end=sample(p,p.T),normalEnd=-p.sn*end.x+p.c*end.y;
 if(!Number.isFinite(p.T)||Math.abs(normalEnd)>1e-7)throw Error('landing off plane');
 for(let i=0;i<=20;i++){const state=sample(p,p.T*i/20),d=-p.sn*state.x+p.c*state.y;if(d< -1e-7)throw Error('penetration')}
 if(slope===0&&Math.abs(p.T-2*speed*Math.sin(angle*Math.PI/180)/p.g)>1e-8)throw Error('flat plane');
 t=p.T;updateUI();render();checks++;
}
console.log('PASS: '+checks+' parameter combinations; landing, no penetration, flat-plane limit, rendering.');
`,sandbox);
