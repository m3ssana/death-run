import { gameState } from './state.js';
import { W, HORIZON } from './constants.js';

/**
 * generateMountains — builds 3 parallax layers of dark architectural
 * silhouettes that sit at the horizon between the ceiling and floor.
 *
 * Design intent: suggest background structures (ovens, walls, archways) through
 * silhouette shape without being literally recognizable. Three additive sine
 * waves at different frequencies and a rectified minimum floor create organic
 * shapes that feel architectural rather than hilly.
 *
 * Layer 0 = farthest (largest peaks, slowest scroll, lightest silhouette)
 * Layer 2 = nearest  (smaller peaks, fastest scroll, darkest silhouette)
 *
 * Peak heights are constrained so the neon ceiling tubes (y ≈ 3–7) stay
 * visible above the silhouettes at all times.
 */
export function generateMountains() {
  gameState.mountainLayers = [];

  for (let layer = 0; layer < 3; layer++) {
    const pts = [];
    const segW = 7;  // fine resolution for smooth silhouette curves

    // Far layers are taller and more spread out; near layers are shorter
    // and tighter so they don't obstruct the play field near the horizon.
    const baseH    =  9 + layer * 7;    // rest height above HORIZON:  9 / 16 / 23
    const amp1     =  5 + layer * 4;    // primary amplitude:          5 /  9 / 13
    const wave1Len = 210 - layer * 48;  // primary wavelength:       210 / 162 / 114
    const amp2     = amp1 * 0.38;       // secondary (detail) amplitude
    const wave2Len = wave1Len * 0.40;   // secondary wavelength (faster oscillation)
    const amp3     = amp1 * 0.14;       // tertiary (fine surface) amplitude
    const wave3Len = wave2Len * 0.42;
    const phase    = layer * 2.2;       // phase stagger so layers don't crest together

    for (let x = 0; x <= W * 2 + segW; x += segW) {
      const w1 = Math.sin((x / wave1Len) * Math.PI * 2 + phase)          * amp1;
      const w2 = Math.sin((x / wave2Len) * Math.PI * 2 + phase * 1.65)   * amp2;
      const w3 = Math.sin((x / wave3Len) * Math.PI * 2 + phase * 2.85)   * amp3;
      // Clamp so silhouettes never punch above y=18 (leaves ceiling tubes visible)
      const y = Math.max(18, HORIZON - baseH - (w1 + w2 + w3));
      pts.push({ x, y });
    }

    gameState.mountainLayers.push({
      pts,
      // Speed drives parallax: far=0.25, mid=0.35, near=0.45 px/frame
      speed : 0.25 + layer * 0.10,
      // Stagger starting offsets so layers aren't in phase on first frame
      offset: layer * 175,
      color : layer,
    });
  }
}
