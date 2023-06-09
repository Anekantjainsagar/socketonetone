const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const app = express();

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://anekantjainsagar:anekantjainsagar12345@chatapp.7xoggpk.mongodb.net/"
  )
  .then((res) => {
    console.log("Connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timeStamps: true,
  }
);

const Chat = mongoose.model("Chat", messageSchema);

app.get("/", (req, res) => {
  res.send("Hell");
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", ({ userId }) => {
    console.log("JOin");
    socket.join(userId);
  });

  socket.on("message", async ({ from, to, text }) => {
    try {
      const message = new Chat({ sender: from, receiver: to, content: text });
      await message.save();

      io.to(from).to(to).emit("message", message);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(8000, () => {
  console.log(`Server running on port ${8000}`);
});
