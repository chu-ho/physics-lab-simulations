'use strict';
function drawConveyorFriction(s){
 const left=simulation.bounds.min[0],right=simulation.bounds.max[0],r=.45;
 box([(left+right)/2,.72,0],[right-left,.18,1.7],'#507c79');box([(left+right)/2,1.18,0],[right-left,.13,1.7],'#446f70');
 // Marks circulate around the rounded belt path at its actual prescribed displacement.
 const length=right-left,total=2*length+2*Math.PI*r,point=q=>{q=((q%total)+total)%total;if(q<length)return[left+q,1.2,.91];q-=length;if(q<Math.PI*r){const a=Math.PI/2-q/r;return[right+r*Math.cos(a),.75+r*Math.sin(a),.91]}q-=Math.PI*r;if(q<length)return[right-q,.3,.91];q-=length;const a=-Math.PI/2-q/r;return[left+r*Math.cos(a),.75+r*Math.sin(a),.91]};
 for(let j=0;j<Math.ceil(total/.8);j++){const q=point(j*.8+s.beltX);segment([q[0],q[1],-.78],[q[0],q[1],.78],'#e4c574',1.5)}
 for(const cx of[left,right]){ring([cx,.75,0],r,'xy','#6b9d94',3);for(let j=0;j<6;j++){const a=-s.beltX/r+j*TAU/6;segment([cx,.75,0],[cx+r*Math.cos(a),.75+r*Math.sin(a),0],'#668a89',2)}}
 box([s.x,s.y,0],[.9,.8,.9],s.sticking?'#76b49c':'#dda96a');
 label([s.x,s.y+.75,0],s.sticking?'靜摩擦黏住':'相對滑動','#426566',12);label([s.x,s.y+1.1,0],'Q '+s.Q.toFixed(2)+' J · f '+s.friction.toFixed(2)+' N','#426566',11);
 const base=[s.x,1.3,.8],scale=.5;if($('vectors').checked){if(Math.abs(s.vB)>.01)arrow(base,[base[0]+scale*s.vB,base[1],base[2]],'#4b91bd','v帶 '+s.vB.toFixed(2));if(Math.abs(s.vx)>.01)arrow([s.x,2.25,.8],[s.x+scale*s.vx,2.25,.8],'#438d80','v箱 '+s.vx.toFixed(2));}
 if($('forces').checked&&Math.abs(s.friction)>1e-7)arrow([s.x,1.7,-.6],[s.x+.7*Math.sign(s.friction),1.7,-.6],'#b56657','f '+s.friction.toFixed(2)+' N');
 label([s.x,.1,1.2],'無限帶示意窗；摩擦箭頭只示方向','#426566',10);
}
