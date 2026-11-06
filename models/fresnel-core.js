/* Lossless, isotropic, nonmagnetic Fresnel electric-field coefficients. */
(function(M){'use strict';
function ratio(a,b,c,d){const den=c*c+d*d;return{re:(a*c+b*d)/den,im:(b*c-a*d)/den};}
function abs2(z){return z.re*z.re+z.im*z.im;}
function calculate(n1,n2,angle){const theta=angle*Math.PI/180,ci=Math.cos(theta),st=n1/n2*Math.sin(theta),tir=st>1+1e-12,ct=tir?{re:0,im:Math.sqrt(st*st-1)}:{re:Math.sqrt(Math.max(0,1-st*st)),im:0};
if(n1===n2)return{rs:{re:0,im:0},rp:{re:0,im:0},ts:{re:1,im:0},tp:{re:1,im:0},Rs:0,Rp:0,Ts:1,Tp:1,tir:false,thetaT:theta,ci,ct,flux:1};
const rs=ratio(n1*ci-n2*ct.re,-n2*ct.im,n1*ci+n2*ct.re,n2*ct.im),rp=ratio(n2*ci-n1*ct.re,-n1*ct.im,n2*ci+n1*ct.re,n1*ct.im),ts=ratio(2*n1*ci,0,n1*ci+n2*ct.re,n2*ct.im),tp=ratio(2*n1*ci,0,n2*ci+n1*ct.re,n1*ct.im),flux=ci>1e-12?n2*ct.re/(n1*ci):0;
return{rs,rp,ts,tp,Rs:abs2(rs),Rp:abs2(rp),Ts:flux*abs2(ts),Tp:flux*abs2(tp),tir,thetaT:tir?null:Math.asin(Math.min(1,st)),ci,ct,flux};}
M.Fresnel={calculate,abs2};
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
