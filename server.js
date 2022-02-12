const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// when a client connects to the socket
io.on("connection", (socket) => {
  // send a 'user connected' event to all connected clients
  io.emit("user connected", "a user connected");
  console.log("a user connected");

  // when a client disconnects from the socket
  socket.on("disconnect", () => {
    // send a 'user disconnected' event to all connected clients
    io.emit("user disconnected", "a user disconnected");
    console.log("user disconnected");
  });

  // when a client broadcasts a 'chat message' event
  socket.on("chat message", (data) => {
    // one client broadcasts data to all OTHER clients
    socket.broadcast.emit("chat message", data);

    // broadcast data to ALL connected clients
    // io.emit("chat message", data);
    console.log("data", data);
  });
});

server.listen(PORT, () => {
  console.log("listening on *:3000");
});
