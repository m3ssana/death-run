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

  // Parallax mountains
  mountainLayers: [],

  // Input
  keys: {},
  touchX: null,
};
