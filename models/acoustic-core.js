/* Uniform damped 1D acoustics, harmonic pressure drive at the open mouth. */
(function(M){'use strict';
const C={add:(a,b)=>[a[0]+b[0],a[1]+b[1]],mul:(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],scale:(a,s)=>[a[0]*s,a[1]*s],div:(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return[(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];},abs:a=>Math.hypot(...a),sin:a=>[Math.sin(a[0])*Math.cosh(a[1]),Math.cos(a[0])*Math.sinh(a[1])],cos:a=>[Math.cos(a[0])*Math.cosh(a[1]),-Math.sin(a[0])*Math.sinh(a[1])],realAt:(a,w,t)=>a[0]*Math.cos(w*t)-a[1]*Math.sin(w*t)};
function drivenTube({L,f,c,rho,Q,pressure}){const w=2*Math.PI*f,gamma=w/(2*Q),a=Math.sqrt((Math.hypot(w*w,2*gamma*w)+w*w)/2)/c,b=-gamma*w/(a*c*c),kappa=[a,b],den=C.mul(kappa,C.cos(C.scale(kappa,L))),coefficient=C.div([-pressure/(rho*c*c),0],den);
const phasor=X=>{const z=C.scale(kappa,X),u=C.mul(coefficient,C.sin(z)),ux=C.mul(C.mul(coefficient,kappa),C.cos(z)),uxx=C.scale(C.mul(C.mul(kappa,kappa),u),-1);return{u,ux,uxx,p:C.scale(ux,-rho*c*c)};};
const field=(X,t)=>{const q=phasor(X),u=C.realAt(q.u,w,t),ut=C.realAt([-w*q.u[1],w*q.u[0]],w,t),ux=C.realAt(q.ux,w,t);return{u,ut,utt:-w*w*u,ux,uxx:C.realAt(q.uxx,w,t),pressure:C.realAt(q.p,w,t),uAmplitude:C.abs(q.u),pressureAmplitude:C.abs(q.p)};};
return{field,phasor,kappa,omega:w,gamma};}
function soundSpeed(temperatureC){const kelvin=temperatureC+273.15;if(!(kelvin>0))throw new RangeError('temperature must exceed absolute zero');return Math.sqrt(1.4*8.314462618*kelvin/.0289652);}
function pulseEnvelope(time,start,duration){const q=(time-start)/duration;return q>0&&q<1?Math.sin(Math.PI*q)**2:0;}
M.Acoustics={C,drivenTube,soundSpeed,pulseEnvelope};if(typeof module!=='undefined'&&module.exports)module.exports=M.Acoustics;
})(typeof module!=='undefined'&&module.exports?require('../mechanics-models.js'):globalThis.Mechanics);
