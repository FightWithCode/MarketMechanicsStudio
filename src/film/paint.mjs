export const ink = '#27212b';
export const tau = Math.PI * 2;
export const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const mix = (a, b, amount) => a + (b - a) * amount;
export const step = (time, from, to) => clamp((time - from) / (to - from));
export const smooth = (time, from, to) => {
  const t = step(time, from, to);
  return t * t * (3 - 2 * t);
};
export const easeOut = (time, from, to) => 1 - (1 - step(time, from, to)) ** 3;
export const pulse = (time, from, peak, to) => smooth(time, from, peak) * (1 - smooth(time, peak, to));
export const move = (from, to, t) => [mix(from[0], to[0], t), mix(from[1], to[1], t)];
export const noise = seed => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

export function layer(ctx, fn) {
  ctx.save();
  try { fn(); } finally { ctx.restore(); }
}

export function path(ctx, commands, fill, stroke, width = 2) {
  ctx.beginPath();
  for (const [kind, ...points] of commands) {
    if (kind === 'M') ctx.moveTo(...points);
    else if (kind === 'L') ctx.lineTo(...points);
    else if (kind === 'Q') ctx.quadraticCurveTo(...points);
    else if (kind === 'C') ctx.bezierCurveTo(...points);
    else ctx.closePath();
  }
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function poly(ctx, points, fill, stroke, width) {
  path(ctx, [...points.map(([x,y], i) => [i === 0 ? 'M' : 'L', x, y]), ['Z']], fill, stroke, width);
}

export function rect(ctx, x, y, w, h, radius, fill, stroke, width = 2) {
  ctx.beginPath();
  if (radius) ctx.roundRect(x, y, w, h, radius);
  else ctx.rect(x, y, w, h);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function ellipse(ctx, x, y, rx, ry, fill, stroke, width = 2, angle = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, angle, 0, tau);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function line(ctx, points, color, width = 2) {
  path(ctx, points.map(([x,y], i) => [i === 0 ? 'M' : 'L', x, y]), null, color, width);
}

export function linear(ctx, x, y, x2, y2, stops) {
  const gradient = ctx.createLinearGradient(x, y, x2, y2);
  for (const [pos, color] of stops) gradient.addColorStop(pos, color);
  return gradient;
}

export function radial(ctx, x, y, radius, stops) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  for (const [pos, color] of stops) gradient.addColorStop(pos, color);
  return gradient;
}

export function lettering(ctx, text, x, y, {size=20, color='#f5e1b7', family='"DejaVu Sans", sans-serif', weight=700, align='center', outline, maxWidth} = {}) {
  ctx.font = weight + ' ' + size + 'px ' + family;
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;
  if (outline) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = outline;
    ctx.strokeText(text, x, y, maxWidth);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y, maxWidth);
}

export function cover(ctx, image, w, h, {focusX=.5, anchor=.5, y=h/2, overscan=1}={}) {
  const scale = Math.max(w/image.width, h/image.height) * overscan;
  const width = image.width * scale;
  const height = image.height * scale;
  const x = clamp(w/2 - width*focusX, w-width, 0);
  const top = clamp(y - height*anchor, h-height, 0);
  ctx.drawImage(image, x, top, width, height);
  return {x, y:top, w:width, h:height};
}

export function camera(ctx, {w, h}, scale, subject, action) {
  const x = scale>=1 ? clamp(subject[0],w/(2*scale),w-w/(2*scale)) : subject[0];
  const y = scale>=1 ? clamp(subject[1],h/(2*scale),h-h/(2*scale)) : subject[1];
  layer(ctx, () => {
    ctx.translate(w/2, h/2);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);
    action();
  });
}

export function vignette(ctx, w, h, strength) {
  const gradient = ctx.createRadialGradient(w*.49, h*.44, h*.22, w*.49, h*.44, Math.hypot(w,h)*.55);
  gradient.addColorStop(0, 'rgba(12,8,20,0)');
  gradient.addColorStop(.64, 'rgba(12,8,20,'+strength*.34+')');
  gradient.addColorStop(1, 'rgba(12,8,20,'+strength+')');
  rect(ctx, 0, 0, w, h, 0, gradient);
}
