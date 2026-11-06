'use strict';
function drawBlockStack(s){
 const n=simulation.n,L=simulation.L,h=simulation.h,z=.55;
 box([-2*L,.8,0],[4*L,.4,1.7],'#819b96');
 segment([0,.4,-.9],[0,1,-.9],'#4e6e6d',2);label([0,.35,-1],'桌緣 x = 0','#426566',11);
 for(let i=n-1;i>=0;i--){const y=1+(n-i-.5)*h,color=i===simulation.chosen?'#e4b062':i%2?'#72afa6':'#a0c6ba';box([s.centers[i],y,0],[L,h,.95],color);label([s.centers[i],y,z],String(i+1),'#385d5d',10)}
 for(const q of s.interfaces){const y=1+(n-q.layer)*h,weak=q.layer===s.criticalLayer,col=weak?'#c65464':'#358f82';segment([q.left,y,z+.12],[q.right,y,z+.12],col,weak?4:2);sphere([q.com,y+.045,z+.15],.055,col);segment([q.com,y+.08,z+.15],[q.com,y+.24,z+.15],col,1.5);label([q.right+.12,y,z+.18],'C'+q.layer+' '+q.margin.toFixed(2)+' m',col,9)}
 label([-L,1+n*h+.65,0],s.invalid?'初始配置無靜力支持':s.atCritical?'第 '+simulation.criticalLayer+' 界面臨界；停止掃描':'靜力推移第 '+s.selectedLayer+' 層','#426566',12);
 label([-L,1+n*h+1,0],'懸伸 '+s.overhang.toFixed(2)+' m · 最優上限 '+s.maxOverhang.toFixed(2)+' m','#426566',11);
 label([-2*L,.2,1],'圓點：上方子堆質心；線段：接觸支持範圍','#426566',10);
}
