"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 0 => invaild move
 * 1 => normal value on value move
 * 2 => +2
 * 3 => skip
 * 4 => reverse
 * 5 => wild mystery color
 * 6 => +4
 */
class Rules {
    constructor(card1, card2, currentColor) {
        this.card1 = card1;
        this.card2 = card2;
        this.currentColor = currentColor;
    }
    getRule() {
        if (this.card1.isSpecial == false && this.card2.isSpecial == false) {
            if (this.card1.color != this.card2.color && this.card1.value != this.card2.value)
                return 0;
            else
                return 1;
        }
        else if (this.card1.isSpecial == true && this.card2.isSpecial == false) {
            if (this.currentColor != this.card2.color)
                return 0;
            else
                return 1;
        }
        else if (this.card1.isSpecial == false && this.card2.isSpecial == true) {
            if (this.card2.color == "black") {
                if (this.card2.value == 1)
                    return 6;
                else
                    return 5;
            }
            else {
                if (this.card1.color != this.card2.color)
                    return 0;
                else {
                    if (this.card2.value == 1)
                        return 3;
                    else if (this.card2.value == 2)
                        return 2;
                    else
                        return 4;
                }
            }
        }
        else {
            if (this.card2.color != "black" && this.currentColor != this.card2.color && this.card1.value != this.card2.value)
                return 0;
            if (this.card2.color == "black") {
                if (this.card2.value == 1)
                    return 6;
                else
                    return 5;
            }
            else {
                if (this.card2.color == this.currentColor || (this.card1.value == this.card2.value && this.card1.color != "black")) {
                    if (this.card2.value == 1)
                        return 3;
                    else if (this.card2.value == 2)
                        return 2;
                    else
                        return 4;
                }
                else {
                    return 0;
                }
            }
        }
    }
}
exports.default = Rules;
