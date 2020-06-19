var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Card = function (_React$Component) {
    _inherits(Card, _React$Component);

    function Card(props) {
        _classCallCheck(this, Card);

        var _this = _possibleConstructorReturn(this, (Card.__proto__ || Object.getPrototypeOf(Card)).call(this, props));

        _this.color = props.color;
        _this.value = props.value;
        _this.isSpecial = props.isSpecial;
        _this.index = props.index;
        if (_this.isSpecial && _this.color != "black") {
            if (_this.value == 2) _this.filename = 9 + 3 + "_" + _this.color + ".png";else if (_this.value == 3) _this.filename = 9 + 2 + "_" + _this.color + ".png";else _this.filename = 9 + _this.value + "_" + _this.color + ".png";
        } else if (_this.isSpecial) {
            _this.filename = _this.value + "_" + _this.color + ".png";
        } else {
            _this.filename = _this.value + "_" + _this.color + ".png";
        }
        return _this;
    }

    _createClass(Card, [{
        key: "render",
        value: function render() {
            return React.createElement("img", { color: this.color, value: this.value, isSpecial: this.isSpecial ? 1 : 0, index: this.index, className: "card-deck", src: 'deck-images/' + this.filename });
        }
    }]);

    return Card;
}(React.Component);

//ReactDOM.render(<Card prop={{value:2,color:"black",isSpecial:true}} />,document.getElementById("root"))