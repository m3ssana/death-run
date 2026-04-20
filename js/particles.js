import { gameState } from './state.js';

// Particle caps — keeps the frame rate stable on mobile / low-end devices.
// Each glow particle runs an expensive createRadialGradient() call per frame,
// so letting the list grow unbounded (death 40 + dash 15 + souls 10 each)
// easily stacks to 200+ during intense moments and tanks perf.
// When the cap is exceeded we drop the OLDEST particles (shift from front) so
// fresh feedback from the player's latest action always survives.
const MAX_PARTICLES = 150;
const MAX_BG_PARTICLES = 60;

export function updateParticles() {
  // Update main particles
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) gameState.particles.splice(i, 1);
  }
  // Enforce cap AFTER life decay so naturally-dying particles clear first.
  while (gameState.particles.length > MAX_PARTICLES) gameState.particles.shift();

  // Update background particles
  for (let i = gameState.bgParticles.length - 1; i >= 0; i--) {
    const p = gameState.bgParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) gameState.bgParticles.splice(i, 1);
  }
  while (gameState.bgParticles.length > MAX_BG_PARTICLES) gameState.bgParticles.shift();

  // Update light sources
  for (let i = gameState.lightSources.length - 1; i >= 0; i--) {
    const l = gameState.lightSources[i];
    l.x += l.vx;
    l.y += l.vy;
    l.life--;
    if (l.life <= 0) gameState.lightSources.splice(i, 1);
  }

  // Update mountains — use layer.speed for true parallax (far=slow, near=fast)
  for (const layer of gameState.mountainLayers) {
    layer.offset += layer.speed;
  }
}
