'use strict';
const assert=require('node:assert/strict'),{create}=require('./assets/mechanics-audio.js');
let constructions=0;
class Param{
 constructor(value=0){this.value=value;this.ramps=[];}
 cancelScheduledValues(){}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v,t){this.value=v;this.ramps.push([v,t]);}
}
class Context{
 constructor(){constructions++;this.currentTime=3;this.state='suspended';this.sampleRate=48000;this.destination={};Context.latest=this;}
 createOscillator(){return this.osc={frequency:new Param(440),connect(){},setPeriodicWave(wave){this.wave=wave;this.waveSets=(this.waveSets||0)+1;},start(){this.started=true;},stop(){},disconnect(){}};}
 createPeriodicWave(real,imag,options){const wave={real:Array.from(real),imag:Array.from(imag),options};(this.waves||(this.waves=[])).push(wave);return wave;}
 createGain(){return this.vol={gain:new Param(),connect(){},disconnect(){}};}
 async resume(){this.state='running';}async close(){this.state='closed';}
}
const element=()=>({setAttribute(k,v){this[k]=v;}});
(async()=>{
 const button=element(),status=element(),audio=create({host:{AudioContext:Context},button,status});
 audio.setExperiment({playbackScale:.001,audio:(s,p)=>({frequency:s.frequency,gain:p.volume})},{volume:.5});
 audio.update({frequency:512},true);assert.equal(constructions,0,'no context without explicit user gesture');
 await button.onclick();assert.equal(constructions,1);assert.equal(audio.enabled,true);assert.equal(Context.latest.osc.frequency.value,512,'physical Hz independent of animation scale');assert.equal(Context.latest.vol.gain.value,.06);assert.equal(button['aria-pressed'],'true');
 audio.update({frequency:261},true);assert.equal(Context.latest.osc.frequency.value,261);assert.ok(Context.latest.vol.gain.ramps.every(([,t])=>t>3),'short ramp avoids abrupt gain change');
 audio.update({frequency:261},false);assert.equal(Context.latest.vol.gain.value,0,'pause and timeline seek silence');
 audio.update({frequency:200},true);audio.stop();assert.equal(Context.latest.vol.gain.value,0,'reset stop');
 audio.setExperiment({audio:()=>({frequency:777,gain:.4})},{},{preserveEnabled:true});assert.equal(audio.enabled,true);audio.update({},true);assert.equal(Context.latest.osc.frequency.value,777);assert.equal(Context.latest.vol.gain.value,.048);audio.setExperiment({},{});assert.equal(audio.enabled,false);audio.setExperiment({audio:()=>({frequency:555,gain:.4})},{},{preserveEnabled:true});assert.equal(audio.enabled,false,'preservation cannot implicitly enable audio');audio.setExperiment({},{});assert.equal(audio.enabled,false);assert.equal(Context.latest.vol.gain.value,0);assert.equal(button.hidden,true);
 audio.dispose();
 const harmonicStatus=element(),harmonic=create({host:{AudioContext:Context},status:harmonicStatus});
 let descriptor={frequency:1000,gain:.5,type:'harmonics',harmonics:[1,.5,.25]};
 harmonic.setExperiment({audio:()=>descriptor},{});harmonic.update({},true);
 const before=constructions;assert.equal(harmonic.enabled,false);assert.equal(constructions,before);
 await harmonic.enableFromGesture();const hc=Context.latest;
 assert.deepEqual(hc.waves[0].real,[0,0,0,0]);assert.deepEqual(hc.waves[0].imag,[0,1,.5,.25]);assert.equal(hc.waves[0].options.disableNormalization,true,'do not normalize model amplitudes');
 harmonic.update({},true);assert.equal(hc.waves.length,1);assert.equal(hc.osc.waveSets,1,'unchanged wave cached across frames');
 descriptor={frequency:10000,gain:.5,type:'harmonics',harmonics:[1,.5,.25]};harmonic.update({},true);
 assert.deepEqual(hc.osc.wave.imag,[0,1,.5]);assert.equal(hc.osc.frequency.value,10000,'Nyquist removes high harmonics without transposing');
 descriptor={frequency:24000,gain:1,type:'harmonics',harmonics:[1]};harmonic.update({},true);assert.equal(hc.vol.gain.value,0,'inaudible fundamental silenced');
 descriptor={frequency:10,gain:.5,type:'harmonics',real:[0,.25,-.5],imag:[0,.5,.25]};harmonic.update({},true);
 assert.deepEqual(hc.osc.wave.real,[0,.25,-.5]);assert.deepEqual(hc.osc.wave.imag,[0,.5,.25]);
 // Orthogonality gives RMS² = sum(a_n²+b_n²)/2; no API normalization or gain correction.
 const rms2=hc.osc.wave.real.reduce((sum,a,i)=>sum+(a*a+hc.osc.wave.imag[i]**2)/2,0);assert.equal(rms2,.3125);assert.equal(hc.vol.gain.value,.06);
 descriptor={frequency:440,gain:.5};harmonic.update({},true);assert.equal(hc.osc.type,'sine','custom wave switches back to sine');
 descriptor={frequency:1000,gain:.5,type:'harmonics',harmonics:[1,.5,.25]};harmonic.update({},true);assert.equal(hc.waves.length,3,'cached waveform reused after sine');
 harmonic.update({},false);assert.equal(hc.vol.gain.value,0);harmonic.setExperiment({audio:()=>descriptor},{});harmonic.update({},true);assert.equal(harmonic.enabled,false);assert.equal(hc.vol.gain.value,0,'new waveform or experiment never enables sound');harmonic.dispose();
 class NoPeriodic extends Context{createPeriodicWave=undefined;}
 const unsupportedStatus=element(),unsupported=create({host:{AudioContext:NoPeriodic},status:unsupportedStatus});unsupported.setExperiment({audio:()=>descriptor},{});unsupported.update({},true);await unsupported.enableFromGesture();assert.equal(unsupported.enabled,false);assert.match(unsupportedStatus.textContent,/未能啟用/);assert.equal(Context.latest.vol.gain.value,0);
 class BrokenPeriodic extends Context{createPeriodicWave(){throw new Error('wave failed');}}
 const broken=create({host:{AudioContext:BrokenPeriodic}});broken.setExperiment({audio:()=>descriptor},{});broken.update({},true);await broken.enableFromGesture();assert.equal(broken.enabled,false);assert.equal(Context.latest.vol.gain.value,0);
 const unavailableStatus=element(),unavailableButton=element(),unavailable=create({host:{},status:unavailableStatus,button:unavailableButton});unavailable.setExperiment({audio:()=>({frequency:440,gain:1})},{});assert.equal(unavailableButton.disabled,true);assert.match(unavailableStatus.textContent,/不支援/);assert.equal(await unavailable.enableFromGesture(),false);
 class Rejected extends Context{async resume(){throw new Error('denied');}}
 const rejectedStatus=element(),rejected=create({host:{AudioContext:Rejected},status:rejectedStatus});rejected.setExperiment({audio:()=>({frequency:440,gain:.5})},{});assert.equal(await rejected.enableFromGesture(),false);assert.equal(rejected.enabled,false);assert.match(rejectedStatus.textContent,/未能啟用/);assert.equal(Context.latest.vol.gain.value,0);
 let resume;class Delayed extends Context{resume(){return new Promise(resolve=>{resume=()=>{this.state='running';resolve();};});}}
 const pending=create({host:{AudioContext:Delayed}});pending.setExperiment({audio:()=>({frequency:440,gain:1})},{});const activation=pending.enableFromGesture();pending.setExperiment({},{});resume();assert.equal(await activation,false);assert.equal(pending.enabled,false,'old resume cannot enable audio after experiment change');
 console.log('PASS optional audio: explicit gesture, physical Hz, smooth gain, pause/reset/switch, no API, rejected and stale resume. PeriodicWave coefficients/cache/Nyquist/RMS/failure. No audio devices used.');
})().catch(error=>{console.error(error);process.exitCode=1;});
