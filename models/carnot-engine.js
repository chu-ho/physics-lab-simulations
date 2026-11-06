'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  M.register('carnot-engine', '卡諾熱機：可逆循環與效率', '熱學', 'carnot-engine', [
 P('hot','熱源溫度',400,650,5,500,'K'),P('cold','冷源溫度',240,350,5,300,'K'),
 P('ratio','等溫膨脹體積比',1.2,3,.1,2),
 P('amount','氣體物質量',.05,.25,.01,.1,'mol')
 ],[metric('pressure','壓力','kPa'),metric('work','累積淨作功','J'),metric('efficiency','卡諾效率','%')],
 'PV = nRT · 可逆絕熱 TV^(γ−1) 固定 · η = 1−T冷/T熱',
 '理想氣體採 γ=1.4。兩段等溫與兩段絕熱均為可逆準靜態過程。各段播放時間等長。熱流入、氣體對外作功記為正。',
 ['改變溫差，觀察效率及循環面積。','固定兩熱源溫度並改變膨脹比，比較淨作功與效率。'],p=>{
   const nR=p.amount*8.314462618;
   const gamma=1.4;
   const volumeA=2,volumeB=volumeA*p.ratio;
   const adiabaticRatio=(p.hot/p.cold)**(1/(gamma-1));
   const volumeC=volumeB*adiabaticRatio,volumeD=volumeA*adiabaticRatio;
   const heatIn=nR*p.hot*Math.log(p.ratio);
   const heatOut=nR*p.cold*Math.log(p.ratio);
   const stages=['高溫等溫膨脹','絕熱膨脹','低溫等溫壓縮','絕熱壓縮'];
   const stateAt=t=>{
     const stage=Math.min(3,Math.floor(t/3));
     const fraction=t/3-stage;
     const volumes=[volumeA,volumeB,volumeC,volumeD,volumeA];
     const volume=volumes[stage]*(volumes[stage+1]/volumes[stage])**fraction;
     const temperature=stage===0?p.hot:stage===1?p.hot*(volumeB/volume)**(gamma-1):stage===2?p.cold:p.cold*(volumeD/volume)**(gamma-1);
     const heat=stage===0?heatIn*fraction:stage===1?heatIn:stage===2?heatIn-heatOut*fraction:heatIn-heatOut;
     const internalChange=nR*(temperature-p.hot)/(gamma-1);
     return {volume,temperature,pressure:nR*temperature/volume,heat,internalChange,work:heat-internalChange,
       efficiency:100*(1-p.cold/p.hot),stage:stages[stage]};
   };
   const curve=Array.from({length:97},(_,i)=>stateAt(i/8));
   return trajectory(12,stateAt,{curve,heatIn,heatOut,hidePrimary:true,hideFloor:true,schematic:true,
     bounds:{min:[-4,0,-1],max:[4,5,1]},
     events:[{t:3,label:stages[1]},{t:6,label:stages[2]},{t:9,label:stages[3]}]
   });
 }, 'models/carnot-engine.js');
  M.defs.at(-1).plotMetrics=[
    metric('volume','體積','L'),metric('temperature','氣體溫度','K'),
    metric('heat','累積淨吸熱','J'),metric('internalChange','內能變化','J')
  ];
})(globalThis.Mechanics);
