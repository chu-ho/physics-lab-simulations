/* ABCD matrices in air, ray vector [height(m), paraxial slope]. */
(function(M){'use strict';const I=()=>[1,0,0,1],multiply=(a,b)=>[a[0]*b[0]+a[1]*b[2],a[0]*b[1]+a[1]*b[3],a[2]*b[0]+a[3]*b[2],a[2]*b[1]+a[3]*b[3]],propagate=d=>[1,d,0,1],lens=f=>[1,0,Number.isFinite(f)?-1/f:0,1],apply=(a,y,u)=>[a[0]*y+a[1]*u,a[2]*y+a[3]*u];
function system(elements){let matrix=I(),x=0;for(const e of elements.filter(e=>e.active).sort((a,b)=>a.x-b.x)){matrix=multiply(lens(e.f),multiply(propagate(e.x-x),matrix));x=e.x;}return{matrix,endX:x};}
function trace(y,slope,elements){let x=0;const hits=[];for(const e of elements.filter(e=>e.active).sort((a,b)=>a.x-b.x)){y+=slope*(e.x-x);x=e.x;const pass=Math.abs(y)<=e.radius+1e-12,next=slope-y/e.f;hits.push({x,y,inSlope:slope,outSlope:next,pass});if(!pass)return{passed:false,x,y,slope,hits};slope=next;}return{passed:true,x,y,slope,hits};}
M.RayMatrix={I,multiply,propagate,lens,apply,system,trace};
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
