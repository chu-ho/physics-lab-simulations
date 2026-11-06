'use strict';
(function (M) {
  const {P, M: metric, trajectory} = M.helpers;
  const duration = 8;
  const gasConstant = 8.31446261815324;
  const metrics = [
    metric('deltaU', 'A 內能變化', 'J'),
    metric('workA', 'A 氣體對外作功', 'J'),
    metric('workB', 'B 氣體對外作功', 'J')
  ];

  M.register('pv-path', '理想氣體的 P–V 路徑與第一定律', '熱學', 'pv-path', [
    P('v0', '初始體積', 1, 5, .1, 2, 'L'),
    P('v1', '終點體積', 1, 5, .1, 4, 'L'),
    P('p0', '初始壓力', 50, 250, 5, 100, 'kPa'),
    P('p1', '終點壓力', 50, 250, 5, 150, 'kPa'),
    P('isothermal', 'B 路徑：0 等容先行／1 等溫先行', 0, 1, 1, 0),
    P('cycle', '返回初態形成循環', 0, 1, 1, 0)
  ], metrics,
  'PV = nRT；W = ∫P dV；ΔU = 3/2 · Δ(PV)；Q = ΔU + W',
  '固定 0.10 mol 的單原子理想氣體。A 先等壓再等容，B 可選先等容再等壓或先等溫再等容。兩邊活塞以準靜態方式走同一對起終態，播放秒數只用來呈現順序。氣體膨脹對外作功為正，壓縮時為負，吸熱為正。1 kPa·L = 1 J。P–V 圖的底下面積顯示各路徑從初態到共同終態的功量值。開啟循環時，兩邊各沿另一條路線反向返回初態，兩片面積相減可求循環功。裝置尺度為示意。',
  [
    '先預測兩邊到達同一終態時，內能變化、氣體對外作功、吸熱量，哪一個必定相同？開啟 P–V 圖並用面積解釋。',
    '開啟循環，觀察順、逆路徑的淨功與淨熱量。交換起終點體積後，等壓段的功會怎麼改變？'
  ], params => {
    const {v0, v1, p0, p1, isothermal, cycle} = params;
    const start = {v: v0, p: p0};
    const end = {v: v1, p: p1};
    const pathA = [start, {v: v1, p: p0}, end];
    const pathB = isothermal
      ? [start, {v: v1, p: p0 * v0 / v1}, end]
      : [start, {v: v0, p: p1}, end];
    const typesA = ['isobaric', 'isochoric'];
    const typesB = isothermal ? ['isothermal', 'isochoric'] : ['isochoric', 'isobaric'];

    const makeSegments = (path, types) => types.map((type, index) => ({
      type, start: path[index], end: path[index + 1]
    }));
    const reverse = segments => segments.slice().reverse().map(s => ({
      type: s.type, start: s.end, end: s.start
    }));
    const a = makeSegments(pathA, typesA);
    const b = makeSegments(pathB, typesB);
    const routeA = cycle ? a.concat(reverse(b)) : a;
    const routeB = cycle ? b.concat(reverse(a)) : b;
    const initialPV = p0 * v0;

    function segmentState(segment, fraction) {
      const {start, end, type} = segment;
      const v = start.v + (end.v - start.v) * fraction;
      if (type === 'isothermal') {
        const pv = start.p * start.v;
        return {v, p: pv / v, w: pv * Math.log(v / start.v)};
      }
      const p = start.p + (end.p - start.p) * fraction;
      return {v, p, w: type === 'isobaric' ? start.p * (v - start.v) : 0};
    }

    function along(route, progress) {
      const cursor = progress * route.length;
      const index = Math.min(route.length - 1, Math.floor(cursor));
      const {v, p, w} = segmentState(route[index], cursor - index);
      let work = w;
      for (let i = 0; i < index; i++) work += segmentState(route[i], 1).w;
      const deltaU = 1.5 * (p * v - initialPV);
      return {v, p, work, deltaU, heat: deltaU + work, temperature: p * v / (.1 * gasConstant)};
    }

    const stage = duration / routeA.length;
    return trajectory(duration, time => {
      const left = along(routeA, time / duration);
      const right = along(routeB, time / duration);
      return {
        x: -1, y: .2 + .28 * left.v, z: 0,
        left, right,
        volumeA: left.v, volumeB: right.v, pressureA: left.p, pressureB: right.p,
        temperatureA: left.temperature, temperatureB: right.temperature,
        deltaU: left.deltaU, deltaUB: right.deltaU,
        workA: left.work, workB: right.work, heatA: left.heat, heatB: right.heat
      };
    }, {
      schematic: true, hidePrimary: true,
      bounds: {min: [-1.7, 0, -.5], max: [1.7, 2.25, .5]},
      events: [
        {t: stage, label: 'A、B 切換至各自的第二段過程'},
        ...(cycle ? [{t: duration / 2, label: '兩邊抵達共同終點，交換路徑返回'}] : [])
      ],
      positionPlot: {
        modeLabel: 'P–V 路徑圖',
        curves: [a, b].map(route => route.flatMap(segment => Array.from(
          {length: 33}, (_, i) => segmentState(segment, i / 32)
        )))
      },
      endLabel: cycle ? '回到共同初態，比較淨熱量與淨功' : '抵達共同終態，比較 Q、W 與 ΔU'
    });
  }, 'models/pv-path.js');
  const def = Mechanics.defs.find(d => d.id === 'pv-path');
  def.defaultPlotMode = 'position';
  def.initialView = {yaw: -.22, pitch: .22};
  def.plotMetrics = [
    metric('deltaUB', 'B 內能變化', 'J'),
    metric('heatA', 'A 累積吸熱', 'J'), metric('heatB', 'B 累積吸熱', 'J'),
    metric('pressureA', 'A 壓力', 'kPa'), metric('pressureB', 'B 壓力', 'kPa'),
    metric('volumeA', 'A 體積', 'L'), metric('volumeB', 'B 體積', 'L'),
    metric('temperatureA', 'A 溫度', 'K'), metric('temperatureB', 'B 溫度', 'K')
  ];
})(typeof module !== 'undefined' && module.exports ? require('../mechanics-models.js') : globalThis.Mechanics);
