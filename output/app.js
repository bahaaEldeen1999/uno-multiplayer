generatePlayerId();
document.querySelector(".open-players").style.display = "none";

document.querySelector("#HostGameBtn").addEventListener("click", () => {
  onHostBtnPressed();
});

document.querySelector("#joinGameBtn").addEventListener("click", () => {
  onJoinBtnPressed();
});
addEventListener("DOMContentLoaded", () => {
  socket.on("connect", async () => {
    console.log("connected client");
    // chooseInputMethod();
    // chooseName();

    // chooseHostOrJoin();

    // onGameCreated();

    // onGameUpdated();

    // onGetCards();

    // onChooseColor();
    // onWrongMove();
    // onWrongTurn();
    // onCannotDraw();
    // onErrorInRequest();
    // onGameEnd();
    // onUno();
    // onPlayerDisconnect();
    // onDrawTwo();
    // onDrawFour();
    // onSkipTurn();
    // onReverseTurn();
    // onMessageRecieved();
    // onChangeIndex();
    // onKickedPlayer();
  });
});
