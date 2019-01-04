import Board from '@/objects/board';
import Block from '@/objects/block';

export default class Game extends Phaser.Scene {
  /**
   *  A sample Game scene, displaying the Phaser logo.
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super({ key: 'Game' });
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

    this.board = new Board(
      this,
      this.NUM_ROWS,
      this.NUM_COLS,
      this.NUM_VARIATIONS
    );
    this.blocks = this.add.group();
    this.graphics = this.make.graphics();
    this.drawBoard();

    // this.time.delayedCall(2000, () => this.board.clearChains());
    // this.time.delayedCall(3000, () => this.board.updateGrid());
    this.time.delayedCall(1000, () => {
      let block1 = this.blocks.getChildren()[10];
      let block2 = this.blocks.getChildren()[11];
      this.swapBlocks(block1, block2);
    });

  }

  drawBoard() {
    this.graphics.fillStyle(0x000, 0.2);
    this.graphics.fillRect(0, 0, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    this.graphics.generateTexture(
      'cell',
      this.BLOCK_SIZE + 6,
      this.BLOCK_SIZE + 6
    );

    for (let i = 0; i < this.NUM_ROWS; i++) {
      for (let j = 0; j < this.NUM_COLS; j++) {
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
      this.children.bringToTop(block);
    } else {
      block.reset(x, y, data);
    }
    block.setActive(true);
    block.setVisible(true);
    return block;
  }

  getBlockFromColRow(block) {
    return this.blocks
      .getChildren()
      .find(item => item.row == block.row && item.col == block.col);
  }

  dropBlock(sourceRow, targetRow, col) {
    const block = this.getBlockFromColRow({ row: sourceRow, col: col });
    const targetY = 150 + targetRow * (this.BLOCK_SIZE + 6);

    block.row = targetRow;
    this.children.bringToTop(block);

    this.tweens.add({
      targets: block,
      y: targetY,
      duration: this.ANIMATION_TIME,
      ease: 'Linear'
    });
  }

  dropReserveBlock(sourceRow, targetRow, col) {
    var x = 36 + col * (this.BLOCK_SIZE + 6);
    var y =
      -(this.BLOCK_SIZE + 6) * this.board.RESERVE_ROW +
      sourceRow * (this.BLOCK_SIZE + 6);

    var block = this.createBlock(x, y, {
      asset: 'block' + this.board.grid[targetRow][col],
      row: targetRow,
      col: col
    });
    var targetY = 150 + targetRow * (this.BLOCK_SIZE + 6);

    this.tweens.add({
      targets: block,
      y: targetY,
      duration: this.ANIMATION_TIME,
      ease: 'Linear'
    });
  }

  swapBlocks(block1, block2) {
    //when swapping scale block1 back to 1
    //block1.scale.setTo(1);

    this.tweens.add({
      targets: block1,
      x: block2.x,
      y: block2.y,
      duration: this.ANIMATION_TIME,
      ease: 'Linear',
      onComplete: () => {
        // update model
        this.board.swap(block1, block2);

        if (!this.isReversingSwap) {
          var chains = this.board.findAllChains();

          if (chains.length > 0) {
            this.updateBoard();
          } else {
            this.isReversingSwap = true;
            this.swapBlocks(block1, block2);
          }
        } else {
          this.isReversingSwap = false;
          //this.clearSelection();
        }
      }
    });

    this.tweens.add({
      targets: block2,
      x: block1.x,
      y: block1.y,
      duration: this.ANIMATION_TIME,
      ease: 'Linear'
    });
  }

  /**
   *  Called when a scene is updated. Updates to game logic, physics and game
   *  objects are handled here.
   *
   *  @protected
   *  @param {number} t Current internal clock time.
   *  @param {number} dt Time elapsed since last update.
   */
  update(/* t, dt */) {}
}
