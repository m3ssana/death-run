import { gameState } from './state.js';
import { update } from './game-loop.js';
import { draw, drawBloom, drawTitleBG } from './rendering.js';
import { startGame } from './game-loop.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    gameState.ctx = this.sys.game.canvas.getContext('2d');
    gameState.bctx = document.getElementById('bloom').getContext('2d');
    gameState.bloomCanvas = document.getElementById('bloom');
    document.getElementById('title-screen').style.display = 'block';
    document.getElementById('death-screen').style.display = 'none';
    document.getElementById('hud-container').style.display = 'none';
    this.input.keyboard.on('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.on('pointerdown', () => this.scene.start('GameScene'));
  }

  update() {
    drawTitleBG();
  }
}

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    gameState.ctx = this.sys.game.canvas.getContext('2d');
    gameState.bctx = document.getElementById('bloom').getContext('2d');
    gameState.bloomCanvas = document.getElementById('bloom');
    startGame();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });
    this.shift = this.input.keyboard.addKeys({ left: 'ShiftLeft', right: 'ShiftRight' });
    this.input.keyboard.on('keydown-SPACE', () => { if (gameState.state === 'dead') startGame(); });

    // Touch input: relative drag + double-tap to dash.
    // DOUBLE_TAP_MS must be tight enough to feel intentional but loose enough for thumbs.
    // 300ms matches standard mobile UI conventions.
    const DOUBLE_TAP_MS = 300;
    this.input.on('pointerdown', (p) => {
      if (gameState.state !== 'playing') { startGame(); return; }
      const now = performance.now();
      if (now - gameState.lastTapTime < DOUBLE_TAP_MS) {
        // Double-tap → request dash (consumed by game-loop).
        gameState.dashRequested = true;
      }
      gameState.lastTapTime = now;
      // Begin a relative drag: remember where the finger landed AND where the player
      // was at that moment. Every move event then applies the delta to that origin.
      gameState.touchDragging = true;
      gameState.touchStartX = p.x;
      gameState.touchStartY = p.y;
      gameState.touchDragX = p.x;
      gameState.touchDragY = p.y;
      gameState.playerStartX = gameState.player ? gameState.player.x : 0;
      gameState.playerStartY = gameState.player ? gameState.player.y : 0;
    });
    this.input.on('pointermove', (p) => {
      if (p.isDown && gameState.touchDragging) {
        gameState.touchDragX = p.x;
        gameState.touchDragY = p.y;
      }
    });
    this.input.on('pointerup', () => { gameState.touchDragging = false; });
  }

  update() {
    // Bridge Phaser input to module-level keys[]
    gameState.keys['ArrowUp'] = this.cursors.up.isDown;
    gameState.keys['KeyW'] = this.wasd.up.isDown;
    gameState.keys['ArrowDown'] = this.cursors.down.isDown;
    gameState.keys['KeyS'] = this.wasd.down.isDown;
    gameState.keys['ArrowLeft'] = this.cursors.left.isDown;
    gameState.keys['KeyA'] = this.wasd.left.isDown;
    gameState.keys['ArrowRight'] = this.cursors.right.isDown;
    gameState.keys['KeyD'] = this.wasd.right.isDown;
    gameState.keys['ShiftLeft'] = this.shift.left.isDown;
    gameState.keys['ShiftRight'] = this.shift.right.isDown;

    update();
    draw();
    drawBloom();
  }
}
