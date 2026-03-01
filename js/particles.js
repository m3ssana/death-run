import { gameState } from './state.js';

export function updateParticles() {
  // Update main particles
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    const p = gameState.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) gameState.particles.splice(i, 1);
  }

  // Update background particles
  for (let i = gameState.bgParticles.length - 1; i >= 0; i--) {
    const p = gameState.bgParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) gameState.bgParticles.splice(i, 1);
  }

  // Update light sources
  for (let i = gameState.lightSources.length - 1; i >= 0; i--) {
    const l = gameState.lightSources[i];
    l.x += l.vx;
    l.y += l.vy;
    l.life--;
    if (l.life <= 0) gameState.lightSources.splice(i, 1);
  }

  // Update mountains
  for (const layer of gameState.mountainLayers) {
    layer.offset += 0.3;
  }
}
