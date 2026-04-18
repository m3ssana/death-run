import { gameState } from './state.js';
import { rectCollide, getObstacleHitbox } from './collision.js';
import { spawnObstacle, spawnSoul } from './spawning.js';
import { updateParticles } from './particles.js';
import { worldToScreen } from './perspective.js';
import { COMBO_TAUNTS, COMBO_MILESTONES, H, PLAY_LEFT, PLAY_RIGHT, PLAY_TOP, PLAY_BOTTOM, lerp, rand } from './constants.js';

// Player hitbox in world units. Shrunk slightly from the visual footprint (24x32)
// to give players ~2px of forgiveness on each side — feels fair, still brutal.
const PLAYER_HB_W = 20;
const PLAYER_HB_H = 26;

export function update() {
  // Game logic only runs during active gameplay
  if (gameState.state === 'playing') {
    gameState.frameCount++;
    gameState.lavaGlowPhase += 0.02;

    // Player movement — primary dodge is Up/Down, secondary is Left/Right
    const moveSpeed = 3;
    const horizAccel = 0.4;
    if (gameState.keys['ArrowUp'] || gameState.keys['KeyW']) {
      gameState.player.y -= moveSpeed;
      gameState.player.lean = lerp(gameState.player.lean, -5, 0.15);
    } else if (gameState.keys['ArrowDown'] || gameState.keys['KeyS']) {
      gameState.player.y += moveSpeed;
      gameState.player.lean = lerp(gameState.player.lean, 5, 0.15);
    } else {
      gameState.player.lean = lerp(gameState.player.lean, 0, 0.1);
    }
    if (gameState.keys['ArrowLeft'] || gameState.keys['KeyA']) gameState.player.vx -= horizAccel;
    if (gameState.keys['ArrowRight'] || gameState.keys['KeyD']) gameState.player.vx += horizAccel;

    // Dash — triggered by Shift keys OR mobile double-tap (dashRequested flag).
    const dashPressed =
      gameState.keys['ShiftLeft'] || gameState.keys['ShiftRight'] || gameState.dashRequested;
    if (dashPressed && gameState.dashCooldown === 0) {
      gameState.dashCooldown = 60;
      gameState.invincible = 15;
      gameState.screenShake = 6;
      for (let i = 0; i < 15; i++) {
        gameState.particles.push({
          x: gameState.player.x + rand(-15, 15),
          y: gameState.player.y + rand(-10, 10),
          vx: rand(-6, -2),
          vy: rand(-2, 2),
          life: 25,
          maxLife: 25,
          size: rand(2, 5),
          color: '#ff3300',
          glow: true,
        });
      }
    }
    // Always consume the one-shot dash request, even if dashCooldown blocked it,
    // so a queued request doesn't fire as soon as the cooldown expires.
    gameState.dashRequested = false;

    // Touch input: relative drag. Player position = start position + finger delta.
    // Canvas pixels and world units have a 1:1 mapping since canvas is 900×650 and
    // world is 900×650, so no scaling needed. Clamping to play-area happens below.
    if (gameState.touchDragging) {
      const dx = gameState.touchDragX - gameState.touchStartX;
      const dy = gameState.touchDragY - gameState.touchStartY;
      gameState.player.x = gameState.playerStartX + dx;
      gameState.player.y = gameState.playerStartY + dy;
    }

    gameState.player.vx *= 0.92;
    gameState.player.x += gameState.player.vx;
    gameState.player.x = Math.max(PLAY_LEFT, Math.min(gameState.player.x, PLAY_RIGHT));
    gameState.player.y = Math.max(PLAY_TOP, Math.min(gameState.player.y, PLAY_BOTTOM));

    // Trail
    gameState.player.trail.push({ x: gameState.player.x, y: gameState.player.y });
    if (gameState.player.trail.length > 8) gameState.player.trail.shift();

    // Grace period: hold off obstacle spawning for the first N frames of a run.
    // Souls still spawn so the player has an immediate goal.
    if (gameState.gracePeriod > 0) {
      gameState.gracePeriod--;
    }

    // Spawn interval scales from 100 frames (easy) to 60 frames (hard) based on difficulty.
    // difficulty is already clamped 0–1 by spawnObstacle's local calculation, but we
    // derive it identically here to drive the interval without adding a shared variable.
    const spawnDifficulty = Math.min(gameState.distance / 2000, 1);
    const obstacleInterval = Math.round(lerp(100, 60, spawnDifficulty));

    if (gameState.gracePeriod === 0 && gameState.frameCount - gameState.lastObstacle > obstacleInterval) {
      spawnObstacle();
    }
    if (gameState.frameCount - gameState.lastSoul > 50) spawnSoul();

    // Move obstacles/souls (right to left)
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
      const o = gameState.obstacles[i];
      o.x += o.vx;
      o.y += (o.vy || 0);
      o.sinOffset = (o.sinOffset || 0) + 0.1;
      if (o.x < -100) {
        // Obstacle successfully dodged — credit the dodge and increment combo.
        // Combo is meant to reward skill (consecutive dodges), not luck (soul collection).
        // Per README: "Dodge 5+ obstacles in a row and receive increasingly unhinged taunts".
        gameState.demonsDodged++;
        gameState.combo++;
        gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
        gameState.obstacles.splice(i, 1);
      }
    }

    for (let i = gameState.souls.length - 1; i >= 0; i--) {
      const s = gameState.souls[i];
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotSpeed;
      if (s.x < -100) gameState.souls.splice(i, 1);
    }

    // Collision & collection — done in SCREEN space so hitboxes match what the player sees.
    // Both player and obstacle shrink with perspective (worldToScreen scale), so a pillar
    // drawn at 70% size has a 70% hitbox. Previously hitboxes ran in raw world units
    // while visuals shrank with depth, causing "invisible" deaths and unfair hits.
    const pScreen = worldToScreen(gameState.player.x, gameState.player.y);
    const pHbW = PLAYER_HB_W * pScreen.scale;
    const pHbH = PLAYER_HB_H * pScreen.scale;
    const pHbX = pScreen.sx - pHbW / 2;
    const pHbY = pScreen.sy - pHbH / 2;

    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
      const o = gameState.obstacles[i];
      const hb = getObstacleHitbox(o); // world-space
      const oScreen = worldToScreen(o.x, o.y);
      // Map world-space hitbox → screen-space: offsets are relative to o.x/o.y and
      // scale with perspective, just like the rendered visual does.
      const oHbSx = oScreen.sx + (hb.x - o.x) * oScreen.scale;
      const oHbSy = oScreen.sy + (hb.y - o.y) * oScreen.scale;
      const oHbSw = hb.w * oScreen.scale;
      const oHbSh = hb.h * oScreen.scale;
      if (rectCollide(pHbX, pHbY, pHbW, pHbH, oHbSx, oHbSy, oHbSw, oHbSh)) {
        if (gameState.invincible === 0) {
          die(o.type.name);
          return;
        }
      }
    }

    for (let i = gameState.souls.length - 1; i >= 0; i--) {
      const s = gameState.souls[i];
      if (Math.hypot(gameState.player.x - s.x, gameState.player.y - s.y) < 30) {
        gameState.soulCount++;
        gameState.combo++;
        gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
        for (let j = 0; j < 10; j++) {
          gameState.particles.push({
            x: s.x, y: s.y, vx: rand(-3, 3), vy: rand(-3, 0), life: 30, maxLife: 30,
            size: rand(2, 4), color: '#aa00ff', glow: false,
          });
        }
        gameState.souls.splice(i, 1);
      }
    }

    // Difficulty scaling — speed grows with distance but is capped at 8.
    // Without the cap, speed reaches 13+ at distance 10000, making the
    // game physically unreadable and obstacles indistinguishable.
    gameState.distance += gameState.speed * 0.1;
    gameState.speed = Math.min(3 + gameState.distance / 1000, 8);

    // Cooldowns
    if (gameState.dashCooldown > 0) gameState.dashCooldown--;
    if (gameState.invincible > 0) gameState.invincible--;
  }

  // Particle and HUD updates happen every frame, even during death animation
  updateParticles();
  updateHUD();
}

