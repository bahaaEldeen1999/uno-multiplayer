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
  drawCard: Number,
  canEnd: Boolean,
  socketId: String
});
const chatSchema = new Schema({
  playerName: String,
  message:String
});
const gameSchema = new Schema({
  players: [playerSchema],
  currentPlayerTurn: Number,
  currentCard: cardSchema,
  currentColor: String,
  isReversed: Boolean,
  gameStart: Boolean,
  numberOfPlayers: Number,
  chat:[chatSchema]
  
});

const gameModel = mongoose.model("Game", gameSchema);
const playerModel = mongoose.model("Player", playerSchema);
const cardModel = mongoose.model("Card", cardSchema);
const chatModel = mongoose.model("Chat", chatSchema);

export  {gameModel,playerModel,cardModel,chatModel};