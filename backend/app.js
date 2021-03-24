const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http");
require("./database/connection")();

const app = express();
const PORT = 3000;
const server = http.createServer(app);
app.use(cors());

const io = socketio.listen(server);

io.on("connection", async (socket) => {
  await require("./routes/socket-route")(socket, io);
});

server.listen(process.env.PORT || PORT, () => {
  console.log(`listening on port ${process.env.PORT || PORT}`);
});
