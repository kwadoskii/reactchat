const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const io = require("socket.io")(http);
require("dotenv").config();

const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

const Message = require("./Message");
const mongoose = require("mongoose");

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use("/messages", (req, res) => {
  Message.find()
    .sort({ createdAt: -1 })
    .then((msgs) => res.send(msgs));
});

io.on("connection", (socket) => {
  // Get last 10 messages from the database
  Message.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .exec((err, messages) => {
      if (err) return console.error(err);

      //Send the last messages to the user
      socket.emit("init", messages);
    });

  // Listen to the connected users for a new message
  socket.on("message", (msg) => {
    const message = new Message({
      content: msg.content,
      name: msg.name,
    });

    message.save((err) => {
      if (err) return console.error(err);
    });

    socket.broadcast.emit("push", msg);
  });
});

http.listen(port, () => {
  console.log("listening on *:" + port);
});
