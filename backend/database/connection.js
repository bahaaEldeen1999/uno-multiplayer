const mongoose = require("mongoose");

module.exports = function () {
  mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true });
  mongoose.connection.once("open", () => {
    console.log("connected to db " + process.env.CONNECTION_STRING);
  });
};
