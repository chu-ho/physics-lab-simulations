/* Air/water geometric ray tracing; zero-thickness container, no glass shell. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers,EPS=1e-7;
const dot=(a,b)=>a.reduce((v,x,j)=>v+x*b[j],0),add=(a,b,t=1)=>a.map((x,j)=>x+t*b[j]),sub=(a,b)=>add(a,b,-1),unit=v=>{const l=Math.hypot(...v);return v.map(x=>x/l);};
function bend(direction,normal,nFrom,nTo){const d=unit(direction);let N=unit(normal);if(dot(d,N)>0)N=N.map(x=>-x);const cos=-dot(d,N),eta=nFrom/nTo,k=1-eta*eta*(1-cos*cos);return k< -1e-12?{direction:add(d,N,2*cos),tir:true}:{direction:unit(add(d.map(x=>x*eta),N,eta*cos-Math.sqrt(Math.max(0,k)))),tir:false};}
function waterHit(o,d,shape,R,H){const hits=[];function hit(t,n){if(t>EPS){const q=add(o,d,t);if(q[1]>=-EPS&&q[1]<=H+EPS&&(shape===0?q[0]*q[0]+q[2]*q[2]<=R*R+EPS:Math.abs(q[0])<=R+EPS&&Math.abs(q[2])<=R+EPS))hits.push({t,point:q,normal:n});}}
if(Math.abs(d[1])>EPS)for(const y of [0,H])hit((y-o[1])/d[1],[0,y===0?-1:1,0]);if(shape===0){const A=d[0]**2+d[2]**2,B=2*(o[0]*d[0]+o[2]*d[2]),C=o[0]**2+o[2]**2-R*R,D=B*B-4*A*C;if(A>EPS&&D>=0)for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)]){const q=add(o,d,t);hit(t,unit([q[0],0,q[2]]));}}else for(const j of [0,2])if(Math.abs(d[j])>EPS)for(const side of [-1,1]){const n=[0,0,0];n[j]=side;hit((side*R-o[j])/d[j],n);}return hits.sort((a,b)=>a.t-b.t)[0]||null;}
function inside(o,shape,R,H){return o[1]>0&&o[1]<H&&(shape===0?o[0]**2+o[2]**2<R*R:Math.abs(o[0])<R&&Math.abs(o[2])<R);}
function strawHit(o,d,a,b,r){const axis=unit(sub(b,a)),length=Math.hypot(...sub(b,a)),q=sub(o,a),dv=dot(d,axis),qv=dot(q,axis),dp=add(d,axis,-dv),qp=add(q,axis,-qv),A=dot(dp,dp),B=2*dot(dp,qp),C=dot(qp,qp)-r*r,D=B*B-4*A*C,hits=[];if(A>1e-12&&D>=0)for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)]){const along=qv+t*dv;if(t>EPS&&along>=0&&along<=length){const point=add(o,d,t);hits.push({t,point,along,normal:unit(sub(point,add(a,axis,along)))});}}if(Math.abs(dv)>EPS)for(const along of [0,length]){const t=(along-qv)/dv,point=add(o,d,t);if(t>EPS&&Math.hypot(...sub(point,add(a,axis,along)))<=r)hits.push({t,point,along,normal:axis.map(x=>x*(along===0?-1:1))});}return hits.sort((a,b)=>a.t-b.t)[0]||null;}
M.WaterOptics={bend,waterHit,inside,strawHit};
M.register('straw-cup','杯中吸管：容器與折射外觀','幾何光學','straw-cup',[
P('shape','容器：0圓柱／1長方形',0,1,1,0),P('n','液體折射率',1,1.8,.01,1.33),P('height','水深',.5,2.5,.1,1.8,'m'),P('tilt','吸管傾角（相對鉛直）',0,50,1,25,'°'),{...P('truth','疊加吸管真實位置',0,1,1,0),visual:true}
],[metric('index','液體折射率',''),metric('realDepth','吸管下端實深','m'),metric('paraxialDepth','近軸平面視深參考','m')],
'n₁sinθ₁=n₂sinθ₂；每次表面交點重新計算折射或全反射',
'從目前3D視角逆向追蹤每個畫面取樣光線，計算空氣／液體交界的折射、全反射與條紋吸管交點；不是固定把水下吸管向上移的近似貼圖。圓柱側面及長方形側面均參與折射，水面為平面；容器壁厚視為零，不含玻璃殼。最多追蹤8次界面交互作用，超限像素標示深色；無Fresnel部分反射、衍射、色散或光強校準。底部使用地面背景示意，不模擬杯底玻璃。吸管因傾角可能未抵杯底；其下端位置保持容器內。主讀值的實深/n只是近軸、平面水面參考，不代表彎曲杯壁或斜視情況的唯一視深。吸管外觀由實際光路決定。時間軸供觀察，場景本身靜止；筆跡及魚模型不在本題內。',
['折射率設為1，水面兩側的吸管還會錯位嗎？','圓柱與長方形側面會產生相同變形嗎？'],p=>{
const radius=1.5,H=p.height,tan=Math.tan(p.tilt*Math.PI/180),depth=Math.min(H-.1,tan>1e-10?radius*.8/tan:H-.1),bottom=[-depth*tan,H-depth,0],top=[.8*tan,H+.8,0];
return trajectory(4,()=>({x:bottom[0],y:bottom[1],z:0,index:p.n,realDepth:depth,paraxialDepth:depth/p.n}),{schematic:true,hidePrimary:true,hideGrid:()=>true,radius,height:H,bottom,top,strawRadius:.085,bounds:{min:[-1.8,0,-1.8],max:[1.8,H+1.1,1.8]},scaleNote:'即時幾何光線追蹤；畫質採取樣格，容器壁厚為零。近軸視深僅作平面參考。',endLabel:'靜態折射外觀觀察完成'});
},'models/straw-cup.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
