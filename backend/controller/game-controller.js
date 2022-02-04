const Game = require("../source/game");
const GameHolder = require("../source/games-holder");
const Player = require("../source/player");
const gamesHolder = new GameHolder();

function createGame(data, socket, io) {
  try {
    if (!data.name || data.number === undefined || !data.playerId)
      throw new Error("not enough data");
    const newGame = new Game();
    const player = new Player(data.playerId, data.name, socket.id);
    newGame.addPlayer(player);

    // add game to game holder
    gamesHolder.addGame(newGame);

    // send back id to host
    // need to be changed to send to only player??
    socket.emit("createdGameId", {
      gameId: newGame.id,
      playerId: data.playerId,
    });

    // set gameid property on the socket object
    socket.gameId = newGame.id;
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function joinGame(data, socket, io) {
  try {
    if (!data.gameId || !data.playerId) throw new Error("not enough data");
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");

    if (game.gameStart) {
      throw new Error("the game already runnning cannot join");
    }

    // check that didnt join before
    for (let player of game.players) {
      if (player.playerId == data.playerId) return;
    }

    const player = new Player(data.playerId, data.name, socket.id);
    const index = game.addPlayer(player);

    // set gameid property on the socket object
    socket.gameId = game.id;
    const players = [];
    for (const player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
      });
    }

    socket.emit("joinedGame", {
      gameId: game.id,
      playerId: data.playerId,
      index: index,
    });

    // can be changed by cluster users in group??
    for (const player of game.players) {
      io.to(player.socketId).emit("queueChanged", {
        gameId: game.id,
        players: players,
      });
    }

    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err, data);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function startGame(data, socket, io) {
  try {
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");

    const players = [];
    game.createGame();
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score: player.score,
      });
    }

    // can be changed to send to the group??
    for (let player of game.players) {
      io.to(player.socketId).emit("gameCreated", {
        gameId: data.gameId,
        players: players,
        currentCard: game.currentCard,
        currentPlayerTurn: game.currentPlayerTurn,
        currenColor: game.currentColor,
      });
    }

    for (let player of game.players) {
      io.to(player.socketId).emit("getCards", {
        playerId: player.playerId,
        cards: player.cards,
        gameId: data.gameId,
      });
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function playCard(data, socket, io) {
  try {
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");
    const isPlayed = game.play(
      data.playerIndex,
      data.cardIndex,
      data.card,
      data.playerId
    );
    if (isPlayed == -1) {
      socket.emit("wrongTurn", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: data.playerId,
      });
      return;
    } else if (isPlayed == 0) {
      socket.emit("wrongMove", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: data.playerId,
      });
      return;
    }
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score: player.score,
      });
    }
    // change method of sending
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
        gameId: data.gameId,
      });
    }
    if (uno) {
      for (let player of game.players) {
        io.to(player.socketId).emit("uno", {
          gameId: data.gameId,
        });
      }
    }
    if (isPlayed == 2) {
      io.to(game.players[game.currentPlayerTurn].socketId).emit("drawTwo", {
        gameId: data.gameId,
      });
    } else if (isPlayed == 3) {
      io.sockets.emit("chooseColor", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: game.players[data.playerIndex].playerId,
      });
    } else if (isPlayed == 4) {
      io.sockets.emit("chooseColor", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: game.players[data.playerIndex].playerId,
      });
      gameController.calculateNextTurn(game);
      io.to(game.players[game.currentPlayerTurn].socketId).emit("drawFour", {
        gameId: data.gameId,
      });
      game.isReversed = !game.isReversed;
      gameController.calculateNextTurn(game);
      game.isReversed = !game.isReversed;
    } else if (isPlayed == 5) {
      io.sockets.emit("skipTurn", {
        gameId: data.gameId,
      });
    } else if (isPlayed == 6) {
      io.sockets.emit("reverseTurn", {
        gameId: data.gameId,
      });
    } else if (isPlayed == 7) {
      io.sockets.emit("gameEnd", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: data.playerId,
        success: "game ended",
      });
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function colorIsChosen(data, socket, io) {
  try {
    if (
      !data.gameId ||
      !data.color ||
      data.playerIndex === undefined ||
      !data.playerId
    )
      throw new Error("data is not enough");
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");

    game.changCurrentColor(data.color, data.playerIndex, data.playerId);
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score: player.score,
      });
    }
    // change
    for (let player of game.players) {
      io.to(player.socketId).emit("gameUpdated", {
        gameId: data.gameId,
        players: players,
        currentCard: game.currentCard,
        currentPlayerTurn: game.currentPlayerTurn,
        currenColor: game.currentColor,
        cardDrawn: true,
      });
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function drawCard(data, socket, io) {
  try {
    if (!data.gameId || data.playerIndex === undefined || !data.playerId)
      throw new Error("data is not enough");
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");
    const x = game.drawCard(data.playerIndex, data.playerId);
    if (x < 0) {
      socket.emit("cannotDraw", {
        gameId: data.gameId,
        playerIndex: data.playerIndex,
        playerId: data.playerId,
      });
      return;
    }
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score: player.score,
      });
    }
    // change
    for (let player of game.players) {
      io.to(player.socketId).emit("gameUpdated", {
        gameId: data.gameId,
        players: players,
        currentCard: game.currentCard,
        currentPlayerTurn: game.currentPlayerTurn,
        currenColor: game.currentColor,
        cardDrawn: true,
      });
    }

    // update each on cards
    // change
    socket.emit("getCards", {
      playerId: data.playerId,
      cards: game.players[data.playerIndex].cards,
      gameId: data.gameId,
    });
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function endTurn(data, socket, io) {
  try {
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");

    if (
      game.currentPlayerTurn == data.playerIndex &&
      game.players[game.currentPlayerTurn].playerId == data.playerId &&
      game.players[game.currentPlayerTurn].canEnd
    ) {
      game.calculateNextTurn();
      let players = [];
      for (let player of game.players) {
        players.push({
          name: player.name,
          index: player.index,
          number: player.cards.length,
          score: player.score,
        });
      }
      // change
      for (let player of game.players) {
        io.to(player.socketId).emit("gameUpdated", {
          gameId: data.gameId,
          players: players,
          currentCard: game.currentCard,
          currentPlayerTurn: game.currentPlayerTurn,
          currenColor: game.currentColor,
        });
      }

      // update each on cards

      for (let player of game.players) {
        io.to(player.socketId).emit("getCards", {
          playerId: player.playerId,
          cards: player.cards,
          gameId: data.gameId,
        });
      }
    } else if (!game.players[game.currentPlayerTurn].canEnd) {
      socket.emit("errorInRequest", {
        msg: "cannot end turn draw card or play card",
      });
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err });
  }
}

