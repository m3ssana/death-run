import { gameState } from './state.js';
import { worldToScreen } from './perspective.js';
import { W, rand, lerp } from './constants.js';

/**
 * drawMeatball3D — shaded 3D sphere that reads as a meatball with googly eyes.
 * Replaces the old drawSkull3D. Parameters kept compatible so the call-site in
 * the 'skull' case stays clean.
 */
export function drawMeatball3D(x, y, size) {
  const { ctx } = gameState;
  const r = size * 0.45;

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + size * 0.4, size * 0.38, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main sphere — warm meatball brown, lit from upper-left
  const sphereGrd = ctx.createRadialGradient(
    x - r * 0.35, y - size * 0.1 - r * 0.35, r * 0.08,
    x,            y - size * 0.1,              r
  );
  sphereGrd.addColorStop(0,   '#c8703a');  // lit face
  sphereGrd.addColorStop(0.4, '#8b4020');  // mid brown
  sphereGrd.addColorStop(0.8, '#5c2810');  // shadow
  sphereGrd.addColorStop(1,   '#3a1808');  // rim
  ctx.fillStyle = sphereGrd;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, r, 0, Math.PI * 2);
  ctx.fill();

  // Herb/spice flecks — dark spots scattered on the surface
  const flecks = [
    { a: -0.4, d: 0.55 }, { a: 0.8,  d: 0.30 }, { a: 2.1, d: 0.55 },
    { a: 3.5,  d: 0.40 }, { a: 5.0,  d: 0.60 }, { a: 1.5, d: 0.20 },
  ];
  for (const { a, d } of flecks) {
    const fx = x + Math.cos(a) * r * d;
    const fy = (y - size * 0.1) + Math.sin(a) * r * d * 0.85;
    ctx.fillStyle = 'rgba(25,8,2,0.55)';
    ctx.beginPath();
    ctx.ellipse(fx, fy, 1.8, 1.2, a, 0, Math.PI * 2);
    ctx.fill();
  }

  // Specular gloss highlight
  ctx.fillStyle = 'rgba(255,220,180,0.28)';
  ctx.beginPath();
  ctx.ellipse(
    x - r * 0.28, y - size * 0.1 - r * 0.28,
    r * 0.18, r * 0.13, -0.4, 0, Math.PI * 2
  );
  ctx.fill();

  // Googly eyes — white sclera + black pupil + catchlight + angled menacing brow
  const eyeR = size * 0.115;
  for (let side = -1; side <= 1; side += 2) {
    const ex = x + side * size * 0.14;
    const ey = y - size * 0.16;

    // Sclera
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex, ey, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Pupil — offset slightly for personality
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(ex + side * eyeR * 0.15, ey + eyeR * 0.1, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(ex + side * eyeR * 0.1 - eyeR * 0.2, ey - eyeR * 0.2, eyeR * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Angled brow — tilts inward (angry/menacing look)
    ctx.strokeStyle = '#3a1808';
    ctx.lineWidth = size * 0.04;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ex - side * eyeR * 0.6, ey - eyeR * 0.9);
    ctx.lineTo(ex + side * eyeR * 0.6, ey - eyeR * 1.3);
    ctx.stroke();
  }
}

