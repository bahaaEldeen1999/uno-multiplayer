socket.on("createdGameId", (data) => {
  console.log("createdGameId", data);
  if (data.playerId != playerId || gameId != undefined) return;
  gameId = data.gameId;
  $("#gameIdText").text(data.gameId);
  playerIndex = 0;
});

socket.on("joinedGame", (data) => {
  console.log("joined Game", data);
  if (data.playerId != playerId) return;
  console.log("joined game with id " + data.gameId);
  showQueue = true;
  playerIndex = data.index;
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
});

socket.on("gameCreated", (data) => {
  if (gameId != data.gameId) return;
  swal.close();
  document.querySelector("#queue").innerHTML = "";
  document.querySelector("#queue").className = "";
  document.querySelector("#queue").style.display = "none";
  if (document.querySelector("#startGameBtn"))
    document.querySelector("#startGameBtn").remove();
  players = [];
  for (let player of data.players) {
    players.push({
      name: player.name,
      number: player.number,
      score: player.score,
    });
  }
  ReactDOM.unmountComponentAtNode(document.querySelector(".players ul"));
  ReactDOM.unmountComponentAtNode(document.querySelector(".board"));
  if (width <= 600) {
    let openPlayersBtn = document.querySelector(".open-players");
    openPlayersBtn.style.display = "block";
    openPlayersBtn.addEventListener("click", () => {
      let players = document.querySelector(".players ul");
      players.style.display = "block";
      setTimeout(() => {
        players.style.display = "none";
      }, 1500);
    });
  }
  window.addEventListener("resize", () => {
    width = innerWidth;
    let openPlayersBtn = document.querySelector(".open-players");
    if (width <= 600) {
      document.querySelector(".players ul").style.display = "none";
      openPlayersBtn.style.display = "block";
      openPlayersBtn.addEventListener("click", () => {
        let players = document.querySelector(".players ul");
        players.style.display = "block";
        setTimeout(() => {
          players.style.display = "none";
        }, 1500);
      });
    } else {
      openPlayersBtn.style.display = "none";
      document.querySelector(".players ul").style.display = "block";
    }
  });
  document.querySelector(".col").innerHTML = "";
  ReactDOM.render(
    React.createElement(
      Players,
      {
        players: players,
        index: playerIndex,
        currentTurn: data.currentPlayerTurn,
      },
      null
    ),
    document.querySelector(".players ul")
  );
  let kicks = document.querySelectorAll(".kick-btn");
  for (let kick of kicks) {
    kick.addEventListener("click", (e) => {
      console.log("F");
      socket.emit("kickPlayer", {
        playerId: playerId,
        gameId: gameId,
        index: Number(kick.attributes.index.value),
      });
    });
  }
  ReactDOM.render(
    React.createElement(
      Board,
      {
        currentCard: {
          value: data.currentCard.value,
          color: data.currentCard.color,
          isSpecial: data.currentCard.isSpecial,
        },
      },
      null
    ),
    document.querySelector(".board")
  );

  contentBG.style.backgroundColor = colorMap[data.currenColor];
  let drawBtn = document.createElement("button");
  drawBtn.className = "waves-effect waves-light btn";
  drawBtn.innerText = "draw card";
  let endTurnBtn = document.createElement("button");
  endTurnBtn.className = "waves-effect waves-light btn";
  endTurnBtn.innerText = "end turn";
  drawBtn.addEventListener("click", () => {
    socket.emit("drawCard", {
      gameId: gameId,
      playerId: playerId,
      playerIndex: playerIndex,
    });
  });
  endTurnBtn.addEventListener("click", () => {
    socket.emit("endTurn", {
      gameId: gameId,
      playerId: playerId,
      playerIndex: playerIndex,
    });
  });
  document.querySelector(".col").appendChild(drawBtn);
  document.querySelector(".col").appendChild(endTurnBtn);
});

