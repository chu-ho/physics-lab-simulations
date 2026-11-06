/* Plane pressure pulse reflected by a stationary wall. SI propagation; envelope audio illustration. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('echo','山壁與回聲','聲音','echo',[
P('distance','人與山壁距離',2,150,1,60,'m'),P('temperature','氣溫',-10,40,1,20,'°C'),P('duration','原聲持續時間',.02,.4,.01,.1,'s'),P('threshold','辨識間隔（教學近似）',.05,.2,.01,.1,'s'),P('reflection','壓力反射振幅比',0,1,.05,.8),P('frequency','發聲頻率',200,1000,20,440,'Hz'),P('volumeGain','音量',0,100,1,60,'%'),{...P('wavefronts','顯示聲波波前',0,1,1,1),visual:true},{...P('packets','顯示原聲／回聲脈衝',0,1,1,1),visual:true}
],[metric('delay','回聲往返時間','s'),metric('gap','兩段聲音空隙','s'),metric('returnLevel','回聲反射能量比','%')],
'c=√(γRT/M)；Δt=2d/c；回聲能量比=r²',
'均勻乾空氣、一維平面聲波、靜止山壁、只計一次反射；忽略空氣吸收、球面擴散和繞射。壓力反射振幅比r≥0，回聲能量比r²不增能。原聲為正弦純音的有限平滑脈衝，往返延遲嚴格為2d/c。空隙=往返時間−原聲時長；以空隙大於設定辨識間隔作為保守教學判準，並非人耳通用閾值。重疊時可能混合／干涉，實際可辨性依音色、音量與環境而異。本模型音訊將延遲包絡相加並固定除以2防止過載，示意原聲與回聲時序，不模擬相干聲波相消。圖形波前僅抽樣顯示包絡，非逐個440Hz波峰；橫軸標記為真實公尺，場景按距離等比縮放。',
['山壁距離減半，回聲返回時間如何改變？','短促發聲和長聲在相同距離下，能否分開聽見？'],p=>{
const c=M.Acoustics.soundSpeed(p.temperature),d=p.distance,D=p.duration,delay=2*d/c,scale=10/d,end=delay+D+.35;
const envelope=t=>t<=0||t>=D?0:Math.sin(Math.PI*t/D)**2;
const pressure=(x,t)=>envelope(t-x/c)*Math.cos(2*Math.PI*p.frequency*(t-x/c))+p.reflection*envelope(t-(2*d-x)/c)*Math.cos(2*Math.PI*p.frequency*(t-(2*d-x)/c));
const events=[{t:0,label:'發聲開始'},{t:D,label:'原聲結束'},{t:d/c,label:'波前抵達山壁'},{t:delay,label:'回聲波前返回'},{t:delay+D,label:'回聲結束'}].sort((a,b)=>a.t-b.t);
return trajectory(end,t=>{const outgoing=envelope(t),returning=p.reflection*envelope(t-delay),distanceTravelled=c*t,front=distanceTravelled<=d?distanceTravelled:distanceTravelled<=2*d?2*d-distanceTravelled:0,velocity=distanceTravelled<d?c:distanceTravelled<2*d?-c:0;
return{x:front,y:0,z:0,vx:velocity,vy:0,fx:0,fy:0,delay,gap:delay-D,returnLevel:100*p.reflection*p.reflection,soundSpeed:c,outgoing,returning,audioGain:p.volumeGain/200*(outgoing+returning),echoPressure:pressure(0,t),frequency:p.frequency,overlap:delay<D?1:0,distinct:delay-D>=p.threshold?1:0,wallArrival:d/c,front,stage:t<delay?'聲音傳播中':t<delay+D?'回聲返回':'回聲結束'};},{hidePrimary:true,hideGrid:()=>true,minimumSceneScale:13,bounds:{min:[-1,-1.6,-2],max:[11,4.5,2]},displayPoint:s=>[s.x*scale,s.y*scale,s.z*scale],envelope,pressure,c,d,delay,scale,pulseDuration:D,events,audio:(s,q)=>({frequency:s.frequency,gain:s.audioGain,type:'sine'}),endLabel:'回聲觀察結束',scaleNote:'距離依真實公尺標註；波前為包絡抽樣示意，時序採SI，音訊不模擬重疊時的相干相消。'});
},'models/echo.js');M.defs.find(d=>d.id==='echo').defaultPlotMetric='returning';M.defs.find(d=>d.id==='echo').plotMetrics=[metric('outgoing','耳邊原聲包絡',''),metric('returning','耳邊回聲包絡',''),metric('audioGain','音訊包絡（非相干）','')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
