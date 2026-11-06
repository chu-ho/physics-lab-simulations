(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers,TAU=2*Math.PI,SIDEREAL=27.321661,YEAR=365.25636,SYNODIC=1/(1/SIDEREAL-1/YEAR);
M.MoonEarth={SIDEREAL,YEAR,SYNODIC};
M.register('moon-earth','月地運動與月相','天文','moon-earth',[
P('startDay','開始日數（以朔為 0）',0,60,.1,0,'日'),P('inclination','月球軌道對黃道傾角',0,15,.1,5.1,'°'),P('node','升交點方向',0,360,1,0,'°'),P('days','觀察日數',30,90,1,60,'日'),{...P('guides','軌道與方向標記',0,1,1,1),visual:true}
],[metric('day','經過日數','日'),metric('illuminated','地球所見亮面比例','%'),metric('phaseAngle','月球相位角','°')],
'P恆星=27.321661 日；1/P會合=1/P恆星−1/P年；亮面比例=(1+cos α)/2；同步自轉角速度=公轉角速度',
'地心慣性座標、圓軌道與平行日光的教學模型；月球公轉及自轉同速，紅色表面標記始終朝地球。日光方向因地球年度公轉緩慢轉動，所以回到同一恆星方向約27.32日，月相週期約29.53日。1秒動畫代表1日，開始日數可移動觀察區間。傾角不為0時，日數0不必恰好全暗；黃道交點預設在初始方向，忽略偏心、天平動與交點進動。球體與地月距離不按比例；亮暗來自日光照射，不是地球遮擋；本模型不計日月蝕。下方獨立月相圖以北黃道極為上，非特定地點的地平視角。NASA資料：https://science.nasa.gov/moon/moon-phases/ 與 https://science.nasa.gov/moon/facts/',
['月球若完全不自轉，紅色標記還能持續朝向地球嗎？','為何27.32日後還沒有回到原本的月相？','新月與滿月時，月球朝向地球的一面是否相同？'],p=>{
const i=p.inclination*Math.PI/180,N=p.node*Math.PI/180,R=5,H=3,rot=(a)=>[Math.cos(N)*Math.cos(a)-Math.sin(N)*Math.sin(a)*Math.cos(i),Math.sin(a)*Math.sin(i),Math.sin(N)*Math.cos(a)+Math.cos(N)*Math.sin(a)*Math.cos(i)],normal=[Math.sin(N)*Math.sin(i),Math.cos(i),-Math.cos(N)*Math.sin(i)];
const sim=trajectory(p.days,t=>{const day=p.startDay+t,a=TAU*day/SIDEREAL-N,sunAngle=TAU*day/YEAR,u=rot(a),tangent=rot(a+Math.PI/2),sun=[Math.cos(sunAngle),0,Math.sin(sunAngle)],cosAlpha=-u.reduce((v,c,j)=>v+c*sun[j],0),phaseAngle=Math.acos(Math.max(-1,Math.min(1,cosAlpha)))*180/Math.PI;return{day,x:R*u[0],y:H+R*u[1],z:R*u[2],vx:R*TAU/SIDEREAL*tangent[0],vy:R*TAU/SIDEREAL*tangent[1],vz:R*TAU/SIDEREAL*tangent[2],ux:u[0],uy:u[1],uz:u[2],sx:sun[0],sy:0,sz:sun[2],phaseAngle,illuminated:50*(1+cosAlpha),orbitAngle:(TAU*day/SIDEREAL)%(TAU),spinAngle:(TAU*day/SIDEREAL)%(TAU),sidereal:SIDEREAL,synodic:SYNODIC};},{hidePrimary:true,hideGrid:()=>true,hideFloor:true,minimumSceneScale:7,scaleNote:'天文示意座標，球體與地月距離非同比例；1秒動畫代表1日，不使用通用力與速度箭頭。',bounds:{min:[-5.6,-1.1,-5.6],max:[7.8,8.6,5.6]},orbit:rot,normal,center:[0,H,0],plotAxis:{label:'動畫時間（1秒代表1日）',unit:'s'},endLabel:'觀察完成'});return sim;
},'models/moon-earth.js');const d=M.defs.find(d=>d.id==='moon-earth');d.initialView={yaw:-.5,pitch:.48};d.plotMetrics=[metric('sidereal','恆星月','日'),metric('synodic','會合月','日'),metric('orbitAngle','公轉角（慣性）','rad'),metric('spinAngle','自轉角（慣性）','rad')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);


