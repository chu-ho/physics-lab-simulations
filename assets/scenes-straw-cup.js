'use strict';
let strawRaster = null,
  strawRasterKey = '';
function drawStrawCup(s) {
  const sim = simulation,
    p = params,
    G = Mechanics.WaterOptics,
    interactive = typeof pointers !== 'undefined' && pointers.size > 0,
    key = JSON.stringify([W, H, camera, p.shape, p.n, p.height, p.tilt, interactive]);
  if (key !== strawRasterKey) {
    const width = Math.min(interactive ? 200 : 480, Math.ceil(W / (interactive ? 5 : 2))),
      height = Math.min(interactive ? 140 : 340, Math.ceil(H / (interactive ? 5 : 2)));
    strawRaster = document.createElement('canvas');
    strawRaster.width = width;
    strawRaster.height = height;
    const context = strawRaster.getContext('2d'),
      raster = context.createImageData(width, height),
      bounds = sceneBounds(),
      dot = (a, b) => a.reduce((v, x, j) => v + x * b[j], 0),
      unit = v => {
        const m = Math.hypot(...v);
        return v.map(x => x / m);
      },
      advance = (o, d, t) => o.map((x, j) => x + d[j] * t),
      light = unit([-0.5, 1, 0.8]);
    for (let row = 0; row < height; row++)
      for (let col = 0; col < width; col++) {
        const sx = (((col + 0.5) * W) / width - W / 2) / focal,
          sy = -(((row + 0.5) * H) / height - (bounds.top + bounds.bottom) / 2) / focal;
        let dir = unit(forward.map((v, j) => v + sx * right[j] + sy * up[j])),
          origin = [...eye],
          inside = G.inside(origin, p.shape, sim.radius, sim.height),
          tint = 1,
          rgb = null;
        for (let bounce = 0; bounce < 8; bounce++) {
          const water = G.waterHit(origin, dir, p.shape, sim.radius, sim.height),
            straw = G.strawHit(origin, dir, sim.bottom, sim.top, sim.strawRadius);
          if (straw && (!water || straw.t < water.t)) {
            const color = Math.floor(straw.along / 0.22) % 2 ? [49, 178, 195] : [51, 83, 168],
              shade = 0.5 + 0.5 * Math.max(0, dot(straw.normal, light));
            rgb = color.map(x => x * shade * tint);
            break;
          }
          if (!water) {
            if (dir[1] < -1e-8) {
              const t = (-0.025 - origin[1]) / dir[1];
              if (t > 0) {
                const floor = advance(origin, dir, t),
                  // 每個取樣點在地板上涵蓋的長度（斜看時拉長），用來做方框濾波的棋盤格。
                  footprint = ((t / focal) * (W / width)) / Math.max(0.05, -dir[1]),
                  shade = filteredChecker(floor[0], floor[2], footprint);
                rgb = [152, 175, 161].map((x, j) => (x + ([186, 201, 185][j] - x) * shade) * tint);
                break;
              }
            }
            rgb = [156 + (row / height) * 40, 188 + (row / height) * 20, 202 - (row / height) * 10];
            break;
          }
          const result = G.bend(dir, water.normal, inside ? p.n : 1, inside ? 1 : p.n);
          dir = result.direction;
          origin = advance(water.point, dir, 1e-6);
          if (!result.tir) inside = !inside;
          tint *= p.n === 1 ? 1 : 0.985;
        }
        if (!rgb) rgb = [53, 74, 87];
        const offset = (row * width + col) * 4;
        for (let j = 0; j < 3; j++) raster.data[offset + j] = Math.max(0, Math.min(255, Math.round(rgb[j])));
        raster.data[offset + 3] = 255;
      }
    context.putImageData(raster, 0, 0);
    strawRasterKey = key;
  }
  ctx.drawImage(strawRaster, 0, 0, W, H);
  if (p.truth) segment(sim.bottom, sim.top, '#c78652', 3, true);
  label([0, sim.height + 1, 0], (p.shape ? '長方形' : '圓柱') + '容器 · n=' + p.n.toFixed(2), '#a5804b', 13);
  label([0, sim.height + 0.7, 0], p.truth ? '虛線：真實吸管位置' : '旋轉視角比較水上／水下條紋外觀', '#839a9c', 11);
}
