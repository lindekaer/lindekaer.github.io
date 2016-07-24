/*
-----------------------------------------------------------------------------------
|
| Game class
|
-----------------------------------------------------------------------------------
*/

class Game {
  constructor() {
    this.$startBtn = $('.js-start-btn');
    this.initEvents();
  }

  initEvents() {
    this.$startBtn.on('click', this.pickGameType.bind(this));
  }

  pickGameType(e) {
    var $btn = $(e.currentTarget);
    this.gameType = $btn.attr('data-game');
    this.startGame();
  }

  startGame() {
    if (this.gameType === 'capitals') {}
    if (this.gameType === 'flags') {}
  }
}