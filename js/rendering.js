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
  ctx.fillStyle = '#0d0810'; // deep dark base
  ctx.fillRect(0, 0, W, H);
  drawCeiling();
  drawFloor();
  drawMountains(); // drawn last so silhouettes sit on top of ceiling/floor at horizon
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
    // Tomato-sauce splash flash on hit (was harsh red)
    ctx.fillStyle = `rgba(204,34,34,${gameState.flashAlpha})`;
    ctx.fillRect(0, 0, W, H);
    gameState.flashAlpha *= 0.95;
  }
  // Combo milestone flash: gold overlay, decays faster than death flash so
  // it feels snappy rather than obstructive.
  if (gameState.comboFlashAlpha > 0) {
    ctx.fillStyle = `rgba(255,200,0,${gameState.comboFlashAlpha})`;
    ctx.fillRect(0, 0, W, H);
    gameState.comboFlashAlpha *= 0.80;
    if (gameState.comboFlashAlpha < 0.005) gameState.comboFlashAlpha = 0;
  }
  // Dark radial vignette — darkens edges, keeps center readable
  ctx.globalAlpha = 1;
  const vigGrd = ctx.createRadialGradient(W * 0.38, H / 2, 160, W * 0.38, H / 2, W * 0.78);
  vigGrd.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrd.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = vigGrd;
  ctx.fillRect(0, 0, W, H);
  // Heat ember specks drifting leftward from the danger zone on the right
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 18; i++) {
    const ex = W - (gameState.frameCount * 0.85 + i * 53) % (W + 50);
    const ey = HORIZON + 45 + (gameState.frameCount * 0.18 + i * 37) % (H - HORIZON - 80);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255,200,80,0.9)' : 'rgba(255,110,35,0.7)';
    ctx.fillRect(ex, ey, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
  if (gameState.state === 'playing') drawPlayer();
  ctx.restore();
}

export function drawBloom() {
  const { ctx, bctx } = gameState;
  // Bloom canvas must stay dark-base so screen-blend only ADDS light (never subtracts).
  bctx.fillStyle = 'rgba(0,0,0,0.9)';
  bctx.fillRect(0, 0, W, H);
  for (const l of gameState.lightSources) {
    const { sx, sy, scale } = worldToScreen(l.x, l.y);
    const lr = (l.life / l.maxLife) * l.size * scale;
    const lgrd = bctx.createRadialGradient(sx, sy, 0, sx, sy, lr);
    // Softer warm yellow/orange halo (was red-orange ember)
    lgrd.addColorStop(0, `rgba(255,209,130,${(l.life / l.maxLife) * 0.8})`);
    lgrd.addColorStop(0.5, `rgba(255,170,80,${(l.life / l.maxLife) * 0.3})`);
    lgrd.addColorStop(1, 'rgba(255,140,60,0)');
    bctx.fillStyle = lgrd;
    bctx.fillRect(sx - lr, sy - lr, lr * 2, lr * 2);
  }
  ctx.globalAlpha = 0.6;
  ctx.drawImage(gameState.bloomCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

export function drawTitleBG() {
  const { ctx, frameCount, lavaGlowPhase, mountainLayers } = gameState;
  ctx.fillStyle = '#0d0810'; // deep dark base
  ctx.fillRect(0, 0, W, H);
  drawCeiling();
  drawFloor();
  drawMountains();
  // Dark radial vignette
  ctx.globalAlpha = 1;
  const fogGrd = ctx.createRadialGradient(W * 0.38, H / 2, 160, W * 0.38, H / 2, W * 0.78);
  fogGrd.addColorStop(0, 'rgba(0,0,0,0)');
  fogGrd.addColorStop(1, 'rgba(0,0,0,0.52)');
  ctx.fillStyle = fogGrd;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  gameState.frameCount++;
  gameState.lavaGlowPhase += 0.02;
  for (const layer of mountainLayers) {
    layer.offset += layer.speed; // parallax: each layer scrolls at its own speed
  }
}
