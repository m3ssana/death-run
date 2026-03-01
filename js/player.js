import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';
import { drawSkull3D } from './obstacles.js';

export function drawPlayer() {
  const { ctx, player, invincible, frameCount, dashCooldown } = gameState;
  if (invincible > 0 && Math.floor(frameCount / 3) % 2 === 0) return;
  const { sx, sy, scale, depth } = worldToScreen(player.x, player.y);
  const sz = 30 * scale;

  // Trail with perspective
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < player.trail.length; i++) {
    const t = player.trail[i];
    const ts = worldToScreen(t.x, t.y);
    const a = (i / player.trail.length) * 0.25;
    ctx.globalAlpha = a;
    const tsz = 24 * ts.scale;
    drawSkull3D(ts.sx, ts.sy - tsz * 0.3, tsz, dashCooldown < 30 ? '#ff2233' : '#cc4400', 0.05);
  }
  ctx.globalAlpha = 1;

  // Player glow (dynamic light)
  const glowR = 60 * scale;
  const pgrd = ctx.createRadialGradient(sx, sy, 5 * scale, sx, sy, glowR);
  pgrd.addColorStop(0, 'rgba(255, 30, 60, 0.35)');
  pgrd.addColorStop(0.5, 'rgba(255, 10, 30, 0.1)');
  pgrd.addColorStop(1, 'rgba(255, 0, 20, 0)');
  ctx.fillStyle = pgrd;
  ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);

  // Floor reflection
  ctx.globalAlpha = 0.15;
  ctx.save();
  ctx.translate(sx, sy + sz * 1.1);
  ctx.scale(1, -0.3);
  drawSkull3D(0, 0, sz * 0.8, '#ff1122', 0.02);
  ctx.restore();
  ctx.globalAlpha = 1;

  // Body - skeleton with 3D bone shading
  const boneGrd = ctx.createLinearGradient(sx - 2, sy, sx + 2, sy + sz);
  boneGrd.addColorStop(0, '#eee');
  boneGrd.addColorStop(0.5, '#ccc');
  boneGrd.addColorStop(1, '#888');
  ctx.strokeStyle = boneGrd;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';

  // Spine
  ctx.beginPath();
  ctx.moveTo(sx, sy + sz * 0.25);
  ctx.lineTo(sx, sy + sz * 0.75);
  ctx.stroke();

  // Ribs
  for (let i = 0; i < 3; i++) {
    const ry = sy + sz * (0.3 + i * 0.12);
    const rw = (8 - i * 1.5) * scale;
    ctx.beginPath();
    ctx.ellipse(sx, ry, rw, 2 * scale, 0, 0, Math.PI);
    ctx.stroke();
  }

  // Arms
  const armWave = Math.sin(frameCount * 0.15) * 6 * scale;
  const lean = player.lean * scale;
  ctx.beginPath();
  ctx.moveTo(sx - 14 * scale + lean, sy + sz * 0.3 + armWave);
  ctx.quadraticCurveTo(sx - 8 * scale, sy + sz * 0.35, sx, sy + sz * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 14 * scale + lean, sy + sz * 0.3 - armWave);
  ctx.quadraticCurveTo(sx + 8 * scale, sy + sz * 0.35, sx, sy + sz * 0.32);
  ctx.stroke();
  // Hands
  ctx.fillStyle = '#ddd';
  ctx.beginPath();
  ctx.arc(sx - 14 * scale + lean, sy + sz * 0.3 + armWave, 2.5 * scale, 0, Math.PI * 2);
  ctx.arc(sx + 14 * scale + lean, sy + sz * 0.3 - armWave, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const legWave = Math.sin(frameCount * 0.2) * 5 * scale;
  ctx.strokeStyle = boneGrd;
  ctx.beginPath();
  ctx.moveTo(sx - 8 * scale, sy + sz + legWave);
  ctx.quadraticCurveTo(sx - 4 * scale, sy + sz * 0.85, sx, sy + sz * 0.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + 8 * scale, sy + sz - legWave);
  ctx.quadraticCurveTo(sx + 4 * scale, sy + sz * 0.85, sx, sy + sz * 0.75);
  ctx.stroke();
  // Feet
  ctx.fillStyle = '#bbb';
  ctx.beginPath();
  ctx.ellipse(sx - 8 * scale, sy + sz + legWave, 3 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(sx + 8 * scale, sy + sz - legWave, 3 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Skull head
  drawSkull3D(sx, sy, sz, '#eeddcc', 0.2);

  // Flame eyes
  if (dashCooldown > 0 && dashCooldown < 50) {
    for (let side = -1; side <= 1; side += 2) {
      const ex = sx + side * sz * 0.15;
      const ey = sy - sz * 0.12;
      const fgrd = ctx.createRadialGradient(ex, ey, 1, ex, ey - 4 * scale, 6 * scale);
      fgrd.addColorStop(0, 'rgba(255,255,100,1)');
      fgrd.addColorStop(0.4, 'rgba(255,50,0,0.8)');
      fgrd.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = fgrd;
      ctx.fillRect(ex - 6 * scale, ey - 8 * scale, 12 * scale, 12 * scale);
    }
  }

  ctx.lineCap = 'butt';
}
