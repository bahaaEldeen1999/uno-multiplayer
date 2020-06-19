class Card extends React.Component{
    color;
    value;
    isSpecial;
    filename;
    index;
    constructor(props){
        super(props)
        this.color = props.color;
        this.value = props.value;
        this.isSpecial = props.isSpecial;
        this.index = props.index;
        if(this.isSpecial && this.color != "black"){
            if(this.value == 2) this.filename = `${9+3}_${this.color}.png`;
            else if(this.value == 3) this.filename = `${9+2}_${this.color}.png`;
            else this.filename = `${9+this.value}_${this.color}.png`;
            
        }else if(this.isSpecial){
            this.filename = `${this.value}_${this.color}.png`;
        }else{
            this.filename = `${this.value}_${this.color}.png`;
        }
    }
    render(){
        return (
            
           
                <img color={this.color} value={this.value} isSpecial={this.isSpecial?1:0} index={this.index} className="card-deck" src={'deck-images/'+this.filename}/>
            
        )
    }
}

//ReactDOM.render(<Card prop={{value:2,color:"black",isSpecial:true}} />,document.getElementById("root"))
