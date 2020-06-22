
class Deck extends React.Component{
    cards;
    carouselOption = {
        margin:2,
        nav:true,
        responsive:{
            0:{
                items:1,
                nav:true
            },
            100:{
                items:2,
                nav:true,
            },
            600:{
                items:5,
                nav:true,
            },
            1000:{
                items:9,
                nav:true,
            },
            2000:{
                items:19,
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
    // componentDidUpdate(){
    //     var $owl = $('.owl-carousel');
    //     $owl.trigger('destroy.owl.carousel');
    //     $owl.html($owl.find('.owl-stage-outer').html()).removeClass('owl-loaded');
    //     $owl.owlCarousel(this.carouselOption);
    // }
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




