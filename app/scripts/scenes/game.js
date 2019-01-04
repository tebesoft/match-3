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
    } else {
      block.reset(x, y, data);
    }

    this.children.bringToTop(block);
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
          this.clearSelection();
        }
      }
    });

    this.tweens.add({
      targets: block2,
      x: block1.x,
      y: block1.y,
      duration: this.ANIMATION_TIME,
      ease: 'Linear',
      onComplete: () => {
        this.children.bringToTop(block2);
      }
    });
  }

  pickBlock(block) {

    //only swap if the UI is not blocked
    if(this.isBoardBlocked) {
      return;
    }

    //if there is nothing selected
    if(!this.selectedBlock) {
      //highlight the first block
      block.setScale(1.5);

      this.selectedBlock = block;
    }
    else {
      //second block you are selecting is target block
      this.targetBlock = block;

      //only adjacent blocks can swap
      if(this.board.checkAdjacent(this.selectedBlock, this.targetBlock)) {
        //block the UI
        this.isBoardBlocked = true;

        //swap blocks
        this.swapBlocks(this.selectedBlock, this.targetBlock);
      }
      else {
        this.clearSelection();
      }
    }
  }

  clearSelection() {
    this.isBoardBlocked = false;
    this.selectedBlock.setScale(1);
    this.selectedBlock = null;
    this.targetBlock = null;
  }

  updateBoard() {
    this.board.clearChains();
    this.board.updateGrid();

    //after the dropping has ended
    this.time.delayedCall(this.ANIMATION_TIME, () => {
      //see if there are new chains
      var chains = this.board.findAllChains();

      if(chains.length > 0) {
        this.updateBoard();
      }
      else {
        this.clearSelection();
      }
    });
  }
}
