function vector(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm(a) {
  const l = Math.hypot(...a) || 1;
  return a.map(v => v / l);
}
let eye, right, up, forward, focal;
function updateCamera() {
  const cp = Math.cos(camera.pitch),
    sp = Math.sin(camera.pitch),
    dist = (scale * 1.3) / camera.zoom;
  eye = [
    camera.target[0] + Math.sin(camera.yaw) * cp * dist,
    camera.target[1] + sp * dist,
    camera.target[2] + Math.cos(camera.yaw) * cp * dist
  ];
  forward = norm(vector(camera.target, eye));
  right = norm(cross(forward, [0, 1, 0]));
  up = cross(right, forward);
  focal = Math.min(W * 0.85, Math.max(130, H - 110) * 1.2);
  keyLabels = [];
  minorLabels = [];
}
// 手機寬度（< 600px）：標籤縮小。重疊避讓見 label()。
let keyLabels = [],
  minorLabels = [];
function labelSize(size) {
  return W >= 600 ? size : Math.max(9, Math.round(size * Math.max(0.78, W / 600)));
}
function labelBox(text, x, y, font, size, align) {
  ctx.font = font;
  const w = ctx.measureText(text)?.width ?? text.length * size;
  return { l: align === 'center' ? x - w / 2 : x, r: align === 'center' ? x + w / 2 : x + w, t: y - size, b: y + 2 };
}
const overlaps = (box, list) =>
  list.some(o => box.l < o.r + 2 && box.r > o.l - 2 && box.t < o.b + 1 && box.b > o.t - 1);
function project(a) {
  const d = vector(a, eye),
    depth = dot(d, forward);
  if (depth < scale * 0.015) return null;
  const bounds = sceneBounds();
  return {
    x: W / 2 + (dot(d, right) * focal) / depth,
    y: (bounds.top + bounds.bottom) / 2 - (dot(d, up) * focal) / depth,
    d: depth
  };
}
function nice(n) {
  const power = 10 ** Math.floor(Math.log10(Math.max(n, 1e-8))),
    f = n / power;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * power;
}

let primitives = [];
function polygon(points, fill, stroke) {
  const pts = points.map(project);
  if (pts.some(a => !a)) return;
  primitives.push({
    depth: pts.reduce((s, a) => s + a.d, 0) / pts.length,
    paint: () => {
      ctx.beginPath();
      pts.forEach((a, i) => (i ? ctx.lineTo(a.x, a.y) : ctx.moveTo(a.x, a.y)));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  });
}
function segment(a, b, color, width = 1, dashed = false) {
  const A = project(a),
    B = project(b);
  if (!A || !B) return;
  primitives.push({
    depth: (A.d + B.d) / 2 - 0.0001 * scale,
    paint: () => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dashed ? [5, 5] : []);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}
function label(pos, text, color = '#355461', size = 11, minor = false) {
  const a = project(pos);
  if (!a) return;
  const px = labelSize(size),
    font = `600 ${px}px system-ui`;
  primitives.push({
    depth: a.d - 0.001 * scale,
    // 標籤避讓（所有寬度）：與已畫的標籤重疊時，依序上下錯開一行找空位，並畫細引線回到原錨點；
    // 次要標籤（格線刻度）找不到空位就略過，實驗標籤找不到空位時仍畫在原位。
    paint: () => {
      const step = px + 3;
      let y = a.y - 6,
        box = labelBox(text, a.x, y, font, px, 'center');
      const taken = b => overlaps(b, keyLabels) || overlaps(b, minorLabels);
      if (taken(box)) {
        let found = null;
        for (const k of [-1, 1, -2, 2, -3, 3]) {
          const candidate = labelBox(text, a.x, a.y - 6 + k * step, font, px, 'center');
          if (!taken(candidate)) {
            found = { y: a.y - 6 + k * step, box: candidate };
            break;
          }
        }
        if (found) ({ y, box } = found);
        else if (minor) return;
      }
      (minor ? minorLabels : keyLabels).push(box);
      if (Math.abs(y - (a.y - 6)) > step * 1.5) {
        ctx.strokeStyle = '#5a6f7580';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - 4);
        ctx.lineTo(a.x, y < a.y ? y + 3 : y - px);
        ctx.stroke();
      }
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.strokeStyle = '#e5f1efcc';
      ctx.lineWidth = 3;
      ctx.strokeText(text, a.x, y);
      ctx.fillText(text, a.x, y);
    }
  });
}
function sphere(center, radius, color = '#ffa04c') {
  const rgb = /^#[0-9a-f]{6}$/i.test(color) ? [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16)) : [255, 160, 76];
  const lat = 10,
    lon = 16,
    light = norm([-0.4, 0.9, 0.5]);
  function vertex(i, j) {
    const a = (Math.PI * i) / lat,
      b = (TAU * j) / lon;
    return [
      center[0] + radius * Math.sin(a) * Math.cos(b),
      center[1] + radius * Math.cos(a),
      center[2] + radius * Math.sin(a) * Math.sin(b)
    ];
  }
  for (let i = 0; i < lat; i++)
    for (let j = 0; j < lon; j++) {
      const a = vertex(i, j),
        b = vertex(i + 1, j),
        c = vertex(i + 1, j + 1),
        d = vertex(i, j + 1),
        normal = norm(
          vector(
            [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4],
            center
          )
        );
      if (dot(normal, vector(eye, center)) < 0) continue;
      const k = 0.48 + 0.52 * Math.max(0, dot(normal, light));
      polygon([a, b, c, d], `rgb(${Math.round(rgb[0] * k)},${Math.round(rgb[1] * k)},${Math.round(rgb[2] * k)})`);
    }
}
// 全站物理量固定色（場景是淺色背景，比 lab.css 的 --q-* 深一階）；合力另用較粗箭桿，不只靠顏色辨識。
const quantityColors = { velocity: '#06647b', acceleration: '#9a4a06', force: '#a8291f' };
function arrow(a, b, color, text) {
  segment(a, b, color, color === quantityColors.force ? 4.5 : 3);
  const A = project(a),
    B = project(b);
  if (!A || !B || Math.hypot(A.x - B.x, A.y - B.y) < 3) return;
  const px = labelSize(12),
    font = `bold ${px}px system-ui`;
  if (W < 600) keyLabels.push(labelBox(text, B.x + 7, B.y - 7, font, px, 'left'));
  primitives.push({
    depth: B.d - 0.002 * scale,
    paint: () => {
      const ang = Math.atan2(B.y - A.y, B.x - A.x);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(B.x, B.y);
      ctx.lineTo(B.x - 11 * Math.cos(ang - 0.4), B.y - 11 * Math.sin(ang - 0.4));
      ctx.lineTo(B.x - 11 * Math.cos(ang + 0.4), B.y - 11 * Math.sin(ang + 0.4));
      ctx.fill();
      ctx.font = font;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#19333f';
      ctx.fillText(text, B.x + 7, B.y - 7);
    }
  });
}
