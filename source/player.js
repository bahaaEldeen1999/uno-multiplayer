"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(name, index) {
        this.cards = [];
        this.name = name;
        this.index = index;
    }
    addCard(card) {
        this.cards.push(card);
    }
    removeCard(index) {
        this.cards.splice(index, 1);
    }
}
exports.default = Player;
