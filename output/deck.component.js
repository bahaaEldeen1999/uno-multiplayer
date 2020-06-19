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
            margin: 5,
            nav: false,
            responsive: {
                0: {
                    items: 1,
                    nav: true
                },
                600: {
                    items: 5,
                    nav: false
                },
                1000: {
                    items: 9,
                    nav: true,
                    loop: false
                },
                2000: {
                    items: 19,
                    nav: true,
                    loop: false
                }
            }

        };

        _this.state = {
            cards: []
        };
        _this.addCard.bind(_this);
        _this.removeCard.bind(_this);
        _this.mousOver.bind(_this);
        // get globla reference
        window.deckComponent = _this;
        return _this;
    }

    _createClass(Deck, [{
        key: "addCard",
        value: function addCard(card) {
            this.setState(function (prevState) {
                prevState.cards.push(card);
                return prevState;
            });
        }
    }, {
        key: "removeCard",
        value: function removeCard(index) {
            var a = this.state.cards;
            a.splice(index, 1);
            this.setState({ cards: a });
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {}
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {}
    }, {
        key: "removeCards",
        value: function removeCards() {
            this.setState({ cards: [] });
        }
    }, {
        key: "mousOver",
        value: function mousOver(e) {
            this.removeCard(e);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return this.state.cards.map(function (card, index) {
                return React.createElement(
                    "div",
                    { className: "item-slick slidee", onClick: function onClick() {
                            return _this2.mousOver(index);
                        } },
                    React.createElement(Card, { key: Math.floor(Math.random() * 100000), index: index, value: card.value, color: card.color, isSpecial: card.isSpecial })
                );
            });
        }
    }]);

    return Deck;
}(React.Component);

ReactDOM.render(React.createElement(Deck, null), document.querySelector("#frame"));