/* Additional mechanics topics; independent of UI. */
(function(M){
'use strict';
const {P,M:metric,trajectory,G}=M.helpers,add=(...args)=>M.register(...args,'models/extended-mechanics.js');
// Jacobi diagonalization of the mass-weighted, symmetric stiffness matrix.
// This yields exact modal evolution for the discretized linear spring model.
function springModes(masses,stiffness,initial){
 const n=masses.length,A=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>stiffness[i][j]/Math.sqrt(masses[i]*masses[j]))),V=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>+(i===j)));
 for(let it=0;it<100*n*n;it++){let p=0,q=1,max=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(A[i][j])>max){max=Math.abs(A[i][j]);p=i;q=j}if(max<1e-11)break;
  const phi=.5*Math.atan2(2*A[p][q],A[q][q]-A[p][p]),c=Math.cos(phi),s=Math.sin(phi),app=A[p][p],aqq=A[q][q],apq=A[p][q];
  for(let i=0;i<n;i++)if(i!==p&&i!==q){const aip=A[i][p],aiq=A[i][q];A[i][p]=A[p][i]=c*aip-s*aiq;A[i][q]=A[q][i]=s*aip+c*aiq}
  A[p][p]=c*c*app-2*s*c*apq+s*s*aqq;A[q][q]=s*s*app+2*s*c*apq+c*c*aqq;A[p][q]=A[q][p]=0;
  for(let i=0;i<n;i++){const a=V[i][p],b=V[i][q];V[i][p]=c*a-s*b;V[i][q]=s*a+c*b}
 }
 const omega=A.map((r,i)=>Math.sqrt(Math.max(0,r[i]))),amplitudes=omega.map((_,j)=>initial.reduce((sum,u,i)=>sum+V[i][j]*Math.sqrt(masses[i])*u,0));
 return{omega:omega.slice().sort((a,b)=>a-b),sample(t){const u=Array(n).fill(0),v=Array(n).fill(0);for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=V[i][j]*amplitudes[j]/Math.sqrt(masses[i]);u[i]+=a*Math.cos(omega[j]*t);v[i]-=a*omega[j]*Math.sin(omega[j]*t)}return{u,v}}};
}
add('massive-spring','有質量彈簧的振動','振動','massive-spring',[
 P('m','末端物塊質量',.5,8,.5,2,'kg'),P('ms','彈簧總質量',.2,6,.2,2,'kg'),P('k','整根彈簧常數',4,30,.5,10,'N/m'),P('A','初始伸長量',.2,1.5,.1,1,'m')
],[metric('q','末端位移','m'),metric('period','基頻週期','s'),metric('E','總機械能','J')],
 '分布彈簧：M ü + K u = 0；小彈簧質量近似 T ≈ 2π√[(m + mₛ/3)/k]',
 '水平光滑面，原長 4 m。用 12 段彈簧與質量集總有限元素描述分布慣性，各段剛度為 12k；末端節點含半段彈簧質量及物塊。由均勻拉伸後靜止釋放，以正規模態精確演化離散模型，能觀察各段變形與高頻成分。顯示的週期為最低模態週期，不假設只有單一頻率；mₛ/3 公式只供小質量比較。',
 ['彈簧質量增加時，週期為什麼變長？','末端與彈簧各段的速度是否相同？何時可用 mₛ/3 近似？'],p=>{
  const n=12,masses=Array(n).fill(p.ms/n);masses[n-1]=p.m+p.ms/(2*n);const K=Array.from({length:n},()=>Array(n).fill(0)),k=n*p.k;
  for(let i=0;i<n;i++){K[i][i]=i===n-1?k:2*k;if(i<n-1)K[i][i+1]=K[i+1][i]=-k}
  const modal=springModes(masses,K,Array.from({length:n},(_,i)=>p.A*(i+1)/n)),period=2*Math.PI/modal.omega[0];
  return trajectory(Math.min(30,4*period),t=>{const {u,v}=modal.sample(t),nodes=[0,...u],nodeSpeeds=[0,...v],kinetic=v.reduce((sum,w,i)=>sum+.5*masses[i]*w*w,0),potential=u.reduce((sum,x,i)=>sum+.5*k*(x-(i?u[i-1]:0))**2,0);return{x:u[n-1],y:.5,vx:v[n-1],fx:-k*(u[n-1]-u[n-2]),q:u[n-1],period,approxPeriod:2*Math.PI*Math.sqrt((p.m+p.ms/3)/p.k),K:kinetic,U:potential,E:kinetic+potential,nodes,nodeSpeeds}},{modes:modal.omega});
 });

add('bicycle-friction','腳踏車前後輪的摩擦力','圓周與轉動','bicycle',[
 P('m','人車總質量（含輪）',50,100,5,70,'kg'),P('mw','每輪質量',1,4,.5,2,'kg'),P('R','輪半徑',.25,.45,.01,.35,'m'),P('beta','輪慣量係數 I/(m輪R²)',.5,1,.1,1),P('drive','後輪驅動力矩',0,40,2,20,'N·m'),P('frontBrake','前輪煞車力矩',0,30,2,0,'N·m'),P('rearBrake','後輪煞車力矩',0,30,2,0,'N·m'),P('v','初始前進速率',0,8,.5,3,'m/s')
],[metric('frontF','前輪摩擦力（向前正）','N'),metric('rearF','後輪摩擦力（向前正）','N'),metric('ax','全車加速度','m/s²')],
 'I = βm輪R²；a = (τ驅 − τ後煞 − τ前煞)/[R(M + 2I/R²)]；f前 = −τ前煞/R − Ia/R²；f後 = (τ驅 − τ後煞)/R − Ia/R²',
 '後輪驅動、兩輪純滾動，正方向向右／向前。各輪摩擦力由平動與轉動方程共同決定，不是直接設成速度反向。假設靜摩擦充足且兩輪維持接觸；不計空氣與滾動阻力，未模擬鎖死、打滑或翻車。減速到零即停止，不倒退；初始靜止且煞車足夠時，煞車力矩按設定比例縮減到剛好平衡驅動。理想等速滑行且無驅動／煞車時，兩輪摩擦力為零。輪下箭頭僅表方向，力值以 N 標示。',
 ['踩踏加速時，前輪與後輪摩擦力為什麼可能相反？','只煞前輪或只煞後輪時，另一輪的摩擦力是否一定向後？'],p=>{
  const inertia=p.beta*p.mw*p.R*p.R,torque=p.drive-p.frontBrake-p.rearBrake,a=torque/(p.R*(p.m+2*inertia/p.R**2)),held=p.v===0&&a<=0,T=a<0&&!held?Math.min(4,-p.v/a):4;
  return trajectory(T,t=>{const v=held?0:p.v+a*t,x=held?0:p.v*t+.5*a*t*t,staticFront=p.frontBrake+p.rearBrake?p.drive*p.frontBrake/(p.frontBrake+p.rearBrake):0,frontF=held?-staticFront/p.R:-p.frontBrake/p.R-inertia*a/p.R**2,rearF=held?staticFront/p.R:(p.drive-p.rearBrake)/p.R-inertia*a/p.R**2;return{x,y:p.R,vx:Math.max(0,v),fx:frontF+rearF,ax:held?0:a,frontF,rearF,omega:Math.max(0,v)/p.R,theta:x/p.R,K:.5*(p.m+2*inertia/p.R**2)*v*v,held:+held}},{endLabel:a<0&&!held&&T<4?'已煞停 · 停止前瞬間':'觀察結束'});
 });
M.springModes=springModes;
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
