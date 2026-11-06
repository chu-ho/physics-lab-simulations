'use strict';
(function (M) {
  const {P, M: metric, trajectory, integrated} = M.helpers;
  M.register('eddy-current', '渦電流：磁鐵穿過導體管', '電磁學', 'eddy-current', [
 P('mass','磁鐵質量',15,80,5,35,'g'),P('moment','等效磁偶極矩',2,9,.5,6,'A·m²'),
 P('resistance','各環等效電阻',20,200,5,45,'μΩ'),P('conducting','管材（0 絕緣／1 導電）',0,1,1,1)
 ],[metric('height','磁鐵高度','m'),metric('speed','下落速率','m/s'),metric('heat','累積焦耳熱','J')],
 'εᵢ = −v dΦᵢ/dy · Iᵢ = εᵢ/R · F磁 = Σ Iᵢ dΦᵢ/dy',
 '磁鐵近似軸向點偶極，導體管以等間距薄環表示。忽略環的自感、互感、空氣阻力與接觸。等效環電阻供觀察阻尼，不直接代表特定金屬。播放放慢模型時間。',
 ['比較導電與絕緣管的落下時間。','觀察接近與離開單個環時電流方向，並比對機械能與焦耳熱。'],p=>{
   const radius=.035,mass=p.mass*1e-3,resistance=p.resistance*1e-6;
   const rings=Array.from({length:13},(_,i)=>.06+i*.03);
   const fluxConstant=2*Math.PI*1e-7*p.moment*radius**2;
   const derivative=(height,ring)=>{
     const z=height-ring;
     return -3*fluxConstant*z/(radius**2+z*z)**2.5;
   };
   const damping=height=>p.conducting?rings.reduce((sum,ring)=>sum+derivative(height,ring)**2/resistance,0):0;
   const raw=integrated(6,[.5,0,0],(_,state)=>{
     const [height,velocity]=state;
     const b=damping(height);
     return [velocity,-9.81-b*velocity/mass,b*velocity**2];
   },state=>{
     const [height,velocity,heat]=state;
     return {height,velocity,speed:-velocity,heat,energy:mass*(9.81*height+velocity**2/2)+heat,
       currents:rings.map(ring=>p.conducting?-velocity*derivative(height,ring)/resistance:0)};
   },1/720);
   let lo=0,hi=6;
   for(let i=0;i<40;i++){
     const mid=(lo+hi)/2;
     if(raw.sample(mid).height>0)lo=mid;else hi=mid;
   }
   return trajectory(6,t=>({...raw.sample(t*hi/6),physicalTime:t*hi/6}),{
     rings,fallTime:hi,hidePrimary:true,hideFloor:true,schematic:true,
     bounds:{min:[-2,-.2,-1.4],max:[2,5.6,1.4]},
     endLabel:'抵達底端'
   });
 }, 'models/eddy-current.js');
})(globalThis.Mechanics);
