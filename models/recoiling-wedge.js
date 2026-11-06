/* Frictionless point mass on a horizontally recoiling wedge; exact contact-limited motion. */
(function(M){'use strict';const {P,M:metric,trajectory}=M.helpers;
M.register('recoiling-wedge','光滑斜面向後滑','動力學','recoiling-wedge',[
 P('massWedge','斜面質量',1,30,.5,6,'kg'),P('m','質點質量',.5,10,.5,2,'kg'),P('angle','坡角',10,70,1,30,'°'),P('length','斜面長度',2,8,.2,5,'m'),P('g','重力加速度',1,15,.1,9.8,'m/s²'),P('fixed','固定斜面（0 自由／1 固定）',0,1,1,0,'')
],[metric('wedgeX','斜面水平位移','m'),metric('relativeSpeed','沿坡相對速率','m/s'),metric('normal','坡面正向力','N')],
'自由斜面：q̈ = g sinθ (M+m)/(M+m sin²θ)；Ẍ = −m cosθ q̈/(M+m)；N = mg cosθ M/(M+m sin²θ)；(M+m)Ẋ + m q̇ cosθ = 0',
'水平地面與斜面都光滑，剛性楔形只作水平平移。質點從坡頂靜止釋放，沿坡下滑；沒有摩擦，因此不是純滾動，也不模擬自轉。球形圖示僅用來表示質點，大小不參與接觸幾何。自由模式無水平外力，水平動量與機械能守恆；固定模式有支架提供水平外力。解析運動只到質點抵達坡底前瞬間，保留當時速度，不推演離坡、碰地或碰撞後運動。正向力及地面支持力皆為正，楔形轉動與翻倒由理想水平導引排除。楔形按均勻三角截面標定質心，wedgeX為底面中點的位移。圖上的分力箭頭為方向示意，數字是實際力。',
['斜面變輕後，質點沿坡滑下的時間和斜面後退量如何變化？','質點水平動量改變時，斜面得到多少反向動量？','固定斜面與極重的自由斜面，滑下時間是否接近？'],p=>{
 const a=p.angle*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),total=p.massWedge+p.m,den=p.massWedge+p.m*sn*sn,aq=p.fixed?p.g*sn:p.g*sn*total/den,axW=p.fixed?0:-p.m*c*aq/total,duration=Math.sqrt(2*p.length/aq),normal=p.fixed?p.m*p.g*c:p.m*p.g*c*p.massWedge/den,groundNormal=p.massWedge*p.g+normal*c,width=p.length*c,height=p.length*sn;
 const finalW=.5*axW*duration*duration;
 return trajectory(duration,t=>{const q=.5*aq*t*t,u=aq*t,wedgeX=.5*axW*t*t,wedgeV=axW*t,x=wedgeX-width/2+q*c,y=height-q*sn,vx=wedgeV+u*c,vy=-u*sn,Kmass=.5*p.m*(vx*vx+vy*vy),Kwedge=.5*p.massWedge*wedgeV*wedgeV,U=p.m*p.g*y;
 return{x,y,z:0,vx,vy,vz:0,fx:normal*sn,fy:normal*c-p.m*p.g,fz:0,ax:axW+aq*c,ay:-aq*sn,q,relativeSpeed:u,relativeAcceleration:aq,wedgeX,wedgeV,wedgeA:axW,wedgeForce:-normal*sn,wedgeNetForce:p.fixed?0:-normal*sn,supportHorizontal:p.fixed?normal*sn:0,normal,groundNormal,horizontalMomentum:p.massWedge*wedgeV+p.m*vx,centerX:(p.massWedge*(wedgeX-width/6)+p.m*x)/total,Kmass,Kwedge,K:Kmass+Kwedge,U,E:Kmass+Kwedge+U};
 },{width,height,angle:a,events:[{t:0,label:p.fixed?'固定斜面：由靜止釋放':'自由斜面：總水平動量為零'},{t:duration,label:'到達坡底 · 離坡前瞬間'}],endLabel:'到達坡底 · 保留離坡前瞬間速度',bounds:{min:[finalW-width/2-1,0,-1.5],max:[width/2+1,height+1.5,1.5]}});
},'models/recoiling-wedge.js');
M.defs.find(d=>d.id==='recoiling-wedge').plotMetrics=[metric('wedgeV','斜面水平速度','m/s'),metric('vx','質點水平速度','m/s'),metric('horizontalMomentum','系統水平動量','kg·m/s'),metric('groundNormal','地面支持力','N'),metric('Kmass','質點動能','J'),metric('Kwedge','斜面動能','J'),metric('U','質點重力位能','J'),metric('E','系統機械能','J')];
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