socket.on("gameUpdated", (data) => {
  console.log("gameUpdated", data);
  if (gameId != data.gameId) return;
  if (playerIndex == data.currentPlayerTurn && !data.cardDrawn) {
    swal.fire({
      confirmButtonColor: "#2c3e50",
      icon: "info",
      title: "Your Turn",
      timer: 500,

      showConfirmButton: false,
    });
  }
  ReactDOM.unmountComponentAtNode(document.querySelector(".players ul"));
  ReactDOM.unmountComponentAtNode(document.querySelector(".board"));
  ReactDOM.unmountComponentAtNode(document.querySelector("#queue"));
  let animated = "";
  if (!data.cardDrawn) animated = "animate__animated animate__bounce";
  players = [];
  for (let player of data.players) {
    players.push({
      name: player.name,
      number: player.number,
      score: player.score,
    });
  }

  ReactDOM.render(
    React.createElement(
      Players,
      {
        players: players,
        index: playerIndex,
        currentTurn: data.currentPlayerTurn,
      },
      null
    ),
    document.querySelector(".players ul")
  );
  let kicks = document.querySelectorAll(".kick-btn");
  for (let kick of kicks) {
    kick.addEventListener("click", (e) => {
      console.log("F");
      socket.emit("kickPlayer", {
        playerId: playerId,
        gameId: gameId,
        index: Number(kick.attributes.index.value),
      });
    });
  }
  ReactDOM.render(
    React.createElement(
      Board,
      {
        currentCard: {
          value: data.currentCard.value,
          color: data.currentCard.color,
          isSpecial: data.currentCard.isSpecial,
        },
        animated: animated,
      },
      null
    ),
    document.querySelector(".board")
  );
  contentBG.style.backgroundColor = colorMap[data.currenColor];
});

socket.on("getCards", (data) => {
  if (playerId != data.playerId) return;
  cards = data.cards;
  //document.querySelector("#frame").innerHTML = "";
  var $owl = $(".owl-carousel");
  $owl.trigger("destroy.owl.carousel");
  ReactDOM.unmountComponentAtNode(document.querySelector("#frame"));
  ReactDOM.render(
    React.createElement(
      Deck,
      {
        cards: cards,
      },
      null
    ),
    document.querySelector("#frame")
  );
  let cardsDoc = document.querySelectorAll(".card-deck");
  cardsDoc.forEach((card) => {
    card.addEventListener(methodClick, (e) => {
      let data = {
        gameId: gameId,
        playerIndex: playerIndex,
        card: {
          isSpecial: e.target.attributes.isSpecial.value == "1" ? true : false,
          value: Number(e.target.attributes.value.value),
          color: e.target.attributes.color.value,
        },
        cardIndex: Number(e.target.attributes.index.value),
        playerId: playerId,
      };
      socket.emit("playCard", data);
    });
  });
});

socket.on("queueChanged", (data) => {
  console.log("queueChanged", data);
  if (gameId != data.gameId) return;
  players = data.players;
  let playersCollection = document.querySelector("#queue");
  playersCollection.innerHTML = "";
  let i = 0;
  for (let player of players) {
    let playerList = document.createElement("li");
    playerList.classList.add("collection-item");
    playerList.innerText = player.name;
    if (player.index == playerIndex) playerList.innerText += " (You)";
    if (host && i != 0) {
      let a = document.createElement("a");
      a.setAttribute("index", i);
      a.className = "kick-btn";
      a.innerText = "kick";
      playerList.appendChild(a);
      a.addEventListener("click", (e) => {
        console.log(e.target.attributes.index.value);
        socket.emit("kickPlayer", {
          playerId: playerId,
          gameId: gameId,
          index: Number(e.target.attributes.index.value),
        });
      });
    }
    playersCollection.appendChild(playerList);
    i++;
  }
});

socket.on("chooseColor", (data) => {
  if (data.gameId != gameId) return;
  if (playerId != data.playerId) return;
  modalChooseColor.open();
  chooseColorBtn.addEventListener("click", () => {
    let color = document.querySelector("select").value;
    socket.emit("colorIsChosen", {
      gameId: gameId,
      playerId: playerId,
      playerIndex: playerIndex,
      color: color,
    });
  });
});

socket.on("wrongMove", (data) => {
  if (data.gameId != gameId || data.playerId != playerId) return;
  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "error",
    title: "invalid move",
    timer: 500,

    showConfirmButton: false,
  });
});

socket.on("messageRecieve", (data) => {
  console.log("messageRecieve", data);
  if (data.gameId != gameId) return;
  let navChat = document.querySelector("#chatBox");
  let li = document.createElement("li");
  li.innerText = `${data.playerName}: ${data.message}`;
  navChat.appendChild(li);
  navChat.scrollTop = navChat.scrollHeight;
  if (playerId != data.playerId) {
    Swal.fire({
      position: "top-start",
      title: `${data.playerName}: ${data.message}`,
      showConfirmButton: false,
      timer: 1000,
      backdrop: false,
      customClass: {
        title: "swal-title",
        container: "swal-container-class",
      },
    });
  }
});

