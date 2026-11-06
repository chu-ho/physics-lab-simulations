/* Analytic nondispersive wave profiles and equal-tension string interface matching. */
(function(M){'use strict';
function pulse(s,A,width){if(Math.abs(s)>=width)return{u:0,d1:0,d2:0};const a=Math.PI/(2*width),c=Math.cos(a*s),n=Math.sin(a*s);return{u:A*c**4,d1:-4*A*a*c**3*n,d2:4*A*a*a*c*c*(3*n*n-c*c)};}
function harmonic(x,t,A,lambda,c){const k=2*Math.PI/lambda,w=k*c,p=k*x-w*t;return{u:A*Math.sin(p),ut:-A*w*Math.cos(p),ux:A*k*Math.cos(p),utt:-A*w*w*Math.sin(p),uxx:-A*k*k*Math.sin(p),incident:A*Math.sin(p),reflected:0,transmitted:0};}
function travellingPulse(x,t,A,width,c,x0=-5){const q=pulse(x-x0-c*t,A,width);return{u:q.u,ut:-c*q.d1,ux:q.d1,utt:c*c*q.d2,uxx:q.d2,incident:q.u,reflected:0,transmitted:0};}
function reflection(x,t,A,width,c,R,x0=-5){const a=pulse(x-x0-c*t,A,width),b=pulse(-x-x0-c*t,A,width);return{u:a.u+R*b.u,ut:-c*(a.d1+R*b.d1),ux:a.d1-R*b.d1,utt:c*c*(a.d2+R*b.d2),uxx:a.d2+R*b.d2,incident:a.u,reflected:R*b.u,transmitted:0};}
function coefficients(ratio){const z=Math.sqrt(ratio),R=(1-z)/(1+z),T=2/(1+z);return{R,T,reflectedEnergy:R*R,transmittedEnergy:z*T*T};}
function interfacePulse(x,t,A,width,c,ratio,x0=-5){const z=Math.sqrt(ratio),coef=coefficients(ratio);if(x<=0)return reflection(x,t,A,width,c,coef.R,x0);const a=pulse(z*x-x0-c*t,A,width);return{u:coef.T*a.u,ut:-c*coef.T*a.d1,ux:coef.T*z*a.d1,utt:c*c*coef.T*a.d2,uxx:coef.T*z*z*a.d2,incident:0,reflected:0,transmitted:coef.T*a.u};}
M.Waves={pulse,harmonic,travellingPulse,reflection,coefficients,interfacePulse};if(typeof module!=='undefined'&&module.exports)module.exports=M.Waves;
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
