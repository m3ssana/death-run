// Canvas dimensions
export const W = 900, H = 650;

// Perspective constants
export const HORIZON = 55;         // y-line of the horizon
export const FLOOR_TOP = HORIZON;
export const CEIL_BOT = HORIZON;
export const VP_X = W / 2;         // Vanishing point
export const VP_Y = HORIZON;

// Obstacle type definitions
export const OBSTACLE_TYPES = [
  { name: 'HELLFIRE PILLAR', color: '#ff2200', w: 30, h: 80, pattern: 'pillar' },
  { name: 'DEMON SKULL', color: '#ff0066', w: 44, h: 44, pattern: 'skull' },
  { name: 'BONE SAW', color: '#ccccaa', w: 50, h: 20, pattern: 'saw' },
  { name: 'LAVA GEYSER', color: '#ff6600', w: 25, h: 120, pattern: 'geyser' },
  { name: 'BLOOD SPIKE', color: '#990022', w: 15, h: 65, pattern: 'spike' },
  { name: 'CHAIN WHIP', color: '#888888', w: 200, h: 8, pattern: 'chain' },
];

// Combo taunt messages
export const COMBO_TAUNTS = [
  '',
  '',
  'NOT BAD...',
  'UNHOLY',
  'DEMONIC!',
  'BLASPHEMOUS!!',
  'SACRILEGE!!!',
  'GODKILLER!!!!',
  'BEYOND DEATH!!!!!',
];

// Helper functions
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function rand(a, b) {
  return a + Math.random() * (b - a);
}
