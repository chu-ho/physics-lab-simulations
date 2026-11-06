'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  M.register('optical-polarizers','偏振片：馬呂斯定律與交叉偏振','波動光學','optical-polarizers',[
    P('input','入射光（0 非偏振／1 線偏振）',0,1,1,0),
    P('inputAngle','入射偏振角',0,180,5,0,'°'),
    P('middle','中間偏振片（0 移除／1 放入）',0,1,1,1),
    P('middleAngle','中間偏振軸',0,180,5,45,'°'),
    P('analyzer','末片偏振軸',0,180,5,90,'°'),
    P('sweep','末片掃描（0 固定／1 旋轉）',0,1,1,0)
  ],[metric('afterFirst','首片透射強度','%'),metric('beforeAnalyzer','末片前強度','%'),metric('output','輸出強度','%')],
  '非偏振光通過首片後 I₁ = I₀/2 · 線偏振光 I₂ = I₁ cos²(Δθ)',
  '理想線偏振片，首片固定 0°。百分比以入射強度為 100。角度以垂直方向為 0°。場景的亮度和偏振軸為示意，數值以讀值為準。',
  ['把首末片設為互相垂直，再放入 45° 中間片，預測透射強度。','掃描末片角度，比較有無中間片時最大強度的位置。'],p=>{
    const projection=angle=>Math.cos(angle*Math.PI/180)**2;
    const afterFirst=p.input?100*projection(p.inputAngle):50;
    const priorAngle=p.middle?p.middleAngle:0;
    const beforeAnalyzer=p.middle?afterFirst*projection(priorAngle):afterFirst;
    const outputAt=angle=>beforeAnalyzer*projection(angle-priorAngle);
    return trajectory(8,t=>{
      const analyzerAngle=p.sweep?180*t/8:p.analyzer;
      return {analyzerAngle,afterFirst,beforeAnalyzer,output:outputAt(analyzerAngle)};
    },{hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-4.7,0,-1.7],max:[4.7,4.6,1.7]},
      positionPlot:{key:'analyzerAngle',label:'末片角度',unit:'°',min:0,max:180,title:'偏振片透射強度',
        menuLabel:'強度對偏振軸',yUnit:'%',series:[{label:'輸出強度',color:'#8ee0c0',value:outputAt}]}
    });
  },'models/optical-polarizers.js');
  M.defs.at(-1).defaultPlotMode='position';
})(globalThis.Mechanics);
