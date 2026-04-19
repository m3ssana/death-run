import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';

/**
 * drawPlayer — PIZZA.RUN pizza-slice protagonist.
 *
 * Replaces the old skeleton (spine, ribs, arms, skull head) with a cartoon
 * pizza slice: triangular silhouette with golden crust, tomato body, cheese
 * highlight, pepperoni spots, googly eyes, and two white sneakers that bob
 * when moving. Dash state shows squinted eyes + motion lines + gold i-frame
 * outline (replacing the old red flame-eyes/red-outline cue).
 *
 * Preserves:
 *  - 24×32 visual footprint (hitbox dimensions are owned by game-loop.js,
 *    collision is in world coords; this function only changes visuals).
 *  - worldToScreen depth scaling via `scale` — all dimensions are `* scale`
 *    so the player shrinks correctly with perspective.
 *  - Invincibility flicker (every 3 frames while invincible > 0).
 */
export function drawPlayer() {
  const { ctx, player, invincible, frameCount, dashCooldown } = gameState;
  if (invincible > 0 && Math.floor(frameCount / 3) % 2 === 0) return;
  const { sx, sy, scale } = worldToScreen(player.x, player.y);
  const sz = 30 * scale;
  const dashing = dashCooldown > 0 && dashCooldown < 50;

  // --- Sauce-droplet trail (replaces skull trail) ---
  for (let i = 0; i < player.trail.length; i++) {
    const t = player.trail[i];
    const ts = worldToScreen(t.x, t.y);
    const a = (i / player.trail.length) * 0.45;
    ctx.globalAlpha = a;
    ctx.fillStyle = dashing ? '#ffd166' : '#cc2222';
    const tsz = 5 * ts.scale;
    ctx.beginPath();
    ctx.ellipse(ts.sx, ts.sy + tsz * 0.4, tsz * 0.55, tsz * 0.95, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // --- Warm glow (was red hellfire) ---
  const glowR = 55 * scale;
  const pgrd = ctx.createRadialGradient(sx, sy, 5 * scale, sx, sy, glowR);
  pgrd.addColorStop(0, 'rgba(255, 200, 120, 0.35)');
  pgrd.addColorStop(0.5, 'rgba(255, 170, 80, 0.12)');
  pgrd.addColorStop(1, 'rgba(255, 140, 60, 0)');
  ctx.fillStyle = pgrd;
  ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);

  // --- Soft oval floor shadow (replaces flipped-skull reflection) ---
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'rgba(60,40,20,0.55)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + sz * 0.78, sz * 0.42, sz * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // --- Stepping bob (shoes alternate, body subtly rises/falls) ---
  const stepPhase = Math.sin(frameCount * 0.25);
  const moving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy || 0) > 0.1;
  const bodyBob = moving ? Math.abs(stepPhase) * 1.2 * scale : 0;

  // --- Pizza slice silhouette (triangular body + curved crust) ---
  const tipY = sy - sz * 0.48 - bodyBob;
  const baseL = sx - sz * 0.48;
  const baseR = sx + sz * 0.48;
  const baseY = sy + sz * 0.32 - bodyBob;
  const crustBulge = sz * 0.16;

  // Crust underside (curved arc beneath the slice triangle)
  const crustGrd = ctx.createLinearGradient(sx, baseY - crustBulge * 0.3, sx, baseY + crustBulge * 1.2);
  crustGrd.addColorStop(0, '#e0a94a');
  crustGrd.addColorStop(1, '#995c1e');
  ctx.fillStyle = crustGrd;
  ctx.beginPath();
  ctx.moveTo(baseL, baseY);
  ctx.quadraticCurveTo(sx, baseY + crustBulge * 1.9, baseR, baseY);
  ctx.closePath();
  ctx.fill();

  // Slice body — warm cheese→tomato gradient from tip down to crust
  const bodyGrd = ctx.createLinearGradient(sx, tipY, sx, baseY);
  bodyGrd.addColorStop(0, '#ffe3a3');    // cheese highlight at tip
  bodyGrd.addColorStop(0.35, '#f4c053');  // cheese mid
  bodyGrd.addColorStop(0.7, '#d94a2a');   // tomato red
  bodyGrd.addColorStop(1, '#a8321c');
  ctx.fillStyle = bodyGrd;
  ctx.beginPath();
  ctx.moveTo(sx, tipY);
  ctx.lineTo(baseL, baseY);
  ctx.lineTo(baseR, baseY);
  ctx.closePath();
  ctx.fill();

  // Dash i-frame outline (was red skeleton outline; now warm gold)
  if (invincible > 0) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.2 * scale;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, tipY);
    ctx.lineTo(baseR, baseY);
    ctx.quadraticCurveTo(sx, baseY + crustBulge * 1.9, baseL, baseY);
    ctx.closePath();
    ctx.stroke();
  }

  // Pepperoni spots on the slice body (fixed positions relative to slice)
  ctx.fillStyle = '#c8102e';
  const pepperonis = [
    { dx: -0.18, dy: 0.08, r: 0.075 },
    { dx:  0.14, dy: 0.14, r: 0.065 },
    { dx: -0.02, dy: -0.08, r: 0.055 },
  ];
  for (const p of pepperonis) {
    ctx.beginPath();
    ctx.arc(sx + p.dx * sz, sy + p.dy * sz - bodyBob, p.r * sz, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small cheese bubbles for texture
  ctx.fillStyle = 'rgba(255,235,180,0.65)';
  for (let i = 0; i < 4; i++) {
    const ang = i * 1.6 + 0.4;
    const bx = sx + Math.cos(ang) * sz * 0.12;
    const by = sy + Math.sin(ang) * sz * 0.14 - bodyBob - sz * 0.06;
    ctx.beginPath();
    ctx.arc(bx, by, 1.3 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Googly eyes (on the slice body, centered just above middle) ---
  const eyeY = sy - sz * 0.08 - bodyBob;
  const eyeSpacing = sz * 0.18;
  const eyeR = sz * 0.13;
  const pupilR = eyeR * 0.52;
  const pupilOffX = Math.max(-2, Math.min(2, player.vx)) * 0.9 * scale;

  for (let side = -1; side <= 1; side += 2) {
    const ex = sx + side * eyeSpacing;
    if (dashing) {
      // Squint: flat dark slit — selling speed/focus
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeR, eyeR * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1.4 * scale;
      ctx.beginPath();
      ctx.moveTo(ex - eyeR * 0.7, eyeY);
      ctx.lineTo(ex + eyeR * 0.7, eyeY);
      ctx.stroke();
    } else {
      // White eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      // Thin black outline
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = Math.max(0.7, 0.7 * scale);
      ctx.stroke();
      // Pupil — shifts slightly toward motion direction
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(ex + pupilOffX, eyeY, pupilR, 0, Math.PI * 2);
      ctx.fill();
      // Tiny catchlight
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ex + pupilOffX - pupilR * 0.3, eyeY - pupilR * 0.3, pupilR * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Sneakers (two white shoes below the crust, alternating step) ---
  const shoeLX = sx - sz * 0.22;
  const shoeRX = sx + sz * 0.22;
  const shoeBaseY = baseY + crustBulge * 2.2;
  const step = moving ? stepPhase : 0;
  // Left shoe rises when step > 0, right shoe rises when step < 0
  const shoeLY = shoeBaseY + (step > 0 ? -2.5 * scale : 0);
  const shoeRY = shoeBaseY + (step < 0 ? -2.5 * scale : 0);

  for (const [sxShoe, syShoe] of [[shoeLX, shoeLY], [shoeRX, shoeRY]]) {
    // Shoe body (white with subtle gradient)
    const shoeGrd = ctx.createLinearGradient(sxShoe, syShoe - sz * 0.06, sxShoe, syShoe + sz * 0.06);
    shoeGrd.addColorStop(0, '#ffffff');
    shoeGrd.addColorStop(1, '#d8d8d8');
    ctx.fillStyle = shoeGrd;
    ctx.beginPath();
    ctx.ellipse(sxShoe, syShoe, sz * 0.15, sz * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    // Dark sole along the bottom half
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.ellipse(sxShoe, syShoe + sz * 0.04, sz * 0.15, sz * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    // Lace X (simple cross-hatch)
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = Math.max(0.9, 0.9 * scale);
    ctx.beginPath();
    ctx.moveTo(sxShoe - sz * 0.05, syShoe - sz * 0.015);
    ctx.lineTo(sxShoe + sz * 0.05, syShoe + sz * 0.015);
    ctx.moveTo(sxShoe - sz * 0.05, syShoe + sz * 0.015);
    ctx.lineTo(sxShoe + sz * 0.05, syShoe - sz * 0.015);
    ctx.stroke();
  }

  // --- Motion lines on dash (behind player, gold/warm) ---
  if (dashing) {
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.8)';
    ctx.lineWidth = 1.8 * scale;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      const lineY = sy + i * sz * 0.18;
      ctx.beginPath();
      ctx.moveTo(sx - sz * 1.1, lineY);
      ctx.lineTo(sx - sz * 0.55, lineY);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
}
