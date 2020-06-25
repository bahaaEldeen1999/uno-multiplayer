import express from 'express';
import cors from 'cors';
import socketio from 'socket.io';
import http from 'http';
import Game from './source/game';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {  gameModel  } from './model/db-model';
import Player from './source/player';
import { createCallChain } from 'typescript';

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
  

  socket.on("createGame", async (data) => {
    try {
      if(!data.name || data.number === undefined || !data.playerId)throw new Error("not enough data");
      
      let newGame = new gameModel({
        players : [{
          name: data.name,
          index: data.number,
          playerId: data.playerId,
          socketId: socket.id,
          drawCard: 0,
          score:0
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
      // set gameid property on the socket object
      socket.gameId = newGame._id;
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
        playerId: data.playerId,
        socketId: socket.id,
        drawCard: 0,
        score:0
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
      await game.save();
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
        number: player.cards.length,
        score:player.score
      })
      }
    for (let player of game.players) { 
      io.to(player.socketId).emit("gameCreated", {
        gameId: data.gameId,
        players: players,
        currentCard: game.currentCard,
        currentPlayerTurn: game.currentPlayerTurn,
        currenColor:game.currentColor
      });
    }
    
    for (let player of game.players) {
      io.to(player.socketId).emit("getCards", {
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
        number:player.cards.length,
        score:player.score
      })
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
      if (game.players[data.playerIndex].cards.length == 1) uno = true;
    for (let player of game.players) {
      io.to(player.socketId).emit("getCards", {
        playerId: player.playerId,
        cards: player.cards,
        gameId:data.gameId
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
    } else if (isPlayed == 3) {
       io.sockets.emit("chooseColor", {
         gameId: data.gameId,
         playerIndex: data.playerIndex,
         playerId: game.players[data.playerIndex].playerId
       });
     } else if (isPlayed == 4) {
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
     } else if (isPlayed == 5) {
      io.sockets.emit("skipTurn", {
        gameId: data.gameId
      });
     } else if (isPlayed == 6) {
      io.sockets.emit("reverseTurn", {
        gameId: data.gameId
      });
     }else if (isPlayed == 7) {
      io.sockets.emit("gameEnd", { gameId:data.gameId,playerIndex:data.playerIndex,playerId:data.playerId,success: "game ended" });
    }
    } catch (err) {
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
        number: player.cards.length,
        score:player.score
      })
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
        playerId: data.playerId,
      });
      return;
    } 
    let game = await gameModel.findById(data.gameId);
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score:player.score
      })
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
        gameId:data.gameId
      });
   
      
    } catch (err) {
      console.log(err);
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
            number: player.cards.length,
            score:player.score
          })
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


  socket.on('disconnect', async () => {
    try{
    const socketId = socket.id;
    const gameId = socket.gameId;
    const game = await gameModel.findById(gameId);
    if (!game) return;
      let player: any;
    // remove this player from the game
    for (let i = 0; i < game.players.length; i++){
      if (game.players[i].socketId == socketId) {
        player = game.players[i];
        
        if (game.players[i].index == game.currentPlayerTurn) {
          if (game.gameStart) {
            await gameController.calculateNextTurn(game);
            
          } 
        } 
        game.players.splice(i, 1);
        game.numberOfPlayers = game.players.length;
        if (game.numberOfPlayers == 0) {
          // delete game from db
          await gameModel.findByIdAndDelete(gameId);
          return;
        } else if (game.numberOfPlayers == 1) {
          io.sockets.emit("gameEnd", { gameId:gameId,playerIndex:game.players[0].number,playerId:game.players[0].playerId,success: "game ended" });
        }
        break;
      }
      }
      
    
      if (game.numberOfPlayers > 0) {
        // update current players index
        for (let i = 0; i < game.players.length;i++) {
          game.players[i].index = i;
          io.to(game.players[i].socketId).emit("changeIndex", {
            gameId: gameId,
            playerId: game.players[i].playerId,
            newIndex:i
          });
        }
        await game.save();
        io.sockets.emit("playerDiconnnected", {
          gameId: gameId,
          playerName: player.name
        });
        let players = [];
            for (let player of game.players) {
              players.push({
                name: player.name,
                index: player.index,
                number: player.cards.length,
                score:player.score
              })
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
            
          } else {
            for (let player of game.players) {
              io.to(player.socketId).emit("queueChanged", {
                gameId: game._id,
                players: players
              });
            }
          }
    }  
    
        
    } catch (err) {
      console.log(err);
        socket.emit("errorInRequest",{msg:err.message});
      }
      
    
  });

  socket.on("chatMessage", async (data) => {
    try {
      let gameId = data.gameId;
      let name = data.playerName;
      if (!gameId || !name) throw new Error("not enough data");
      const game = await gameModel.findById(gameId);
      if(!game) throw new Error("no game with this id");
      game.chat.push({
        playerName: name,
        message: data.message
      });
      await game.save();
      // emit the message to all players in the room 
      for (let player of game.players) {
        io.to(player.socketId).emit("messageRecieve", {
          gameId: game._id,
          playerName: name,
          message: data.message,
          playerId: data.playerId
        });
      }
      
    } catch (err) {
      console.log(err);
        socket.emit("errorInRequest",{msg:err.message});
      }
  })

})





server.listen(process.env.PORT || PORT, () => { console.log(`listening on port ${process.env.PORT || PORT}`) });