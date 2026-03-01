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
    this.input.on('pointerdown', (p) => { if (gameState.state !== 'playing') startGame(); gameState.touchX = p.x; gameState.touchY = p.y; });
    this.input.on('pointermove', (p) => { if (p.isDown) { gameState.touchX = p.x; gameState.touchY = p.y; } });
    this.input.on('pointerup', () => { gameState.touchX = null; gameState.touchY = null; });
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
