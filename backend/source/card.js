class Card {
  value;
  color;
  isSpecial;

  constructor(value, color, isSpecial) {
    this.value = value;
    this.color = color;
    this.isSpecial = isSpecial;
  }
}

module.exports = Card;
