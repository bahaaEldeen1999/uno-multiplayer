var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Deck = function (_React$Component) {
    _inherits(Deck, _React$Component);

    function Deck(props) {
        _classCallCheck(this, Deck);

        var _this = _possibleConstructorReturn(this, (Deck.__proto__ || Object.getPrototypeOf(Deck)).call(this, props));

        _this.carouselOption = {
            margin: 2,
            nav: true,
            responsive: {
                0: {
                    items: 2,
                    nav: true
                },
                100: {
                    items: 3,
                    nav: true
                },
                200: {
                    items: 3,
                    nav: true
                },
                300: {
                    items: 4,
                    nav: true
                },
                400: {
                    items: 5,
                    nav: true
                },
                500: {
                    items: 6,
                    nav: true
                },
                600: {
                    items: 7,
                    nav: true
                },
                800: {
                    items: 8,
                    nav: true
                },
                1000: {
                    items: 10,
                    nav: true
                },
                1200: {
                    items: 12,
                    nav: true
                },
                1500: {
                    items: 15,
                    nav: true
                },
                2000: {
                    items: 20,
                    nav: true
                }
            }

        };

        _this.cards = props.cards;

        return _this;
    }

    _createClass(Deck, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var $owl = $('.owl-carousel');
            $owl.owlCarousel(this.carouselOption);
        }
    }, {
        key: "render",
        value: function render() {

            return this.cards.map(function (card, index) {

                return React.createElement(
                    "div",
                    { className: "item-slick slidee item" },
                    React.createElement(Card, { key: Math.floor(Math.random() * 100000), index: index, value: card.value, color: card.color, isSpecial: card.isSpecial })
                );
            });
        }
    }]);

    return Deck;
}(React.Component);