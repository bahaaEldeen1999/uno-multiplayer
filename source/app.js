"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const game_1 = __importDefault(require("./game"));
const path_1 = __importDefault(require("path"));
let numberOfPlayers = 4;
let names = [];
for (let i = 0; i < numberOfPlayers; i++)
    names.push(`player ${i}`);
// create the game
let game = new game_1.default(numberOfPlayers, names);
const app = express_1.default();
const PORT = 3000;
const server = http_1.default.createServer(app);
app.use(cors_1.default());
const io = require("socket.io")(server);
//io.set('Access-Control-Allow-Credentials', true);
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../index.html"));
});
io.on("connection", (e) => {
    console.log("connected", e);
});
app.listen(PORT, () => console.log(`listening to port ${PORT}`));
