import { TitleScene, GameScene } from './scenes.js';

export const phaserConfig = {
  type: Phaser.CANVAS,
  canvas: document.getElementById('game'),
  width: 900,
  height: 650,
  scene: [TitleScene, GameScene],
  render: {
    clearBeforeRender: false,
    antialias: false,
    resolution: 1,
  },
  backgroundColor: '#000000',
};
