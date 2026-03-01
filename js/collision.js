import { gameState } from './state.js';

// AABB collision test
export function rectCollide(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Get collision hitbox for obstacle based on its pattern
export function getObstacleHitbox(o) {
  const t = o.type;
  const { player, frameCount } = gameState;

  switch (t.pattern) {
    case 'pillar':
      return { x: o.x - o.w / 2, y: o.y, w: o.w, h: o.h };
    case 'skull':
      return { x: o.x - o.w / 2, y: o.y - o.w / 2, w: o.w, h: o.w };
    case 'saw':
      return { x: o.x - 25, y: o.y - 25, w: 50, h: 50 };
    case 'geyser':
      return { x: o.x - 10, y: o.y, w: 20, h: o.h };
    case 'spike':
      return { x: o.x - o.w / 2, y: o.y, w: o.w, h: o.h };
    case 'chain': {
      const cx = o.x + Math.sin((player.y - o.y + frameCount * 3) * 0.05) * 25;
      return { x: cx - 15, y: o.y - o.h / 2, w: 30, h: o.h };
    }
    default:
      return { x: o.x, y: o.y, w: o.w, h: o.h };
  }
}
