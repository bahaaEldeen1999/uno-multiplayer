class Board extends React.Component{
    constructor(props){
        super(props);
        this.state = { card: props.currentCard};       
        this.changeCard.bind(this);
    }
    changeCard(card){
        
        this.setState({card:card});
    }
    render(){
        return (
            
            <div className={`board-card ${this.props.animated?this.props.animated:""}`}  >
                 <Card  value={this.state.card.value} color={this.state.card.color} isSpecial={this.state.card.isSpecial} />
            </div>
        )
    }
}
//ReactDOM.render(<Board currentCard={{value:2,color:"black",isSpecial:true}} />,document.querySelector(".board"))