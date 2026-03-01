import { gameState } from './state.js';
import { OBSTACLE_TYPES, W, H, rand } from './constants.js';

export function spawnObstacle() {
  const difficulty = Math.min(gameState.distance / 2000, 1);
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  gameState.obstacles.push({
    x: W + 50,
    y: rand(80, H - 40),
    type,
    w: type.w,
    h: type.h,
    vx: -(gameState.speed + rand(-0.5, 0.5) + difficulty * 2),
    vy: 0,
    rotation: 0,
    wobble: Math.random() * Math.PI * 2,
    sinOffset: Math.random() * Math.PI * 2,
    angle: 0,
  });
  gameState.lastObstacle = gameState.frameCount;
}

export function spawnSoul() {
  gameState.souls.push({
    x: W + 20,
    y: rand(80, H - 40),
    size: 12,
    vx: -(gameState.speed + rand(-0.2, 0.2)),
    vy: rand(-0.5, 0.5),
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: rand(0.02, 0.08),
    pulse: 0,
  });
  gameState.lastSoul = gameState.frameCount;
}
