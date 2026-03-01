import { gameState } from './state.js';
import { W, H, HORIZON, rand, clamp, lerp } from './constants.js';

export function drawFloor() {
  const { ctx, lavaGlowPhase, frameCount } = gameState;

  // Lava gradient
  const floorGrd = ctx.createLinearGradient(0, HORIZON, 0, H);
  floorGrd.addColorStop(0, '#1a0a00');
  floorGrd.addColorStop(0.3, '#3a1a08');
  floorGrd.addColorStop(0.6, '#5a2a10');
  floorGrd.addColorStop(1, '#4a1a00');
  ctx.fillStyle = floorGrd;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  // Perspective grid — vertical lines converging rightward
  ctx.strokeStyle = 'rgba(255,100,50,0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const x = t * W;
    ctx.globalAlpha = (1 - t) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x, HORIZON);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  // Horizontal depth lines
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    const y = HORIZON + t * (H - HORIZON);
    ctx.globalAlpha = t * 0.15;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cracks
  ctx.strokeStyle = 'rgba(20,0,0,0.4)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const startY = HORIZON + rand(0, H - HORIZON);
    const startX = rand(0, W);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    let x = startX, y = startY;
    for (let j = 0; j < 5; j++) {
      x += rand(-30, 30);
      y += rand(20, 50);
      if (y > H) y = H;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Lava glow/pulse
  ctx.globalAlpha = 0.3 + Math.sin(lavaGlowPhase) * 0.2;
  const glowGrd = ctx.createRadialGradient(W / 2, H, 100, W / 2, H - 200, 400);
  glowGrd.addColorStop(0, 'rgba(255,100,0,0.6)');
  glowGrd.addColorStop(1, 'rgba(255,50,0,0)');
  ctx.fillStyle = glowGrd;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  ctx.globalAlpha = 1;
}

export function drawCeiling() {
  const { ctx, frameCount } = gameState;

  // Sky gradient
  const skyGrd = ctx.createLinearGradient(0, 0, 0, HORIZON);
  skyGrd.addColorStop(0, '#1a0a1a');
  skyGrd.addColorStop(0.3, '#2a0a2a');
  skyGrd.addColorStop(0.7, '#1a0a1a');
  skyGrd.addColorStop(1, '#000');
  ctx.fillStyle = skyGrd;
  ctx.fillRect(0, 0, W, HORIZON);

  // Stalactites
  ctx.strokeStyle = '#4a3a2a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 15; i++) {
    const x = (i / 15) * W;
    const baseLen = 20 + Math.sin(frameCount * 0.05 + i) * 10;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, baseLen);
    ctx.stroke();
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.arc(x, baseLen, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Drips
  for (let i = 0; i < 5; i++) {
    const dx = rand(0, W);
    const drip = ((frameCount * 2 + i * 100) % 200) / 200;
    if (drip > 0 && drip < 1) {
      ctx.fillStyle = 'rgba(100,50,0,0.6)';
      ctx.beginPath();
      ctx.ellipse(dx, HORIZON + drip * 50, 1.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Particles/dust
  ctx.fillStyle = 'rgba(200,100,50,0.1)';
  for (let i = 0; i < 20; i++) {
    const px = (frameCount * 0.1 + i * 45) % (W + 10) - 5;
    const py = (frameCount * 0.3 + i * 30) % HORIZON;
    ctx.beginPath();
    ctx.arc(px, py, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawMountains() {
  const { ctx, mountainLayers } = gameState;

  for (const layer of mountainLayers) {
    const colors = ['#1a3a5a', '#2a4a6a', '#3a5a7a'];
    ctx.fillStyle = colors[layer.color] || '#1a3a5a';

    ctx.beginPath();
    let firstPoint = true;
    for (let i = 0; i < layer.pts.length; i++) {
      const pt = layer.pts[i];
      const x = pt.x - layer.offset;
      const y = pt.y;
      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.lineTo(W + 50, HORIZON);
    ctx.lineTo(-50, HORIZON);
    ctx.closePath();
    ctx.fill();

    // Mountain edge highlight
    ctx.strokeStyle = `rgba(100,150,200,${0.1 + layer.color * 0.05})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    firstPoint = true;
    for (const pt of layer.pts) {
      const x = pt.x - layer.offset;
      const y = pt.y;
      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}
