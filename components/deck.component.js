
class Deck extends React.Component{
    cards;

    
    constructor(props){
        super(props);
        this.cards =props.cards;

    }
    render(){
       
        return (
                        
                        this.cards.map((card, index) => {
                            
                            return (
                            <div className="item-slick slidee" >
                            <Card key={Math.floor(Math.random()*100000)} index={index} value={card.value }color={card.color} isSpecial={card.isSpecial} />
                            </div>
                            )
                            })

        )
    }

}




