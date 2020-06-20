
class Deck extends React.Component{
    cards;
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




