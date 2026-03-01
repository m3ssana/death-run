import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';

export function drawSoul(s) {
  const { ctx } = gameState;
  s.pulse = (s.pulse || 0) + 0.08;
  const { sx, sy, scale } = worldToScreen(s.x, s.y);
  const baseSz = (s.size + Math.sin(s.pulse) * 3) * scale;

  // Floor reflection
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = 'rgba(170,0,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + 10 * scale, baseSz * 0.6, baseSz * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Glow aura
  const auraGrd = ctx.createRadialGradient(sx, sy, baseSz * 0.3, sx, sy, baseSz * 0.9);
  auraGrd.addColorStop(0, 'rgba(170,0,255,0.6)');
  auraGrd.addColorStop(0.5, 'rgba(170,0,255,0.2)');
  auraGrd.addColorStop(1, 'rgba(170,0,255,0)');
  ctx.fillStyle = auraGrd;
  ctx.beginPath();
  ctx.arc(sx, sy, baseSz * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Core sphere with 3D gradient
  const coreGrd = ctx.createRadialGradient(sx - baseSz * 0.25, sy - baseSz * 0.25, baseSz * 0.1, sx, sy, baseSz * 0.5);
  coreGrd.addColorStop(0, 'rgba(200,100,255,0.95)');
  coreGrd.addColorStop(0.4, 'rgba(170,50,255,0.8)');
  coreGrd.addColorStop(1, 'rgba(100,0,200,0.4)');
  ctx.fillStyle = coreGrd;
  ctx.beginPath();
  ctx.arc(sx, sy, baseSz * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Tendrils of energy
  ctx.strokeStyle = 'rgba(170,100,255,0.4)';
  ctx.lineWidth = 1.5 * scale;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + s.rotation * 0.5;
    const len = baseSz * (0.6 + Math.sin(gameState.frameCount * 0.08 + i) * 0.3);
    const ex = sx + Math.cos(angle) * len;
    const ey = sy + Math.sin(angle) * len;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + Math.cos(angle) * baseSz * 0.4,
      sy + Math.sin(angle) * baseSz * 0.4,
      ex, ey
    );
    ctx.stroke();
  }

  // Highlight
  ctx.fillStyle = 'rgba(255,200,255,0.6)';
  ctx.beginPath();
  ctx.arc(sx - baseSz * 0.15, sy - baseSz * 0.15, baseSz * 0.15, 0, Math.PI * 2);
  ctx.fill();
}
