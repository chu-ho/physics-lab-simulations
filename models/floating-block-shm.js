(function(M){'use strict';const {P,M:metric,trajectory,integrated,clamp}=M.helpers;
M.register('floating-block-shm','方塊入水與浮力簡諧振盪','振動','floating-block-shm',[
P('mode','情境：0從水面上落下／1平衡附近振盪',0,1,1,0),P('density','方塊密度',100,900,25,500,'kg/m³'),P('waterDensity','液體密度',950,1300,25,1000,'kg/m³'),P('width','方塊寬度（正方形底）',.3,1.2,.05,.8,'m'),P('height','方塊高度',.4,1.6,.05,1,'m'),P('drop','方塊底面初始離水高度',0,1.5,.05,.2,'m'),P('amplitude','平衡情境：容許振幅比例',.05,.9,.05,.6),P('damping','水中線性阻尼',0,300,5,0,'kg/s'),P('g','重力加速度',1,15,.01,9.81,'m/s²'),{...P('forces','顯示受力',0,1,1,1),visual:true}
],[metric('q','相對平衡位置（向上）','m'),metric('restoring','浮力＋重力','N'),metric('period','小振幅無阻尼週期','s')],
'浸深 d=clamp(H/2−(y−水面),0,H)；B=ρ液gAd；平衡附近 F=B−mg=−ρ液gAq；T=2π√(m/(ρ液gA))',
'方塊保持直立，只做鉛直運動；底面為正方形，m=ρ塊AH。入水情境由靜止落下；平衡情境由平衡點上方靜止釋放，振幅依離水／全浸邊界較小距離設定。只有部分浸沒時浮力與位移線性；離水與完全浸沒時恢復力不再等於−kq。阻尼為−cv，僅在接觸液體時作用；c>0為阻尼運動，依參數可能振盪或不振盪，非理想簡諧。忽略流體附加質量、波浪、濺水、入水衝擊、浮體轉動及水位變化，液體視為無限深。紅色／藍色箭頭分別是重力／浮力，紫色是阻尼，金色為合力；圖中標線並非位置向量。',
['為什麼平衡點合力為零，方塊卻仍會繼續移動？','何時可以用 F=−kq，何時離水或全浸使簡諧近似失效？','改變底面積時，質量與恢復力斜率同時改變，週期會改變嗎？'],p=>{
const surface=4,A=p.width**2,H=p.height,m=p.density*A*H,k=p.waterDensity*p.g*A,eqDepth=p.density/p.waterDensity*H,equilibriumY=surface+H/2-eqDepth,margin=Math.min(eqDepth,H-eqDepth),amplitude=p.amplitude*margin,period=2*Math.PI*Math.sqrt(m/k),duration=Math.min(30,6*period),initial=p.mode?equilibriumY+amplitude:surface+H/2+p.drop;
const immersion=y=>clamp(surface+H/2-y,0,H),force=(y,v)=>{const d=immersion(y),B=k*d,drag=d>0?-p.damping*v:0;return{d,B,drag,F:B-m*p.g+drag};};
const motion=integrated(duration,[initial,0],(_,s)=>[s[1],force(s[0],s[1]).F/m],s=>{const y=s[0],vy=s[1],f=force(y,vy),q=y-equilibriumY,z=surface+H/2-y,U=m*p.g*(y-equilibriumY)+(z<=0?0:z<H?.5*k*z*z:k*(H*z-.5*H*H))-.5*k*eqDepth**2,K=.5*m*vy*vy;return{y,vy,fy:f.F,ay:f.F/m,q,restoring:f.B-m*p.g,linearForce:-k*q,buoyancy:f.B,weight:m*p.g,drag:f.drag,immersed:f.d,regime:f.d<=0?0:f.d>=H?2:1,period,K,U,E:K+U,mass:m};},1/1200);
let ymin=initial,ymax=initial;for(let i=0;i<=600;i++){const y=motion.sample(duration*i/600).y;ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);}
return trajectory(duration,t=>motion.sample(t),{minimumSceneScale:6,hidePrimary:true,hideGrid:()=>true,surface,H,A,m,k,equilibriumY,eqDepth,margin,amplitude,period,initial,immersion,bounds:{min:[-2.8,Math.min(ymin-H/2-.5,1.5),-1.6],max:[3.5,Math.max(6,ymax+H/2+.7),1.6]},endLabel:'六個理論週期觀察結束（最長30秒）'});
},'models/floating-block-shm.js');
M.defs.find(d=>d.id==='floating-block-shm').plotMetrics=[metric('vy','鉛直速度','m/s'),metric('buoyancy','浮力','N'),metric('weight','重力大小','N'),metric('linearForce','線性預測 −kq','N'),metric('drag','阻尼力','N'),metric('immersed','浸深','m'),metric('K','動能','J'),metric('U','相對平衡位能','J'),metric('E','機械能','J')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