export function startGame() {
  gameState.state = 'playing';
  gameState.player = { x: 120, y: H / 2, w: 24, h: 32, vx: 0, vy: 0, trail: [], lean: 0 };
  gameState.obstacles = [];
  gameState.souls = [];
  gameState.particles = [];
  gameState.bgParticles = [];
  gameState.lightSources = [];
  gameState.distance = 0;
  gameState.soulCount = 0;
  gameState.demonsDodged = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.speed = 3;
  gameState.dashCooldown = 0;
  gameState.invincible = 0;
  gameState.frameCount = 0;
  gameState.lastObstacle = 0;
  gameState.lastSoul = 0;
  gameState.screenShake = 0;
  gameState.flashAlpha = 0;
  gameState.gracePeriod = 180;
  gameState.lastObstacleType = null;
  gameState.comboFlashAlpha = 0;
  gameState.prevCombo = 0;

  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('death-screen').style.display = 'none';
  document.getElementById('hud-container').style.display = 'flex';
}

export function die(cause) {
  gameState.state = 'dead';
  gameState.flashAlpha = 0.8;
  gameState.screenShake = 12;

  // Explosion particles
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    gameState.particles.push({
      x: gameState.player.x, y: gameState.player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40, maxLife: 40,
      size: rand(3, 8),
      color: '#ff3300',
      glow: true,
    });
  }

  document.getElementById('final-dist').textContent = Math.floor(gameState.distance);
  document.getElementById('final-souls').textContent = gameState.soulCount;
  document.getElementById('final-dodged').textContent = gameState.demonsDodged;
  document.getElementById('final-combo').textContent = gameState.maxCombo;
  document.getElementById('death-cause').textContent = cause;

  setTimeout(() => {
    document.getElementById('hud-container').style.display = 'none';
    document.getElementById('death-screen').style.display = 'block';
  }, 800);
}

