const gameController = require("../controller/game-controller");
module.exports = async function (socket, io) {
  socket.on("createGame", async (data) => {
    console.log("create game", data);
    gameController.createGame(data, socket, io);
  });

  // when other user want to join game
  socket.on("joinGame", async (data) => {
    console.log("join game", data);
    gameController.joinGame(data, socket, io);
  });

  // create game instance when the host start the game
  socket.on("startGame", async (data) => {
    gameController.startGame(data, socket, io);
  });

  // player play card
  socket.on("playCard", async (data) => {
    gameController.playCard(data, socket, io);
  });

  socket.on("colorIsChosen", async (data) => {
    gameController.colorIsChosen(data, socket, io);
  });

  socket.on("drawCard", async (data) => {
    gameController.drawCard(data, socket, io);
  });

  socket.on("endTurn", async (data) => {
    gameController.endTurn(data, socket, io);
  });

  socket.on("disconnect", async () => {
    gameController.disconnect(null, socket, io);
  });

  socket.on("chatMessage", async (data) => {
    gameController.chatMesssage(data, socket, io);
  });

  socket.on("rematch", async (data) => {
    gameController.rematch(data, socket, io);
  });

  socket.on("kickPlayer", async (data) => {
    gameController.kickPlayer(data, socket, io);
  });

  setInterval(() => {
    // // emit to all people in server that a new public game may be available
    const games = gameController.getPublicGames();
    io.emit("publicRoomsChanged", { games: games });
  }, 4000);
};
