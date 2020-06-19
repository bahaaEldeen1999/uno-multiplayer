"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const card_1 = __importDefault(require("./card"));
class Deck {
    /**
     * 8 wild cards, 1 => +4, 2 => mystery
     * 25 cards of each 4 colors => 0-9 numbers,2 skips, 2 reverse, 2 draw 2, 3 action cards
     * 1 => skip, 2 => +2, 3 => reverse
     *
     */
    drawCard() {
        let random = Math.random();
        let value = undefined;
        let isSpecial = false;
        let color = undefined;
        if (random < 0.01) {
            random = Math.random();
            isSpecial = true;
            color = "black";
            if (random < 0.5) {
                value = 1;
            }
            else {
                value = 2;
            }
        }
        else {
            random = Math.random();
            if (random < 0.25) {
                color = "red";
                random = Math.random();
                if (random < 0.5) {
                    value = Math.floor(Math.random() * 10);
                    isSpecial = false;
                }
                else {
                    isSpecial = true;
                    value = Math.floor(Math.random() * 3) + 1;
                }
            }
            else if (random < 0.5) {
                color = "yellow";
                random = Math.random();
                if (random < 0.5) {
                    value = Math.floor(Math.random() * 10);
                    isSpecial = false;
                }
                else {
                    isSpecial = true;
                    value = Math.floor(Math.random() * 3) + 1;
                }
            }
            else if (random < 0.75) {
                color = "blue";
                random = Math.random();
                if (random < 0.5) {
                    value = Math.floor(Math.random() * 10);
                    isSpecial = false;
                }
                else {
                    isSpecial = true;
                    value = Math.floor(Math.random() * 3) + 1;
                }
            }
            else {
                color = "green";
                random = Math.random();
                if (random < 0.5) {
                    value = Math.floor(Math.random() * 10);
                    isSpecial = false;
                }
                else {
                    isSpecial = true;
                    value = Math.floor(Math.random() * 3) + 1;
                }
            }
        }
        return new card_1.default(value, color, isSpecial);
    }
    drawNonSpecialCard() {
        let random = Math.random();
        let value = undefined;
        let isSpecial = false;
        let color = undefined;
        random = Math.random();
        if (random < 0.25) {
            color = "red";
            random = Math.random();
            value = Math.floor(Math.random() * 10);
            isSpecial = false;
        }
        else if (random < 0.5) {
            color = "yellow";
            random = Math.random();
            value = Math.floor(Math.random() * 10);
            isSpecial = false;
        }
        else if (random < 0.75) {
            color = "blue";
            random = Math.random();
            value = Math.floor(Math.random() * 10);
            isSpecial = false;
        }
        else {
            color = "green";
            random = Math.random();
            value = Math.floor(Math.random() * 10);
            isSpecial = false;
        }
        return new card_1.default(value, color, isSpecial);
    }
}
exports.default = Deck;
