import Game from './source/game';
let numberOfPlayers: number = 4;
let names: Array<string> = [];
for (let i = 0; i < numberOfPlayers; i++) names.push(`player ${i}`);

// create the game
let game: Game = new Game(numberOfPlayers, names);

// create the players visuals
let playersList = document.querySelector(".players");
for (let i = 1; i < numberOfPlayers; i++){
  let playerItem = document.createElement('li');
  playerItem.classList.add('collection-item');
  playerItem.innerText = names[i];
  let numberOfCards = document.createElement('span');
  numberOfCards.innerText = "7";
  playerItem.appendChild(numberOfCards);
  playersList.appendChild(playerItem);
}
console.log("l")