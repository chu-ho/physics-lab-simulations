'use strict';

function drawPhotoelectric(s) {
  const emitter = -1.8, collector = 1.8, plateY = 1.7;
  const photonColor = '#835bc3', electronColor = '#237a98';
  box([emitter, plateY, 0], [.14, 2.1, 2.2], '#ae795b');
  box([collector, plateY, 0], [.14, 2.1, 2.2], '#7896a3');
  label([emitter, 3.05, 0], '光陰極', '#855740', 12);
  label([collector, 3.05, 0], '收集極', '#3c697b', 12);
  const wires = [[emitter,.65,0],[emitter,.05,0],[-.6,.05,0],[.6,.05,0],[collector,.05,0],[collector,.65,0]];
  for (let i = 1; i < wires.length; i++) {
    segment(wires[i - 1], wires[i], '#526c76', i === 3 ? 5 : 2);
  }
  label([0,-.45,0], 'V = '+s.voltage.toFixed(2)+' V　｜　I = '+s.current.toFixed(3)+' μA', '#375765', 12);
  label([0,4.35,0], '入射光 '+s.photonEnergy.toFixed(2)+' eV／光子　｜　逸出功 '+params.workFunction.toFixed(2)+' eV', '#576577', 12);
  const status = s.incidentRate === 0 ? '光源關閉'
    : s.maxEnergy <= 0 ? '未超過逸出門檻'
      : s.current === 0 ? '電子可逸出，收集端無電流' : '電子逸出，部分或全部到達收集極';
  label([0,3.65,0], status, '#376b6e', 13);
  label([0,3.2,0], '發射 '+s.emittedRate.toFixed(2)+' ／ 收集 '+s.collectedRate.toFixed(2)+'（10¹³/s）', '#576577', 10);

  const photonCount = Math.min(12, Math.ceil(s.incidentRate * .8));
  for (let i = 0; i < photonCount; i++) {
    const phase = (t * 1.6 + i / photonCount) % 1;
    const z = -.8 + .4 * (i % 5);
    const x = -4.1 + 2.22 * phase;
    const y = 3.8 - 1.8 * phase;
    segment([x-.18,y+.15,z], [x,y,z], photonColor, 2);
    sphere([x,y,z], .055, photonColor);
  }

  const electronCount = Math.min(16, Math.ceil(s.emittedRate * 4));
  for (let i = 0; i < electronCount; i++) {
    const energy = s.maxEnergy * ((i + .5) / electronCount);
    const speed = Math.sqrt(energy);
    const arrives = energy > s.voltage;
    const flight = arrives ? 2 / (speed + Math.sqrt(energy - s.voltage)) : 4 * speed / s.voltage;
    const age = flight * ((t * (.65 + .2 * speed) + i * .618) % 1);
    const fraction = Math.max(0, Math.min(1, speed * age - s.voltage * age * age / 4));
    const y = 1.05 + .32 * (i % 5);
    const z = -.75 + .5 * (Math.floor(i / 5) % 4);
    sphere([emitter + .1 + fraction * (collector - emitter - .2), y, z], .075, electronColor);
  }
}
