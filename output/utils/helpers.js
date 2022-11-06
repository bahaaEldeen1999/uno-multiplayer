function generatePlayerId() {
  for (let i = 0; i < 32; i++) {
    playerId += String(Math.floor(Math.random() * 10));
  }
}

function chooseInputMethod() {
  method.open();
  dblClickBtn.addEventListener("click", () => {
    mainThemeAudio.play();
    methodClick = "dblclick";
    method.close();
    modal1.open();
  });
  snglClickBtn.addEventListener("click", () => {
    mainThemeAudio.play();
    methodClick = "click";
    method.close();
    modal1.open();
  });
}

function chooseName() {
  $("#nameEnterBtn").click(() => {
    let inputText = document.querySelector("#nameInput").value;
    if (!inputText) inputText = "default-name";
    playerName = inputText;
    modal1.close();
    modal2.open();
  });
}

function hostGame(hostName, roomName, isPrivate) {
  host = 1;
  // create game as host
  socket.emit("createGame", {
    name: hostName,
    number: 0,
    playerId: playerId,
    roomName: roomName,
    isPrivate: isPrivate,
  });

  // socket.on("createdGameId", (data) => {
  //   console.log("createdGameId", data);
  //   if (data.playerId != playerId || gameId != undefined) return;
  //   gameId = data.gameId;
  //   $("#gameIdText").text(data.gameId);
  //   playerIndex = 0;
  // });

  let playersCollection = document.querySelector("#queue");
  if (playersCollection.innerHTML.trim() == "") {
    let playerList = document.createElement("li");
    playerList.classList.add("collection-item");
    playerList.innerText = playerName + " (You)";
    playersCollection.appendChild(playerList);
  }
  let startGameBtn = document.createElement("button");
  startGameBtn.id = "startGameBtn";
  startGameBtn.innerText = "start game";
  startGameBtn.className = "waves-effect waves-light btn";
  startGameBtn.addEventListener("click", () => {
    socket.emit("startGame", {
      gameId: gameId,
    });
  });

  let modalsOverlay = document.querySelectorAll(".modal-overlay");
  for (let modalOverlay of modalsOverlay) {
    modalOverlay.remove();
  }
  if (document.querySelector("#startGameDiv").innerHTML.trim() == "")
    document.querySelector("#startGameDiv").appendChild(startGameBtn);
  // add game id to floating point
  let showGameId = document.createElement("a");
  showGameId.className = "btn-floating btn-large waves-effect waves-light teal";
  showGameId.innerText = "gameId";
  showGameId.addEventListener("click", () => {
    swal.fire({
      confirmButtonColor: "#2c3e50",
      icon: "info",
      title: "your game id is : " + gameId,
      showConfirmButton: true,
    });
  });
  // intialize chat button
  let sideNavChat = document.createElement("ul");
  sideNavChat.className = "sidenav";
  sideNavChat.id = "chat-slide";
  let chatBox = document.createElement("div");
  chatBox.id = "chatBox";
  sideNavChat.appendChild(chatBox);
  let chatInputDiv = document.createElement("div");
  chatInputDiv.className = "input-field col s12";
  let chatInputTextarea = document.createElement("textarea");
  chatInputTextarea.className = "materialize-textarea";
  chatInputTextarea.setAttribute("placeholder", "enter your message");
  chatInputTextarea.addEventListener("keypress", function (e) {
    console.log("sending chat");
    if (e.key === "Enter") {
      e.preventDefault();
      // send the message
      let text = chatInputTextarea.value.trim();
      if (!text) return;
      chatInputTextarea.value = "";
      socket.emit("chatMessage", {
        gameId: gameId,
        playerName: playerName,
        message: text,
        playerId: playerId,
      });
    }
  });
  chatInputDiv.appendChild(chatInputTextarea);
  sideNavChat.appendChild(chatInputDiv);
  document.body.appendChild(sideNavChat);
  let sideNavchatInstance = M.Sidenav.init(
    document.querySelectorAll(".sidenav"),
    {
      inDuration: 10,
      outDuration: 10,
    }
  );
  let showChatBtn = document.createElement("a");
  showChatBtn.className = "sidenav-trigger btn";
  showChatBtn.innerText = "chat";
  showChatBtn.setAttribute("data-target", "chat-slide");
  document.body.appendChild(showChatBtn);
  document.body.appendChild(showGameId);
}

function joinGame(joinerName, gameId) {
  host = 0;
  let modalsOverlay = document.querySelectorAll(".modal-overlay");
  for (let modalOverlay of modalsOverlay) {
    modalOverlay.remove();
  }
  socket.emit("joinGame", {
    gameId: gameId,
    name: joinerName,
    playerId: playerId,
  });
}

function onHostBtnPressed() {
  let hostName = document.querySelector("#hostName").value;
  let roomName = document.querySelector("#hostRoomName").value;
  let isPrivate = document.querySelector("#isPrivateCheckbox").checked;
  console.log(
    `host name ${hostName} room name ${roomName} is private ${isPrivate}`
  );
  playerName = hostName;
  hostGame(hostName, roomName, isPrivate);

  document.querySelector(".container").remove();
}

function onJoinBtnPressed() {
  let joinName = document.querySelector("#joinName").value;
  let _gameId = document.querySelector("#joinGameId").value;

  console.log(`join name ${joinName} game id ${_gameId} `);
  playerName = joinName;
  gameId = _gameId;
  joinGame(joinName, _gameId);
  document.querySelector(".container").remove();
}
