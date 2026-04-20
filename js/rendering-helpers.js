import { gameState } from './state.js';
import { W, H, HORIZON } from './constants.js';

/**
 * drawFloor — bright golden tile floor with a perspective grid that converges
 * at the right-horizon vanishing point (where obstacles originate). A subtle
 * oven glow from the right hints at the heat source and gives warm directionality.
 */
export function drawFloor() {
  const { ctx, lavaGlowPhase } = gameState;

  // Warm golden tile base — sunlit pizzeria floor, brighter at horizon
  const floorGrd = ctx.createLinearGradient(0, HORIZON, 0, H);
  floorGrd.addColorStop(0,   '#f5d070');
  floorGrd.addColorStop(0.4, '#e8b848');
  floorGrd.addColorStop(1,   '#d09820');
  ctx.fillStyle = floorGrd;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  // Oven / danger glow from the right — subtle warm pulse, less dominant on bright bg
  const pulse = 0.18 + Math.sin(lavaGlowPhase) * 0.06;
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
    ctx.strokeStyle = `rgba(140,80,20,${alpha})`;
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
    ctx.strokeStyle = `rgba(140,80,20,${alpha})`;
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
  sheen.addColorStop(0.45, 'rgba(255,245,180,0.10)');
  sheen.addColorStop(1,    'rgba(255,160,70,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, sheenY - 20, W, 48);
}

/**
 * drawCeiling — bright warm kitchen overhead strip with flickering fluorescent tubes.
 * Tubes cast downward amber light cones toward the horizon, framing the play area.
 * HORIZON is only 55px tall so every element here must be compact but readable.
 */
export function drawCeiling() {
  const { ctx, frameCount } = gameState;

  // Warm cream gradient — bright kitchen ceiling, warmer near horizon
  const skyGrd = ctx.createLinearGradient(0, 0, 0, HORIZON);
  skyGrd.addColorStop(0, '#fff8d0');
  skyGrd.addColorStop(1, '#ffeaa0');
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
    halo.addColorStop(0,    `rgba(255,210,100,${0.30 * flicker})`);
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
    cone.addColorStop(0, `rgba(200,150,30,${0.18 * flicker})`);
    cone.addColorStop(1, 'rgba(180,120,20,0)');
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
 * drawMountains — bright green rolling hills straddling the horizon.
 * Drawn AFTER ceiling and floor so they appear as mid-ground depth layer.
 * Sunlit rim-lighting gives them a warm outdoor daylight look.
 *
 * Layer ordering: color 0 = farthest (tallest, slowest), color 2 = nearest
 * (shorter, fastest) — front layers are smaller so they don't occlude gameplay.
 */
export function drawMountains() {
  const { ctx, mountainLayers } = gameState;

  // Bright green fills — vivid rolling hills, nearest layer deepest forest green
  const layerFills = [
    'hsl(130,40%,52%)',   // far:   vivid sage green
    'hsl(120,35%,42%)',   // mid:   forest green
    'hsl(110,28%,32%)',   // near:  deep green
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

    // Sunlit rim highlight on top edge — warm daylight on green hills
    const rimAlpha = 0.30 - layer.color * 0.07;
    ctx.save();
    ctx.strokeStyle = `rgba(220,255,180,${rimAlpha})`;
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

  // Green daylight haze strip — blends floor, hills, and ceiling at the horizon
  const hGlow = ctx.createLinearGradient(0, HORIZON - 6, 0, HORIZON + 32);
  hGlow.addColorStop(0,    'rgba(180,230,120,0)');
  hGlow.addColorStop(0.35, 'rgba(200,245,140,0.22)');
  hGlow.addColorStop(0.7,  'rgba(160,210,100,0.10)');
  hGlow.addColorStop(1,    'rgba(120,180,70,0)');
  ctx.fillStyle = hGlow;
  ctx.fillRect(0, HORIZON - 6, W, 38);
}
