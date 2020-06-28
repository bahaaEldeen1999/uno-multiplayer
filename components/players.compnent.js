class Players extends React.Component{
    index;
    currentTurn;
    constructor(props){
        super(props);
        this.state = {};
        this.state.players = props.players;
        this.index = props.index;
        this.currentTurn = props.currentTurn;
        this.chaneNumber.bind(this);
        // get global reference to this component
        window.playersComponent = this;
    }
    chaneNumber(index,number){
        let players = this.state.players;
        players[index].number += number;
        this.setState({players});
    }
    render(){
        return (
            
            <div class="collection">
                {
                
                    this.state.players.map((player,index) => {
                        let classNames = "collection-item";
                       if(this.index == index)classNames += " current"
                        if(this.currentTurn == index) classNames += " turn";

                        return (
                        <li className={classNames} ><span className="badge" >{player.number}</span> <span className="badge" >{player.score}</span>
                        {
                            this.index == 0 ?<span className="badge kick-btn" index={index}  >kick</span>:null
                            
                        }
                        
                        
                          {player.name}</li>
                        )
 
                        
                    })
                }
            </div>
        )
    }
}


