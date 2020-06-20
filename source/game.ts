import Card from './card';
import Deck from './deck';
import Player from './player';
import Rules from './rules';
import mongoose from 'mongoose';
import {  gameModel , playerModel, cardModel } from '../model/db-model';
class Game {
   deck: Deck = new Deck();
  async createGame(gameId: mongoose.Types.ObjectId, players: Array<Player>) {
    const numberOfPlayers = players.length;
    //if (numberOfPlayers < 2) throw new Error("can't start a game with less than 2 players");
    const game = await gameModel.findById(gameId);
    for (let i = 0; i < numberOfPlayers; i++){
      let player:Player = new Player(players[i].name,players[i].index);
      // draw 7 cards for each player 
      for (let j = 0; j < 7; j++){
        let card: Card = this.deck.drawCard();
        game.players[i].cards.push(card);
      }
    }
    // intialize current card on board with random value
    game.currentCard = this.deck.drawNonSpecialCard();
    game.currentColor = game.currentCard.color;
    await game.save();
    return game;
  }
  async calculateNextTurn(game) {
    game.players[game.currentPlayerTurn].drawCard = false;
    if (game.isReversed && game.currentPlayerTurn == 0) game.currentPlayerTurn = game.numberOfPlayers - 1;
      else {
        if (game.isReversed) game.currentPlayerTurn--;
        else game.currentPlayerTurn = (game.currentPlayerTurn + 1) % game.numberOfPlayers;
    }
    
  }
  addCard(game,card: Card): void {
    game.players[game.currentPlayerTurn].cards.push(card);
  }
  removeCard(game,index: number): void{
    game.players[game.currentPlayerTurn].cards.splice(index, 1);
  }
  /**
   * -1 => not your turn
   * 0 => false
   * 1 => true
   * 2 => game end
   * 3 => choose color
   */
  async play(gameId: mongoose.Types.ObjectId, playerIndex: Number, cardIndex: number, card: Card) {
   // console.log(playerIndex, cardIndex, card);
    card.isSpecial = card.isspecial;
    const game = await gameModel.findById(gameId);
    if (game.currentPlayerTurn != playerIndex) return -1;
    game.players[game.currentPlayerTurn].drawCard = false;
    let rule: Rules = new Rules(game.currentCard, card,game.currentColor);
    let ruleNumber: number = rule.getRule();
    if (!ruleNumber) return 0;
    game.currentColor = card.color;
    game.currentCard = card;
    this.removeCard(game,cardIndex);
    if (game.players[game.currentPlayerTurn].cards.length == 0) {
      await game.save();
      return 2;
    }
    if (ruleNumber == 1) {
      this.calculateNextTurn(game);
    } else if (ruleNumber == 2) {
      this.calculateNextTurn(game);
      // draw 2 cards for the next player
      this.addCard(game,this.deck.drawCard());
      this.addCard(game,this.deck.drawCard());
    } else if (ruleNumber == 3) {
      // skip player
      this.calculateNextTurn(game);
      this.calculateNextTurn(game);
    } else if (ruleNumber == 4) {
      // reverse 
      game.isReversed = true;
      this.calculateNextTurn(game);
    } else if (ruleNumber == 5) {

      await game.save();
      return 3;
    } else if (ruleNumber == 6) {
      this.calculateNextTurn(game);
      // +4 current user
      this.addCard(game,this.deck.drawCard());
      this.addCard(game,this.deck.drawCard());
      this.addCard(game,this.deck.drawCard());
      this.addCard(game, this.deck.drawCard());
      game.isReversed = !game.isReversed;
      this.calculateNextTurn(game);
      game.isReversed = !game.isReversed;
      await game.save();
      return 3;
    }
    await game.save();
    return 1;
 
  }
  async changCurrentColor(gameId: mongoose.Types.ObjectId, color: string,playerIndex:number,playerId:string) {
    const game = await gameModel.findById(gameId);
    if (game.currentPlayerTurn != playerIndex) return 0;
    if (game.players[game.currentPlayerTurn].playerId != playerId) return 0;
    if (["red", "yellow", "blue", "green"].includes(color)) {
      game.currentColor = color;
      this.calculateNextTurn(game);
      await game.save();
      return game;
    }
    return 0;
  }

  async drawCard(gameId: mongoose.Types.ObjectId, playerIndex: number) {
    const game = await gameModel.findById(gameId);
    if (game.currentPlayerTurn != playerIndex || game.players[playerIndex].drawCard == 1) return 0;
    game.players[playerIndex].cards.push(this.deck.drawCard());
    game.players[playerIndex].drawCard = true;
    await game.save();
    return 1;
    
  }
}

export default Game;