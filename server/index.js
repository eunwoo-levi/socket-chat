const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users = new Map(); // 사용자 ID와 방 정보를 저장하는 Map

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    users.set(socket.id, room);
    socket.emit("welcome_message", `Welcome to room ${room}!`);

    // 다른 사용자들에게 새로운 사용자가 입장했음을 알림
    socket
      .to(room)
      .emit("user_joined", `User ${socket.id} has joined the room.`);
  });

  socket.on("send_message", (data) => {
    const { room, message } = data;
    console.log(`Message from ${socket.id} in room ${room}: ${message}`);

    io.to(room).emit("receive_message", {
      message,
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    const room = users.get(socket.id);
    if (room) {
      socket.to(room).emit("user_left", `User ${socket.id} has left the room.`);
      users.delete(socket.id);
    }
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
