const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");
const app = express();
const PORT = 3000;
const server = http.createServer(app);
app.use(cors());
app.use(express.static(path.join(__dirname, "../output")));
//  app.use(express.static("../component"));
console.log("path ", path.join(__dirname, "../output"));
app.use(express.static(path.join(__dirname, "../styles")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});
const io = socketio.listen(server);

io.on("connection", async (socket) => {
  await require("./routes/socket-route")(socket, io);
});

server.listen(process.env.PORT || PORT, () => {
  console.log(`listening on port ${process.env.PORT || PORT}`);
});
