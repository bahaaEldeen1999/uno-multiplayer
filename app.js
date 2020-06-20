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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const game_1 = __importDefault(require("./source/game"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_model_1 = require("./model/db-model");
// create the game
let gameController = new game_1.default();
const app = express_1.default();
const PORT = 3000;
const server = http_1.default.createServer(app);
mongoose_1.default.connect("mongodb://localhost/uno", { useNewUrlParser: true });
mongoose_1.default.connection.once("open", () => {
    console.log("connected to db");
});
app.use(cors_1.default());
app.use(express_1.default.static('output'));
app.use(express_1.default.static('styles'));
const io = socket_io_1.default.listen(server);
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
io.on("connection", (socket) => {
    console.log("connected");
    socket.on("createGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let newGame = new db_model_1.gameModel({
            players: [{
                    name: data.name,
                    index: data.number,
                    playerId: data.playerId
                }],
            currentPlayerTurn: 0,
            gameStart: false
        });
        yield newGame.save();
        // send back id to host
        io.sockets.emit("createdGameId", {
            gameId: newGame._id,
            playerId: data.playerId
        });
    }));
    // when other user want to join game
    socket.on("joinGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let game = yield db_model_1.gameModel.findById(data.gameId);
        if (game.gameStart)
            return;
        let index = game.players.length;
        game.players.push({
            name: data.name,
            index: index,
            playerId: data.playerId
        });
        let players = [];
        for (let player of game.players) {
            players.push({
                name: player.name,
                index: player.index
            });
        }
        yield game.save();
        io.sockets.emit("joinedGame", {
            gameId: game._id,
            playerId: data.playerId,
            index: index
        });
        io.sockets.emit("queueChanged", {
            gameId: game._id,
            players: players
        });
    }));
    // create game instance when the host start the game
    socket.on("startGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let game = yield db_model_1.gameModel.findById(data.gameId);
        game.gameStart = true;
        game.numberOfPlayers = game.players.length;
        game.isReversed = false;
        yield game.save();
        let players = [];
        for (let player of game.players)
            players.push(player);
        game = yield gameController.createGame(game._id, players);
        players = [];
        for (let player of game.players) {
            players.push({
                name: player.name,
                index: player.index,
                number: player.cards.length
            });
        }
        io.sockets.emit("gameCreated", {
            gameId: data.gameId,
            players: players,
            currentCard: game.currentCard,
            currentPlayerTurn: game.currentPlayerTurn,
            currenColor: game.currentColor
        });
        for (let player of game.players) {
            io.sockets.emit("getCards", {
                playerId: player.playerId,
                cards: player.cards
            });
        }
    }));
    // player play card
    socket.on("playCard", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let isPlayed = yield gameController.play(data.gameId, data.playerIndex, data.cardIndex, data.card);
        if (isPlayed == -1) {
            socket.emit("wrongTurn", {
                gameId: data.gameId,
                playerIndex: data.playerIndex,
                playerId: data.playerId
            });
            return;
        }
        else if (isPlayed == 0) {
            socket.emit("wrongMove", {
                gameId: data.gameId,
                playerIndex: data.playerIndex,
                playerId: data.playerId
            });
            return;
        }
        let game = yield db_model_1.gameModel.findById(data.gameId);
        let players = [];
        for (let player of game.players) {
            players.push({
                name: player.name,
                index: player.index,
                number: player.cards.length
            });
        }
        io.sockets.emit("gameUpdated", {
            gameId: data.gameId,
            players: players,
            currentCard: game.currentCard,
            currentPlayerTurn: game.currentPlayerTurn,
            currenColor: game.currentColor
        });
        // update each on cards
        for (let player of game.players) {
            io.sockets.emit("getCards", {
                playerId: player.playerId,
                cards: player.cards
            });
        }
        if (isPlayed == 1) {
            io.sockets.emit("greatMove", { gameId: data.gameId, playerIndex: data.playerIndex, success: "valid move" });
        }
        else if (isPlayed == 3) {
            io.sockets.emit("chooseColor", {
                gameId: data.gameId,
                playerIndex: data.playerIndex,
                playerId: game.players[data.playerIndex].playerId
            });
        }
        else {
            io.sockets.emit("gameEnd", { gameId: data.gameId, playerIndex: data.playerIndex, success: "game ended" });
        }
    }));
    socket.on("colorIsChosen", (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield gameController.changCurrentColor(data.gameId, data.color, data.playerIndex, data.playerId);
        let game = yield db_model_1.gameModel.findById(data.gameId);
        let players = [];
        for (let player of game.players) {
            players.push({
                name: player.name,
                index: player.index,
                number: player.cards.length
            });
        }
        io.sockets.emit("gameUpdated", {
            gameId: data.gameId,
            players: players,
            currentCard: game.currentCard,
            currentPlayerTurn: game.currentPlayerTurn,
            currenColor: game.currentColor
        });
    }));
    socket.on("drawCard", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let x = yield gameController.drawCard(data.gameId, data.playerIndex);
        if (!x) {
            socket.emit("cannotDraw", {
                gameId: data.gameId,
                playerIndex: data.playerIndex,
                playerId: data.playerId,
            });
            return;
        }
        let game = yield db_model_1.gameModel.findById(data.gameId);
        let players = [];
        for (let player of game.players) {
            players.push({
                name: player.name,
                index: player.index,
                number: player.cards.length
            });
        }
        io.sockets.emit("gameUpdated", {
            gameId: data.gameId,
            players: players,
            currentCard: game.currentCard,
            currentPlayerTurn: game.currentPlayerTurn,
            currenColor: game.currentColor
        });
        // update each on cards
        for (let player of game.players) {
            io.sockets.emit("getCards", {
                playerId: player.playerId,
                cards: player.cards
            });
        }
    }));
    socket.on("endTurn", (data) => __awaiter(void 0, void 0, void 0, function* () {
        let game = yield db_model_1.gameModel.findById(data.gameId);
        if (game.currentPlayerTurn == data.playerIndex && game.players[game.currentPlayerTurn].playerId == data.playerId) {
            yield gameController.calculateNextTurn(game);
            yield game.save();
            let players = [];
            for (let player of game.players) {
                players.push({
                    name: player.name,
                    index: player.index,
                    number: player.cards.length
                });
            }
            io.sockets.emit("gameUpdated", {
                gameId: data.gameId,
                players: players,
                currentCard: game.currentCard,
                currentPlayerTurn: game.currentPlayerTurn,
                currenColor: game.currentColor
            });
            // update each on cards
            for (let player of game.players) {
                io.sockets.emit("getCards", {
                    playerId: player.playerId,
                    cards: player.cards
                });
            }
        }
    }));
});
server.listen(PORT, () => { console.log(`listening on port ${PORT}`); });
