import { gameState } from './state.js';
import { phaserConfig } from './config.js';
import { generateMountains } from './mountains.js';

// Initialize game state contexts
gameState.ctx = document.getElementById('game').getContext('2d');
gameState.bctx = document.getElementById('bloom').getContext('2d');
gameState.bloomCanvas = document.getElementById('bloom');

// Generate parallax mountains
generateMountains();

// Create Phaser game
const game = new Phaser.Game(phaserConfig);
