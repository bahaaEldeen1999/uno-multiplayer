
class Deck extends React.Component{
    cards;
    carouselOption = {
        margin:2,
        nav:true,
        responsive:{
            0:{
                items:2,
                nav:true
            },
            100:{
                items:3,
                nav:true,
            },
            200:{
                items:3,
                nav:true,  
            },
            300:{
                items:4,
                nav:true, 
            },
            400:{
                items: 5,
                nav:true,
            },
            500:{
                items:6,
                nav:true, 
            },
            600:{
                items:7,
                nav:true,
            },
            800:{
                items:8,
                nav:true,
            },
            1000:{
                items:10,
                nav:true,
            },
            1200:{
                items:12,
                nav:true,
            },
            1500:{
                items:15,
                nav:true,
            },
            2000:{
                items:20,
                nav:true,
            }
        }
   
    }
    
    constructor(props){
        super(props);
        this.cards =props.cards;

    }
    componentDidMount(){
        var $owl = $('.owl-carousel');
        $owl.owlCarousel(this.carouselOption);
    }

    render(){
       
        return (
                        
                        this.cards.map((card, index) => {
                            
                            return (
                            <div className="item-slick slidee item" >
                            <Card key={Math.floor(Math.random()*100000)} index={index} value={card.value }color={card.color} isSpecial={card.isSpecial} />
                            </div>
                            )
                            })

        )
    }

}




