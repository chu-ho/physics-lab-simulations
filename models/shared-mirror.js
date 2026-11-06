/* Self-view in a finite vertical plane mirror; ideal geometric optics. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('shared-mirror','兩人同鏡：全身像與最小鏡高','幾何光學','shared-mirror',[
P('height1','甲身高',100,220,1,180,'cm'),P('eye1','甲眼高／身高',75,98,1,90,'%'),P('distance1','甲離鏡距離',.5,5,.1,2,'m'),P('height2','乙身高',100,220,1,160,'cm'),P('eye2','乙眼高／身高',75,98,1,90,'%'),P('distance2','乙離鏡距離',.5,5,.1,2,'m'),P('bottom','鏡底高度',0,150,1,70,'cm'),P('mirrorHeight','鏡面高度',20,180,1,110,'cm'),{...P('rays','顯示頭腳光路',0,1,1,1),visual:true},{...P('required','顯示所需鏡面區間',0,1,1,1),visual:true}
],[metric('minimumHeight','共用最小鏡高','m'),metric('minimumBottom','最佳鏡底高度','m'),metric('fullCount','可見自己全身的人數','')],
'y鏡=(y眼+y物)/2；共用區間=[min(y眼/2), max((y眼+身高)/2)]',
'兩人各自觀察自己的像，身體以同一垂直線段代表，鏡面寬度足以涵蓋兩人；不計兩人互相遮擋、身體厚度與頭部視野限制。眼高以身高百分比設定。各自看腳及頭頂的反射點分別是眼高的一半及眼高與身高的平均，因此所需鏡高與離鏡距離無關。兩人共用最小連續鏡面是兩個所需區間的聯集外包區間；最小鏡高只有在適當高度安裝時才足夠。鏡後人物是虛像，虛線是延長線，不是光穿過鏡面。時間只用於慢放光路示意，非真實光速。',
['離鏡遠近會改變看見全身所需的鏡高嗎？','兩人的眼高不同，鏡面應裝在哪裡？'],p=>{
const bottom=p.bottom/100,top=bottom+p.mirrorHeight/100,persons=[1,2].map((j)=>{const height=p['height'+j]/100,eye=height*p['eye'+j]/100,x=p['distance'+j],z=j===1?-.65:.65,low=eye/2,high=(eye+height)/2;return{height,eye,x,z,low,high,full:bottom<=low+1e-12&&top>=high-1e-12,visibleLow:Math.max(0,2*bottom-eye),visibleHigh:Math.min(height,2*top-eye),paths:[0,height].map(y=>({object:[x,y,z],image:[-x,y,z],hit:[0,(eye+y)/2,z],visible:(eye+y)/2>=bottom-1e-12&&(eye+y)/2<=top+1e-12}))};});
const minimumBottom=Math.min(...persons.map(q=>q.low)),minimumTop=Math.max(...persons.map(q=>q.high)),minimumHeight=minimumTop-minimumBottom;
return trajectory(4,t=>({x:0,y:1,z:0,minimumHeight,minimumBottom,minimumTop,fullCount:persons.filter(q=>q.full).length,phase:t/4}),{hidePrimary:true,hideGrid:()=>true,persons,bottom,top,bounds:{min:[-Math.max(p.distance1,p.distance2)-.4,0,-1.5],max:[Math.max(p.distance1,p.distance2)+.4,Math.max(top,2.2)+.5,1.5]},scaleNote:'甲乙各自看自己的全身像；所需鏡高與離鏡距離無關。',events:[{t:0,label:'頭與腳的反射點決定所需鏡面區間'}],endLabel:'光路示意完成'});
},'models/shared-mirror.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
