import { gameState } from './state.js';
import { phaserConfig } from './config.js';
import { generateMountains } from './mountains.js';

// Initialize game state contexts
gameState.ctx = document.getElementById('game').getContext('2d');
gameState.bctx = document.getElementById('bloom').getContext('2d');
gameState.bloomCanvas = document.getElementById('bloom');

// Generate parallax mountains
generateMountains();

// Create Phaser game.
// NOTE: Phaser stamps inline style.width and style.height = "900px" on the canvas
// element during init. CSS canvas rules (width: 100%) cannot override inline styles,
// so we do NOT fight it there. Instead we scale the entire #wrap container via
// CSS transform, leaving Phaser's 900x650 logical space completely untouched.
const game = new Phaser.Game(phaserConfig);

// ── Viewport scaling ──────────────────────────────────────────────────────────
// The game's logical resolution is 900×650. We scale #wrap uniformly so it fills
// as much of the viewport as possible while preserving the aspect ratio.
// Phaser input coordinates remain in the 900×650 logical space because Phaser
// reads pointer positions relative to the canvas element's bounding rect and
// divides by the canvas width/height attributes (not the CSS display size).
const LOGICAL_W = 900;
const LOGICAL_H = 650;
const wrap = document.getElementById('wrap');

function scaleToViewport() {
  const scaleX = window.innerWidth  / LOGICAL_W;
  const scaleY = window.innerHeight / LOGICAL_H;
  // Use the smaller axis so the game always fits entirely on screen.
  const scale  = Math.min(scaleX, scaleY);
  wrap.style.transform = `scale(${scale})`;
}

// Scale immediately (Phaser has already stamped inline styles by the time
// the module script body finishes executing synchronously, and Phaser's
// internal boot is synchronous up to the first rAF tick).
scaleToViewport();

// Re-scale whenever the browser window or orientation changes.
window.addEventListener('resize', scaleToViewport);
