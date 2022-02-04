class GamesHolder {
  games = {};

  addGame(game) {
    this.games[game.id] = game;
  }

  getGame(gameId) {
    const game = this.games[gameId];
    if (game) return game;
    return null;
  }

  removeGame(gameId) {
    this.games[gameId] = null;
  }
}

module.exports = GamesHolder;