export function updateHUD() {
  document.getElementById('hud-dist').textContent = Math.floor(gameState.distance);
  document.getElementById('hud-souls').textContent = gameState.soulCount;
  document.getElementById('hud-speed').textContent = gameState.speed.toFixed(1);

  const ci = Math.min(gameState.combo, COMBO_TAUNTS.length - 1);
  const comboPanel = document.querySelector('.hud-panel.combo');
  if (gameState.combo > 0 && COMBO_TAUNTS[ci]) {
    document.getElementById('combo-text').innerHTML = gameState.combo + '×<br>' + COMBO_TAUNTS[ci];
    comboPanel.classList.add('combo-active');
  } else {
    document.getElementById('combo-text').textContent = '—';
    comboPanel.classList.remove('combo-active');
  }

  // Detect combo milestone crossings. We compare the previous value against the current
  // so a single fast combo jump (e.g., 4 → 10) still triggers the flash for 5 and 10.
  for (let mi = 0; mi < COMBO_MILESTONES.length; mi++) {
    const milestone = COMBO_MILESTONES[mi];
    if (gameState.prevCombo < milestone && gameState.combo >= milestone) {
      // Gold flash — intensity scales with milestone tier (0.25 → 0.45).
      gameState.comboFlashAlpha = 0.25 + mi * 0.05;
      // Light screen shake to punctuate without disrupting readability.
      gameState.screenShake = Math.max(gameState.screenShake, 3);
      // HUD panel burst animation: remove and immediately re-add to restart it.
      comboPanel.classList.remove('combo-milestone');
      // Force a reflow so the browser registers the class removal before re-adding.
      void comboPanel.offsetWidth;
      comboPanel.classList.add('combo-milestone');
      break; // Trigger only the lowest uncrossed milestone per frame
    }
  }
  gameState.prevCombo = gameState.combo;
}
