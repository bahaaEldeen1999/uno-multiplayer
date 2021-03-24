const gameController = require("../controller/game-controller");
module.exports = async function (socket, io) {
  socket.on("createGame", async (data) => {
    await gameController.createGame(data, socket, io);
  });

  // when other user want to join game
  socket.on("joinGame", async (data) => {
    await gameController.joinGame(data, socket, io);
  });

  // create game instance when the host start the game
  socket.on("startGame", async (data) => {
    await gameController.startGame(data, socket, io);
  });

  // player play card
  socket.on("playCard", async (data) => {
    await gameController.playCard(data, socket, io);
  });

  socket.on("colorIsChosen", async (data) => {
    await gameController.colorIsChosen(data, socket, io);
  });

  socket.on("drawCard", async (data) => {
    await gameController.drawCard(data, socket, io);
  });

  socket.on("endTurn", async (data) => {
    await gameController.endTurn(data, socket, io);
  });

  socket.on("disconnect", async () => {
    await gameController.disconnect(null, socket, io);
  });

  socket.on("chatMessage", async (data) => {
    await gameController.chatMesssage(data, socket, io);
  });

  socket.on("rematch", async (data) => {
    await gameController.rematch(data, socket, io);
  });

  socket.on("kickPlayer", async (data) => {
    await gameController.kickPlayer(data, socket, io);
  });
};
