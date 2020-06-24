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
const dotenv_1 = __importDefault(require("dotenv"));
const db_model_1 = require("./model/db-model");
dotenv_1.default.config();
// create the game
let gameController = new game_1.default();
const app = express_1.default();
const PORT = 3000;
const server = http_1.default.createServer(app);
mongoose_1.default.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true });
mongoose_1.default.connection.once("open", () => {
    console.log("connected to db " + process.env.CONNECTION_STRING);
});
app.use(cors_1.default());
app.use(express_1.default.static('output'));
app.use(express_1.default.static('styles'));
const io = socket_io_1.default.listen(server);
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "index.html"));
});
io.on("connection", (socket) => {
    socket.on("createGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!data.name || data.number === undefined || !data.playerId)
                throw new Error("not enough data");
            let newGame = new db_model_1.gameModel({
                players: [{
                        name: data.name,
                        index: data.number,
                        playerId: data.playerId,
                        socketId: socket.id,
                        drawCard: 0
                    }],
                currentPlayerTurn: 0,
                gameStart: false,
                isReversed: false
            });
            yield newGame.save();
            // send back id to host
            io.sockets.emit("createdGameId", {
                gameId: newGame._id,
                playerId: data.playerId
            });
            // set gameid property on the socket object
            socket.gameId = newGame._id;
        }
        catch (err) {
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    // when other user want to join game
    socket.on("joinGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let game = yield db_model_1.gameModel.findById(data.gameId);
            if (!game)
                throw new Error("no game with this id");
            if (game.gameStart) {
                throw new Error("the game already runnning cannot join");
            }
            let index = game.players.length;
            game.players.push({
                name: data.name,
                index: index,
                playerId: data.playerId,
                socketId: socket.id,
                drawCard: 0
            });
            // set gameid property on the socket object
            socket.gameId = game._id;
            let players = [];
            for (let player of game.players) {
                players.push({
                    name: player.name,
                    index: player.index
                });
            }
            yield game.save();
            socket.emit("joinedGame", {
                gameId: game._id,
                playerId: data.playerId,
                index: index
            });
            for (let player of game.players) {
                io.to(player.socketId).emit("queueChanged", {
                    gameId: game._id,
                    players: players
                });
            }
        }
        catch (err) {
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    // create game instance when the host start the game
    socket.on("startGame", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let game = yield db_model_1.gameModel.findById(data.gameId);
            if (!game)
                throw new Error("no game with this id");
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
            for (let player of game.players) {
                io.to(player.socketId).emit("gameCreated", {
                    gameId: data.gameId,
                    players: players,
                    currentCard: game.currentCard,
                    currentPlayerTurn: game.currentPlayerTurn,
                    currenColor: game.currentColor
                });
            }
            for (let player of game.players) {
                io.to(player.socketId).emit("getCards", {
                    playerId: player.playerId,
                    cards: player.cards,
                    gameId: data.gameId
                });
            }
        }
        catch (err) {
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    // player play card
    socket.on("playCard", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let isPlayed = yield gameController.play(data.gameId, data.playerIndex, data.cardIndex, data.card, data.playerId);
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
            for (let player of game.players) {
                io.to(player.socketId).emit("gameUpdated", {
                    gameId: data.gameId,
                    players: players,
                    currentCard: game.currentCard,
                    currentPlayerTurn: game.currentPlayerTurn,
                    currenColor: game.currentColor
                });
            }
            // update each on cards
            let uno = false;
            if (game.players[data.playerIndex].cards.length == 1)
                uno = true;
            for (let player of game.players) {
                io.to(player.socketId).emit("getCards", {
                    playerId: player.playerId,
                    cards: player.cards,
                    gameId: data.gameId
                });
            }
            if (uno) {
                for (let player of game.players) {
                    io.to(player.socketId).emit("uno", {
                        gameId: data.gameId
                    });
                }
            }
            if (isPlayed == 2) {
                io.to(game.players[game.currentPlayerTurn].socketId).emit("drawTwo", {
                    gameId: data.gameId
                });
            }
            else if (isPlayed == 3) {
                io.sockets.emit("chooseColor", {
                    gameId: data.gameId,
                    playerIndex: data.playerIndex,
                    playerId: game.players[data.playerIndex].playerId
                });
            }
            else if (isPlayed == 4) {
                io.sockets.emit("chooseColor", {
                    gameId: data.gameId,
                    playerIndex: data.playerIndex,
                    playerId: game.players[data.playerIndex].playerId
                });
                gameController.calculateNextTurn(game);
                io.to(game.players[game.currentPlayerTurn].socketId).emit("drawFour", {
                    gameId: data.gameId
                });
                game.isReversed = !game.isReversed;
                gameController.calculateNextTurn(game);
                game.isReversed = !game.isReversed;
            }
            else if (isPlayed == 5) {
                io.sockets.emit("skipTurn", {
                    gameId: data.gameId
                });
            }
            else if (isPlayed == 6) {
                io.sockets.emit("reverseTurn", {
                    gameId: data.gameId
                });
            }
            else if (isPlayed == 7) {
                io.sockets.emit("gameEnd", { gameId: data.gameId, playerIndex: data.playerIndex, playerId: data.playerId, success: "game ended" });
            }
        }
        catch (err) {
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    socket.on("colorIsChosen", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!data.gameId || !data.color || data.playerIndex === undefined || !data.playerId)
                throw new Error("data is not enough");
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
            for (let player of game.players) {
                io.to(player.socketId).emit("gameUpdated", {
                    gameId: data.gameId,
                    players: players,
                    currentCard: game.currentCard,
                    currentPlayerTurn: game.currentPlayerTurn,
                    currenColor: game.currentColor,
                    cardDrawn: true
                });
            }
        }
        catch (err) {
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    socket.on("drawCard", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!data.gameId || data.playerIndex === undefined || !data.playerId)
                throw new Error("data is not enough");
            let x = yield gameController.drawCard(data.gameId, data.playerIndex, data.playerId);
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
            for (let player of game.players) {
                io.to(player.socketId).emit("gameUpdated", {
                    gameId: data.gameId,
                    players: players,
                    currentCard: game.currentCard,
                    currentPlayerTurn: game.currentPlayerTurn,
                    currenColor: game.currentColor,
                    cardDrawn: true
                });
            }
            // update each on cards
            socket.emit("getCards", {
                playerId: data.playerId,
                cards: game.players[data.playerIndex].cards,
                gameId: data.gameId
            });
        }
        catch (err) {
            console.log(err);
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    socket.on("endTurn", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let game = yield db_model_1.gameModel.findById(data.gameId);
            if (!game)
                throw new Error("no game with this id");
            if (game.currentPlayerTurn == data.playerIndex && game.players[game.currentPlayerTurn].playerId == data.playerId && game.players[game.currentPlayerTurn].canEnd) {
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
                for (let player of game.players) {
                    io.to(player.socketId).emit("gameUpdated", {
                        gameId: data.gameId,
                        players: players,
                        currentCard: game.currentCard,
                        currentPlayerTurn: game.currentPlayerTurn,
                        currenColor: game.currentColor
                    });
                }
                // update each on cards
                for (let player of game.players) {
                    io.to(player.socketId).emit("getCards", {
                        playerId: player.playerId,
                        cards: player.cards,
                        gameId: data.gameId
                    });
                }
            }
            else if (!game.players[game.currentPlayerTurn].canEnd) {
                socket.emit("errorInRequest", { msg: "cannot end turn draw card or play card" });
            }
        }
        catch (err) {
            socket.emit("errorInRequest", { msg: err });
        }
    }));
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const socketId = socket.id;
            const gameId = socket.gameId;
            const game = yield db_model_1.gameModel.findById(gameId);
            if (!game)
                return;
            let player;
            // remove this player from the game
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].socketId == socketId) {
                    player = game.players[i];
                    if (game.gameStart) {
                        if (game.players[i].index == game.currentPlayerTurn) {
                            yield gameController.calculateNextTurn(game);
                        }
                    }
                    game.players.splice(i, 1);
                    game.numberOfPlayers = game.players.length;
                    if (game.numberOfPlayers == 0) {
                        // delete game from db
                        yield db_model_1.gameModel.findByIdAndDelete(gameId);
                        return;
                    }
                    break;
                }
            }
            yield game.save();
            io.sockets.emit("playerDiconnnected", {
                gameId: gameId,
                playerName: player.name
            });
            let players = [];
            for (let player of game.players) {
                players.push({
                    name: player.name,
                    index: player.index,
                    number: player.cards.length
                });
            }
            if (game.gameStart) {
                for (let player of game.players) {
                    io.to(player.socketId).emit("gameUpdated", {
                        gameId: gameId,
                        players: players,
                        currentCard: game.currentCard,
                        currentPlayerTurn: game.currentPlayerTurn,
                        currenColor: game.currentColor
                    });
                }
            }
            else {
                for (let player of game.players) {
                    io.to(player.socketId).emit("queueChanged", {
                        gameId: game._id,
                        players: players
                    });
                }
            }
        }
        catch (err) {
            console.log(err);
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
});
server.listen(process.env.PORT || PORT, () => { console.log(`listening on port ${process.env.PORT || PORT}`); });
