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

const connections = { length: 0 };
const addConnection = (id) => {
  connections.length++;
  connections[id] = { id, username: "" };
};
const deleteConnection = (id) => {
  connections.length--;
  delete connections[id];
  console.log(connections);
};

// when a client connects to the socket
io.on("connection", (socket) => {
  addConnection(socket.id);
  // send a 'client connected' event to all connected clients
  io.emit("connected", { connections });

  // when a client disconnects from the socket
  socket.on("disconnect", () => {
    deleteConnection(socket.id);
    // send a 'client disconnected' event to all connected clients
    io.emit("disconnected", { connections });
  });

  socket.on("typing", (data) => {
    // one client broadcasts data to all OTHER clients
    socket.broadcast.emit("typing", data);
  });

  socket.on("typing cancelled", (data) => {
    // one client broadcasts data to all OTHER clients
    socket.broadcast.emit("typing cancelled", data);
  });

  // when a client broadcasts a 'client sent message' event
  socket.on("sent message", (data) => {
    // one client broadcasts data to all OTHER clients
    socket.broadcast.emit("sent message", data);

    // broadcast data to ALL connected clients
    // io.emit("sent message", data);
  });

  socket.on("set username", ({ id, username }) => {
    connections[id].username = username;
    socket.broadcast.emit("set username", { connections });
  });
});

server.listen(PORT, () => {
  console.log("listening on *:3000");
});
