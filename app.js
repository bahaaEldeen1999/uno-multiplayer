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
                        drawCard: 0,
                        score: 0
                    }],
                currentPlayerTurn: 0,
                gameStart: false,
                isReversed: false
            });
            yield newGame.save();
            // send back id to host
            socket.emit("createdGameId", {
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
            if (!data.gameId || !data.playerId)
                throw new Error("not enough data");
            let game = yield db_model_1.gameModel.findById(data.gameId);
            if (!game)
                throw new Error("no game with this id");
            if (game.gameStart) {
                throw new Error("the game already runnning cannot join");
            }
            // check that didnt join before
            for (let player of game.players) {
                if (player.playerId == data.playerId)
                    return;
            }
            let index = game.players.length;
            game.players.push({
                name: data.name,
                index: index,
                playerId: data.playerId,
                socketId: socket.id,
                drawCard: 0,
                score: 0
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
            game.markModified("players");
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
            let players = [];
            for (let player of game.players)
                players.push(player);
            game = yield gameController.createGame(game._id, players);
            players = [];
            for (let player of game.players) {
                players.push({
                    name: player.name,
                    index: player.index,
                    number: player.cards.length,
                    score: player.score
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
                    number: player.cards.length,
                    score: player.score
                });
            }
            for (let player of game.players) {
                io.to(player.socketId).emit("gameUpdated", {
                    gameId: data.gameId,
                    players: players,
                    currentCard: game.currentCard,
                    currentPlayerTurn: game.currentPlayerTurn,
                    currenColor: game.currentColor,
                    cardDrawn: isPlayed == 4 || isPlayed == 3 ? true : false,
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
                    number: player.cards.length,
                    score: player.score
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
                    number: player.cards.length,
                    score: player.score
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
                        number: player.cards.length,
                        score: player.score
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
            let disconnected = 0;
            // remove this player from the game
            for (let i = 0; i < game.players.length; i++) {
                if (game.players[i].socketId == socketId) {
                    disconnected = 1;
                    player = game.players[i];
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
            if (!disconnected)
                return;
            if (game.numberOfPlayers > 0) {
                // update current players index
                for (let i = 0; i < game.players.length; i++) {
                    game.players[i].index = i;
                    io.to(game.players[i].socketId).emit("changeIndex", {
                        gameId: gameId,
                        playerId: game.players[i].playerId,
                        newIndex: i
                    });
                    io.to(game.players[i].socketId).emit("playerDiconnnected", {
                        gameId: gameId,
                        playerName: player.name
                    });
                }
                yield game.save();
                let players = [];
                for (let player of game.players) {
                    players.push({
                        name: player.name,
                        index: player.index,
                        number: player.cards.length,
                        score: player.score
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
        }
        catch (err) {
            console.log(err);
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    socket.on("chatMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let gameId = data.gameId;
            let name = data.playerName;
            if (!gameId || !name)
                throw new Error("not enough data");
            const game = yield db_model_1.gameModel.findById(gameId);
            if (!game)
                throw new Error("no game with this id");
            game.chat.push({
                playerName: name,
                message: data.message
            });
            yield game.save();
            // emit the message to all players in the room 
            for (let player of game.players) {
                io.to(player.socketId).emit("messageRecieve", {
                    gameId: game._id,
                    playerName: name,
                    message: data.message,
                    playerId: data.playerId
                });
            }
        }
        catch (err) {
            console.log(err);
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
    socket.on("rematch", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!data.gameId)
                throw new Error("not enough data");
            let game = yield db_model_1.gameModel.findById(data.gameId);
            // reset game 
            game = yield gameController.resetGame(game);
            let players = [];
            for (let player of game.players) {
                players.push({
                    name: player.name,
                    index: player.index,
                    number: player.cards.length,
                    score: player.score
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
    socket.on("kickPlayer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const gameId = data.gameId;
            const game = yield db_model_1.gameModel.findById(gameId);
            if (!game)
                throw new Error("no game with this id");
            if (game.players[0].playerId != data.playerId)
                throw new Error("not the current host");
            if (!data.index)
                throw new Error("not enough data");
            if (data.index <= 0 || data.index >= game.players.length)
                throw new Error("cannot remove player with this index");
            io.to(game.players[data.index].socketId).emit("kickedPlayer", { gameId: gameId });
            game.players.splice(data.index, 1);
            game.numberOfPlayers = game.numberOfPlayers - 1;
            game.markModified("players");
            yield game.save();
            // update current players index
            for (let i = 0; i < game.players.length; i++) {
                game.players[i].index = i;
                io.to(game.players[i].socketId).emit("changeIndex", {
                    gameId: gameId,
                    playerId: game.players[i].playerId,
                    newIndex: i
                });
            }
            let players = [];
            for (let player of game.players) {
                players.push({
                    name: player.name,
                    index: player.index,
                    number: player.cards.length,
                    score: player.score
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
            socket.emit("errorInRequest", { msg: err.message });
        }
    }));
});
server.listen(process.env.PORT || PORT, () => { console.log(`listening on port ${process.env.PORT || PORT}`); });
