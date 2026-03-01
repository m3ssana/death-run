import { gameState } from './state.js';
import { W, HORIZON } from './constants.js';

export function generateMountains() {
  gameState.mountainLayers = [];
  for (let layer = 0; layer < 3; layer++) {
    const pts = [];
    const segW = 30 + layer * 20;
    for (let x = 0; x <= W + segW; x += segW) {
      const baseH = 15 + layer * 10;
      pts.push({ x, y: HORIZON - baseH - Math.random() * (20 - layer * 5) });
    }
    gameState.mountainLayers.push({ pts, speed: 0.15 + layer * 0.1, offset: 0, color: layer });
  }
}
