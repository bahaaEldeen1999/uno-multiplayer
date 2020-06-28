var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Players = function (_React$Component) {
    _inherits(Players, _React$Component);

    function Players(props) {
        _classCallCheck(this, Players);

        var _this = _possibleConstructorReturn(this, (Players.__proto__ || Object.getPrototypeOf(Players)).call(this, props));

        _this.state = {};
        _this.state.players = props.players;
        _this.index = props.index;
        _this.currentTurn = props.currentTurn;
        _this.chaneNumber.bind(_this);
        // get global reference to this component
        window.playersComponent = _this;
        return _this;
    }

    _createClass(Players, [{
        key: "chaneNumber",
        value: function chaneNumber(index, number) {
            var players = this.state.players;
            players[index].number += number;
            this.setState({ players: players });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            return React.createElement(
                "div",
                { "class": "collection" },
                this.state.players.map(function (player, index) {
                    var classNames = "collection-item";
                    if (_this2.index == index) classNames += " current";
                    if (_this2.currentTurn == index) classNames += " turn";

                    return React.createElement(
                        "li",
                        { className: classNames },
                        React.createElement(
                            "span",
                            { className: "badge" },
                            player.number
                        ),
                        " ",
                        React.createElement(
                            "span",
                            { className: "badge" },
                            player.score
                        ),
                        _this2.index == 0 ? React.createElement(
                            "span",
                            { className: "badge kick-btn", index: index },
                            "kick"
                        ) : null,
                        player.name
                    );
                })
            );
        }
    }]);

    return Players;
}(React.Component);