var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Board = function (_React$Component) {
    _inherits(Board, _React$Component);

    function Board(props) {
        _classCallCheck(this, Board);

        var _this = _possibleConstructorReturn(this, (Board.__proto__ || Object.getPrototypeOf(Board)).call(this, props));

        _this.state = { card: props.currentCard };
        _this.changeCard.bind(_this);
        return _this;
    }

    _createClass(Board, [{
        key: "changeCard",
        value: function changeCard(card) {

            this.setState({ card: card });
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "board-card " + (this.props.animated ? this.props.animated : "") },
                React.createElement(Card, { value: this.state.card.value, color: this.state.card.color, isSpecial: this.state.card.isSpecial })
            );
        }
    }]);

    return Board;
}(React.Component);
//ReactDOM.render(<Board currentCard={{value:2,color:"black",isSpecial:true}} />,document.querySelector(".board"))