socket.on("wrongTurn", (data) => {
  if (data.gameId != gameId || data.playerId != playerId) return;
  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "error",
    title: "wait your turn",
    timer: 500,

    showConfirmButton: false,
  });
});

socket.on("cannotDraw", (data) => {
  if (data.gameId != gameId || data.playerId != playerId) return;
  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "error",
    title: "cannot draw more cards this turn",
    timer: 500,

    showConfirmButton: false,
  });
});

socket.on("errorInRequest", (data) => {
  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "error",
    title: data.msg,
    timer: 500,

    showConfirmButton: false,
  });
});

socket.on("gameEnd", (data) => {
  if (data.gameId != gameId) return;
  if (data.playerId == playerId) {
    swal
      .fire({
        confirmButtonColor: "#2c3e50",
        cancelButtonColor: "#2c3e50",
        icon: "success",
        title: "congtatulations!! You Won",
        showCancelButton: true,
        cancelButtonText: "reload",
        confirmButtonText: "rematch",
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
      })
      .then((e) => {
        console.log(e);
        if (e.isDismissed) {
          window.location.href = "/";
        } else {
          socket.emit("rematch", {
            gameId: gameId,
          });
        }
      });
  } else {
    swal.fire({
      confirmButtonColor: "#2c3e50",
      cancelButtonColor: "#2c3e50",
      icon: "info",
      title: "game ended only the winner can rematch",
    });
  }
});

socket.on("uno", (data) => {
  if (data.gameId != gameId) return;

  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "warning",
    title: "UNO",
    timer: 500,
    showConfirmButton: false,
  });
});

socket.on("playerDiconnnected", (data) => {
  if (data.gameId != gameId) return;

  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "warning",
    title: "player " + data.playerName + " is diconnected",
    timer: 1000,
    showConfirmButton: false,
  });
});

socket.on("drawTwo", (data) => {
  if (data.gameId != gameId) return;

  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "warning",
    title: "+2",
    timer: 500,
    showConfirmButton: false,
  });
});

socket.on("drawFour", (data) => {
  if (data.gameId != gameId) return;

  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "warning",
    title: "+4",
    timer: 500,
    showConfirmButton: false,
  });
});

socket.on("skipTurn", (data) => {
  if (data.gameId != gameId) return;

  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "warning",
    title: "SKIP",
    timer: 500,
    showConfirmButton: false,
  });
});

socket.on("reverseTurn", (data) => {
  if (data.gameId != gameId) return;

  swal.fire({
    confirmButtonColor: "#2c3e50",
    icon: "warning",
    title: "REVERSE",
    timer: 500,
    showConfirmButton: false,
  });
});

socket.on("changeIndex", (data) => {
  if (data.gameId != gameId || data.playerId != playerId) return;
  playerIndex = data.newIndex;
});

socket.on("kickedPlayer", (data) => {
  if (data.gameId != gameId) return;
  swal
    .fire({
      confirmButtonColor: "#2c3e50",

      icon: "warning",
      title: "You are kicked by the host",
      confirmButtonText: "ok",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    })
    .then((e) => {
      window.location.href = "/";
    });
});

socket.on("publicRoomsChanged", (data) => {
  const games = data.games;
  const listOfGames = document.getElementById("roomsList");
  if (!listOfGames) return;
  listOfGames.innerHTML = "";
  for (let game of games) {
    let _gameId = game.gameId;
    let name = game.name;
    const listItem = document.createElement("li");
    listItem.innerHTML = ` <a id="${_gameId}"  class="roomBtn collection-item">${name}</a>`;
    listOfGames.appendChild(listItem);
    listItem.addEventListener("click", (e) => {
      // console.log(e.target.id);
      gameId = e.target.id;
      getJoinerNameModal.open();
      // get user name
      $("#nameEnterBtn").click(() => {
        let inputText = document.querySelector("#nameInput").value;
        if (!inputText) inputText = "default-name";
        playerName = inputText;
        getJoinerNameModal.close();
        joinGame(playerName, _gameId);
        document.querySelector(".container").remove();
      });
    });
  }
});
