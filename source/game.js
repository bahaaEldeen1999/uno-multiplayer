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
const player_1 = __importDefault(require("./player"));
const rules_1 = __importDefault(require("./rules"));
const db_model_1 = require("../model/db-model");
class Game {
    constructor() {
        this.deck = new deck_1.default();
    }
    createGame(gameId, players) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfPlayers = players.length;
            //if (numberOfPlayers < 2) throw new Error("can't start a game with less than 2 players");
            const game = yield db_model_1.gameModel.findById(gameId);
            for (let i = 0; i < numberOfPlayers; i++) {
                let player = new player_1.default(players[i].name, players[i].index);
                // draw 7 cards for each player 
                for (let j = 0; j < 7; j++) {
                    let card = this.deck.drawCard();
                    game.players[i].cards.push(card);
                }
            }
            // intialize current card on board with random value
            game.currentCard = this.deck.drawNonSpecialCard();
            game.currentColor = game.currentCard.color;
            yield game.save();
            return game;
        });
    }
    calculateNextTurn(game) {
        return __awaiter(this, void 0, void 0, function* () {
            if (game.isReversed && game.currentPlayerTurn == 0)
                game.currentPlayerTurn = game.numberOfPlayers - 1;
            else {
                if (game.isReversed)
                    game.currentPlayerTurn--;
                else
                    game.currentPlayerTurn = (game.currentPlayerTurn + 1) % game.numberOfPlayers;
            }
        });
    }
    addCard(game, card) {
        game.players[game.currentPlayerTurn].cards.push(card);
    }
    removeCard(game, index) {
        game.players[game.currentPlayerTurn].cards.splice(index, 1);
    }
    /**
     *
     * 0 => false
     * 1 => true
     * 2 => game end
     * 3 => choose color
     */
    play(gameId, playerIndex, cardIndex, card) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(playerIndex, cardIndex, card);
            card.isSpecial = card.isspecial;
            const game = yield db_model_1.gameModel.findById(gameId);
            if (game.currentPlayerTurn != playerIndex)
                return 0;
            let rule = new rules_1.default(game.currentCard, card, game.currentColor);
            let ruleNumber = rule.getRule();
            if (!ruleNumber)
                return 0;
            game.currentColor = card.color;
            game.currentCard = card;
            this.removeCard(game, cardIndex);
            if (game.players[game.currentPlayerTurn].cards.length == 0) {
                yield game.save();
                return 2;
            }
            if (ruleNumber == 1) {
                this.calculateNextTurn(game);
            }
            else if (ruleNumber == 2) {
                this.calculateNextTurn(game);
                // draw 2 cards for the next player
                this.addCard(game, this.deck.drawCard());
                this.addCard(game, this.deck.drawCard());
            }
            else if (ruleNumber == 3) {
                // skip player
                this.calculateNextTurn(game);
                this.calculateNextTurn(game);
            }
            else if (ruleNumber == 4) {
                // reverse 
                game.isReversed = true;
                this.calculateNextTurn(game);
            }
            else if (ruleNumber == 5) {
                // prompt user to choose color emit event "selectColor"
                // let inputColor:string = prompt("choose the color");
                //  game.currentColor = inputColor;
                //this.calculateNextTurn(game);
                yield game.save();
                return 3;
            }
            else if (ruleNumber == 6) {
                // prompt user to choose color emit event "selectColor"
                // let inputColor:string = prompt("choose the color");
                // game.currentColor = inputColor;
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
                return 3;
            }
            yield game.save();
            return 1;
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
                this.calculateNextTurn(game);
                yield game.save();
                return game;
            }
            return 0;
        });
    }
    drawCard(gameId, playerIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const game = yield db_model_1.gameModel.findById(gameId);
            if (game.currentPlayerTurn != playerIndex)
                return 0;
            game.players[playerIndex].cards.push(this.deck.drawCard());
            yield game.save();
        });
    }
}
exports.default = Game;
