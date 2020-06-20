import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const cardSchema = new Schema({
  value: Number,
  color: String,
  isSpecial: Boolean
});
const playerSchema = new Schema({
  cards: [cardSchema],
  name: String,
  index: Number,
  playerId: String,
  drawCard: Boolean
});

const gameSchema = new Schema({
  players: [playerSchema],
  currentPlayerTurn: Number,
  currentCard: cardSchema,
  currentColor: String,
  isReversed: Boolean,
  gameStart: Boolean,
  numberOfPlayers:Number
  
});

const gameModel = mongoose.model("Game", gameSchema);
const playerModel = mongoose.model("Player", playerSchema);
const cardModel = mongoose.model("Card", cardSchema);

export  {gameModel,playerModel,cardModel};