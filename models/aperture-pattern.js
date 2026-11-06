(function(M){'use strict';const{P,M:metric,trajectory}=M.helpers;
// J1 rational/asymptotic approximation (Numerical Recipes coefficients).
function j1(x){const a=Math.abs(x);let r;if(a<8){const y=x*x;r=x*(72362614232+y*(-7895059235+y*(242396853.1+y*(-2972611.439+y*(15704.48260+y*-30.16036606)))))/(144725228442+y*(2300535178+y*(18583304.74+y*(99447.43394+y*(376.9991397+y)))));}else{const z=8/a,y=z*z,xx=a-2.356194491;r=Math.sqrt(.636619772/a)*(Math.cos(xx)*(1+y*(.00183105+y*(-.00003516396496+y*(.000002457520174+y*-.000000240337019))))-z*Math.sin(xx)*(.04687499995+y*(-.0002002690873+y*(.000008449199096+y*(-.00000088228987+y*.000000105787412)))));if(x<0)r=-r;}return r;}
const sinc=x=>Math.abs(x)<1e-8?1:Math.sin(x)/x,airy=x=>Math.abs(x)<1e-6?1-x*x/8:2*j1(x)/x;
function array(n,phase){let re=0,im=0;for(let k=0;k<n;k++){const a=(k-(n-1)/2)*phase;re+=Math.cos(a);im+=Math.sin(a);}return (re*re+im*im)/(n*n);}
M.AperturePatterns={j1,airy,array};
M.register('aperture-pattern','方孔、圓孔與多孔陣列干涉繞射','波動光學','aperture-pattern',[
P('shape','孔形：0矩形／1圓孔',0,1,1,0),P('nx','水平孔數',1,8,1,1),P('ny','鉛直孔數',1,8,1,1),P('a','水平孔寬／圓孔直徑',.02,.3,.01,.2,'mm'),P('b','矩形孔高度',.02,3,.01,.2,'mm'),P('gapX','水平孔間淨距',0,.6,.02,.2,'mm'),P('gapY','鉛直孔間淨距',0,.6,.02,.2,'mm'),P('L','屏距',2,20,.5,5,'m'),P('lambda','波長',380,750,5,550,'nm'),P('span','螢幕半寬與半高',5,40,1,20,'mm'),{...P('gain','螢幕亮度倍率',1,100,1,10),visual:true},{...P('magnify','孔板示意放大倍率',1,5,.5,1),visual:true}
],[metric('intensity','掃描點相對強度',''),metric('firstMinimum','單孔首暗紋半徑／水平距離','mm'),metric('spacing','水平陣列近軸條紋距','mm')],
'I/I₀=|F孔|²|Σe^(ikdₓu)/Nₓ|²|Σe^(ikdᵧv)/Nᵧ|²；圓孔F=2J₁(q)/q',
'相干單色平面波垂直入射；使用純量夫朗和斐遠場模型，矩形孔為兩個sinc乘積，圓孔為Airy振幅。孔間淨距加孔寬得到中心間距，孔不重疊。螢幕採方向餘弦u=z/r、v=Y/r。強度以該孔板軸上峰值歸一；改孔數、孔面積不能比較絕對透光功率。圓孔高度由直徑決定。近距離或大孔陣列不保證滿足遠場條件，未包含菲涅耳近場。孔板與螢幕橫向尺度各自放大，時間只是沿螢幕水平掃描，不是光傳播時間。亮度倍率只改顯示映射；圖表與讀值仍為線性真實相對強度。',
['圓孔與方孔的第一暗紋有什麼不同？','增加水平或鉛直孔數，主極大寬度與位置如何改變？'],p=>{
const a=p.a*.001,b=(p.shape?p.a:p.b)*.001,dx=a+p.gapX*.001,dy=b+p.gapY*.001,lambda=p.lambda*1e-9,k=2*Math.PI/lambda;
function intensity(z,Y=0){const r=Math.hypot(p.L,z,Y),u=z/r,v=Y/r,F=p.shape?airy(Math.PI*a*Math.hypot(u,v)/lambda):sinc(Math.PI*a*u/lambda)*sinc(Math.PI*b*v/lambda);return Math.min(1,Math.max(0,F*F*array(p.nx,k*dx*u)*array(p.ny,k*dy*v)));}
const q=(p.shape?3.8317059702075125/Math.PI:1)*lambda/a,first=q<1?p.L*q/Math.sqrt(1-q*q)*1000:0;
return trajectory(8,t=>{const z=(2*t/8-1)*p.span*.001;return{x:6,y:4,z:z*400,intensity:intensity(z),probe_mm:z*1000,firstMinimum:first,spacing:lambda*p.L/dx*1000};},{schematic:true,hidePrimary:true,hideGrid:()=>true,intensity,a,b,dx,dy,lambda,plotAxis:{key:'probe_mm',label:'水平螢幕座標',unit:'mm'},bounds:{min:[-7,0,-5],max:[7,9,5]},scaleNote:'孔板、屏幕橫向各自放大；相干遠場近似，強度對目前孔板的中心峰值歸一。',endLabel:'螢幕掃描完成'});
},'models/aperture-pattern.js');
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
