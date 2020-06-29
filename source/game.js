"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = __importDefault(require("./deck"));
const rules_1 = __importDefault(require("./rules"));
const db_model_1 = require("../model/db-model");
class Game {
    constructor() {
        this.deck = new deck_1.default();
    }
    createGame(gameId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfPlayers = players.length;
            if (numberOfPlayers < 2)
                throw new Error("can't start a game with less than 2 players");
            const game = yield db_model_1.gameModel.findById(gameId);
            for (let i = 0; i < numberOfPlayers; i++) {
                // draw 7 cards for each player 
                for (let j = 0; j < 7; j++) {
                    let card = this.deck.drawCard();
                    game.players[i].cards.push(card);
                }
            }
            // intialize current card on board with random value
            game.currentCard = this.deck.drawNonSpecialCard();
            game.currentColor = game.currentCard.color;
            game.numberOfPlayers = numberOfPlayers;
            game.isReversed = false;
            game.gameStart = true;
            yield game.save();
            return game;
        });
    }
    calculateNextTurn(game) {
        game.players[game.currentPlayerTurn].drawCard = 0;
        game.players[game.currentPlayerTurn].canEnd = false;
        if (game.isReversed && game.currentPlayerTurn == 0)
            game.currentPlayerTurn = game.numberOfPlayers - 1;
        else {
            if (game.isReversed)
                game.currentPlayerTurn--;
            else
                game.currentPlayerTurn = (game.currentPlayerTurn + 1) % game.numberOfPlayers;
        }
        game.players[game.currentPlayerTurn].canEnd = false;
    }
    addCard(game, card) {
        game.players[game.currentPlayerTurn].cards.push(card);
    }
    removeCard(game, index) {
        game.players[game.currentPlayerTurn].cards.splice(index, 1);
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
    play(gameId, playerIndex, cardIndex, card, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(playerIndex, cardIndex, card);
            card.isSpecial = card.isspecial;
            const game = yield db_model_1.gameModel.findById(gameId);
            if (game.currentPlayerTurn != playerIndex || game.players[game.currentPlayerTurn].playerId != playerId)
                return -1;
            game.players[game.currentPlayerTurn].drawCard = 0;
            let rule = new rules_1.default(game.currentCard, card, game.currentColor);
            let ruleNumber = rule.getRule();
            if (!ruleNumber)
                return 0;
            game.players[game.currentPlayerTurn].canEnd = true;
            game.currentColor = card.color;
            game.currentCard = card;
            this.removeCard(game, cardIndex);
            if (game.players[game.currentPlayerTurn].cards.length == 0) {
                yield game.save();
                return 7;
            }
            if (ruleNumber == 1) {
                game.players[game.currentPlayerTurn].score += 20;
                if (game.players[game.currentPlayerTurn].score >= 500) {
                    yield game.save();
                    return 7;
                }
                this.calculateNextTurn(game);
                yield game.save();
                return 1;
            }
            else if (ruleNumber == 2) {
                game.players[game.currentPlayerTurn].score += 20;
                if (game.players[game.currentPlayerTurn].score >= 500) {
                    yield game.save();
                    return 7;
                }
                this.calculateNextTurn(game);
                // draw 2 cards for the next player
                this.addCard(game, this.deck.drawCard());
                this.addCard(game, this.deck.drawCard());
                yield game.save();
                return 2;
            }
            else if (ruleNumber == 3) {
                game.players[game.currentPlayerTurn].score += 20;
                if (game.players[game.currentPlayerTurn].score >= 500) {
                    yield game.save();
                    return 7;
                }
                // skip player
                this.calculateNextTurn(game);
                this.calculateNextTurn(game);
                yield game.save();
                return 5;
            }
            else if (ruleNumber == 4) {
                game.players[game.currentPlayerTurn].score += 20;
                if (game.players[game.currentPlayerTurn].score >= 500) {
                    yield game.save();
                    return 7;
                }
                // reverse 
                // reverse work as skip in case of 2 players 
                if (game.numberOfPlayers > 2) {
                    game.isReversed = !game.isReversed;
                    this.calculateNextTurn(game);
                }
                yield game.save();
                return 6;
            }
            else if (ruleNumber == 5) {
                game.players[game.currentPlayerTurn].score += 50;
                if (game.players[game.currentPlayerTurn].score >= 500) {
                    yield game.save();
                    return 7;
                }
                yield game.save();
                return 3;
            }
            else if (ruleNumber == 6) {
                game.players[game.currentPlayerTurn].score += 50;
                if (game.players[game.currentPlayerTurn].score >= 500) {
                    yield game.save();
                    return 7;
                }
                this.calculateNextTurn(game);
                // +4 current user
                this.addCard(game, this.deck.drawCard());
                this.addCard(game, this.deck.drawCard());
                this.addCard(game, this.deck.drawCard());
                this.addCard(game, this.deck.drawCard());
                game.isReversed = !game.isReversed;
                this.calculateNextTurn(game);
                game.isReversed = !game.isReversed;
                yield game.save();
                return 4;
            }
        });
    }
    changCurrentColor(gameId, color, playerIndex, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield db_model_1.gameModel.findById(gameId);
            if (game.currentPlayerTurn != playerIndex)
                return 0;
            if (game.players[game.currentPlayerTurn].playerId != playerId)
                return 0;
            if (["red", "yellow", "blue", "green"].includes(color)) {
                game.currentColor = color;
                game.currentCard.isSpecial = false;
                this.calculateNextTurn(game);
                yield game.save();
                return game;
            }
            return 0;
        });
    }
    drawCard(gameId, playerIndex, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield db_model_1.gameModel.findById(gameId);
            if (!game)
                return 0;
            if (game.currentPlayerTurn != playerIndex || game.players[playerIndex].drawCard >= 2 || game.players[playerIndex].playerId != playerId)
                return 0;
            game.players[playerIndex].cards.push(this.deck.drawCard());
            game.players[playerIndex].drawCard++;
            if (game.players[playerIndex].drawCard == 2)
                game.players[playerIndex].canEnd = true;
            yield game.save();
            return 1;
        });
    }
    resetGame(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfPlayers = game.players.length;
            if (numberOfPlayers < 2)
                throw new Error("can't start a game with less than 2 players");
            for (let i = 0; i < numberOfPlayers; i++) {
                game.players[i].cards = [];
                game.players[i].drawCard = 0;
                game.players[i].canEnd = false;
                game.players[i].score = 0;
                // draw 7 cards for each player 
                for (let j = 0; j < 7; j++) {
                    let card = this.deck.drawCard();
                    game.players[i].cards.push(card);
                }
            }
            // intialize current card on board with random value
            game.currentCard = this.deck.drawNonSpecialCard();
            game.currentColor = game.currentCard.color;
            game.gameStart = true;
            game.numberOfPlayers = game.players.length;
            game.isReversed = false;
            game.currentPlayerTurn = 0;
            yield game.save();
            return game;
        });
    }
}
exports.default = Game;
