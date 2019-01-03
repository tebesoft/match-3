export default class Block extends Phaser.GameObjects.Sprite {
  /**
   *  My custom sprite.
   *
   *  @constructor
   *  @class Block
   *  @extends Phaser.GameObjects.Sprite
   *  @param {Phaser.Scene} scene - The scene that owns this sprite.
   *  @param {number} x - The horizontal coordinate relative to the scene viewport.
   *  @param {number} y - The vertical coordinate relative to the scene viewport.
   */
  constructor(scene, x, y, data) {
    super(scene, x, y, data.asset);
    this.data = data;
    this.row = data.row;
    this.col = data.col;
  }

  reset(x, y, data) {
    this.setPosition(x, y);
    this.setTexture(data.asset);
    this.row = data.row;
    this.col = data.col;
  }
}
