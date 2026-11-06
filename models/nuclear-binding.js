'use strict';

(function (M) {
  const {P,M:metric,trajectory}=M.helpers;
  // Neutral-atom masses from the NIST isotopic composition tables, in u.
  const hydrogen=1.00782503223,neutron=1.00866491606,energyPerU=931.49410242;
  const nuclides=[
    ['²H',2,1,2.01410177812],['³H',3,1,3.0160492779],['⁴He',4,2,4.00260325413],
    ['⁵⁶Fe',56,26,55.93493633],['⁹²Kr',92,36,91.9261731],
    ['¹⁴¹Ba',141,56,140.9144033],['²³⁵U',235,92,235.0439301]
  ].map(([symbol,a,z,mass])=>({symbol,a,z,mass,binding:(z*hydrogen+(a-z)*neutron-mass)*energyPerU}));
  const reactions=[
    {text:'²H + ³H → ⁴He + n', before:[0,1],after:[2],neutronsBefore:0,neutronsAfter:1},
    {text:'²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n',before:[6],after:[5,4],neutronsBefore:1,neutronsAfter:3}
  ];
  M.register('nuclear-binding','核結合能：融合與分裂','近代物理','nuclear-binding',[
    P('mode','反應（0 氘氚融合／1 鈾分裂範例）',0,1,1,0),
    P('isotope','核種索引（0 至 6）',0,6,1,3)
  ],[metric('binding','選定核種總結合能','MeV'),metric('bindingPerA','每核子結合能','MeV'),metric('release','此反應 Q 值','MeV')],
  'B ≈ [Zm(¹H)+(A−Z)mₙ−m原子]c² · Q = (Σm反應物−Σm產物)c²',
  '採 NIST 中性原子質量。反應前後電子數相抵，忽略電子束縛能差。鈾分裂只展示一種產物組合，Q 值採所列核種基態的質量差。圖是能量帳而非碰撞、反應速率或分裂產率模擬。',
  ['選擇氘、氦、鐵和鈾，比較每核子結合能。','切換融合與分裂，核對質子與核子數守恆，解釋兩種反應如何都能放能。'],p=>{
    const target=nuclides[p.isotope];
    const reaction=reactions[p.mode];
    const sum=(indexes,key)=>indexes.reduce((total,index)=>total+nuclides[index][key],0);
    const massBefore=sum(reaction.before,'mass')+reaction.neutronsBefore*neutron;
    const massAfter=sum(reaction.after,'mass')+reaction.neutronsAfter*neutron;
    const release=(massBefore-massAfter)*energyPerU;
    const balance={
      protonsBefore:sum(reaction.before,'z'),protonsAfter:sum(reaction.after,'z'),
      nucleonsBefore:sum(reaction.before,'a')+reaction.neutronsBefore,
      nucleonsAfter:sum(reaction.after,'a')+reaction.neutronsAfter
    };
    return trajectory(6,t=>({
      binding:target.binding,bindingPerA:target.binding/target.a,release,
      shownRelease:t>=3?release:0
    }),{target,reaction,nuclides,balance,hidePrimary:true,hideFloor:true,schematic:true,
      bounds:{min:[-4,0,-1],max:[4,5.4,1]},
      events:[{t:3,label:'切換至產物的能量帳'}]});
  },'models/nuclear-binding.js');
})(globalThis.Mechanics);
