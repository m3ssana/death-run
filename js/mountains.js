import { gameState } from './state.js';
import { W, HORIZON } from './constants.js';

/**
 * generateMountains — builds 3 parallax background layers of smooth rolling
 * hills (PIZZA.RUN's family-friendly reskin of the prior hellscape silhouettes).
 *
 * Each layer samples a combined sine function instead of random jitter, so the
 * silhouette reads as smooth, rounded hills rather than jagged peaks. Layers
 * are ordered back-to-front by `layer` index (color 0 = lightest/farthest,
 * color 2 = darkest/closest), matching drawMountains()'s color lookup.
 */
export function generateMountains() {
  gameState.mountainLayers = [];
  for (let layer = 0; layer < 3; layer++) {
    const pts = [];
    // Denser sampling on near layers for smoother curvature when rendered
    const segW = 24 - layer * 6;
    // Layer-specific wave shape: back hills are longer/lower, front hills
    // are tighter/taller. Phase offset so layers don't crest in lockstep.
    const wavelength = 260 - layer * 70;     // back=260, mid=190, front=120
    const amplitude = 12 + layer * 6;        // back=12, mid=18, front=24
    const baseH = 16 + layer * 8;            // vertical offset below HORIZON
    const phase = layer * 1.1;               // stagger layer crests
    // Secondary wave adds gentle asymmetry so hills don't look mechanical
    const wave2Len = wavelength * 0.35;
    const wave2Amp = amplitude * 0.25;
    for (let x = 0; x <= W * 2 + segW; x += segW) {
      const w1 = Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
      const w2 = Math.sin((x / wave2Len) * Math.PI * 2 + phase * 1.7) * wave2Amp;
      const y = HORIZON - baseH - amplitude - (w1 + w2);
      pts.push({ x, y });
    }
    gameState.mountainLayers.push({
      pts,
      speed: 0.15 + layer * 0.1,
      offset: 0,
      color: layer,
    });
  }
}
