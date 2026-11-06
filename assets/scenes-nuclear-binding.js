'use strict';
function drawNuclearBinding(s) {
  for(const [index,nuclide] of simulation.nuclides.entries()){
    const x=(index-3)*.92;
    const height=.34*nuclide.binding/nuclide.a;
    const color=nuclide===simulation.target?'#bb8356':'#82a9a3';
    box([x,.75+height/2,0],[.46,height,.42],color);
    label([x,.48,0],nuclide.symbol,'#365464',11);
  }
  label([0,4.92,0],'每核子結合能 · '+simulation.target.symbol+' '+s.bindingPerA.toFixed(2)+' MeV','#365464',13);
  label([0,4.44,0],simulation.reaction.text,'#365464',13);
  label([0,4.03,0],t<3?'反應物的能量帳':'產物 · 釋放 '+s.shownRelease.toFixed(2)+' MeV','#365464',12);
}
