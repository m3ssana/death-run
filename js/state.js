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

  // Touch input uses RELATIVE DRAG: player moves by (currentTouch - touchStart)
  // from the player's position at touch-down. This prevents the "finger-on-obstacle
  // pushes player into obstacle" bug of an absolute drag-to-position model.
  touchDragging: false,
  touchStartX: 0,     // finger position when touch began (canvas pixels)
  touchStartY: 0,
  playerStartX: 0,    // player position when touch began (world units)
  playerStartY: 0,
  touchDragX: 0,      // current finger position (canvas pixels)
  touchDragY: 0,

  // Mobile dash gesture: double-tap within DOUBLE_TAP_MS triggers a dash.
  // dashRequested is a one-shot flag consumed by the game loop.
  lastTapTime: 0,
  dashRequested: false,
};
