import Card from './card';

class Player {
  cards: Array<Card>;
  name: string;
  index: number;
  constructor(name:string,index: number) {
    this.cards = [];
    this.name = name;
    this.index = index;
  }
  addCard(card: Card): void {
    this.cards.push(card);
  }
  removeCard(index: number): void{
    this.cards.splice(index, 1);
  }

}

export default Player;