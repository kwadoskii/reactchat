const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    content: String,
    name: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
