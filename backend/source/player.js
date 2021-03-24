

class Player {
  cards;
  name;
  index;
  constructor(name,index) {
    this.cards = [];
    this.name = name;
    this.index = index;
  }
  addCard(card) {
    this.cards.push(card);
  }
  removeCard(index){
    this.cards.splice(index, 1);
  }

}

module.exports = Player;