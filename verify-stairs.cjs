const fs=require('fs'),vm=require('vm'),assert=require('assert');const html=fs.readFileSync('staircase-projectile.html','utf8'),code=html.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(code);const els={};for(const m of html.matchAll(/<([\w]+)[^>]*\bid="([^"]+)"[^>]*>/g)){const tag=m[0];els[m[2]]={value:(tag.match(/\bvalue="([^"]*)"/)||[])[1]||'9.81',checked:tag.includes('checked'),textContent:'',style:{},addEventListener(){},append(){},getBoundingClientRect(){return{width:1100,height:750}},classList:{add(){},remove(){},toggle(){return false}}}}const ctx=new Proxy({}, {get(o,k){return k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}}});els.scene.getContext=()=>ctx;const sandbox={document:{getElementById:id=>els[id],createElement:()=>({}),addEventListener(){}},window:{devicePixelRatio:1},ResizeObserver:class{observe(){}},requestAnimationFrame(){},console};vm.createContext(sandbox);vm.runInContext(code,sandbox);vm.runInContext('render()',sandbox);
vm.runInContext(`
for(const speed of [1,6,15,30])for(const angle of [0,30,45,90])for(const e of [0,.75,1]){
 $('v').value=speed;$('angle').value=angle;$('bounce').value=e;setup();
 if(!Number.isFinite(p.T)||p.T>30.00001)throw Error('invalid duration');
 for(const seg of p.segments){for(let i=1;i<20;i++){const d=seg.dt*i/20,x=seg.x+seg.vx*d,y=seg.y+seg.vy*d-.5*p.g*d*d;const floor=x<0?p.h:x<p.count*p.size?p.h-(Math.floor(x/p.size)+1)*p.size:0;if(y<floor-1e-6)throw Error('penetration '+JSON.stringify({speed,angle,e,x,y,floor}))}}
 t=p.T;updateUI();render();
}
`,sandbox);console.log('PASS: script, rendering and 48 parameter combinations; no terrain penetration.');
