// Central game state object
export const gameState = {
  // Canvas contexts
  ctx: null,
  bctx: null,

  // Game state
  state: 'title',
  player: null,
  obstacles: [],
  souls: [],
  particles: [],
  bgParticles: [],
  lightSources: [],

  // Game metrics
  distance: 0,
  soulCount: 0,
  demonsDodged: 0,
  combo: 0,
  maxCombo: 0,
  speed: 3,

  // Visual effects
  screenShake: 0,
  flashAlpha: 0,
  frameCount: 0,
  lavaGlowPhase: 0,

  // Timing/cooldowns
  lastObstacle: 0,
  lastSoul: 0,
  dashCooldown: 0,
  invincible: 0,

  // Grace period: frames to hold off obstacle spawning at run start
  gracePeriod: 180,

  // Last obstacle pattern name; prevents same type repeating consecutively
  lastObstacleType: null,

  // Combo milestone flash (gold overlay, distinct from red death flash)
  comboFlashAlpha: 0,
  // Previous combo value, used to detect threshold crossings each frame
  prevCombo: 0,

  // Parallax mountains
  mountainLayers: [],

  // Input
  keys: {},
  touchX: null,
  touchY: null,
};
