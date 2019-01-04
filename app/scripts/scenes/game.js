import Board from '@/objects/board';
import Block from '@/objects/block';

export default class Game extends Phaser.Scene {
  /**
   *  A sample Game scene, displaying the Phaser logo.
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super({key: 'Game'});
  }

  /**
   *  Called when a scene is initialized. Method responsible for setting up
   *  the game objects of the scene.
   *
   *  @protected
   *  @param {object} data Initialization parameters.
   */
  create(/* data */) {
    this.NUM_ROWS = 8;
    this.NUM_COLS = 8;
    // candy variations
    this.NUM_VARIATIONS = 6;
    this.BLOCK_SIZE = 35;
    this.ANIMATION_TIME = 300;

    this.background = this.add.sprite(0, 0, 'background');
    this.background.setOrigin(0);

    this.board = new Board(this, this.NUM_ROWS, this.NUM_COLS, this.NUM_VARIATIONS);
    this.blocks = this.add.group();
    this.graphics = this.make.graphics();
    this.drawBoard();

    this.time.delayedCall(1000, () => this.board.clearChains());
  }

  drawBoard() {
    this.graphics.fillStyle(0x000, 0.2);
    this.graphics.fillRect(0, 0, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    this.graphics.generateTexture('cell', this.BLOCK_SIZE + 6, this.BLOCK_SIZE + 6);

    for(let i = 0; i < this.NUM_ROWS; i++) {
      for(let j = 0; j < this.NUM_COLS; j++) {
        const x = 36 + j * (this.BLOCK_SIZE + 6);
        const y = 150 + i * (this.BLOCK_SIZE + 6);

        this.add.image(x, y, 'cell');

        this.createBlock(x, y, {
          asset: 'block' + this.board.grid[i][j],
          row: i,
          col: j
        });
      }
    }
  }

  createBlock(x, y, data) {
    let block = this.blocks.getFirstDead(false, x, y);
    if (block == null) {
      block = new Block(this, x, y, data);
      this.blocks.add(block, true);
    }
    else {
      block.reset(x, y, data);
    }

    return block;
  }

  getBlockFromColRow(block) {
    return this.blocks.getChildren().find((item) => item.row == block.row && item.col == block.col);
  }

  /**
   *  Called when a scene is updated. Updates to game logic, physics and game
   *  objects are handled here.
   *
   *  @protected
   *  @param {number} t Current internal clock time.
   *  @param {number} dt Time elapsed since last update.
   */
  update(/* t, dt */) {
  }
}
