const uuid = require("uuid");

function generateId() {
  return uuid.v4();
}

module.exports = {
  generateId,
};
