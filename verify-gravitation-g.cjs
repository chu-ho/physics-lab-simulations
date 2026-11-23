'use strict';
const assert = require('node:assert/strict');
const M = require('./mechanics-models.js');
const def = M.defs.find(d => d.id === 'gravitation-g');
const make = o => def.build({ ...M.defaults(def), ...o });
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.abs(b), msg + ' ' + a + ' vs ' + b);
// 獨立常數（不取自模型）
const G = 6.674e-11,
  GM = 3.986004418e14,
  RE = 6.371e6;

// --- 卡文迪西扭秤 ---
const c = make({});
// 力矩平衡 κθ = τ，κ = Iω²，I = 2ml²，與 m 無關
const thetaEq = (2 * G * 158 * 0.73 * 0.93) / 0.23 ** 2 / (2 * 0.73 * 0.93 ** 2 * (2 * Math.PI / 60) ** 2);
near(c.sample(0).eq, thetaEq, 1e-12, 'equilibrium deflection');
near(make({ m: 0.3 }).sample(0).eq, thetaEq, 1e-12, 'deflection independent of m');
near(c.sample(0).torque, (2 * G * 158 * 0.73 * 0.93) / 0.23 ** 2, 1e-12, 'torque');
assert.equal(c.sample(0).theta, 0);
// 欠阻尼：長時間後收斂到平衡（以大阻尼比的另一組驗證穩態），並由讀數反推出 G
const damped = make({ zeta: 0.3, T0: 20 });
const late = damped.sample(damped.duration);
near(late.theta, damped.sample(0).eq, 1e-2, 'settles to equilibrium');
near(late.Gmeas * 1e-11, G, 1e-2, 'G recovered from deflection');
// 無阻尼：θ = θeq(1 − cos ωt)，第一次峰值為 2θeq，G 讀數為 2G
const free = make({ zeta: 0 });
near(free.sample(30).theta, 2 * free.sample(0).eq, 1e-12, 'undamped first peak');
near(free.sample(15).theta, free.sample(0).eq, 1e-12, 'undamped quarter period');
// 偏轉與 M、T²、1/R²、1/l 的比例
near(make({ M: 79 }).sample(0).eq / thetaEq, 0.5, 1e-12, 'scales with M');
near(make({ T0: 30 }).sample(0).eq / thetaEq, 0.25, 1e-12, 'scales with T²');
near(make({ R: 0.46 }).sample(0).eq / thetaEq, 0.25, 1e-12, 'scales with 1/R²');
// 數量級：T = 400 s 的真實儀器偏轉約 0.9 mrad（θ ∝ T²）
assert.ok(thetaEq * (400 / 60) ** 2 > 8e-4 && thetaEq * (400 / 60) ** 2 < 9e-4);

// --- 地球重力 ---
const planet = o => make({ mode: 1, ...o });
const at = (o, t = 10) => planet(o).sample(t);
near(at({ h: 0, phi: 90 }, 0).gEff, GM / RE ** 2, 1e-12, 'pole surface g');
const w = (2 * Math.PI) / (23.9 * 3600);
near(at({ h: 0, phi: 0 }, 0).gEff, GM / RE ** 2 - w * w * RE, 1e-9, 'equator surface g');
// 高度 h = R 時 g 為地表的 1/4（無自轉影響的極點）
near(at({ h: 6371, phi: 90 }).gEff, GM / RE ** 2 / 4, 1e-9, 'inverse square at 2R');
// 同步軌道半徑 r = (GM/ω²)^(1/3)：赤道有效重力為零
const rSync = Math.cbrt(GM / (w * w));
assert.ok(Math.abs(rSync / 1000 - RE / 1000 - 35786) < 700, 'synchronous altitude ~ 3.58e4 km, got ' + (rSync - RE) / 1000);
const hSync = Math.round((rSync - RE) / 1e5) * 100;
assert.ok(Math.abs(planet({ h: hSync, phi: 0 }).sample(10).gEff) < 1e-3 * 9.8 * 10, 'g≈0 near synchronous orbit');
// 兩極無偏離；緯度 45° 有偏離；赤道無偏離
assert.ok(at({ phi: 90, h: 0 }).tilt < 1e-12 && at({ phi: 0, h: 0 }).tilt < 1e-12);
assert.ok(at({ phi: 45, h: 0 }).tilt > 1e-3);
// 隨緯度單調：赤道最小、極點最大
let prev = 0;
for (let phi = 0; phi <= 90; phi += 5) {
  const g = at({ phi, h: 0 }).gEff;
  assert.ok(g > prev, 'monotonic in latitude');
  prev = g;
}
// 自轉越慢，離心影響越小
assert.ok(at({ phi: 0, h: 0, day: 48 }).gEff > at({ phi: 0, h: 0, day: 6 }).gEff);
console.log('PASS gravitation-g');
