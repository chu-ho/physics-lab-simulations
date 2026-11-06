(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers,TAU=2*Math.PI,D=Math.PI/180,YEAR=365.2422;
const dot=(a,b)=>a.reduce((s,v,j)=>s+v*b[j],0),add=(a,b)=>a.map((v,j)=>v+b[j]),scale=(a,k)=>a.map(v=>v*k);
function daylight(lat,dec){const a=Math.sin(lat)*Math.sin(dec),b=Math.cos(lat)*Math.cos(dec);if(Math.abs(b)<1e-14)return Math.abs(a)<1e-14?12:a>0?24:0;const c=-a/b;return c<=-1?24:c>=1?0:24*Math.acos(c)/Math.PI;}
M.SunEarth={daylight,YEAR};
M.register('sun-earth','日地運動：地軸、晝夜與四季','天文','sun-earth',[
P('day','起始日期：春分後天數',0,365,1,91,'天'),P('hour','起始觀測地太陽時',0,24,.25,12,'h'),P('latitude','觀測地緯度（北為正）',-90,90,1,25,'°'),P('tilt','地軸傾角',0,45,.01,23.44,'°'),P('speed','播放：0兩天／1一年',0,1,1,1),{...P('view','視圖：0公轉全景／1地球日照近景',0,1,1,0),visual:true,refit:true},{...P('guides','顯示地軸、赤道與緯線',0,1,1,1),visual:true}
],[metric('day','春分後天數','天'),metric('declination','太陽赤緯','°'),metric('daylight','白晝長度','h')],
'δ=asin(sinε sinλ☉)；cosH₀=−tanφ tanδ；白晝=24H₀/π；sin高度=sinφ sinδ+cosφ cosδ cosH',
'理想圓軌道與等速自轉；春分為第0天，一年365.2422天；0兩天模式為60播放秒走2天，1一年模式為60播放秒走一年。這是幾何教學模型，日期是春分後的相位，不是精密曆日或星曆。地軸在慣性空間保持固定方向；每平均太陽日自轉1+1/365.2422圈，相對恆星一年比太陽日多轉一圈。起始太陽時定義觀測經線，後續顯示幾何真太陽時。球面日照使用平行光，不含折射、太陽有限角直徑、黃昏或地形，極圈切線日視為臨界值。地球半徑與軌道距離分開放大，地表色塊是經緯網而非真實大陸；四季源於地軸傾斜與日照角度、晝長，不是此圓軌道的距離變化。NASA來源：science.nasa.gov/earth/earth-observatory/an-epic-view-of-the-seasons/；science.nasa.gov/wp-content/uploads/2023/10/Arctic-Seasons-Model-Activity.pdf。',
['零傾角時，赤緯與各地白晝如何改變？','南北半球的夏季為何相反？','切換近景，觀察觀測地何時穿過晝夜界線。'],p=>{
const eps=p.tilt*D,axis=[Math.sin(eps),Math.cos(eps),0],e1=[Math.cos(eps),-Math.sin(eps),0],e2=[0,0,-1],rate=p.speed?YEAR/60:1/30,R=7,r=1.1,lat=p.latitude*D;
function orbit(day){const l=Math.PI/2+TAU*day/YEAR;return{center:[R*Math.cos(l),0,R*Math.sin(l)],sun:[-Math.cos(l),0,-Math.sin(l)]};}
const start=orbit(p.day),theta0=Math.atan2(dot(start.sun,e2),dot(start.sun,e1))+(p.hour-12)*Math.PI/12;
function geometry(t){const advance=rate*t,day=p.day+advance,q=orbit(day),theta=theta0+TAU*(1+1/YEAR)*advance,normal=(phi,longitude)=>add(scale(axis,Math.sin(phi)),scale(add(scale(e1,Math.cos(theta+longitude)),scale(e2,Math.sin(theta+longitude))),Math.cos(phi))),observer=normal(lat,0),dec=Math.asin(dot(axis,q.sun)),alt=Math.asin(Math.max(-1,Math.min(1,dot(observer,q.sun)))),ra=Math.atan2(dot(q.sun,e2),dot(q.sun,e1)),hour=((12+(theta-ra)*12/Math.PI)%24+24)%24;return{...q,theta,normal,observer,dec,alt,hour,day,advance,light:daylight(lat,dec)};}
const sim=trajectory(60,t=>{const q=geometry(t),v=TAU*rate/YEAR;return{x:q.center[0],y:0,z:q.center[2],vx:-q.center[2]*v,vz:q.center[0]*v,day:((q.day%YEAR)+YEAR)%YEAR,elapsedDays:q.advance,declination:q.dec/D,daylight:q.light,altitude:q.alt/D,solarHour:q.hour,lit:q.alt>0?1:0,distanceAU:1};},{hidePrimary:true,hideGrid:()=>true,hideFloor:true,minimumSceneScale:2,schematic:true,geometry,axis,e1,e2,R,r,rate,get bounds(){return p.view?{min:[-2,-2,-2],max:[2,2,2]}:{min:[-9,-3,-9],max:[9,3,9]};},scaleNote:'太陽、地球半徑與公轉距離分開放大；日照角度採平行光幾何。',endLabel:p.speed?'一個理想年完成':'兩個太陽日完成'});
Object.defineProperty(sim,'bounds',{get:()=>p.view?{min:[-2.2,-2.2,-1.4],max:[2.2,2.2,1.4]}:{min:[-9,-3,-9],max:[9,3,9]}});sim.displayPoint=s=>p.view?[0,0,0]:[s.x,s.y,s.z];
sim.plotAxis={key:'elapsedDays',label:'經過天數',unit:'天'};
sim.positionPlot={min:0,max:YEAR,key:'day',label:'春分後天數',unit:'天',title:'四季與白晝長度',yUnit:'h',series:[{label:'觀測緯度白晝長度',color:'#d59c45',value:day=>daylight(lat,Math.asin(Math.sin(eps)*Math.sin(TAU*day/YEAR)))}]};return sim;
},'models/sun-earth.js');const d=M.defs.find(d=>d.id==='sun-earth');d.initialView={yaw:-.7,pitch:.55};d.plotMetrics=[metric('altitude','觀測地太陽高度','°'),metric('solarHour','觀測地真太陽時','h'),metric('elapsedDays','經過天數','天')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
