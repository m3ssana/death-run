import { gameState } from './state.js';
import { OBSTACLE_TYPES, rand, H } from './constants.js';

export function spawnObstacle() {
  const difficulty = Math.min(gameState.distance / 2000, 1);
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  gameState.obstacles.push({
    x: rand(50, 850),
    y: -50,
    type,
    w: type.w,
    h: type.h,
    vy: gameState.speed + rand(-0.5, 0.5) + difficulty * 2,
    rotation: 0,
    wobble: Math.random() * Math.PI * 2,
    sinOffset: Math.random() * Math.PI * 2,
    angle: 0,
  });
  gameState.lastObstacle = gameState.frameCount;
}

export function spawnSoul() {
  gameState.souls.push({
    x: rand(50, 850),
    y: -20,
    size: 12,
    vx: rand(-0.5, 0.5),
    vy: gameState.speed + rand(-0.2, 0.2),
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: rand(0.02, 0.08),
    pulse: 0,
  });
  gameState.lastSoul = gameState.frameCount;
}