export function drawObstacle(o) {
  const { ctx, frameCount } = gameState;
  const { sx, sy, scale } = worldToScreen(o.x, o.y);
  if (sx < -100 || sx > W + 100) return;
  ctx.save();

  const sw = o.w * scale;
  const sh = o.h * scale;

  switch (o.type.pattern) {

    // ── OVEN FLAME ────────────────────────────────────────────────────────────
    case 'pillar': {
      // Animated teardrop flame — bobs vertically, layered from wide+dim → narrow+bright
      const bob  = Math.sin(frameCount * 0.08 + o.sinOffset) * 4 * scale;
      const fx   = sx;
      const tipY = sy + bob;         // flame tip (top)
      const baseY = sy + sh + bob;   // flame base (bottom)

      // Outer ambient glow
      const haloR = sw * 2.5;
      const halo  = ctx.createRadialGradient(fx, baseY - sh * 0.3, 0, fx, baseY - sh * 0.3, haloR);
      halo.addColorStop(0,   'rgba(255,110,15,0.16)');
      halo.addColorStop(0.5, 'rgba(255,55,0,0.06)');
      halo.addColorStop(1,   'rgba(255,20,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(fx - haloR, tipY - haloR * 0.2, haloR * 2, sh + haloR * 0.6);

      // Three flame layers — outer → inner, widening stops: base=red, mid=orange, tip=yellow/white
      const flameLayers = [
        { xMul: 1.00, gTop: '#ffe040', gMid: '#ff8800', gBot: '#cc2200', a: 1.00 },
        { xMul: 0.62, gTop: '#fff5a0', gMid: '#ffaa00', gBot: '#ff4400', a: 0.92 },
        { xMul: 0.30, gTop: '#fffff5', gMid: '#ffdd44', gBot: '#ff8800', a: 0.85 },
      ];

      for (const fl of flameLayers) {
        const lw     = sw * fl.xMul;
        const midY   = lerp(tipY, baseY, 0.68);  // widest at 68% from tip
        const fGrd   = ctx.createLinearGradient(fx, tipY, fx, baseY);
        fGrd.addColorStop(0,    fl.gTop);
        fGrd.addColorStop(0.35, fl.gMid);
        fGrd.addColorStop(1,    fl.gBot);
        ctx.fillStyle  = fGrd;
        ctx.globalAlpha = fl.a;
        ctx.beginPath();
        ctx.moveTo(fx, tipY);
        ctx.quadraticCurveTo(fx + lw * 1.15, lerp(tipY, midY, 0.55), fx + lw * 0.52, baseY);
        ctx.lineTo(fx - lw * 0.52, baseY);
        ctx.quadraticCurveTo(fx - lw * 1.15, lerp(tipY, midY, 0.55), fx, tipY);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floor glow pool
      const poolGrd = ctx.createRadialGradient(fx, baseY, 0, fx, baseY, sw * 2);
      poolGrd.addColorStop(0,   'rgba(255,100,0,0.22)');
      poolGrd.addColorStop(1,   'rgba(255,40,0,0)');
      ctx.fillStyle = poolGrd;
      ctx.fillRect(fx - sw * 2, baseY - sw * 0.4, sw * 4, sw * 1.2);
      break;
    }

    // ── MEATBALL OF DOOM ─────────────────────────────────────────────────────
    case 'skull': {
      const bob   = Math.sin(frameCount * 0.05 + o.sinOffset) * 5 * scale;
      const meatY = sy + bob;

      // Warm rolling aura
      const aGrd = ctx.createRadialGradient(sx, meatY, sw * 0.18, sx, meatY, sw * 0.88);
      aGrd.addColorStop(0, 'rgba(190,75,18,0.28)');
      aGrd.addColorStop(1, 'rgba(140,35,0,0)');
      ctx.fillStyle = aGrd;
      ctx.beginPath();
      ctx.arc(sx, meatY, sw * 0.88, 0, Math.PI * 2);
      ctx.fill();

      drawMeatball3D(sx, meatY, sw);
      break;
    }

    // ── PIZZA CUTTER ─────────────────────────────────────────────────────────
    case 'saw': {
      o.angle += 0.18;
      const sawR      = 20 * scale;
      const handleLen = 28 * scale;
      const handleW   =  7 * scale;

      // Wooden handle — drawn in canvas space (not rotated with disc)
      const hGrd = ctx.createLinearGradient(sx - handleW * 0.5, sy - handleLen, sx + handleW * 0.5, sy);
      hGrd.addColorStop(0,    '#5c3a1e');
      hGrd.addColorStop(0.35, '#916040');
      hGrd.addColorStop(0.7,  '#6e4828');
      hGrd.addColorStop(1,    '#4a2c14');
      ctx.fillStyle = hGrd;
      // Handle body
      ctx.beginPath();
      ctx.moveTo(sx - handleW / 2, sy);
      ctx.lineTo(sx + handleW / 2, sy);
      ctx.lineTo(sx + handleW / 2, sy - handleLen);
      ctx.lineTo(sx - handleW / 2, sy - handleLen);
      ctx.closePath();
      ctx.fill();
      // Rounded end cap
      ctx.beginPath();
      ctx.arc(sx, sy - handleLen, handleW / 2, Math.PI, 0);
      ctx.fill();
      // Grip rings
      ctx.strokeStyle = 'rgba(30,12,4,0.45)';
      ctx.lineWidth = 1.2;
      for (let g = 0; g < 3; g++) {
        const gy = sy - handleLen * 0.28 - g * handleLen * 0.22;
        ctx.beginPath();
        ctx.moveTo(sx - handleW * 0.36, gy);
        ctx.lineTo(sx + handleW * 0.36, gy);
        ctx.stroke();
      }
      // Metal collar where handle meets disc
      ctx.fillStyle = '#888';
      ctx.fillRect(sx - handleW * 0.6, sy - handleW * 0.55, handleW * 1.2, handleW * 0.55);

      // Spinning disc — translate + rotate for disc only
      ctx.translate(sx, sy);
      ctx.rotate(o.angle);

      // Chrome serrated disc
      const sgrd = ctx.createRadialGradient(-sawR * 0.3, -sawR * 0.3, sawR * 0.05, 0, 0, sawR);
      sgrd.addColorStop(0,   '#ffffff');
      sgrd.addColorStop(0.2, '#e8e8e8');
      sgrd.addColorStop(0.6, '#b0b0b0');
      sgrd.addColorStop(1,   '#686868');
      ctx.fillStyle = sgrd;
      ctx.beginPath();
      const teeth = 18;
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        const r = i % 2 === 0 ? sawR : sawR * 0.76;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();

      // Radial polish lines — machine-finished look
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * sawR * 0.22, Math.sin(a) * sawR * 0.22);
        ctx.lineTo(Math.cos(a) * sawR * 0.88, Math.sin(a) * sawR * 0.88);
        ctx.stroke();
      }

      // Hub rivet
      const hubGrd = ctx.createRadialGradient(-2 * scale, -2 * scale, 0, 0, 0, 5.5 * scale);
      hubGrd.addColorStop(0, '#cccccc');
      hubGrd.addColorStop(1, '#444444');
      ctx.fillStyle = hubGrd;
      ctx.beginPath();
      ctx.arc(0, 0, 5.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Axle hole
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ── TOMATO SAUCE GEYSER ───────────────────────────────────────────────────
    case 'geyser': {
      const baseW = 14 * scale;

      // Sauce pool at base — dark crimson puddle
      const poolGrd = ctx.createRadialGradient(sx, sy + sh, 0, sx, sy + sh, baseW * 1.5);
      poolGrd.addColorStop(0,   'rgba(160,18,18,0.92)');
      poolGrd.addColorStop(0.55,'rgba(110,8,8,0.65)');
      poolGrd.addColorStop(1,   'rgba(70,0,0,0)');
      ctx.fillStyle = poolGrd;
      ctx.beginPath();
      ctx.ellipse(sx, sy + sh, baseW * 1.5, 4.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eruption column — wobbling bands of tomato sauce
      for (let row = 0; row < sh; row += 2) {
        const t      = row / sh;
        const wobble = Math.sin((frameCount * 0.12 + row * 0.08) + o.sinOffset) * (8 + t * 12) * scale;
        const width  = lerp(baseW, baseW * 0.22, t) * (1 + Math.sin(frameCount * 0.1 + row * 0.05) * 0.18);

        // Tomato red palette — dark base, brighter mid-column, dark tip
        const brightness = Math.sin(t * Math.PI);  // 0 at ends, 1 at middle
        const rVal  = Math.floor(lerp(160, 230, brightness));
        const gVal  = Math.floor(lerp(12, 42, t));
        const bVal  = 15;
        const alpha = lerp(0.92, 0.12, t);
        ctx.fillStyle = `rgba(${rVal},${gVal},${bVal},${alpha})`;
        ctx.fillRect(sx - width / 2 + wobble, sy + sh - row, width, 3);
      }

      // Bright core glow — lighter sauce streak up the center
      ctx.globalCompositeOperation = 'lighter';
      const cGrd = ctx.createLinearGradient(sx, sy + sh, sx, sy);
      cGrd.addColorStop(0,   'rgba(255,70,40,0.32)');
      cGrd.addColorStop(0.5, 'rgba(200,35,18,0.10)');
      cGrd.addColorStop(1,   'rgba(160,15,10,0)');
      ctx.fillStyle = cGrd;
      ctx.fillRect(sx - baseW * 0.26, sy, baseW * 0.52, sh);
      ctx.globalCompositeOperation = 'source-over';

      // Airborne sauce droplets — arc up and fall back
      for (let d = 0; d < 3; d++) {
        const dt  = ((frameCount * 1.4 + o.sinOffset * 55 + d * 22) % 50) / 50;
        const dx  = sx + Math.sin(d * 2.2 + o.sinOffset) * baseW * 0.45;
        const dy  = (sy + sh * 0.1) - dt * sh * 0.55 + dt * dt * sh * 0.3; // arc up then slow
        const dr  = lerp(3.5, 1, dt) * scale;
        const dal = lerp(0.85, 0, dt);
        ctx.fillStyle = `rgba(200,28,18,${dal})`;
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    // ── PARMESAN SHARD ────────────────────────────────────────────────────────
    case 'spike': {
      const spikeW = sw;
      const spikeH = sh;
      const tipX   = sx;
      const tipY   = sy;
      const baseY  = sy + spikeH;

      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(sx + 2, baseY, spikeW * 0.48, 2.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shadow facet — right edge, darker
      ctx.fillStyle = '#7a5a0e';
      ctx.beginPath();
      ctx.moveTo(tipX + 1, tipY);
      ctx.lineTo(tipX + spikeW * 0.5 + 2, baseY);
      ctx.lineTo(tipX + spikeW * 0.5 - 1, baseY);
      ctx.closePath();
      ctx.fill();

      // Main face — parmesan tan to bright golden yellow
      const spGrd = ctx.createLinearGradient(tipX - spikeW * 0.5, baseY, tipX, tipY);
      spGrd.addColorStop(0,    '#b8900e');  // dark warm gold at base
      spGrd.addColorStop(0.38, '#dcb830');  // mid bright
      spGrd.addColorStop(0.72, '#f4d35e');  // pale yellow
      spGrd.addColorStop(1,    '#fdeea0');  // hot tip
      ctx.fillStyle = spGrd;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(tipX - spikeW * 0.5, baseY);
      ctx.lineTo(tipX + spikeW * 0.5, baseY);
      ctx.closePath();
      ctx.fill();

      // Crystalline facet lines — diagonal splits mimicking cheese grain
      ctx.strokeStyle = 'rgba(100,70,0,0.32)';
      ctx.lineWidth = 0.8;
      const facets = [
        [tipX - spikeW * 0.06, tipY + spikeH * 0.20, tipX - spikeW * 0.30, tipY + spikeH * 0.68],
        [tipX + spikeW * 0.04, tipY + spikeH * 0.32, tipX - spikeW * 0.16, tipY + spikeH * 0.80],
        [tipX + spikeW * 0.10, tipY + spikeH * 0.14, tipX + spikeW * 0.04, tipY + spikeH * 0.52],
      ];
      for (const [x1, y1, x2, y2] of facets) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Left-edge gloss — bright lit facet
      ctx.strokeStyle = 'rgba(255,248,180,0.55)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tipX, tipY + 1);
      ctx.lineTo(tipX - spikeW * 0.38, baseY - 1);
      ctx.stroke();

      // Tip specular glint
      ctx.fillStyle = 'rgba(255,255,220,0.80)';
      ctx.beginPath();
      ctx.ellipse(tipX - 1, tipY + spikeH * 0.05, 1.5, 3.5 * scale, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ── MOZZARELLA STRETCH ────────────────────────────────────────────────────
    case 'chain': {
      // CRITICAL: swing formula must exactly match collision.js 'chain' case.
      // Do NOT change sin() parameters without updating getObstacleHitbox().
      const chainLen = o.h * scale;
      const linkH    = 8 * scale;
      const swing    = Math.sin(frameCount * 0.05 + o.sinOffset) * 25 * scale;

      for (let i = 0; i < chainLen; i += linkH * 1.2) {
        const lx = sx + swing;
        const ly = sy + i - chainLen / 2;
        const t  = i / chainLen;  // 0 = top, 1 = bottom

        // Mozzarella cream — warm white at top, faint golden sag at bottom
        const rC = Math.floor(lerp(255, 242, t));
        const gC = Math.floor(lerp(250, 225, t));
        const bC = Math.floor(lerp(210, 160, t));

        // Stroke each link as a cheese blob (rounded ellipse outline)
        const cheeseGrd = ctx.createLinearGradient(lx - linkH * 0.5, ly, lx + linkH * 0.5, ly);
        cheeseGrd.addColorStop(0,    `rgba(${rC},${gC},${bC},0.70)`);
        cheeseGrd.addColorStop(0.38, 'rgba(255,254,238,0.96)');  // bright highlight
        cheeseGrd.addColorStop(1,    `rgba(${Math.floor(rC*0.78)},${Math.floor(gC*0.78)},${Math.floor(bC*0.70)},0.80)`);
        ctx.strokeStyle = cheeseGrd;
        ctx.lineWidth   = 3 * scale;
        ctx.beginPath();
        ctx.ellipse(lx, ly, linkH * 0.32, linkH * 0.50, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Wet-cheese gloss on alternating links
        if (Math.floor(i / linkH) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,245,0.48)';
          ctx.beginPath();
          ctx.ellipse(lx - linkH * 0.08, ly - linkH * 0.12, linkH * 0.11, linkH * 0.07, -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Drip teardrop at the bottom — cheese pulling downward
      const dripX = sx + swing;
      const dripY = sy + chainLen / 2;
      const dripR = 3.5 * scale;
      const dripGrd = ctx.createRadialGradient(dripX - 1, dripY - 1, 0, dripX, dripY, dripR * 2);
      dripGrd.addColorStop(0,   'rgba(255,252,220,0.92)');
      dripGrd.addColorStop(0.5, 'rgba(240,225,170,0.70)');
      dripGrd.addColorStop(1,   'rgba(220,200,140,0)');
      ctx.fillStyle = dripGrd;
      ctx.beginPath();
      ctx.arc(dripX, dripY + dripR * 0.5, dripR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}