function disconnect(data, socket, io) {
  try {
    const socketId = socket.id;
    const gameId = socket.gameId;
    const game = gamesHolder.getGame(gameId);
    if (!game) throw new Error("no game with this id");
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
          // delete game
          gamesHolder.removeGame(gameId);
          return;
        }
        break;
      }
    }
    if (!disconnected) return;

    if (game.numberOfPlayers > 0) {
      // update current players index
      for (let i = 0; i < game.players.length; i++) {
        game.players[i].index = i;
        io.to(game.players[i].socketId).emit("changeIndex", {
          gameId: gameId,
          playerId: game.players[i].playerId,
          newIndex: i,
        });
        io.to(game.players[i].socketId).emit("playerDiconnnected", {
          gameId: gameId,
          playerName: player.name,
        });
      }

      let players = [];
      for (let player of game.players) {
        players.push({
          name: player.name,
          index: player.index,
          number: player.cards.length,
          score: player.score,
        });
      }
      if (game.gameStart) {
        for (let player of game.players) {
          io.to(player.socketId).emit("gameUpdated", {
            gameId: gameId,
            players: players,
            currentCard: game.currentCard,
            currentPlayerTurn: game.currentPlayerTurn,
            currenColor: game.currentColor,
          });
        }
      } else {
        for (let player of game.players) {
          io.to(player.socketId).emit("queueChanged", {
            gameId: game.id,
            players: players,
          });
        }
      }
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function chatMesssage(data, socket, io) {
  try {
    let gameId = data.gameId;
    let name = data.playerName;
    if (!gameId || !name) throw new Error("not enough data");
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id");
    game.chat.push({
      playerName: name,
      message: data.message,
    });
    // emit the message to all players in the room
    for (let player of game.players) {
      io.to(player.socketId).emit("messageRecieve", {
        gameId: game.id,
        playerName: name,
        message: data.message,
        playerId: data.playerId,
      });
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    console.log(err);
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function rematch(data, socket, io) {
  try {
    if (!data.gameId) throw new Error("not enough data");
    const game = gamesHolder.getGame(data.gameId);
    if (!game) throw new Error("no game with this id"); // reset game
    game.resetGame();
    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score: player.score,
      });
    }
    for (let player of game.players) {
      io.to(player.socketId).emit("gameCreated", {
        gameId: data.gameId,
        players: players,
        currentCard: game.currentCard,
        currentPlayerTurn: game.currentPlayerTurn,
        currenColor: game.currentColor,
      });
    }

    for (let player of game.players) {
      io.to(player.socketId).emit("getCards", {
        playerId: player.playerId,
        cards: player.cards,
        gameId: data.gameId,
      });
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    socket.emit("errorInRequest", { msg: err.message });
  }
}

function kickPlayer(data, socket, io) {
  try {
    const gameId = data.gameId;
    const game = gamesHolder.getGame(gameId);
    if (!game) throw new Error("no game with this id");
    if (game.players[0].playerId != data.playerId)
      throw new Error("not the current host");
    if (!data.index) throw new Error("not enough data");
    if (data.index <= 0 || data.index >= game.players.length)
      throw new Error("cannot remove player with this index");
    io.to(game.players[data.index].socketId).emit("kickedPlayer", {
      gameId: gameId,
    });
    game.players.splice(data.index, 1);
    game.numberOfPlayers = game.numberOfPlayers - 1;
    // update current players index
    for (let i = 0; i < game.players.length; i++) {
      game.players[i].index = i;
      io.to(game.players[i].socketId).emit("changeIndex", {
        gameId: gameId,
        playerId: game.players[i].playerId,
        newIndex: i,
      });
    }

    let players = [];
    for (let player of game.players) {
      players.push({
        name: player.name,
        index: player.index,
        number: player.cards.length,
        score: player.score,
      });
    }
    if (game.gameStart) {
      for (let player of game.players) {
        io.to(player.socketId).emit("gameUpdated", {
          gameId: gameId,
          players: players,
          currentCard: game.currentCard,
          currentPlayerTurn: game.currentPlayerTurn,
          currenColor: game.currentColor,
        });
      }
    } else {
      for (let player of game.players) {
        io.to(player.socketId).emit("queueChanged", {
          gameId: game.id,
          players: players,
        });
      }
    }
    // update game to game holder
    // not sure if necessary as JS should get object by reference not value
    gamesHolder.addGame(game);
  } catch (err) {
    socket.emit("errorInRequest", { msg: err.message });
  }
}
module.exports = {
  createGame,
  joinGame,
  startGame,
  playCard,
  colorIsChosen,
  drawCard,
  endTurn,
  disconnect,
  chatMesssage,
  rematch,
  kickPlayer,
};
