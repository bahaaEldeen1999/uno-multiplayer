import express from 'express';
import cors from 'cors';
import socketio from 'socket.io';
import http from 'http';
import Game from './source/game';
import path from 'path';
import mongoose from 'mongoose';
import {  gameModel , playerModel, cardModel } from './model/db-model';


// create the game
let gameController: Game = new Game();

const app = express();
const PORT = 3000;
const server = http.createServer(app);
mongoose.connect("mongodb://localhost/uno", { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("connected to db")
})
app.use(cors());
app.use(express.static('output'));
app.use(express.static('styles'));
const io = socketio.listen(server);

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,"index.html"))
})
io.on("connection", (socket) => {
  console.log("connected");

  socket.on("createGame", async (data) => {
    let newGame = new gameModel({
      players : [{
        name: data.name,
        index: data.number,
        playerId:data.playerId
      }],
      currentPlayerTurn: 0,
      gameStart:false
    });
    await newGame.save();
    // send back id to host
    io.sockets.emit("createdGameId", {
      gameId: newGame._id,
      playerId:data.playerId
    });
  })

  // when other user want to join game
  socket.on("joinGame", async (data) => {
    let game = await gameModel.findById(data.gameId);
    if (game.gameStart) return;
    let index = game.players.length;
    game.players.push({
      name: data.name,
      index: index,
      playerId:data.playerId
    })
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index:player.index
      })
    }
    await game.save();
    io.sockets.emit("joinedGame", {
      gameId: game._id,
      playerId: data.playerId,
      index:index
    });
    io.sockets.emit("queueChanged", {
      gameId: game._id,
      players:players
    });
  });


  // create game instance when the host start the game
  socket.on("startGame", async (data) => {
    let game = await gameModel.findById(data.gameId);
    game.gameStart = true;
    game.numberOfPlayers = game.players.length;
    game.isReversed = false;
    await game.save();
    let players = [];
    for (let player of game.players) players.push(player);
    game = await gameController.createGame(game._id, players);
    players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number:player.cards.length
      })
    }
    io.sockets.emit("gameCreated", {
      gameId: data.gameId,
      players: players,
      currentCard: game.currentCard,
      currentPlayerTurn: game.currentPlayerTurn,
      currenColor:game.currentColor
    });
    for (let player of game.players) {
      io.sockets.emit("getCards", {
        playerId: player.playerId,
        cards: player.cards
      });
    }
  });

  // player play card
  socket.on("playCard", async (data) => {
    let isPlayed = await gameController.play(data.gameId, data.playerIndex, data.cardIndex, data.card);
    console.log(isPlayed)
    let game = await gameModel.findById(data.gameId);
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number:player.cards.length
      })
    }
    io.sockets.emit("gameUpdated", {
      gameId: data.gameId,
      players: players,
      currentCard: game.currentCard,
      currentPlayerTurn: game.currentPlayerTurn,
      currenColor:game.currentColor
    });
    // update each on cards
    for (let player of game.players) {
      io.sockets.emit("getCards", {
        playerId: player.playerId,
        cards: player.cards
      });
    }
    if (isPlayed == 0) {
      io.sockets.emit("wrongMove", { gameId:data.gameId,playerIndex:data.playerIndex,error: "invalid move" });
    } else if (isPlayed == 1) {
      io.sockets.emit("greatMove", { gameId:data.gameId,playerIndex:data.playerIndex,success: "valid move" });
    } else if (isPlayed == 3) {
      io.sockets.emit("chooseColor", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: game.players[data.playerIndex].playerId
      })
    } else {
      io.sockets.emit("gameEnd", { gameId:data.gameId,playerIndex:data.playerIndex,success: "game ended" });
    }
  });

  socket.on("colorIsChosen", async (data) => {
    await gameController.changCurrentColor(data.gameId, data.color, data.playerIndex, data.playerId);
    let game = await gameModel.findById(data.gameId)
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length
      })
    }
    io.sockets.emit("gameUpdated", {
      gameId: data.gameId,
      players: players,
      currentCard: game.currentCard,
      currentPlayerTurn: game.currentPlayerTurn,
      currenColor: game.currentColor
    });
    
    
    
  });

  socket.on("drawCard", async (data) => {
    await gameController.drawCard(data.gameId, data.playerIndex);
    let game = await gameModel.findById(data.gameId)
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length
      })
    }
    io.sockets.emit("gameUpdated", {
      gameId: data.gameId,
      players: players,
      currentCard: game.currentCard,
      currentPlayerTurn: game.currentPlayerTurn,
      currenColor: game.currentColor
    });

  });

  socket.on("endTurn", async (data) => {
    
    let game = await gameModel.findById(data.gameId);
    if (game.currentPlayerTurn == data.playerIndex && game.players[game.currentPlayerTurn].playerId == data.playerId) {
      await gameController.calculateNextTurn(game);
      await game.save();
      let players = [];
      for (let player of game.players) {
        players.push({
          name: player.name,
          index: player.index,
          number: player.cards.length
        })
      }
      io.sockets.emit("gameUpdated", {
        gameId: data.gameId,
        players: players,
        currentCard: game.currentCard,
        currentPlayerTurn: game.currentPlayerTurn,
        currenColor: game.currentColor
      });

   
    }
  })


})





server.listen(PORT,()=>{console.log(`listening on port ${PORT}`)})