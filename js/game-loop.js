import { gameState } from './state.js';
import { rectCollide, getObstacleHitbox } from './collision.js';
import { spawnObstacle, spawnSoul } from './spawning.js';
import { updateParticles } from './particles.js';
import { COMBO_TAUNTS, H, PLAY_LEFT, PLAY_RIGHT, PLAY_TOP, PLAY_BOTTOM, lerp, rand } from './constants.js';

export function update() {
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

  // Dash
  if ((gameState.keys['ShiftLeft'] || gameState.keys['ShiftRight']) && gameState.dashCooldown === 0) {
    gameState.dashCooldown = 60;
    gameState.invincible = 15;
    gameState.speed += 2;
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

  // Touch input
  if (gameState.touchX !== null) {
    gameState.player.x += (gameState.touchX - gameState.player.x) * 0.08;
  }
  if (gameState.touchY !== null) {
    gameState.player.y += (gameState.touchY - gameState.player.y) * 0.08;
  }

  gameState.player.vx *= 0.92;
  gameState.player.x += gameState.player.vx;
  gameState.player.x = Math.max(PLAY_LEFT, Math.min(gameState.player.x, PLAY_RIGHT));
  gameState.player.y = Math.max(PLAY_TOP, Math.min(gameState.player.y, PLAY_BOTTOM));

  // Trail
  gameState.player.trail.push({ x: gameState.player.x, y: gameState.player.y });
  if (gameState.player.trail.length > 8) gameState.player.trail.shift();

  // Spawning
  if (gameState.frameCount - gameState.lastObstacle > 100) spawnObstacle();
  if (gameState.frameCount - gameState.lastSoul > 50) spawnSoul();

  // Move obstacles/souls (right to left)
  for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
    const o = gameState.obstacles[i];
    o.x += o.vx;
    o.y += (o.vy || 0);
    o.sinOffset = (o.sinOffset || 0) + 0.1;
    if (o.x < -100) gameState.obstacles.splice(i, 1);
  }

  for (let i = gameState.souls.length - 1; i >= 0; i--) {
    const s = gameState.souls[i];
    s.x += s.vx;
    s.y += s.vy;
    s.rotation += s.rotSpeed;
    if (s.x < -100) gameState.souls.splice(i, 1);
  }

  // Collision & collection
  for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
    const o = gameState.obstacles[i];
    const hb = getObstacleHitbox(o);
    if (rectCollide(gameState.player.x - 12, gameState.player.y - 16, 24, 32, hb.x, hb.y, hb.w, hb.h)) {
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

  // Difficulty scaling
  gameState.distance += gameState.speed * 0.1;
  gameState.speed = 3 + gameState.distance / 1000;

  // Cooldowns
  if (gameState.dashCooldown > 0) gameState.dashCooldown--;
  if (gameState.invincible > 0) gameState.invincible--;

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

  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('death-screen').style.display = 'none';
  document.getElementById('hud-container').style.display = 'flex';
}

export function die(cause) {
  gameState.state = 'dead';
  gameState.flashAlpha = 0.8;
  gameState.screenShake = 12;
  gameState.demonsDodged = Math.max(0, gameState.obstacles.length - 1);

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
}
