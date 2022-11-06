let width = innerWidth;
let height = innerHeight;
let gameId = undefined;
let players = [];
let cards = [];
let playerName = undefined;
let playerIndex = undefined;
let host = undefined;
let playerId = "";
let showQueue = false;
let rematch = false;
let mainThemeAudio = new Audio("audio/theme.mp3");
mainThemeAudio.loop = true;
mainThemeAudio.volume = 0.2;
let contentBG = document.querySelector("body");
let colorMap = {
  red: "#ff5555",
  yellow: "#ffaa00",
  green: "#55aa55",
  blue: "#5555fd",
};
let methodClick = "click";
let modalOptions = {
  inDuration: 10,
  outDuration: 10,
  dismissible: false,
  onCloseEnd: function (e) {
    //console.log(e);
    if (e.id != "modal5" && e.id != "modal4") e.remove();
  },
};
$("#getJoinerNameModal").modal(modalOptions);
//$("#modal2").modal(modalOptions);
//$(".host-modal").modal(modalOptions);
//$(".join-modal").modal(modalOptions);
$("#colorModal").modal(modalOptions);
$("#method").modal(modalOptions);
let getJoinerNameModal = M.Modal.getInstance($("#getJoinerNameModal"));
//let modal2 = M.Modal.getInstance($("#modal2"));
let method = M.Modal.getInstance($("#method"));
//let modalHost = M.Modal.getInstance($(".host-modal"));
//let modalJoin = M.Modal.getInstance($(".join-modal"));
let modalChooseColor = M.Modal.getInstance($("#colorModal"));
let chooseColorBtn = document.querySelector("#choosColorBtn");
let dblClickBtn = document.querySelector("#dblClickBtn");
let snglClickBtn = document.querySelector("#snglClickBtn");
