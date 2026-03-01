import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';
import { W, H, HORIZON, lerp, clamp } from './constants.js';
import { drawFloor, drawCeiling, drawMountains } from './rendering-helpers.js';
import { drawPlayer } from './player.js';
import { drawObstacle } from './obstacles.js';
import { drawSoul } from './souls.js';

export function draw() {
  const { ctx } = gameState;
  ctx.save();
  if (gameState.screenShake > 0) {
    const sx = (Math.random() - 0.5) * gameState.screenShake;
    const sy = (Math.random() - 0.5) * gameState.screenShake;
    ctx.translate(sx, sy);
    gameState.screenShake *= 0.85;
  }
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drawMountains();
  drawCeiling();
  drawFloor();
  for (const p of gameState.bgParticles) {
    const { sx, sy, scale } = worldToScreen(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = (p.life / p.maxLife) * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const o of gameState.obstacles) drawObstacle(o);
  for (const s of gameState.souls) drawSoul(s);
  for (const p of gameState.particles) {
    const { sx, sy, scale } = worldToScreen(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / p.maxLife;
    if (p.glow) {
      const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, p.size * 2 * scale);
      gr.addColorStop(0, p.color);
      gr.addColorStop(1, p.color.replace(')', ', 0)'));
      ctx.fillStyle = gr;
      ctx.fillRect(sx - p.size * scale, sy - p.size * scale, p.size * 2 * scale, p.size * 2 * scale);
    }
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sx, sy, p.size * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (gameState.flashAlpha > 0) {
    ctx.fillStyle = `rgba(255,50,50,${gameState.flashAlpha})`;
    ctx.fillRect(0, 0, W, H);
    gameState.flashAlpha *= 0.95;
  }
  ctx.globalAlpha = 0.6;
  const fogGrd = ctx.createLinearGradient(0, 0, W, 0);
  fogGrd.addColorStop(0, 'rgba(0,0,0,0.6)');
  fogGrd.addColorStop(0.3, 'rgba(0,0,0,0.2)');
  fogGrd.addColorStop(0.7, 'rgba(0,0,0,0.05)');
  fogGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fogGrd;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 30; i++) {
    const gx = (gameState.frameCount * 0.3 + i * 30) % (W + 20) - 10;
    const gy = (gameState.frameCount * 0.5 + i * 20) % (H + 20) - 10;
    ctx.fillRect(gx, gy, 2, 2);
  }
  ctx.globalAlpha = 1;
  if (gameState.state === 'playing') drawPlayer();
  ctx.restore();
}

export function drawBloom() {
  const { ctx, bctx } = gameState;
  bctx.fillStyle = 'rgba(0,0,0,0.9)';
  bctx.fillRect(0, 0, W, H);
  for (const l of gameState.lightSources) {
    const { sx, sy, scale } = worldToScreen(l.x, l.y);
    const lr = (l.life / l.maxLife) * l.size * scale;
    const lgrd = bctx.createRadialGradient(sx, sy, 0, sx, sy, lr);
    lgrd.addColorStop(0, `rgba(255,150,50,${(l.life / l.maxLife) * 0.8})`);
    lgrd.addColorStop(0.5, `rgba(255,100,0,${(l.life / l.maxLife) * 0.3})`);
    lgrd.addColorStop(1, 'rgba(255,50,0,0)');
    bctx.fillStyle = lgrd;
    bctx.fillRect(sx - lr, sy - lr, lr * 2, lr * 2);
  }
  ctx.globalAlpha = 0.6;
  ctx.drawImage(gameState.bloomCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

export function drawTitleBG() {
  const { ctx, frameCount, lavaGlowPhase, mountainLayers } = gameState;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drawMountains();
  drawCeiling();
  drawFloor();
  ctx.globalAlpha = 0.6;
  const fogGrd = ctx.createLinearGradient(0, 0, W, 0);
  fogGrd.addColorStop(0, 'rgba(0,0,0,0.6)');
  fogGrd.addColorStop(0.3, 'rgba(0,0,0,0.2)');
  fogGrd.addColorStop(0.7, 'rgba(0,0,0,0.05)');
  fogGrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fogGrd;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  gameState.frameCount++;
  gameState.lavaGlowPhase += 0.02;
  for (const layer of mountainLayers) {
    layer.offset += 0.3;
  }
}
