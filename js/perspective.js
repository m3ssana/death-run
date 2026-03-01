import { W, H, VP_Y, clamp, lerp } from './constants.js';

// Map game coordinates to screen with mild perspective
// Depth runs left-to-right: left=near (scale 1.0), right=far (scale 0.55)
export function worldToScreen(wx, wy) {
  const t = clamp((wx - 20) / (W - 55), 0, 1); // 0=left (near), 1=right (far)
  const sx = lerp(30, W - 10, t);
  // Objects converge toward vertical center as depth increases
  const depth = t; // 0=near (left), 1=far (right)
  const sy = lerp(wy, VP_Y, depth * 0.2);
  const scale = lerp(1.0, 0.55, depth);
  return { sx, sy, scale, depth };
}
