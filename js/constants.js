// Canvas dimensions
export const W = 900, H = 650;

// Perspective constants
export const HORIZON = 55;         // y-line of the horizon
export const FLOOR_TOP = HORIZON;
export const CEIL_BOT = HORIZON;
export const VP_X = W;             // Vanishing point at right edge
export const VP_Y = H / 2;         // Vanishing point at vertical center

// Play area boundaries (player confined to left portion)
export const PLAY_LEFT = 30;
export const PLAY_RIGHT = 300;
export const PLAY_TOP = 70;
export const PLAY_BOTTOM = H - 20;

// Obstacle type definitions
export const OBSTACLE_TYPES = [
  { name: 'OVEN FLAME', color: '#ff8800', w: 30, h: 80, pattern: 'pillar' },
  { name: 'MEATBALL OF DOOM', color: '#7a3a1a', w: 44, h: 44, pattern: 'skull' },
  { name: 'PIZZA CUTTER', color: '#e0e0e0', w: 50, h: 20, pattern: 'saw' },
  { name: 'TOMATO SAUCE GEYSER', color: '#cc2222', w: 25, h: 120, pattern: 'geyser' },
  { name: 'PARMESAN SHARD', color: '#f4d35e', w: 15, h: 65, pattern: 'spike' },
  { name: 'MOZZARELLA STRETCH', color: '#fff8dc', w: 8, h: 200, pattern: 'chain' },
];

// Combo taunt messages
export const COMBO_TAUNTS = [
  '',
  '',
  'NOT BAD...',
  'SAUCY!',
  'EXTRA CHEESE!!',
  'DELIZIOSO!!!',
  "CHEF'S KISS!!!!",
  'PIZZA GOD!!!!!',
  'LEGENDARY DELIVERY!!!!!',
];

// Combo milestone thresholds for visual/audio feedback
export const COMBO_MILESTONES = [5, 10, 25, 50, 100];

// Story screen pages — shown once between title and first game start.
// headline: displayed immediately. body: typewritten at 28ms/char.
// Empty body on the last page is intentional (headline stands alone).
export const STORY_PAGES = [
  {
    headline: 'THE PIZZERIA INFERNALE',
    body: 'Deep beneath the city, a kitchen burns eternal.\n\nEvery pizza made here has cost a runner their soul.\nThe ovens never cool. The cutters never stop.',
  },
  {
    headline: 'YOUR DELIVERY',
    body: 'The order came in at midnight.\n\n900 meters of infernal kitchen stand between\nyou and the door.\n\nDeliver hot. Deliver alive.',
  },
  {
    headline: 'SURVIVE THE KITCHEN',
    body: "ARROW KEYS or WASD \u2014 dodge up and down.\nSHIFT \u2014 dash through danger (brief invincibility).\n\nCollect the lost pepperoni souls.\nDon't stop running.",
  },
  {
    headline: 'THE KITCHEN IS WAITING.',
    body: '',
  },
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
