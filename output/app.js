generatePlayerId();
document.querySelector(".open-players").style.display = "none";
addEventListener("DOMContentLoaded", () => {
  socket.on("connect", async () => {
    console.log("connected client");
    chooseInputMethod();
    chooseName();

    chooseHostOrJoin();

    onGameCreated();

    onGameUpdated();

    onGetCards();

    onChooseColor();
    onWrongMove();
    onWrongTurn();
    onCannotDraw();
    onErrorInRequest();
    onGameEnd();
    onUno();
    onPlayerDisconnect();
    onDrawTwo();
    onDrawFour();
    onSkipTurn();
    onReverseTurn();
    onMessageRecieved();
    onChangeIndex();
    onKickedPlayer();
  });
});
