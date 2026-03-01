import { W, H, HORIZON, VP_X, clamp, lerp } from './constants.js';

// Map game coordinates to screen with mild perspective
// Play area spans full canvas. Objects near the top are slightly smaller (depth feel)
export function worldToScreen(wx, wy) {
  const t = clamp((wy - 20) / (H - 55), 0, 1); // 0=top, 1=bottom
  const sy = lerp(30, H - 10, t);
  // Mild perspective: top-of-screen objects converge slightly toward center
  const depth = 1 - t; // 1=far (top), 0=near (bottom)
  const sx = lerp(wx, VP_X, depth * 0.2);
  const scale = lerp(1.0, 0.55, depth);
  return { sx, sy, scale, depth };
}
