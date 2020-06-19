
class Deck extends React.Component{

    carouselOption = {
            margin:5,
            nav:false,
            responsive:{
                0:{
                    items:1,
                    nav:true
                },
                600:{
                    items:5,
                    nav:false
                },
                1000:{
                    items:9,
                    nav:true,
                    loop:false
                },
                2000:{
                    items:19,
                    nav:true,
                    loop:false
                }
            }
       
        }
    
    constructor(props){
        super(props);
        this.state = {
            cards:[]
        }
        this.addCard.bind(this);
        this.removeCard.bind(this);
        this.mousOver.bind(this);
        // get globla reference
        window.deckComponent = this;
    }
    addCard(card){
        this.setState(prevState => {
           prevState.cards.push(card);
           return prevState;


        })
    }
    removeCard(index){
        let a = this.state.cards;
        a.splice(index,1);
        this.setState({cards:a});
    }
    componentDidMount(){

    }
    componentDidUpdate(){

    }
    removeCards(){
        this.setState({cards:[]});
    }
    mousOver(e){
        this.removeCard(e);
    }
    render(){
       
        return (

                        this.state.cards.map((card, index) => (
                            <div className="item-slick slidee" onClick={()=>this.mousOver(index)}>
                            <Card key={Math.floor(Math.random()*100000)} index={index} value={card.value }color={card.color} isSpecial={card.isSpecial} />
                            </div>
                        ))

        )
    }

}



ReactDOM.render(<Deck />,document.querySelector("#frame"));
