"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = exports.cardModel = exports.playerModel = exports.gameModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
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
    socketId: String,
    score: Number
});
const chatSchema = new Schema({
    playerName: String,
    message: String
});
const gameSchema = new Schema({
    players: [playerSchema],
    currentPlayerTurn: Number,
    currentCard: cardSchema,
    currentColor: String,
    isReversed: Boolean,
    gameStart: Boolean,
    numberOfPlayers: Number,
    chat: [chatSchema]
});
const gameModel = mongoose_1.default.model("Game", gameSchema);
exports.gameModel = gameModel;
const playerModel = mongoose_1.default.model("Player", playerSchema);
exports.playerModel = playerModel;
const cardModel = mongoose_1.default.model("Card", cardSchema);
exports.cardModel = cardModel;
const chatModel = mongoose_1.default.model("Chat", chatSchema);
exports.chatModel = chatModel;
