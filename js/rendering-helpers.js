import { gameState } from './state.js';
import { W, H, HORIZON, rand, clamp, lerp } from './constants.js';

export function drawFloor() {
  const { ctx, lavaGlowPhase, frameCount } = gameState;

  // Base pizzeria-tile gradient (yellow toward horizon, deeper toward camera)
  const floorGrd = ctx.createLinearGradient(0, HORIZON, 0, H);
  floorGrd.addColorStop(0, '#e8b855');
  floorGrd.addColorStop(0.3, '#d9a441');
  floorGrd.addColorStop(0.6, '#c8933a');
  floorGrd.addColorStop(1, '#a8791f');
  ctx.fillStyle = floorGrd;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);

  // Checkered tile overlay with quadratic depth compression.
  // Bands near the horizon are thin and narrow (perspective); bands near the
  // camera are tall and wide. Cell offset per band creates the checkerboard.
  // Dark tiles only — the yellow gradient shows through as the "light" tile.
  const numBands = 11;
  for (let band = 0; band < numBands; band++) {
    const t0 = band / numBands;
    const t1 = (band + 1) / numBands;
    // Quadratic easing: squaring compresses distant bands toward the horizon.
    const yTop = HORIZON + t0 * t0 * (H - HORIZON);
    const yBot = HORIZON + t1 * t1 * (H - HORIZON);
    const cellW = 26 + band * 9;                // cells widen closer to camera
    const rowOffset = (band % 2) * cellW;       // alternating offset = checker
    const alpha = 0.12 + t1 * 0.28;             // more opaque near camera
    ctx.fillStyle = `rgba(30,18,8,${alpha})`;
    for (let x = -cellW + rowOffset; x < W; x += cellW * 2) {
      ctx.fillRect(x, yTop, cellW, yBot - yTop);
    }
  }

  // Subtle grout lines between bands (tile seams — horizontal depth)
  ctx.strokeStyle = 'rgba(60,40,20,0.18)';
  ctx.lineWidth = 1;
  for (let band = 1; band < numBands; band++) {
    const t = band / numBands;
    const y = HORIZON + t * t * (H - HORIZON);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Warm oven-glow pulse (variable retained as lavaGlowPhase for state-continuity)
  ctx.globalAlpha = 0.25 + Math.sin(lavaGlowPhase) * 0.15;
  const glowGrd = ctx.createRadialGradient(W / 2, H, 100, W / 2, H - 200, 400);
  glowGrd.addColorStop(0, 'rgba(255,209,102,0.55)');
  glowGrd.addColorStop(1, 'rgba(255,180,100,0)');
  ctx.fillStyle = glowGrd;
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  ctx.globalAlpha = 1;
}

export function drawCeiling() {
  const { ctx, frameCount } = gameState;

  // Cream kitchen ceiling (was stalactite purple/black)
  const skyGrd = ctx.createLinearGradient(0, 0, 0, HORIZON);
  skyGrd.addColorStop(0, '#f4e1c1');
  skyGrd.addColorStop(0.3, '#e8d2a8');
  skyGrd.addColorStop(0.7, '#ddc695');
  skyGrd.addColorStop(1, '#c8b077');
  ctx.fillStyle = skyGrd;
  ctx.fillRect(0, 0, W, HORIZON);

  // Hanging kitchen items: alternating pots, pans, and string-light bulbs
  // sway gently on shared cords (same sin() family as original stalactites to
  // preserve visual rhythm — only the silhouette changes).
  const itemCount = 14;
  for (let i = 0; i < itemCount; i++) {
    const baseX = ((i + 0.5) / itemCount) * W;
    // Sway offset — slight horizontal drift gives a breathing "alive" feel
    const sway = Math.sin(frameCount * 0.03 + i * 0.6) * 2.5;
    const x = baseX + sway;
    const cordLen = 14 + Math.sin(frameCount * 0.05 + i) * 3;

    // Cord (always drawn — acts as the visual anchor)
    ctx.strokeStyle = 'rgba(60,40,20,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(baseX, 0);
    ctx.lineTo(x, cordLen);
    ctx.stroke();

    const kind = i % 3;
    if (kind === 0) {
      // Pot: dark cast-iron trapezoid body with rim + small handle knobs
      const potW = 14;
      const potH = 10;
      const rimH = 2;
      // Body
      ctx.fillStyle = '#3a2a1c';
      ctx.beginPath();
      ctx.moveTo(x - potW / 2 + 1, cordLen + rimH);
      ctx.lineTo(x + potW / 2 - 1, cordLen + rimH);
      ctx.lineTo(x + potW / 2 - 2, cordLen + rimH + potH);
      ctx.lineTo(x - potW / 2 + 2, cordLen + rimH + potH);
      ctx.closePath();
      ctx.fill();
      // Rim (lighter band on top)
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(x - potW / 2, cordLen, potW, rimH);
      // Side handles
      ctx.fillStyle = '#2a1e14';
      ctx.fillRect(x - potW / 2 - 2, cordLen + 2, 2, 3);
      ctx.fillRect(x + potW / 2, cordLen + 2, 2, 3);
      // Highlight sheen on pot body
      ctx.fillStyle = 'rgba(255,220,180,0.15)';
      ctx.fillRect(x - potW / 2 + 2, cordLen + rimH + 1, 2, potH - 3);
    } else if (kind === 1) {
      // Pan: horizontal ellipse with protruding handle
      const panW = 16;
      const panH = 4;
      // Handle (small stick extending right)
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(x + panW / 2 - 1, cordLen + panH / 2 - 1, 5, 2);
      // Pan body
      ctx.fillStyle = '#1f1510';
      ctx.beginPath();
      ctx.ellipse(x, cordLen + panH, panW / 2, panH, 0, 0, Math.PI * 2);
      ctx.fill();
      // Inner sheen (slight reflected highlight)
      ctx.fillStyle = 'rgba(200,160,120,0.25)';
      ctx.beginPath();
      ctx.ellipse(x - 1, cordLen + panH - 0.5, panW / 3, panH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // String-light bulb: small glowing warm sphere with soft halo
      const bulbR = 2.5;
      const bulbY = cordLen + bulbR + 1;
      // Halo (soft warm glow — cheap single radial gradient)
      const halo = ctx.createRadialGradient(x, bulbY, 0, x, bulbY, bulbR * 4);
      halo.addColorStop(0, 'rgba(255,220,140,0.55)');
      halo.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - bulbR * 4, bulbY - bulbR * 4, bulbR * 8, bulbR * 8);
      // Bulb body
      ctx.fillStyle = '#ffd98a';
      ctx.beginPath();
      ctx.arc(x, bulbY, bulbR, 0, Math.PI * 2);
      ctx.fill();
      // Filament highlight
      ctx.fillStyle = 'rgba(255,255,220,0.9)';
      ctx.beginPath();
      ctx.arc(x - 0.5, bulbY - 0.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
      // Tiny base/cap
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(x - 1, cordLen, 2, 1.5);
    }
  }

  // Flour-dust drifting down (was warm orange ember dust)
  ctx.fillStyle = 'rgba(255,245,220,0.18)';
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
    // Rolling green hills (was dark hellscape blue silhouettes)
    const colors = ['#9cc5a1', '#7eb382', '#5e9668'];
    ctx.fillStyle = colors[layer.color] || '#9cc5a1';

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

    // Hill edge highlight (sunlit green)
    ctx.strokeStyle = `rgba(180,220,180,${0.15 + layer.color * 0.05})`;
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
