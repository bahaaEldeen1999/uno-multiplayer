import Card from './card';
import Deck from './deck';
import Player from './player';
import Rules from './rules';
class Game {

  players: Array<Player>;
  numberOfPlayers: number;
  deck: Deck = new Deck();
  currentPlayerTurn: number = 0;
  currentCard: Card;
  currentColor: string;
  isReversed: boolean = false;
  constructor(numberOfPlayers: number, names: Array<string>) {
    if (numberOfPlayers < 2) throw new Error("can't start a game with less than 2 players");
    this.numberOfPlayers = numberOfPlayers;
    for (let i = 0; i < numberOfPlayers; i++){
      let player:Player = new Player(names[i],i);
      // draw 7 cards for each player 
      for (let j = 0; j < 7; j++){
        let card: Card = this.deck.drawCard();
        player.addCard(card);
      }
      this.players.push(player);
    }
    // intialize current card on board with random value
    this.currentCard = this.deck.drawNonSpecialCard();
    this.currentColor = this.currentCard.color;
  }
  calculateNextTurn(): void{
    if (this.isReversed && this.currentPlayerTurn == 0) this.currentPlayerTurn = this.numberOfPlayers - 1;
      else {
        if (this.isReversed) this.currentPlayerTurn--;
        else this.currentPlayerTurn = (this.currentPlayerTurn + 1) % this.numberOfPlayers;
      }
  }
  /**
   * 
   * 0 => false
   * 1 => true
   * 2 => game end
   */
  play(cardIndex:number,card: Card): number{
    let rule: Rules = new Rules(this.currentCard, card,this.currentColor);
    let ruleNumber: number = rule.getRule();
    if (!ruleNumber) return 0;
    this.currentColor = card.color;
    this.currentCard = card;
    this.players[this.currentPlayerTurn].removeCard(cardIndex);
    if (this.players[this.currentPlayerTurn].cards.length == 0) return 2;
    if (ruleNumber == 1) {
      this.calculateNextTurn();
    } else if (ruleNumber == 2) {
      this.calculateNextTurn();
      // draw 2 cards for the next player
      this.players[this.currentPlayerTurn].addCard(this.deck.drawCard());
      this.players[this.currentPlayerTurn].addCard(this.deck.drawCard());
    } else if (ruleNumber == 3) {
      // skip player
      this.calculateNextTurn();
      this.calculateNextTurn();
    } else if (ruleNumber == 4) {
      // reverse 
      this.isReversed = true;
      this.calculateNextTurn();
    } else if (ruleNumber == 5) {
      // prompt user to choose color 
      let inputColor:string = prompt("choose the color");
      this.currentColor = inputColor;
      this.calculateNextTurn();
    } else if (ruleNumber == 6) {
      // prompt user to choose color 
      let inputColor:string = prompt("choose the color");
      this.currentColor = inputColor;
      this.calculateNextTurn();
      // +4 current user
      this.players[this.currentPlayerTurn].addCard(this.deck.drawCard());
      this.players[this.currentPlayerTurn].addCard(this.deck.drawCard());
      this.players[this.currentPlayerTurn].addCard(this.deck.drawCard());
      this.players[this.currentPlayerTurn].addCard(this.deck.drawCard());
    }
    return 1;
  }

}

export default Game;