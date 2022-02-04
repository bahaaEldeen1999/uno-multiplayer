class Player {
  cards;
  name;
  index;
  playerId;
  socketId;
  drawCard = 0;
  score = 0;
  canEnd = false;
  constructor(playerId, name, socketId) {
    this.cards = [];
    this.name = name;
    this.socketId = socketId;
    this.playerId = playerId;
    return this.id;
  }

  addCard(card) {
    this.cards.push(card);
  }

  removeCard(index) {
    this.cards.splice(index, 1);
  }
}

module.exports = Player;
