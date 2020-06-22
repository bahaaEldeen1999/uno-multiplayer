import express from 'express';
import cors from 'cors';
import socketio from 'socket.io';
import http from 'http';
import Game from './source/game';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {  gameModel , playerModel, cardModel } from './model/db-model';

dotenv.config();

// create the game
let gameController: Game = new Game();

const app = express();
const PORT = 3000;
const server = http.createServer(app);
mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("connected to db "+process.env.CONNECTION_STRING)
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
    try {
      if(!data.name || data.number === undefined || !data.playerId)throw new Error("not enough data");
      
      let newGame = new gameModel({
        players : [{
          name: data.name,
          index: data.number,
          playerId:data.playerId
        }],
        currentPlayerTurn: 0,
        gameStart: false,
        isReversed:false
      });
      await newGame.save();
      // send back id to host
      io.sockets.emit("createdGameId", {
        gameId: newGame._id,
        playerId:data.playerId
      });
    } catch (err) {
      socket.emit("errorInRequest",{msg:err.message});
    }
    
  })

  // when other user want to join game
  socket.on("joinGame", async (data) => {
    try {
      let game = await gameModel.findById(data.gameId);
      if(!game) throw new Error("no game with this id");
      
      if (game.gameStart) {
        throw new Error("the game already runnning cannot join");
        
       
      }
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
      await game.save();
      io.sockets.emit("joinedGame", {
        gameId: game._id,
        playerId: data.playerId,
        index: index
      });
      io.sockets.emit("queueChanged", {
        gameId: game._id,
        players: players
      });
    }catch(err){
      socket.emit("errorInRequest",{msg:err.message});
    }
  });


  // create game instance when the host start the game
  socket.on("startGame", async (data) => {
    try {
      let game = await gameModel.findById(data.gameId);
      if(!game) throw new Error("no game with this id");
      
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
        cards: player.cards,
        gameId:data.gameId
      });
      }
      
      
    }catch(err){
      socket.emit("errorInRequest",{msg:err.message});
    }
  });

  // player play card
  socket.on("playCard", async (data) => {
    try{
    let isPlayed = await gameController.play(data.gameId, data.playerIndex, data.cardIndex, data.card,data.playerId);
    if (isPlayed == -1) {
      socket.emit("wrongTurn", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId:data.playerId
      });
      return;
    }else if (isPlayed == 0) {
      socket.emit("wrongMove", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId:data.playerId
      });
      return;
    } 
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
      let uno = false;
      if (game.players[data.playerIndex].cards.length == 1) uno = true;
    for (let player of game.players) {
      io.sockets.emit("getCards", {
        playerId: player.playerId,
        cards: player.cards,
        gameId:data.gameId
      });
      
      }
      if (uno) {
        io.sockets.emit("uno", {
          
          gameId: data.gameId
        });
      }
     if (isPlayed == 1) {
      io.sockets.emit("greatMove", { gameId:data.gameId,playerIndex:data.playerIndex,success: "valid move" });
    } else if (isPlayed == 3) {
      io.sockets.emit("chooseColor", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: game.players[data.playerIndex].playerId
      })
    } else {
      io.sockets.emit("gameEnd", { gameId:data.gameId,playerIndex:data.playerIndex,playerId:data.playerId,success: "game ended" });
    }
  }catch(err){
    socket.emit("errorInRequest",{msg:err.message});
  }
  });

  socket.on("colorIsChosen", async (data) => {
    try {
      if(!data.gameId || !data.color || data.playerIndex === undefined  || !data.playerId)throw new Error("data is not enough");
      
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
  }catch(err){
    socket.emit("errorInRequest",{msg:err.message});
  }
    
    
  });

  socket.on("drawCard", async (data) => {
    try {
      
      if(!data.gameId ||  data.playerIndex === undefined || !data.playerId)throw new Error("data is not enough");
    let x = await gameController.drawCard(data.gameId, data.playerIndex,data.playerId);
    if (!x) {
      socket.emit("cannotDraw", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId:data.playerId,
      })
      return;
    } 
    let game = await gameModel.findById(data.gameId);
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
      currenColor: game.currentColor,
      cardDrawn:true
    });
    // update each on cards
    
    for (let player of game.players) {
      io.sockets.emit("getCards", {
        playerId: player.playerId,
        cards: player.cards,
        gameId:data.gameId
      });
   
      }
  }catch(err){
    socket.emit("errorInRequest",{msg:err.message});
  }
  });

  socket.on("endTurn", async (data) => {
    try {
      let game = await gameModel.findById(data.gameId);
      if(!game) throw new Error("no game with this id");
      
      if (game.currentPlayerTurn == data.playerIndex && game.players[game.currentPlayerTurn].playerId == data.playerId && game.players[game.currentPlayerTurn].canEnd) {
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
        // update each on cards
  
    for (let player of game.players) {
      io.sockets.emit("getCards", {
        playerId: player.playerId,
        cards: player.cards,
        gameId:data.gameId
      });
   
      }

   
      } else if (!game.players[game.currentPlayerTurn].canEnd) {
        socket.emit("errorInRequest", { msg: "cannot end turn draw card or play card" });
      }
    } catch (err) {
      socket.emit("errorInRequest", { msg: err });
    }
  });


})





server.listen(process.env.PORT|| PORT,()=>{console.log(`listening on port ${process.env.PORT|| PORT}`)})