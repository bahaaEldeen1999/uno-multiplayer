const Deck = require("./deck");
const Rules = require("./rules");
const helpers = require("../utils/helpers");

class Game {
  deck = new Deck();
  players = [];
  currentPlayerTurn = -1;
  currentCard = null;
  currentColor = null;
  isReversed = false;
  gameStart = false;
  numberOfPlayers = 0;
  chat = [];
  id = null;

  constructor() {
    this.id = helpers.generateId();
  }

  addPlayer(player) {
    player.index = this.players.length;
    this.players.push(player);
    return player.index;
  }

  createGame() {
    this.numberOfPlayers = this.players.length;
    if (this.numberOfPlayers < 2)
      throw new Error("can't start a game with less than 2 players");
    for (let i = 0; i < this.numberOfPlayers; i++) {
      // draw 7 cards for each player
      for (let j = 0; j < 7; j++) {
        let card = this.deck.drawCard();
        this.players[i].cards.push(card);
      }
    }
    // intialize current card on board with random value
    this.currentCard = this.deck.drawNonSpecialCard();
    this.currentColor = this.currentCard.color;
    this.isReversed = false;
    this.gameStart = true;
    this.currentPlayerTurn = 0;
  }

  calculateNextTurn() {
    this.players[this.currentPlayerTurn].drawCard = 0;
    this.players[this.currentPlayerTurn].canEnd = false;

    if (this.isReversed && this.currentPlayerTurn == 0)
      this.currentPlayerTurn = this.numberOfPlayers - 1;
    else {
      if (this.isReversed) this.currentPlayerTurn--;
      else
        this.currentPlayerTurn =
          (this.currentPlayerTurn + 1) % this.numberOfPlayers;
    }
    this.players[this.currentPlayerTurn].canEnd = false;
  }

  addCard(card) {
    this.players[this.currentPlayerTurn].cards.push(card);
  }

  removeCard(index) {
    this.players[this.currentPlayerTurn].cards.splice(index, 1);
  }

  /**
   * -1 => not your turn
   * 0 => false
   * 1 => true
   * 2 => +2
   * 4 => +4
   * 3 => choose color
   * 5 => skip
   * 6 => inverse
   * 7 => game end
   */
  play(playerIndex, cardIndex, card, playerId) {
    // console.log(playerIndex, cardIndex, card);
    if (
      this.currentPlayerTurn != playerIndex ||
      this.players[this.currentPlayerTurn].playerId != playerId
    )
      return -1;
    this.players[this.currentPlayerTurn].drawCard = 0;
    let rule = new Rules(this.currentCard, card, this.currentColor);
    let ruleNumber = rule.getRule();
    if (!ruleNumber) return 0;
    this.players[this.currentPlayerTurn].canEnd = true;
    this.currentColor = card.color;
    this.currentCard = card;
    this.removeCard(cardIndex);
    if (this.players[this.currentPlayerTurn].cards.length == 0) {
      return 7;
    }
    if (ruleNumber == 1) {
      this.players[this.currentPlayerTurn].score += 20;
      if (this.players[this.currentPlayerTurn].score >= 500) {
        return 7;
      }
      this.calculateNextTurn();
      return 1;
    } else if (ruleNumber == 2) {
      this.players[this.currentPlayerTurn].score += 20;
      if (this.players[this.currentPlayerTurn].score >= 500) {
        return 7;
      }
      this.calculateNextTurn();
      // draw 2 cards for the next player
      this.addCard(this.deck.drawCard());
      this.addCard(this.deck.drawCard());
      return 2;
    } else if (ruleNumber == 3) {
      this.players[this.currentPlayerTurn].score += 20;
      if (this.players[this.currentPlayerTurn].score >= 500) {
        return 7;
      }
      // skip player
      this.calculateNextTurn();
      this.calculateNextTurn();

      return 5;
    } else if (ruleNumber == 4) {
      this.players[this.currentPlayerTurn].score += 20;
      if (this.players[this.currentPlayerTurn].score >= 500) {
        return 7;
      }
      // reverse
      // reverse work as skip in case of 2 players
      if (this.numberOfPlayers > 2) {
        this.isReversed = !this.isReversed;
        this.calculateNextTurn();
      }
      return 6;
    } else if (ruleNumber == 5) {
      this.players[this.currentPlayerTurn].score += 50;
      if (this.players[this.currentPlayerTurn].score >= 500) {
        return 7;
      }
      return 3;
    } else if (ruleNumber == 6) {
      this.players[this.currentPlayerTurn].score += 50;
      if (this.players[this.currentPlayerTurn].score >= 500) {
        return 7;
      }
      this.calculateNextTurn();
      // +4 current user
      this.addCard(this.deck.drawCard());
      this.addCard(this.deck.drawCard());
      this.addCard(this.deck.drawCard());
      this.addCard(this.deck.drawCard());
      this.isReversed = !this.isReversed;
      this.calculateNextTurn();
      this.isReversed = !this.isReversed;
      return 4;
    }
  }
  changCurrentColor(color, playerIndex, playerId) {
    if (this.currentPlayerTurn != playerIndex) return -1;
    if (this.players[this.currentPlayerTurn].playerId != playerId) return -1;
    if (["red", "yellow", "blue", "green"].includes(color)) {
      this.currentColor = color;
      this.calculateNextTurn();
      return 0;
    }
    return -1;
  }

  drawCard(playerIndex, playerId) {
    // console.log(
    //   this.players,
    //   playerId,
    //   playerIndex,
    //   this.currentPlayerTurn,
    //   this.isReversed
    // );
    if (
      this.currentPlayerTurn != playerIndex ||
      this.players[playerIndex].drawCard >= 2 ||
      this.players[playerIndex].playerId != playerId
    )
      return -1;
    this.players[playerIndex].cards.push(this.deck.drawCard());
    this.players[playerIndex].drawCard++;
    if (this.players[playerIndex].drawCard == 2)
      this.players[playerIndex].canEnd = true;
    return 0;
  }

  resetGame() {
    const numberOfPlayers = this.players.length;
    if (this.numberOfPlayers < 2)
      throw new Error("can't start a game with less than 2 players");
    for (let i = 0; i < this.numberOfPlayers; i++) {
      this.players[i].cards = [];
      this.players[i].drawCard = 0;
      this.players[i].canEnd = false;
      this.players[i].score = 0;

      // draw 7 cards for each player
      for (let j = 0; j < 7; j++) {
        let card = this.deck.drawCard();
        this.players[i].cards.push(card);
      }
    }
    // intialize current card on board with random value
    this.currentCard = this.deck.drawNonSpecialCard();
    this.currentColor = this.currentCard.color;
    this.gameStart = true;
    this.isReversed = false;
    this.currentPlayerTurn = 0;
  }
}
module.exports = Game;
