class Card {

    value:number;
    color:string;
    isSpecial: boolean;
    constructor(value: number, color: string, isSpecial: boolean) {
        this.value = value;
        this.color = color;
        this.isSpecial = isSpecial;
    }
    

}

export default Card;