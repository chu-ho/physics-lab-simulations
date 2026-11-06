'use strict';
/* Optional illustrative synthesized sound. No audio device is created before enableFromGesture().
   Descriptor: simulation.audio(state, params) => {frequency: Hz, gain: 0..1, type?: sine|triangle|harmonics, harmonics?: [a1,...], real?: [DC,a1,...], imag?: [DC,b1,...]}.
   PeriodicWave coefficients are preserved without normalization. Frequencies at/above Nyquist are removed, never transposed.
   real/imag include index 0 (DC ignored); harmonics lists sine coefficients starting at n=1.
   The amplitude is illustrative and does not represent calibrated sound pressure. */
(function(root){
 function create(options={}){
  const host=options.host||root,button=options.button,status=options.status;
  let context,oscillator,volume,simulation,params,enabled=false,epoch=0,disposed=false;
  let waveKey,activeType;const waves=new Map();
  let latestState,latestRunning=false,message='聲音預設關閉；合成聲音音量為示意，非校準聲壓。';
  const supported=()=>!!(host.AudioContext||host.webkitAudioContext);
  const available=()=>typeof simulation?.audio==='function';
  function ui(){
   if(button){button.hidden=!available();button.disabled=available()&&!supported();button.textContent=enabled?'關閉聲音':'開啟聲音';button.setAttribute('aria-pressed',String(enabled));}
   if(status){status.hidden=!available();status.textContent=!supported()?'此瀏覽器不支援聲音播放；動畫仍可操作。':message;}
  }
  function silence(){
   if(!volume||!context)return;
   const at=context.currentTime;
   volume.gain.cancelScheduledValues(at);volume.gain.setValueAtTime(volume.gain.value,at);volume.gain.linearRampToValueAtTime(0,at+.025);
  }
  function fail(){enabled=false;epoch++;silence();message='聲音未能啟用，請再按開啟聲音；動畫仍可操作。';ui();}
  function update(state,running){
   latestState=state;latestRunning=!!running;
   if(!enabled||!latestRunning||!available()||context?.state!=='running'){silence();return;}
   try{
    const tone=simulation.audio(state,params);
    if(!tone||!Number.isFinite(tone.frequency)||tone.frequency<=0||!Number.isFinite(tone.gain)){silence();return;}
    const at=context.currentTime,nyquist=(context.sampleRate||44100)/2,frequency=tone.frequency;
    // Never transpose the fundamental to accommodate the device: silence inaudible fundamentals.
    if(frequency>=nyquist){silence();return;}
    const type=tone.type==='harmonics'?'harmonics':tone.type==='triangle'?'triangle':'sine';
    if(type==='harmonics'){
     if(typeof context.createPeriodicWave!=='function'||typeof oscillator.setPeriodicWave!=='function')throw new Error('PeriodicWave unavailable');
     const sourceImag=tone.imag||[0,...(tone.harmonics||[])],sourceReal=tone.real||[];
     const count=Math.min(Math.max(sourceImag.length,sourceReal.length),Math.ceil(nyquist/frequency));
     if(count<2)throw new Error('No audible harmonics');
     const real=new Float32Array(count),imag=new Float32Array(count);
     for(let i=1;i<count;i++){
      real[i]=sourceReal[i]??0;imag[i]=sourceImag[i]??0;
      if(!Number.isFinite(real[i])||!Number.isFinite(imag[i]))throw new Error('Invalid harmonic coefficient');
     }
     const key=JSON.stringify([Array.from(real),Array.from(imag)]);
     if(activeType!==type||waveKey!==key){
      let wave=waves.get(key);
      if(!wave){wave=context.createPeriodicWave(real,imag,{disableNormalization:true});if(waves.size>=32)waves.delete(waves.keys().next().value);waves.set(key,wave);}
      oscillator.setPeriodicWave(wave);waveKey=key;
     }
    }else if(activeType!==type){oscillator.type=type;waveKey=undefined;}
    activeType=type;
    oscillator.frequency.cancelScheduledValues(at);oscillator.frequency.setValueAtTime(oscillator.frequency.value,at);oscillator.frequency.linearRampToValueAtTime(frequency,at+.015);
    volume.gain.cancelScheduledValues(at);volume.gain.setValueAtTime(volume.gain.value,at);volume.gain.linearRampToValueAtTime(Math.max(0,Math.min(1,tone.gain))*.12,at+.025);
   }catch(error){fail();}
  }
  async function enableFromGesture(){
   if(disposed||!available()||!supported()){ui();return false;}
   const token=++epoch;
   try{
    if(!context){
     const Audio=host.AudioContext||host.webkitAudioContext;context=new Audio();
     oscillator=context.createOscillator();volume=context.createGain();volume.gain.setValueAtTime(0,context.currentTime);
     oscillator.connect(volume);volume.connect(context.destination);oscillator.start();
    }
    if(context.state!=='running')await context.resume();
    if(token!==epoch||disposed)return false;
    if(context.state!=='running')throw new Error('AudioContext suspended');
    enabled=true;message='合成聲音示意已啟用，僅播放中發聲；音量非校準聲壓。';ui();update(latestState,latestRunning);return enabled;
   }catch(error){if(token===epoch)fail();return false;}
  }
  function disable(){epoch++;enabled=false;silence();message='聲音已關閉；合成聲音音量為示意，非校準聲壓。';ui();}
  function setExperiment(next,nextParams,options={}){if(options.preserveEnabled&&enabled){epoch++;silence();}else disable();simulation=next;params=nextParams;latestState=undefined;latestRunning=false;ui();}
  function stop(){latestRunning=false;silence();}
  function dispose(){disable();disposed=true;try{oscillator?.stop();oscillator?.disconnect();volume?.disconnect();const result=context?.close();result?.catch?.(()=>{});}catch(error){/* Animation must remain independent of audio device failures. */}}
  if(button)button.onclick=()=>enabled?disable():enableFromGesture();
  ui();return {setExperiment,enableFromGesture,disable,update,stop,dispose,get enabled(){return enabled;}};
 }
 const api={create};root.MechanicsAudio=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
