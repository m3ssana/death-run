import { gameState } from './state.js';
import { W, H, HORIZON } from './constants.js';

/**
 * drawFloor — dark stone floor with a perspective grid that converges at the
 * right-horizon vanishing point (where obstacles originate). A pulsing oven
 * glow from the right reinforces the danger-from-right design intent and
 * creates dramatic warm/cool contrast against the dark base.
 */
export function drawFloor() {
  const { ctx, lavaGlowPhase } = gameState;

  // Dark stone base — rich dark purple-black, slightly warmer at horizon
  const floorGrd = ctx.createLinearGradient(0, HORIZON, 0, H);
  floorGrd.addColorStop(0,   '#17091c');
  floorGrd.addColorStop(0.4, '#0e050f');
  floorGrd.addColorStop(1,   '#07030a');
  ctx.fillStyle = floorGrd;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  // Oven / danger glow from the right — pulsing warm orange
  // Positioned at upper-right to suggest the heat source that spawns obstacles
  const pulse = 0.40 + Math.sin(lavaGlowPhase) * 0.13;
  const ovenX = W * 0.94;
  const ovenY = HORIZON + (H - HORIZON) * 0.35;
  const ovenGlow = ctx.createRadialGradient(ovenX, ovenY, 8, ovenX, ovenY, 640);
  ovenGlow.addColorStop(0,    `rgba(255,125,28,${pulse})`);
  ovenGlow.addColorStop(0.22, `rgba(220,65,8,${pulse * 0.42})`);
  ovenGlow.addColorStop(0.55, 'rgba(160,25,4,0.09)');
  ovenGlow.addColorStop(1,    'rgba(80,0,0,0)');
  ctx.fillStyle = ovenGlow;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  // Perspective grid — lines converge at VP (W, HORIZON) on the right horizon
  ctx.save();

  // Horizontal depth lines: quadratic spacing so near-camera lines spread out
  const numH = 10;
  for (let i = 1; i <= numH; i++) {
    const t = i / numH;
    const y = HORIZON + Math.pow(t, 1.75) * (H - HORIZON);
    const alpha = 0.06 + t * 0.22;
    ctx.strokeStyle = `rgba(255,140,50,${alpha})`;
    ctx.lineWidth = 0.4 + t * 1.7;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Vertical perspective lines: fan from VP at (W, HORIZON) to bottom edge
  // Lines are brightest on the left (player side) and fade toward the right
  const numV = 16;
  for (let i = 0; i <= numV; i++) {
    const bx = (i / numV) * W;
    const leftBias = 1 - bx / W;              // 1 at left, 0 at right
    const alpha = 0.05 + leftBias * 0.16;
    ctx.strokeStyle = `rgba(255,128,42,${alpha})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(bx, H);
    ctx.lineTo(W, HORIZON);
    ctx.stroke();
  }

  ctx.restore();

  // Specular sheen — faint horizontal highlight mid-floor (reflected oven light)
  const sheenY = HORIZON + (H - HORIZON) * 0.58;
  const sheen = ctx.createLinearGradient(0, sheenY - 20, 0, sheenY + 28);
  sheen.addColorStop(0,    'rgba(255,180,90,0)');
  sheen.addColorStop(0.45, 'rgba(255,215,125,0.055)');
  sheen.addColorStop(1,    'rgba(255,160,70,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, sheenY - 20, W, 48);
}

/**
 * drawCeiling — dark overhead strip with flickering neon fluorescent tubes.
 * Tubes cast downward light cones toward the horizon, framing the play area.
 * HORIZON is only 55px tall so every element here must be compact but readable.
 */
export function drawCeiling() {
  const { ctx, frameCount } = gameState;

  // Near-black gradient — cooler at very top, slightly warmer near horizon
  const skyGrd = ctx.createLinearGradient(0, 0, 0, HORIZON);
  skyGrd.addColorStop(0, '#050310');
  skyGrd.addColorStop(1, '#110821');
  ctx.fillStyle = skyGrd;
  ctx.fillRect(0, 0, W, HORIZON);

  // Three neon fluorescent tubes with organic two-frequency flicker
  const tubes = [
    { cx: W * 0.17, w: 105 },
    { cx: W * 0.52, w: 138 },
    { cx: W * 0.84, w:  92 },
  ];

  tubes.forEach(({ cx, w }, i) => {
    const flicker = 0.82
      + Math.sin(frameCount * 0.09 + i * 3.1) * 0.09
      + Math.sin(frameCount * 0.27 + i * 1.4) * 0.09;

    // Wide soft halo behind tube — warm amber bloom
    const halo = ctx.createRadialGradient(cx, 4, 0, cx, 4, 44);
    halo.addColorStop(0,    `rgba(255,210,100,${0.44 * flicker})`);
    halo.addColorStop(0.55, `rgba(255,172,62,${0.16 * flicker})`);
    halo.addColorStop(1,    'rgba(255,130,40,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(cx - 44, 0, 88, HORIZON + 8);

    // Tube body
    ctx.fillStyle = `rgba(255,248,212,${0.96 * flicker})`;
    ctx.fillRect(cx - w / 2, 3, w, 2.5);

    // Metal endcaps
    ctx.fillStyle = `rgba(155,125,68,${0.85 * flicker})`;
    ctx.fillRect(cx - w / 2 - 5, 2, 5, 4.5);
    ctx.fillRect(cx + w / 2,     2, 5, 4.5);

    // Downward light cone — tapers wider toward horizon
    const cone = ctx.createLinearGradient(0, 5, 0, HORIZON);
    cone.addColorStop(0, `rgba(255,210,110,${0.26 * flicker})`);
    cone.addColorStop(1, 'rgba(255,165,55,0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2,      5);
    ctx.lineTo(cx + w / 2,      5);
    ctx.lineTo(cx + w / 2 + 24, HORIZON);
    ctx.lineTo(cx - w / 2 - 24, HORIZON);
    ctx.closePath();
    ctx.fill();
  });
}

/**
 * drawMountains — dark architectural silhouettes straddling the horizon.
 * Drawn AFTER ceiling and floor so they appear as mid-ground depth layer.
 * Orange rim-lighting from the oven glow gives them a dramatic backlit look.
 *
 * Layer ordering: color 0 = farthest (tallest, slowest), color 2 = nearest
 * (shorter, fastest) — front layers are smaller so they don't occlude gameplay.
 */
export function drawMountains() {
  const { ctx, mountainLayers } = gameState;

  // Dark silhouette fills — cool dark purples, nearest layer nearly black
  const layerFills = [
    'hsl(262,30%,14%)',   // far:   cool dark purple
    'hsl(252,22%,9%)',    // mid:   darker
    'hsl(242,16%,6%)',    // near:  near-black
  ];

  for (const layer of mountainLayers) {
    ctx.fillStyle = layerFills[layer.color] ?? layerFills[0];

    ctx.beginPath();
    let first = true;
    for (const pt of layer.pts) {
      const x = pt.x - layer.offset;
      if (first) { ctx.moveTo(x, pt.y); first = false; }
      else          ctx.lineTo(x, pt.y);
    }
    // Extend slightly into floor so silhouettes look grounded, not floating
    ctx.lineTo( W + 60, HORIZON + 26);
    ctx.lineTo(-60,     HORIZON + 26);
    ctx.closePath();
    ctx.fill();

    // Orange rim light on top edge — backlit by the oven behind
    const rimAlpha = 0.30 - layer.color * 0.07;
    ctx.save();
    ctx.strokeStyle = `rgba(255,148,52,${rimAlpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    first = true;
    for (const pt of layer.pts) {
      const x = pt.x - layer.offset;
      if (first) { ctx.moveTo(x, pt.y); first = false; }
      else          ctx.lineTo(x, pt.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Warm horizon glow strip — blends floor, silhouettes, and ceiling together
  const hGlow = ctx.createLinearGradient(0, HORIZON - 6, 0, HORIZON + 32);
  hGlow.addColorStop(0,    'rgba(255,158,52,0)');
  hGlow.addColorStop(0.35, 'rgba(255,185,72,0.30)');
  hGlow.addColorStop(0.7,  'rgba(255,128,32,0.12)');
  hGlow.addColorStop(1,    'rgba(255,88,18,0)');
  ctx.fillStyle = hGlow;
  ctx.fillRect(0, HORIZON - 6, W, 38);
}
