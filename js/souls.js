import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';

/**
 * drawSoul — renders a PIZZA.RUN pepperoni coin.
 *
 * Uses the same object shape as the old energy orb (x, y, size, rotation,
 * rotSpeed, pulse) so spawning/collision code is unchanged. The disc
 * "tumbles" in the air via a cosine-squeezed X-scale driven by s.rotation,
 * and specks rotate with the face so the spin reads clearly.
 */
export function drawSoul(s) {
  const { ctx } = gameState;
  s.pulse = (s.pulse || 0) + 0.08;
  const { sx, sy, scale } = worldToScreen(s.x, s.y);
  const baseSz = (s.size + Math.sin(s.pulse) * 1.5) * scale;

  // Tumble: cos(rotation) squeezes the disc X-scale from 0.35 to 1.0 so the
  // pepperoni reads as a spinning coin without ever looking fully edge-on
  // (players still need to recognize it at a glance).
  const tumble = 0.65 + 0.35 * Math.cos(s.rotation);
  const faceVisible = Math.abs(Math.cos(s.rotation)); // 0 edge-on .. 1 face-on

  // Floor shadow (soft, offset below)
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = 'rgba(60,30,15,0.55)';
  ctx.beginPath();
  ctx.ellipse(sx, sy + baseSz * 0.9, baseSz * 0.55 * tumble, baseSz * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Warm halo (pepperoni glow, not magical aura)
  const auraGrd = ctx.createRadialGradient(sx, sy, baseSz * 0.4, sx, sy, baseSz * 1.1);
  auraGrd.addColorStop(0, 'rgba(255,180,100,0.45)');
  auraGrd.addColorStop(0.5, 'rgba(255,150,80,0.18)');
  auraGrd.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = auraGrd;
  ctx.beginPath();
  ctx.arc(sx, sy, baseSz * 1.1, 0, Math.PI * 2);
  ctx.fill();

  const discRx = baseSz * 0.7 * tumble;  // X radius collapses with tumble
  const discRy = baseSz * 0.7;            // Y radius stays constant

  // Rim / crust edge — slightly darker outer ring for dimension
  ctx.fillStyle = '#8a1f24';
  ctx.beginPath();
  ctx.ellipse(sx, sy, discRx + 1.2 * scale, discRy + 1.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main disc face — radial gradient gives it a subtle dome highlight
  const faceGrd = ctx.createRadialGradient(
    sx - discRx * 0.25, sy - discRy * 0.25, discRx * 0.15,
    sx, sy, discRy
  );
  faceGrd.addColorStop(0, '#e6344a');   // highlight
  faceGrd.addColorStop(0.55, '#c8102e'); // pepperoni red (spec-called)
  faceGrd.addColorStop(1, '#8a1f24');    // inner shadow
  ctx.fillStyle = faceGrd;
  ctx.beginPath();
  ctx.ellipse(sx, sy, discRx, discRy, 0, 0, Math.PI * 2);
  ctx.fill();

  // Darker brown specks on the face — fade with faceVisible so they disappear
  // as the disc tilts edge-on (no floating specks when disc is a thin line).
  // Each speck has a fixed radial position on the face; we rotate them by
  // s.rotation to sell the spin. The tumble X-squeeze applies to each speck's
  // X offset so they stay glued to the disc surface.
  ctx.globalAlpha = 0.85 * faceVisible;
  ctx.fillStyle = '#6b2b1a';
  const speckDefs = [
    { angle: 0.3, dist: 0.25, size: 0.16 },
    { angle: 1.7, dist: 0.35, size: 0.13 },
    { angle: 2.9, dist: 0.20, size: 0.14 },
    { angle: 4.4, dist: 0.40, size: 0.15 },
    { angle: 5.6, dist: 0.28, size: 0.12 },
  ];
  for (const d of speckDefs) {
    const a = d.angle + s.rotation;
    const rxWorld = Math.cos(a) * d.dist * baseSz;
    const ryWorld = Math.sin(a) * d.dist * baseSz;
    const ex = sx + rxWorld * tumble;
    const ey = sy + ryWorld;
    const sizeX = d.size * baseSz * tumble;
    const sizeY = d.size * baseSz;
    ctx.beginPath();
    ctx.ellipse(ex, ey, sizeX, sizeY, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Top highlight (grease-sheen glint) — only visible when mostly face-on
  ctx.globalAlpha = 0.55 * faceVisible;
  ctx.fillStyle = 'rgba(255,220,180,0.9)';
  ctx.beginPath();
  ctx.ellipse(sx - discRx * 0.35, sy - discRy * 0.4, discRx * 0.22, discRy * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
