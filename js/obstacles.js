import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';
import { W, rand, lerp } from './constants.js';

// 3D Skull rendering used by both obstacles and player
export function drawSkull3D(x, y, size, baseColor, highlight, shadowDir) {
  const { ctx } = gameState;
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + size * 0.35, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head - main sphere
  const headR = size * 0.45;
  const grd = ctx.createRadialGradient(x - headR * 0.3, y - size * 0.1 - headR * 0.3, headR * 0.1, x, y - size * 0.1, headR);
  grd.addColorStop(0, `rgb(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)})`);
  grd.addColorStop(0.5, baseColor);
  grd.addColorStop(1, `rgb(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)})`);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, headR, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  ctx.fillStyle = `rgba(255,255,255,${highlight || 0.15})`;
  ctx.beginPath();
  ctx.ellipse(x - headR * 0.25, y - size * 0.1 - headR * 0.3, headR * 0.2, headR * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Jaw
  const jawGrd = ctx.createLinearGradient(x, y + size * 0.15, x, y + size * 0.4);
  jawGrd.addColorStop(0, baseColor);
  jawGrd.addColorStop(1, `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)})`);
  ctx.fillStyle = jawGrd;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.25, y + size * 0.35, x - size * 0.15, y + size * 0.38);
  ctx.lineTo(x + size * 0.15, y + size * 0.38);
  ctx.quadraticCurveTo(x + size * 0.25, y + size * 0.35, x + size * 0.22, y + size * 0.15);
  ctx.closePath();
  ctx.fill();

  // Eyes
  const eyeR = size * 0.11;
  for (let side = -1; side <= 1; side += 2) {
    const ex = x + side * size * 0.15;
    const ey = y - size * 0.12;
    const eyeGrd = ctx.createRadialGradient(ex, ey, eyeR * 0.2, ex, ey, eyeR);
    eyeGrd.addColorStop(0, '#000');
    eyeGrd.addColorStop(0.7, '#110005');
    eyeGrd.addColorStop(1, `rgb(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)})`);
    ctx.fillStyle = eyeGrd;
    ctx.beginPath();
    ctx.ellipse(ex, ey, eyeR, eyeR * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = '#0a0003';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.02);
  ctx.lineTo(x - size * 0.04, y + size * 0.1);
  ctx.lineTo(x + size * 0.04, y + size * 0.1);
  ctx.closePath();
  ctx.fill();

  // Teeth
  ctx.fillStyle = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
  for (let i = -2; i <= 2; i++) {
    const tx = x + i * size * 0.065;
    ctx.fillRect(tx - 2, y + size * 0.15, 4, size * 0.12);
    ctx.fillStyle = `rgba(0,0,0,0.2)`;
    ctx.fillRect(tx - 2, y + size * 0.15, 4, 2);
    ctx.fillStyle = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
  }
}

export function drawObstacle(o) {
  const { ctx, frameCount } = gameState;
  const { sx, sy, scale, depth } = worldToScreen(o.x, o.y);
  if (sx < -100 || sx > W + 100) return;
  ctx.save();

  const sw = o.w * scale;
  const sh = o.h * scale;

  switch (o.type.pattern) {
    case 'pillar': {
      const pw = sw, ph = sh;
      const sideW = pw * 0.3;
      ctx.fillStyle = '#660000';
      ctx.beginPath();
      ctx.moveTo(sx + pw / 2, sy);
      ctx.lineTo(sx + pw / 2 + sideW, sy - sideW * 0.5);
      ctx.lineTo(sx + pw / 2 + sideW, sy - sideW * 0.5 + ph);
      ctx.lineTo(sx + pw / 2, sy + ph);
      ctx.closePath();
      ctx.fill();
      const pgrd = ctx.createLinearGradient(sx - pw / 2, sy, sx + pw / 2, sy);
      pgrd.addColorStop(0, '#cc2200');
      pgrd.addColorStop(0.3, '#ff4400');
      pgrd.addColorStop(0.7, '#ff3300');
      pgrd.addColorStop(1, '#991100');
      ctx.fillStyle = pgrd;
      ctx.fillRect(sx - pw / 2, sy, pw, ph);
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.moveTo(sx - pw / 2, sy);
      ctx.lineTo(sx - pw / 2 + sideW, sy - sideW * 0.5);
      ctx.lineTo(sx + pw / 2 + sideW, sy - sideW * 0.5);
      ctx.lineTo(sx + pw / 2, sy);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 8; i++) {
        const fx = sx - pw / 2 + Math.random() * pw;
        const fy = sy - Math.random() * 20 * scale;
        const fr = rand(3, 8) * scale;
        const fgrd = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
        fgrd.addColorStop(0, `rgba(255,${Math.floor(rand(180, 255))},50,0.9)`);
        fgrd.addColorStop(0.5, 'rgba(255,100,0,0.4)');
        fgrd.addColorStop(1, 'rgba(255,50,0,0)');
        ctx.fillStyle = fgrd;
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.fill();
      }
      const flGrd = ctx.createRadialGradient(sx, sy + ph, 0, sx, sy + ph, pw * 1.5);
      flGrd.addColorStop(0, 'rgba(255,60,0,0.2)');
      flGrd.addColorStop(1, 'rgba(255,30,0,0)');
      ctx.fillStyle = flGrd;
      ctx.fillRect(sx - pw * 1.5, sy + ph - pw * 0.5, pw * 3, pw * 1.5);
      break;
    }
    case 'skull': {
      const bob = Math.sin(frameCount * 0.05 + o.sinOffset) * 5 * scale;
      const skullY = sy + bob;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + sw * 0.6, sw * 0.4, sw * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      const aGrd = ctx.createRadialGradient(sx, skullY, sw * 0.2, sx, skullY, sw * 0.8);
      aGrd.addColorStop(0, 'rgba(255,0,80,0.3)');
      aGrd.addColorStop(1, 'rgba(255,0,40,0)');
      ctx.fillStyle = aGrd;
      ctx.beginPath();
      ctx.arc(sx, skullY, sw * 0.8, 0, Math.PI * 2);
      ctx.fill();
      drawSkull3D(sx, skullY, sw, '#cc0044', 0.12);
      for (let side = -1; side <= 1; side += 2) {
        const ex = sx + side * sw * 0.15;
        const ey = skullY - sw * 0.12;
        const egrd = ctx.createRadialGradient(ex, ey, 0, ex, ey, 5 * scale);
        egrd.addColorStop(0, 'rgba(255,255,0,1)');
        egrd.addColorStop(0.5, 'rgba(255,200,0,0.5)');
        egrd.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = egrd;
        ctx.beginPath();
        ctx.arc(ex, ey, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'saw': {
      o.angle += 0.18;
      ctx.translate(sx, sy);
      ctx.rotate(o.angle);
      const sawR = 28 * scale;
      const sgrd = ctx.createRadialGradient(0, 0, sawR * 0.2, 0, 0, sawR);
      sgrd.addColorStop(0, '#fff');
      sgrd.addColorStop(0.3, '#ddd');
      sgrd.addColorStop(0.6, '#999');
      sgrd.addColorStop(1, '#555');
      ctx.fillStyle = sgrd;
      ctx.beginPath();
      const teeth = 16;
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const r = i % 2 === 0 ? sawR : sawR * 0.72;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      const hgrd = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * scale);
      hgrd.addColorStop(0, '#888');
      hgrd.addColorStop(0.5, '#555');
      hgrd.addColorStop(1, '#333');
      ctx.fillStyle = hgrd;
      ctx.beginPath();
      ctx.arc(0, 0, 7 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180, 0, 20, 0.6)';
      for (let i = 0; i < 5; i++) {
        const ba = rand(0, Math.PI * 2);
        const br = rand(sawR * 0.3, sawR * 0.8);
        ctx.beginPath();
        ctx.arc(Math.cos(ba) * br, Math.sin(ba) * br, rand(1, 3) * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(200,200,200,0.08)';
      ctx.lineWidth = sawR * 0.6;
      ctx.beginPath();
      ctx.arc(0, 0, sawR * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'geyser': {
      const baseW = 14 * scale;
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.ellipse(sx, sy + sh, baseW, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.ellipse(sx, sy + sh, baseW * 0.5, 2 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let row = 0; row < sh; row += 2) {
        const t = row / sh;
        const wobble = Math.sin((frameCount * 0.12 + row * 0.08) + o.sinOffset) * (8 + t * 12) * scale;
        const width = lerp(baseW, baseW * 0.3, t) * (1 + Math.sin(frameCount * 0.1 + row * 0.05) * 0.2);
        const r = Math.floor(lerp(255, 255, t));
        const g = Math.floor(lerp(200, 40, t));
        const b = Math.floor(lerp(50, 0, t));
        const alpha = lerp(0.9, 0.1, t);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillRect(sx - width / 2 + wobble, sy + sh - row, width, 3);
      }
      ctx.globalCompositeOperation = 'lighter';
      const cGrd = ctx.createLinearGradient(sx, sy + sh, sx, sy);
      cGrd.addColorStop(0, 'rgba(255,200,50,0.4)');
      cGrd.addColorStop(0.5, 'rgba(255,100,0,0.15)');
      cGrd.addColorStop(1, 'rgba(255,50,0,0)');
      ctx.fillStyle = cGrd;
      ctx.fillRect(sx - baseW * 0.3, sy, baseW * 0.6, sh);
      ctx.globalCompositeOperation = 'source-over';
      break;
    }
    case 'spike': {
      const spikeW = sw;
      const spikeH = sh;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + spikeH, spikeW * 0.6, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#550011';
      ctx.beginPath();
      ctx.moveTo(sx + 2, sy);
      ctx.lineTo(sx + spikeW / 2 + 2, sy + spikeH);
      ctx.lineTo(sx + spikeW / 2, sy + spikeH);
      ctx.lineTo(sx, sy);
      ctx.closePath();
      ctx.fill();
      const spGrd = ctx.createLinearGradient(sx - spikeW / 2, sy, sx, sy);
      spGrd.addColorStop(0, '#880022');
      spGrd.addColorStop(1, '#cc0033');
      ctx.fillStyle = spGrd;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - spikeW / 2, sy + spikeH);
      ctx.lineTo(sx + spikeW / 2, sy + spikeH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,100,100,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - spikeW * 0.15, sy + spikeH * 0.6);
      ctx.stroke();
      const dripT = ((frameCount * 2 + o.sinOffset * 100) % 80) / 80;
      const dripY = sy + dripT * spikeH;
      const dripGrd = ctx.createRadialGradient(sx, dripY, 0, sx, dripY, 4 * scale);
      dripGrd.addColorStop(0, 'rgba(200,0,20,0.8)');
      dripGrd.addColorStop(1, 'rgba(150,0,10,0)');
      ctx.fillStyle = dripGrd;
      ctx.beginPath();
      ctx.ellipse(sx, dripY, 3 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'chain': {
      const chainLen = o.h * scale;
      const linkSize = 8 * scale;
      ctx.lineWidth = 3 * scale;
      for (let i = 0; i < chainLen; i += linkSize * 1.2) {
        const rawCx = Math.sin((i / scale + frameCount * 3) * 0.05) * 25 * scale;
        const cx = sx + rawCx;
        const cy = sy + i - chainLen / 2;
        const metalGrd = ctx.createLinearGradient(cx - linkSize / 2, cy, cx + linkSize / 2, cy);
        metalGrd.addColorStop(0, '#aaa');
        metalGrd.addColorStop(0.5, '#666');
        metalGrd.addColorStop(1, '#333');
        ctx.strokeStyle = metalGrd;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.ellipse(cx, cy, linkSize * 0.35, linkSize * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (Math.floor(i / linkSize) % 2 === 0) {
          ctx.fillStyle = '#999';
          ctx.beginPath();
          ctx.moveTo(cx - linkSize * 0.7, cy);
          ctx.lineTo(cx - linkSize * 0.2, cy - 3 * scale);
          ctx.lineTo(cx - linkSize * 0.2, cy + 3 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.beginPath();
          ctx.moveTo(cx - linkSize * 0.7, cy);
          ctx.lineTo(cx - linkSize * 0.3, cy - 1);
          ctx.lineTo(cx - linkSize * 0.3, cy + 1);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    }
  }
  ctx.restore();
}
