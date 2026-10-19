/* SI units throughout. Independent of DOM; also loaded by the verification suite. */
(function(root){
'use strict';
const G=9.81,rad=d=>d*Math.PI/180,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const P=(id,label,min,max,step,value,unit='')=>({id,label,min,max,step,value,unit});
const mass=P('m','質量',.5,10,.5,2,'kg'),gravity=P('g','重力加速度',1,15,.01,G,'m/s²');
const speed=P('v','初速',-10,15,.5,4,'m/s'),mu=P('mu','動摩擦係數',0,.8,.02,.2);
const oscillation=[mass,P('k','彈簧常數',1,30,.5,8,'N/m'),P('A','初始伸長量',.1,3,.1,1.5,'m')];
function trajectory(duration,fn,extra={}){return {duration:Math.max(0,duration),sample:t=>Object.assign({x:0,y:.4,z:0,vx:0,vy:0,vz:0,fx:0,fy:0,fz:0},fn(clamp(t,0,Math.max(0,duration)))),...extra}}
function integrated(duration,initial,derivative,map,dt=1/240){
 const n=Math.ceil(duration/dt),states=[initial.slice()];let state=initial.slice();
 for(let i=0;i<n;i++){const t=i*dt,k1=derivative(t,state),k2=derivative(t+dt/2,state.map((v,j)=>v+k1[j]*dt/2)),k3=derivative(t+dt/2,state.map((v,j)=>v+k2[j]*dt/2)),k4=derivative(t+dt,state.map((v,j)=>v+k3[j]*dt));state=state.map((v,j)=>v+dt/6*(k1[j]+2*k2[j]+2*k3[j]+k4[j]));states.push(state)}
 return trajectory(duration,t=>{const f=t/dt,i=Math.min(states.length-2,Math.floor(f)),a=f-i;const u=derivative(i*dt,states[i]),v=derivative((i+1)*dt,states[i+1]),a2=a*a,a3=a2*a;return map(states[i].map((x,j)=>(2*a3-3*a2+1)*x+(a3-2*a2+a)*dt*u[j]+(-2*a3+3*a2)*states[i+1][j]+(a3-a2)*dt*v[j]),t)})
}
const defs=[];
function add(id,title,group,kind,params,metrics,formula,note,questions,build){defs.push({id,title,group,kind,params,metrics,formula,note,questions,build})}
const M=(key,label,unit)=>({key,label,unit});
const linearMetrics=[M('x','位置 x','m'),M('vx','速度 vₓ','m/s'),M('ax','加速度','m/s²')];
const energyMetrics=[M('K','動能','J'),M('U','位能','J'),M('E','機械能','J')];

add('acceleration','等加速度直線運動','運動學','cart',[speed,P('a','加速度',-5,5,.2,1.2,'m/s²'),P('T','觀察時間',2,15,1,8,'s')],linearMetrics,
 'x = v₀t + ½at²；v = v₀ + at', '沿 x 軸運動，位置可以為負；加速度為固定值。無碰撞邊界；合力箭頭以 1 kg 質點計算。',['初速與加速度反向時，何時改變方向？','位移—時間圖的斜率與速度有何關係？'],p=>trajectory(p.T,t=>({x:p.v*t+.5*p.a*t*t,vx:p.v+p.a*t,ax:p.a,fx:p.a,K:.5*(p.v+p.a*t)**2})));

add('vertical','自由落體與鉛直上拋','運動學','ball',[P('h','初始高度',0,20,.5,8,'m'),P('v','初始鉛直速度',-10,20,.5,8,'m/s'),gravity],[M('y','高度','m'),M('vy','鉛直速度','m/s'),M('K','動能（1 kg）','J')],
 'y = h₀ + v₀t − ½gt²；vᵧ = v₀ − gt', 'y 軸向上；到達 y = 0 時停止，顯示碰撞前速度。質量取 1 kg，無空氣阻力。',['最高點的加速度是否為零？','從同一高度向上與向下拋出，落地速率如何比較？'],p=>{const T=(p.v+Math.sqrt(p.v*p.v+2*p.g*p.h))/p.g;return trajectory(T,t=>({y:Math.max(0,p.h+p.v*t-.5*p.g*t*t),vy:p.v-p.g*t,fy:-p.g,K:.5*(p.v-p.g*t)**2}))});

add('river','渡河與相對速度','運動學','river',[P('v','船相對水速率',1,8,.2,3,'m/s'),P('u','水流速率',-5,5,.1,1.5,'m/s'),P('angle','朝上游偏角',-60,60,1,20,'°'),P('width','河寬',5,30,1,15,'m')],[M('x','順流位移','m'),M('z','渡河距離','m'),M('drift','預計漂流','m')],
 'v地 = v船／水 + v水／地；T = 河寬 / (v cosθ)', '河流沿 +x，對岸沿 +z；正偏角朝上游。水流均勻，抵達對岸即停止。',['如何使落點正好位於正對岸？何時做不到？','最短時間與最短路徑需要相同的航向嗎？'],p=>{const vx=p.u-p.v*Math.sin(rad(p.angle)),vz=p.v*Math.cos(rad(p.angle)),T=p.width/vz;return trajectory(T,t=>({x:vx*t,z:vz*t,y:.3,vx,vz,drift:vx*T}))});

add('pursuit','追及與會車','運動學','two-carts',[P('v','後車初速',0,12,.5,5,'m/s'),P('v2','前車速度',-8,12,.5,3,'m/s'),P('a','後車加速度',0,3,.1,.5,'m/s²'),P('gap','初始間距',2,30,1,15,'m')],[M('x','後車位置','m'),M('x2','前車位置','m'),M('gap','相距','m')],
 'x₁ = v₁t + ½at²；x₂ = d + v₂t', '兩車在平行車道運動；相遇表示同一 x 座標，不進行碰撞。觀察時間 12 秒，合力箭頭以後車質量 1 kg 計算。',['等速時，哪一種情況永遠追不上？','前車迎面而來時，相對速度如何改變？'],p=>trajectory(12,t=>({x:p.v*t+.5*p.a*t*t,x2:p.gap+p.v2*t,vx:p.v+p.a*t,v2:p.v2,gap:Math.abs(p.gap+p.v2*t-p.v*t-.5*p.a*t*t),ax:p.a,fx:p.a})));

add('drag','空氣阻力與終端速度','運動學','fall',[mass,P('b','線性阻力係數',.2,8,.2,2,'kg/s'),gravity],[M('fall','下落距離','m'),M('down','向下速率','m/s'),M('terminal','終端速率','m/s')],
 'm dv/dt = mg − bv；v = (mg/b)(1 − e^(−bt/m))', '由靜止下落，採線性阻力 F = −bv。場景跟隨下落距離以縮尺顯示；不設地板碰撞。',['質量加倍如何改變終端速度？','為什麼終端速度時物體仍在運動？'],p=>{const terminal=p.m*p.g/p.b,tau=p.m/p.b;return trajectory(10,t=>{const v=terminal*(1-Math.exp(-t/tau)),d=terminal*(t-tau*(1-Math.exp(-t/tau)));return{y:-d,vy:-v,fy:-p.m*p.g+p.b*v,fall:d,down:v,terminal,K:.5*p.m*v*v}})});

add('friction','水平受力與靜、動摩擦','牛頓定律','cart',[mass,P('F','水平外力',-30,30,.5,8,'N'),mu,P('mus','靜摩擦係數',0,1,.02,.4),gravity],[M('x','位置','m'),M('friction','摩擦力','N'),M('ax','加速度','m/s²')],
 '靜止：|F| ≤ μₛN；滑動：fₖ = μₖN；a = (F − fₖ)/m', '由靜止開始。有效靜摩擦係數取 max(μₛ, μₖ)，避免靜摩擦小於動摩擦；拉桿下方會顯示實際採用值。',['外力未達最大靜摩擦力時，摩擦力是多少？','剛開始滑動時，加速度會連續改變嗎？'],p=>{const ms=Math.max(p.mus,p.mu),moving=Math.abs(p.F)>ms*p.m*p.g,friction=moving?-Math.sign(p.F)*p.mu*p.m*p.g:-p.F,a=(p.F+friction)/p.m;return trajectory(6,t=>({x:.5*a*t*t,vx:a*t,ax:a,friction,fx:p.F+friction,N:p.m*p.g,mus:ms}))});

add('incline','斜面滑動與摩擦','牛頓定律','incline',[mass,P('angle','斜面傾角',0,60,1,25,'°'),mu,P('mus','靜摩擦係數',0,1,.02,.4),gravity],[M('s','沿坡位移','m'),M('ax','沿坡加速度','m/s²'),M('N','正向力','N')],
 'N = mg cosα；a = g(sinα − μₖcosα)', '從坡頂靜止釋放，沿坡可移動 12 m，到坡底即停止並保留碰撞前速度。有效 μₛ = max(μₛ, μₖ)。',['開始滑動的臨界角度與質量有關嗎？','為什麼增加質量不改變加速度？'],p=>{const a=rad(p.angle),N=p.m*p.g*Math.cos(a),drive=p.m*p.g*Math.sin(a),moving=drive>Math.max(p.mus,p.mu)*N,acc=moving?(drive-p.mu*N)/p.m:0,T=acc>0?Math.sqrt(24/acc):8;return trajectory(T,t=>{const d=.5*acc*t*t;return{x:d*Math.cos(a)-5+.4*Math.sin(a),y:(12-d)*Math.sin(a)+.4*Math.cos(a),vx:acc*t*Math.cos(a),vy:-acc*t*Math.sin(a),s:d,ax:acc,N,friction:moving?p.mu*N:drive,fx:p.m*acc*Math.cos(a),fy:-p.m*acc*Math.sin(a),mus:Math.max(p.mus,p.mu)}})});

add('atwood','阿特伍德機','牛頓定律','pulley',[P('m1','左側質量',.5,10,.5,2,'kg'),P('m2','右側質量',.5,10,.5,3,'kg'),gravity],[M('a','左側向上加速度','m/s²'),M('tension','繩張力','N'),M('s','繩位移','m')],
 'a = (m₂ − m₁)g/(m₁ + m₂)；T = 2m₁m₂g/(m₁ + m₂)', '繩無質量、不可伸長，滑輪無摩擦、無轉動慣量。重物由靜止釋放，任一側移動 3 m 後停止。',['兩側質量相同時，張力等於多少？','為什麼張力不等於較重物體的重量？'],p=>{const a=(p.m2-p.m1)*p.g/(p.m1+p.m2),T=Math.abs(a)>1e-10?Math.sqrt(6/Math.abs(a)):8;return trajectory(T,t=>({x:-2,y:4+.5*a*t*t,x2:2,y2:4-.5*a*t*t,vy:a*t,a,tension:2*p.m1*p.m2*p.g/(p.m1+p.m2),s:.5*a*t*t,fy:p.m1*a}))});

add('table-pulley','桌面物塊與懸掛重物','牛頓定律','table-pulley',[mass,P('m2','懸掛質量',.5,8,.5,1,'kg'),mu,gravity],[M('x','桌面位移','m'),M('tension','繩張力','N'),M('ax','加速度','m/s²')],
 'a = (m₂g − μmg)/(m + m₂)；T = m₂(g − a)', '初始已向滑輪方向緩慢滑動（0.2 m/s）；使用動摩擦。若減速至零則停止並視為靜摩擦可維持，不模擬反向。到桌邊或下落 5 m 結束。',['加重桌上物塊為什麼會降低加速度？','張力對兩個物體的作功會互相抵消嗎？'],p=>{const a=(p.m2*p.g-p.mu*p.m*p.g)/(p.m+p.m2),v=.2,dist=5,T=a<0?Math.min(-v/a,(-v+Math.sqrt(Math.max(0,v*v+2*a*dist)))/a||Infinity):a>0?(-v+Math.sqrt(v*v+2*a*dist))/a:dist/v;const disc=v*v+2*a*dist,edge=Math.abs(a)<1e-12?dist/v:disc>=0?2*dist/(v+Math.sqrt(disc)):Infinity,duration=Math.min(a<0?-v/a:Infinity,edge);return trajectory(duration,t=>{const d=v*t+.5*a*t*t;return{x:d-3,y:6,x2:3,y2:5-d,vx:v+a*t,ax:a,tension:p.m2*(p.g-a),s:d,fx:p.m*a}})});

add('elevator','電梯與視重量','牛頓定律','elevator',[mass,P('a','電梯加速度',-8,8,.2,2,'m/s²'),gravity],[M('N','秤的讀數','N'),M('a','乘客加速度','m/s²'),M('vy','鉛直速度','m/s')],
 '接觸時 N = m(g + a)；失去接觸時 N = 0', '電梯由靜止開始加速 3 秒。a < −g 時乘客脫離地板並自由落下；不模擬與天花板碰撞。秤顯示力（N）。',['電梯向上移動時，體重一定變重嗎？','電梯自由落體時秤會顯示多少？'],p=>trajectory(3,t=>{const a=Math.max(p.a,-p.g),y=2+.5*a*t*t;return{y,vy:a*t,a,N:Math.max(0,p.m*(p.g+p.a)),floor:1+.5*p.a*t*t,fy:p.m*a}}));

add('work','變力作功與動能定理','能量與動量','cart',[mass,P('F','初始外力',1,15,.5,5,'N'),P('k','外力隨位置增加率',0,3,.1,.5,'N/m')],[M('W','外力作功','J'),M('K','動能','J'),M('error','K − W','J')],
 'F(x) = F₀ + kx；W = F₀x + ½kx² = ΔK', '光滑水平面，由靜止開始。k 為外力梯度，不是回復彈簧。到 x = 15 m 時結束。',['相同的力—位移圖面積是否產生相同動能？','質量加倍，走相同距離時速率如何改變？'],p=>{const w=Math.sqrt(p.k/p.m),T=p.k>0?Math.acosh(1+15*p.k/p.F)/w:Math.sqrt(30*p.m/p.F);return trajectory(T,t=>{const x=p.k>0?p.F/p.k*(Math.cosh(w*t)-1):.5*p.F/p.m*t*t,v=p.k>0?p.F/p.k*w*Math.sinh(w*t):p.F/p.m*t,W=p.F*x+.5*p.k*x*x,K=.5*p.m*v*v;return{x,vx:v,fx:p.F+p.k*x,W,K,error:K-W}})});

add('energy-track','無摩擦軌道與能量守恆','能量與動量','track',[mass,P('h','起點高度',1,8,.5,5,'m'),gravity],energyMetrics,
 '軌道 y = hx²/36；½mv² + mgy = mgh', '質點在雙面光滑拋物線導軌上由左側 x = −6 m 靜止釋放；以完整切向運動方程積分。位能零點 y = 0。',['最低點速率由哪些因素決定？','軌道形狀會改變到達最低點的時間嗎？'],p=>integrated(12,[-6,0],(_,s)=>{const slope=p.h*s[0]/18,second=p.h/18;return[s[1],(-p.g*slope-slope*second*s[1]*s[1])/(1+slope*slope)]},s=>{const x=s[0],y=p.h*x*x/36,vy=p.h*x/18*s[1],K=.5*p.m*(s[1]**2+vy**2),U=p.m*p.g*y;return{x,y:y+.3,vx:s[1],vy,K,U,E:K+U,fx:p.m*(-p.g*(p.h*x/18)-(p.h*x/18)*(p.h/18)*s[1]**2)/(1+(p.h*x/18)**2),fy:p.m*((p.h/18)*s[1]**2+(p.h*x/18)*(-p.g*(p.h*x/18)-(p.h*x/18)*(p.h/18)*s[1]**2)/(1+(p.h*x/18)**2))}}));

add('collision','一維碰撞與恢復係數','能量與動量','collision',[P('m1','左球質量',.5,8,.5,2,'kg'),P('m2','右球質量',.5,8,.5,3,'kg'),P('v','左球初速',1,8,.5,4,'m/s'),P('v2','右球初速',-5,0,.5,-1,'m/s'),P('e','恢復係數',0,1,.05,1)],[M('momentum','總動量','kg·m/s'),M('K','總動能','J'),M('loss','損失動能','J')],
 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂；v₂ − v₁ = e(u₁ − u₂)', '兩球中心初距 8 m、示意半徑各 0.5 m。無外力、無摩擦，瞬間碰撞，碰撞後繼續觀察 3 秒。',['e = 0 時動量與動能各自如何變化？','質量相同的彈性碰撞會交換速度嗎？'],p=>{const hit=7/(p.v-p.v2),v1=(p.m1*p.v+p.m2*p.v2-p.m2*p.e*(p.v-p.v2))/(p.m1+p.m2),v2=v1+p.e*(p.v-p.v2),K0=.5*p.m1*p.v**2+.5*p.m2*p.v2**2;return trajectory(hit+3,t=>{const before=t<hit,a=before?p.v:v1,b=before?p.v2:v2,K=.5*p.m1*a*a+.5*p.m2*b*b;return{x:-4+p.v*Math.min(t,hit)+v1*Math.max(0,t-hit),x2:4+p.v2*Math.min(t,hit)+v2*Math.max(0,t-hit),y:1,vx:a,v2:b,momentum:p.m1*a+p.m2*b,K,loss:K0-K,hit:before?0:1}},{events:[{t:hit,label:'碰撞'}]})});

add('ballistic-pendulum','彈道擺','能量與動量','ballistic',[P('m','彈丸質量',.05,.5,.05,.1,'kg'),P('M','擺塊質量',1,5,.5,2,'kg'),P('v','彈丸初速',5,30,1,20,'m/s'),P('L','擺長',2,6,.5,4,'m'),gravity],[M('angle','擺角','°'),M('rise','上升高度','m'),M('loss','碰撞損失','J')],
 '碰撞：mu = (m + M)V；擺動：½(m + M)V² = (m + M)gh', '彈丸嵌入擺塊。碰撞後以非線性擺方程積分，使用剛性無質量擺桿，極端設定可整圈轉動。碰撞前後動量守恆，動能不守恆。',['如何由最大上升高度反推彈丸初速？','為什麼不能直接將碰撞前動能等於擺到最高點的位能？'],p=>{const V=p.m*p.v/(p.m+p.M),hit=3/p.v,loss=.5*p.m*p.v*p.v-.5*(p.m+p.M)*V*V,pend=integrated(10,[0,V/p.L],(_,s)=>[s[1],-p.g/p.L*Math.sin(s[0])],s=>({x:p.L*Math.sin(s[0]),y:1+p.L*(1-Math.cos(s[0])),vx:p.L*Math.cos(s[0])*s[1],vy:p.L*Math.sin(s[0])*s[1],angle:s[0]*180/Math.PI,rise:p.L*(1-Math.cos(s[0])),loss,fx:(p.m+p.M)*(-p.g*Math.sin(s[0])*Math.cos(s[0])-p.L*s[1]**2*Math.sin(s[0])),fy:(p.m+p.M)*(-p.g*Math.sin(s[0])**2+p.L*s[1]**2*Math.cos(s[0]))}));return trajectory(10+hit,t=>t<hit?{x:0,y:1,bulletX:-3+p.v*t,angle:0,rise:0,loss:0}:Object.assign(pend.sample(t-hit),{bulletX:null}),{events:[{t:hit,label:'嵌入碰撞'}]})});

add('rocket','火箭與變質量','能量與動量','rocket',[P('m0','初始質量',5,20,1,10,'kg'),P('fuel','燃料比例',.1,.7,.05,.5),P('ve','相對排氣速率',5,30,1,15,'m/s'),P('burn','燃燒時間',2,10,.5,5,'s')],[M('vx','火箭速率','m/s'),M('mass','剩餘質量','kg'),M('thrust','推力','N')],
 'v = vₑ ln(m₀/m)；F = vₑ(−dm/dt)', '深空一維火箭，無重力與阻力。固定質量流率，燃燒結束後等速飛行 3 秒；排氣方向與火箭運動相反。',['相同燃料比例下，增加火箭總質量會改變最終速度嗎？','增加燃燒時間會改變速度增量，還是只改變推力？'],p=>{const flow=p.m0*p.fuel/p.burn;return trajectory(p.burn+3,t=>{const b=Math.min(t,p.burn),m=p.m0-flow*b,v=p.ve*Math.log(p.m0/m),x=p.ve*(b-m/flow*Math.log(p.m0/m))+v*Math.max(0,t-p.burn);return{x,vx:v,mass:m,thrust:t<p.burn?p.ve*flow:0,fx:t<p.burn?p.ve*flow:0}})});

add('circular','等速圓周運動','圓周與轉動','circle',[mass,P('R','半徑',1,8,.5,4,'m'),P('v','速率',.5,8,.5,3,'m/s')],[M('speed','速率','m/s'),M('acc','向心加速度','m/s²'),M('force','向心合力','N')],
 'ω = v/R；a = v²/R；F = mv²/R', '在水平 x–z 平面以固定速率運動，約束裝置提供向心合力。箭頭顯示瞬時速度與合力。',['速率不變為什麼仍有加速度？','速率加倍，向心力會變成幾倍？'],p=>trajectory(Math.min(30,4*Math.PI*p.R/p.v),t=>{const a=p.v/p.R*t,x=p.R*Math.cos(a),z=p.R*Math.sin(a),force=p.m*p.v*p.v/p.R;return{x,z,y:1,vx:-p.v*Math.sin(a),vz:p.v*Math.cos(a),fx:-force*Math.cos(a),fz:-force*Math.sin(a),speed:p.v,acc:p.v*p.v/p.R,force}}));

add('banked','傾斜彎道','圓周與轉動','banked',[mass,P('R','彎道半徑',2,10,.5,5,'m'),P('angle','彎道傾角',5,50,1,25,'°'),gravity],[M('speed','無摩擦安全速率','m/s'),M('N','正向力','N'),M('acc','向心加速度','m/s²')],
 'N cosθ = mg；N sinθ = mv²/R；v = √(Rg tanθ)', '無摩擦傾斜彎道，車輛以恰好不需摩擦力的速率行駛。只調半徑與傾角，速率由受力平衡決定。',['無摩擦安全速率與車輛質量有關嗎？','同樣半徑下，較大的傾角容許更快還是更慢？'],p=>{const v=Math.sqrt(p.R*p.g*Math.tan(rad(p.angle)));return trajectory(Math.min(30,4*Math.PI*p.R/v),t=>{const a=v/p.R*t;return{x:p.R*Math.cos(a),z:p.R*Math.sin(a),y:1,vx:-v*Math.sin(a),vz:v*Math.cos(a),fx:-p.m*v*v/p.R*Math.cos(a),fz:-p.m*v*v/p.R*Math.sin(a),speed:v,N:p.m*p.g/Math.cos(rad(p.angle)),acc:v*v/p.R}})});

add('conical','圓錐擺','圓周與轉動','conical',[mass,P('L','繩長',2,8,.5,5,'m'),P('angle','繩與鉛直夾角',5,65,1,30,'°'),gravity],[M('period','週期','s'),M('tension','繩張力','N'),M('speed','速率','m/s')],
 'T繩 cosθ = mg；ω² = g/(L cosθ)；週期 = 2π√(L cosθ/g)', '小球在水平圓周運動，繩與鉛直保持固定夾角；繩無質量、不可伸長。',['週期是否與擺球質量有關？','角度變大時，週期與繩張力如何變化？'],p=>{const a=rad(p.angle),R=p.L*Math.sin(a),w=Math.sqrt(p.g/(p.L*Math.cos(a)));return trajectory(4*Math.PI/w,t=>({x:R*Math.cos(w*t),z:R*Math.sin(w*t),y:2,vx:-R*w*Math.sin(w*t),vz:R*w*Math.cos(w*t),fx:-p.m*R*w*w*Math.cos(w*t),fz:-p.m*R*w*w*Math.sin(w*t),period:2*Math.PI/w,tension:p.m*p.g/Math.cos(a),speed:R*w}))});

add('vertical-circle','鉛直圓環與能量','圓周與轉動','vertical-circle',[mass,P('R','圓環半徑',1,5,.5,3,'m'),P('v','最低點初速',1,16,.5,12,'m/s'),gravity],[M('speed','速率','m/s'),M('N','向內約束力','N'),M('E','機械能','J')],
 'θ̈ = −(g/R)sinθ；N = m(v²/R + g cosθ)', '雙面導軌拘束質點沿鉛直圓環運動，因此 N 可以為負（外向）。這不是可能鬆弛的繩圈；低速時會往返擺動。',['最高點和最低點的速率差由什麼決定？','如果改用繩子，哪一段會不再符合本模型？'],p=>integrated(12,[0,p.v/p.R],(_,s)=>[s[1],-p.g/p.R*Math.sin(s[0])],s=>{const a=s[0],w=s[1],v=p.R*w,y=p.R*(1-Math.cos(a)),N=p.m*(v*v/p.R+p.g*Math.cos(a));return{x:p.R*Math.sin(a),y:y+.3,vx:v*Math.cos(a),vy:v*Math.sin(a),speed:Math.abs(v),N,E:.5*p.m*v*v+p.m*p.g*y,fx:p.m*(-p.g*Math.sin(a)*Math.cos(a)-p.R*w*w*Math.sin(a)),fy:p.m*(-p.g*Math.sin(a)**2+p.R*w*w*Math.cos(a))}}));

add('torque','固定軸轉動與力矩','圓周與轉動','rotor',[mass,P('R','圓盤半徑',1,5,.5,3,'m'),P('F','切向力',-10,10,.5,3,'N')],[M('omega','角速度','rad/s'),M('alpha','角加速度','rad/s²'),M('torque','力矩','N·m')],
 'I = ½mR²；τ = FR；α = τ/I；ω = αt', '均勻圓盤固定軸旋轉，切向外力持續作用在邊緣。不計軸摩擦，初始靜止；觀察 6 秒。',['相同外力與質量，半徑加倍如何改變角加速度？','角速度增加時，角加速度是否也增加？'],p=>{const I=.5*p.m*p.R*p.R,alpha=p.F*p.R/I;return trajectory(6,t=>({x:0,y:1,theta:.5*alpha*t*t,omega:alpha*t,alpha,torque:p.F*p.R,K:.5*I*(alpha*t)**2}))});

add('rolling','斜面純滾動','圓周與轉動','rolling',[mass,P('R','半徑',.3,1,.1,.5,'m'),P('angle','斜面傾角',5,45,1,20,'°'),P('beta','慣量係數 I/(mR²)',.4,1,.1,.5),gravity],[M('speed','質心速率','m/s'),M('omega','角速度','rad/s'),M('E','機械能','J')],
 'a = g sinα/(1 + β)；ω = v/R；I = βmR²', '無滑動純滾動；β = 0.4 實心球、0.5 圓柱、1 薄環。假設靜摩擦足夠，位能零點為起始質心下降 12sinα 的位置。',['為什麼純滾動的靜摩擦不耗散機械能？','不同半徑但相同 β 的物體，誰先到坡底？'],p=>{const a=rad(p.angle),acc=p.g*Math.sin(a)/(1+p.beta),T=Math.sqrt(24/acc);return trajectory(T,t=>{const s=.5*acc*t*t,v=acc*t,K=.5*p.m*v*v*(1+p.beta),U=p.m*p.g*(12-s)*Math.sin(a);return{x:s*Math.cos(a)-5+p.R*Math.sin(a),y:(12-s)*Math.sin(a)+p.R*Math.cos(a),vx:v*Math.cos(a),vy:-v*Math.sin(a),speed:v,omega:v/p.R,theta:s/p.R,E:K+U,K,U,s,ax:acc,fx:p.m*acc*Math.cos(a),fy:-p.m*acc*Math.sin(a)}})});

add('lever','槓桿平衡與合力矩','圓周與轉動','lever',[P('m1','左側質量',.5,10,.5,2,'kg'),P('m2','右側質量',.5,10,.5,3,'kg'),P('L1','左側力臂',.5,4,.5,3,'m'),P('L2','右側力臂',.5,4,.5,2,'m'),gravity],[M('left','左側力矩大小','N·m'),M('right','右側力矩大小','N·m'),M('net','合力矩（逆時針正）','N·m')],
 'Στ = m₁gL₁ − m₂gL₂；平衡時 Στ = 0', '靜力學實驗，槓桿固定在水平位置以量測所需約束力矩；播放不會讓失衡槓桿自行旋轉。支點垂直支持力為 (m₁ + m₂)g。',['把較輕的重物放得更遠，能否平衡？','力矩平衡是否同時保證合力為零？'],p=>trajectory(1,()=>({x:0,y:3,left:p.m1*p.g*p.L1,right:p.m2*p.g*p.L2,net:p.g*(p.m1*p.L1-p.m2*p.L2),support:(p.m1+p.m2)*p.g})));

add('spring','彈簧簡諧運動','振動','spring',oscillation,[M('q','相對平衡位移','m'),M('vx','速度','m/s'),M('E','機械能','J')],
 'ω = √(k/m)；x = A cosωt；T = 2π√(m/k)', '水平光滑面，理想彈簧與質點，無阻尼；從最大伸長處靜止釋放。位能以平衡點為零。',['振幅加倍如何改變週期與總能量？','動能與位能各自在什麼位置最大？'],p=>{const w=Math.sqrt(p.k/p.m);return trajectory(Math.min(30,8*Math.PI/w),t=>{const x=p.A*Math.cos(w*t),v=-p.A*w*Math.sin(w*t),K=.5*p.m*v*v,U=.5*p.k*x*x;return{x,q:x,vx:v,fx:-p.k*x,K,U,E:K+U}})});

function oscillator(p,driven){const c=p.c,F=driven?p.F:0,w=driven?p.w:0;return integrated(20,[p.A,0],(t,s)=>[s[1],(-p.k*s[0]-c*s[1]+F*Math.cos(w*t))/p.m],(s,t)=>{const K=.5*p.m*s[1]**2,U=.5*p.k*s[0]**2;return{x:s[0],q:s[0],vx:s[1],fx:-p.k*s[0]-c*s[1]+F*Math.cos(w*t),K,U,E:K+U,drive:F*Math.cos(w*t)}})}
add('damped','阻尼振動','振動','spring',[...oscillation,P('c','阻尼係數',0,12,.2,1,'kg/s')],energyMetrics,
 'mẍ + cẋ + kx = 0；Ė = −cv²', '線性黏滯阻尼，初始速度為零。阻尼力與速度反向；可探索欠阻尼、臨界阻尼與過阻尼。',['臨界阻尼 c = 2√(mk) 時，回到平衡位置有何特色？','能量減少最快時，速度大小如何？'],p=>oscillator(p,false));
add('driven','受迫振動與共振','振動','spring',[...oscillation,P('c','阻尼係數',.2,8,.2,1,'kg/s'),P('F','驅動力振幅',0,10,.5,3,'N'),P('w','驅動角頻率',.2,6,.1,2,'rad/s')],[M('q','位移','m'),M('drive','瞬時驅動力','N'),M('E','機械能','J')],
 'mẍ + cẋ + kx = F₀ cosΩt；ω₀ = √(k/m)', '顯示初始暫態與持續驅動的合成運動。觀察 20 秒，不假定已達穩態；小阻尼時可看到拍頻與共振增幅。',['驅動頻率接近固有頻率時會發生什麼？','阻尼增大會如何改變共振峰？'],p=>oscillator(p,true));

add('pendulum','單擺與大角度擺動','振動','pendulum',[mass,P('L','擺長',1,8,.5,4,'m'),P('angle','初始擺角',5,100,1,35,'°'),gravity],[M('angle','擺角','°'),M('speed','速率','m/s'),M('E','機械能','J')],
 'θ̈ = −(g/L)sinθ；小角近似 T ≈ 2π√(L/g)', '由指定角度靜止釋放，採完整非線性方程；使用剛性無質量擺桿，因此大於 90° 時仍維持約束。忽略阻力與支點摩擦。',['大角度時週期是否仍與振幅無關？','擺球質量會影響週期嗎？'],p=>integrated(Math.min(30,8*Math.PI*Math.sqrt(p.L/p.g)),[rad(p.angle),0],(_,s)=>[s[1],-p.g/p.L*Math.sin(s[0])],s=>{const a=s[0],v=p.L*s[1],y=p.L*(1-Math.cos(a)),K=.5*p.m*v*v,U=p.m*p.g*y;return{x:p.L*Math.sin(a),y:y+1,vx:v*Math.cos(a),vy:v*Math.sin(a),angle:a*180/Math.PI,speed:Math.abs(v),K,U,E:K+U,fx:p.m*(-p.g*Math.sin(a)*Math.cos(a)-p.L*s[1]**2*Math.sin(a)),fy:p.m*(-p.g*Math.sin(a)**2+p.L*s[1]**2*Math.cos(a))}}));

add('orbit','萬有引力與軌道','萬有引力','orbit',[P('GM','重力參數 GM',20,300,10,100,'m³/s²'),P('R','初始距離',3,12,.5,6,'m'),P('ratio','初速／圓軌道速率',.65,1.6,.05,1)],[M('r','距中心距離','m'),M('energy','單位質量機械能','J/kg'),M('angular','單位質量角動量','m²/s')],
 'r̈ = −GM r/|r|³；v圓 = √(GM/r)；v逃逸 = √2 v圓', '教學尺度的中心力模型，GM 可調；中心天體視為質點，橘球為測試質點。固定時間步長 RK4，觀察至多兩個圓軌道週期（上限 60 秒）。初速沿 +z。',['何時形成圓、橢圓與逃逸軌道？','橢圓軌道靠近中心時為什麼會加速？'],p=>{const v=p.ratio*Math.sqrt(p.GM/p.R),T=Math.min(60,4*Math.PI*Math.sqrt(p.R**3/p.GM));return integrated(T,[p.R,0,0,v],(_,s)=>{const r=Math.hypot(s[0],s[1]),f=-p.GM/r**3;return[s[2],s[3],f*s[0],f*s[1]]},s=>{const r=Math.hypot(s[0],s[1]);return{x:s[0],z:s[1],y:1,vx:s[2],vz:s[3],fx:-p.GM*s[0]/r**3,fz:-p.GM*s[1]/r**3,r,energy:.5*(s[2]**2+s[3]**2)-p.GM/r,angular:s[0]*s[3]-s[1]*s[2]}},Math.min(1/240,.0015*Math.sqrt(p.R**3/p.GM)))});

add('collision-2d','二維偏心碰撞','能量與動量','collision2d',[P('m1','入射球質量',.5,8,.5,2,'kg'),P('m2','靜止球質量',.5,8,.5,2,'kg'),P('v','入射速率',1,8,.5,4,'m/s'),P('b','偏心距離',0,.9,.05,.5,'m'),P('e','恢復係數',0,1,.05,1)],[M('px','總 x 動量','kg·m/s'),M('pz','總 z 動量','kg·m/s'),M('K','總動能','J')],
 'J = (1 + e)(u相對 · n)/(1/m₁ + 1/m₂)；Δv₁ = −Jn/m₁；Δv₂ = Jn/m₂', '水平光滑面上的光滑球，各半徑 0.5 m；衝量只沿接觸法線，不產生自轉。入射球沿 +x，橫向偏心距離為 b。碰撞後再觀察 3 秒。',['相同質量的彈性偏心碰撞，兩個出射速度是否互相垂直？','偏心距離如何影響兩球分得的動能？'],p=>{const nx=Math.sqrt(1-p.b*p.b),nz=-p.b,hit=(4-nx)/p.v,J=(1+p.e)*p.v*nx/(1/p.m1+1/p.m2),a=[p.v-J*nx/p.m1,-J*nz/p.m1],b=[J*nx/p.m2,J*nz/p.m2];return trajectory(hit+3,t=>{const dt=Math.max(0,t-hit),before=t<hit,vx=before?p.v:a[0],vz=before?0:a[1],vx2=before?0:b[0],vz2=before?0:b[1];return{x:-4+p.v*Math.min(t,hit)+a[0]*dt,y:1,z:p.b+a[1]*dt,x2:b[0]*dt,z2:b[1]*dt,vx,vz,vx2,vz2,px:p.m1*vx+p.m2*vx2,pz:p.m1*vz+p.m2*vz2,K:.5*p.m1*(vx*vx+vz*vz)+.5*p.m2*(vx2*vx2+vz2*vz2)}},{events:[{t:hit,label:'偏心碰撞'}]})});

add('center-of-mass','質心與內力','能量與動量','pair-spring',[P('m1','左側質量',.5,8,.5,2,'kg'),P('m2','右側質量',.5,8,.5,3,'kg'),P('k','內部彈簧常數',1,20,.5,5,'N/m'),P('A','初始伸長量',.2,2,.1,1,'m'),P('v','質心初速',-2,2,.2,0,'m/s')],[M('com','質心位置','m'),M('momentum','總動量','kg·m/s'),M('E','總機械能','J')],
 'M ẍ質心 = F外 = 0；ω² = k(1/m₁ + 1/m₂)', '光滑水平軌道上兩物塊以無質量彈簧相連，原長 4 m；內力大小相等、方向相反。質心等速移動，即使兩塊持續振動。',['不相等質量的兩物塊，誰相對質心的振幅較大？','內力能否讓整個系統的質心加速？'],p=>{const M=p.m1+p.m2,w=Math.sqrt(p.k*(1/p.m1+1/p.m2));return trajectory(Math.min(20,8*Math.PI/w),t=>{const q=p.A*Math.cos(w*t),r=4+q,dr=-p.A*w*Math.sin(w*t),com=p.v*t,v1=p.v-p.m2/M*dr,v2=p.v+p.m1/M*dr,K=.5*p.m1*v1*v1+.5*p.m2*v2*v2,U=.5*p.k*q*q;return{x:com-p.m2/M*r,x2:com+p.m1/M*r,y:.5,vx:v1,v2,com,momentum:p.m1*v1+p.m2*v2,K,U,E:K+U,fx:p.k*q}})});

add('angular-momentum','收臂旋轉與角動量','圓周與轉動','skater',[P('m','每個手持物質量',.5,4,.5,1,'kg'),P('I','身體轉動慣量',1,8,.5,2,'kg·m²'),P('r0','初始臂長',.5,3,.1,2,'m'),P('r1','最後臂長',.5,3,.1,.6,'m'),P('w','初始角速度',.2,3,.1,1,'rad/s')],[M('inertia','總轉動慣量','kg·m²'),M('omega','角速度','rad/s'),M('angular','角動量','kg·m²/s')],
 'L = I總ω = 常數；I總 = I身體 + 2mr²', '水平無外力矩轉台，兩個手持物對稱移動。4 秒內以平滑曲線改變臂長，之後維持；角動量守恆。收臂由內部致動器作功，因此轉動動能可以增加。速度箭頭顯示手持物，整體合力為零。',['收臂時增加的動能從哪裡來？','若反過來伸臂，角速度會如何變化？'],p=>{const angular=(p.I+2*p.m*p.r0**2)*p.w,radius=t=>{const f=clamp(t/4,0,1);return p.r0+(p.r1-p.r0)*(3*f*f-2*f*f*f)};return integrated(8,[0],(t)=>[angular/(p.I+2*p.m*radius(t)**2)],(s,t)=>{const r=radius(t),inertia=p.I+2*p.m*r*r,omega=angular/inertia;return{x:0,y:1,theta:s[0],radius:r,rdot:t<4?(p.r1-p.r0)*(6*(t/4)-6*(t/4)**2)/4:0,inertia,omega,angular,K:.5*inertia*omega*omega}})});

add('massive-pulley','有轉動慣量的滑輪','圓周與轉動','massive-pulley',[P('m1','左側質量',.5,8,.5,2,'kg'),P('m2','右側質量',.5,8,.5,3,'kg'),P('mp','滑輪質量',.5,8,.5,2,'kg'),P('R','滑輪半徑',1,2,.1,1.5,'m'),gravity],[M('a','左側向上加速度','m/s²'),M('T1','左側張力','N'),M('T2','右側張力','N')],
 'I = ½M滑輪R²；a = (m₂ − m₁)g/(m₁ + m₂ + I/R²)；(T₂ − T₁)R = Iα', '均勻圓盤滑輪，繩不打滑且無質量；軸無摩擦。兩側張力一般不同。任一側由靜止移動 3 m 後停止；圓盤標線顯示轉角。',['為什麼有慣量的滑輪兩側張力不相等？','固定滑輪質量，改變半徑為何不改變線加速度？'],p=>{const a=(p.m2-p.m1)*p.g/(p.m1+p.m2+.5*p.mp),T=Math.abs(a)>1e-10?Math.sqrt(6/Math.abs(a)):8;return trajectory(T,t=>({x:-p.R,y:4+.5*a*t*t,x2:p.R,y2:4-.5*a*t*t,vy:a*t,a,T1:p.m1*(p.g+a),T2:p.m2*(p.g-a),theta:.5*a*t*t/p.R,s:.5*a*t*t,fy:p.m1*a}))});

add('bungee','高空彈跳','振動','bungee',[
 P('h','跳台高度',20,140,5,80,'m'),P('L','繩索原長',5,60,1,25,'m'),
 P('m','跳躍者質量',40,120,5,70,'kg'),P('k','繩索彈性係數',20,200,5,90,'N/m'),
 P('c','繩索阻尼係數',0,120,5,35,'kg/s'),gravity
],[M('y','離地高度','m'),M('vy','鉛直速度','m/s'),M('tension','繩索張力','N')],
 '伸長量 e = max(0, h − y − L)；拉緊時 T = max(0, ke − cvᵧ)；mÿ = T − mg',
 '由跳台靜止落下，y 軸向上。繩索鬆弛時張力為零；伸長後採彈性與黏滯阻尼，繩索只能拉、不能推。人物以腳踝繩索連接點的質點計算，忽略空氣阻力、繩重及人體姿態。觀察 30 秒，若連接點抵達地面則在接觸前瞬間停止。人物大小僅為示意。',
 ['繩索拉直時，速度會立刻變成零嗎？','固定繩長與質量，增加彈性係數或阻尼，最低點和反彈幅度如何改變？'],p=>{
  const tension=(y,v)=>{const e=p.h-y-p.L;return e>=0?Math.max(0,p.k*e-p.c*v):0},taut=Math.sqrt(2*p.L/p.g);
  const stretched=integrated(30-taut,[p.h-p.L,-p.g*taut],(_,s)=>[s[1],tension(s[0],s[1])/p.m-p.g],s=>{
   const extension=Math.max(0,p.h-s[0]-p.L),T=tension(s[0],s[1]),K=.5*p.m*s[1]**2,U=p.m*p.g*s[0]+.5*p.k*extension**2;
   return{y:s[0],vy:s[1],fy:T-p.m*p.g,tension:T,extension,drop:p.h-s[0],K,U,E:K+U};
  });
  const motion=trajectory(30,t=>t<taut?{y:p.h-.5*p.g*t*t,vy:-p.g*t,fy:-p.m*p.g,tension:0,extension:0,drop:.5*p.g*t*t,K:.5*p.m*(p.g*t)**2,U:p.m*p.g*(p.h-.5*p.g*t*t),E:p.m*p.g*p.h}:stretched.sample(t-taut));
  let duration=30,contact=false;
  for(let i=1;i<=7200;i++){const time=i/240;if(motion.sample(time).y<=0){let lo=(i-1)/240,hi=time;for(let j=0;j<40;j++){const mid=(lo+hi)/2;if(motion.sample(mid).y>0)lo=mid;else hi=mid}duration=(lo+hi)/2;contact=true;break}}
  const events=[],markers=[],elasticHeight=p.h-p.L-p.m*p.g/p.k;
  function mark(key,time,label,color){const y=Math.max(0,motion.sample(time).y),event={key,t:time,y,label,color};events.push(event);markers.push(event);return event}
  function crossing(fn,start,direction){if(start>=duration)return null;let a=start,fa=fn(motion.sample(a));for(let b=Math.min(start+1/120,duration);b<=duration;b=Math.min(b+1/120,duration)){const fb=fn(motion.sample(b));if((direction>0?fa< -1e-7&&fb>1e-7:fa>1e-7&&fb< -1e-7)){let lo=a,hi=b;for(let j=0;j<40;j++){const mid=(lo+hi)/2,f=fn(motion.sample(mid));if(direction*f>0)hi=mid;else lo=mid}return(lo+hi)/2}if(Math.abs(fb)>1e-7){a=b;fa=fb}if(b===duration)break}return null}
  if(taut<=duration){
   mark('taut',taut,'繩索首次拉直','#416e8c');
   const elastic=crossing(s=>p.k*s.extension-p.m*p.g,taut,1);
   if(elastic!==null)mark('elastic',elastic,p.c===0?'彈力＝重力／合力為零':'彈力＝重力（未含阻尼）','#168579');
   if(p.c>0){const up=crossing(s=>s.fy,taut+1e-6,1),down=crossing(s=>s.fy,taut+1e-6,-1),balance=up===null?down:down===null?up:Math.min(up,down);if(balance!==null&&Math.abs(motion.sample(balance).fy)<.001)mark('balance',balance,'繩索總拉力＝重力／合力為零','#8b5ac4')}
   const low=crossing(s=>s.vy,taut,1);if(low!==null){mark('lowest',low,'首次最低點（速度為零）','#b76b26');const high=crossing(s=>s.vy,low+1e-5,-1);if(high!==null)mark('rebound',high,'首次反彈最高點','#a65073')}
  }
  if(contact)mark('ground',duration,'抵達地面，停止模擬','#a74739');events.sort((a,b)=>a.t-b.t);
  return trajectory(duration,t=>{const s=motion.sample(t);return{...s,y:Math.max(0,s.y)}},{events,markers,elasticHeight,endLabel:contact?'已抵達地面 · 接觸前瞬間':'觀察結束 · 30 秒'});
 });

const api={defs,G,defaults:d=>Object.fromEntries(d.params.map(p=>[p.id,p.value])),integrated};
if(typeof module!=='undefined'&&module.exports)module.exports=api;root.Mechanics=api;
})(typeof globalThis!=='undefined'?globalThis:this);
