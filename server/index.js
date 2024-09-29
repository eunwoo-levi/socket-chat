const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

// HTTP Server 생성
const server = http.createServer(app);

// Socket.IO 서버 생성
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users = new Map(); // 각 사용자 socket ID와 참가한 방 정보를 저장하는 Map

// io.on("connection"): 사용자가 연결할 때마다 이 이벤트가 발생
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 사용자가 방에 참가하면 발생하는 이벤트
  socket.on("join_room", ({ room, username }) => {
    // 사용자를 방에 추가하고, 사용자에게 환영 메시지를 보냄
    socket.join(room);
    users.set(socket.id, { room, username });
    socket.emit("welcome_message", `Welcome to room ${room}!`);

    // 방에 참가한 사용자에게 사용자가 참가했음을 알림
    socket
      .to(room)
      .emit("user_joined", `User ${username} has joined the room.`);
  });

  // 사용자가 메시지를 보내면 발생하는 이벤트
  socket.on("send_message", (data) => {
    const { room, message } = data;
    console.log(`Message from ${socket.id} in room ${room}: ${message}`);

    io.to(room).emit("receive_message", {
      message,
      senderId: users.get(socket.id).username, // username 사용
      timestamp: new Date().toISOString(),
    });
  });

  // 사용자가 방을 나가면 발생하는 이벤트
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      socket
        .to(user.room)
        .emit("user_left", `User ${user.username} has left the room.`);
      users.delete(socket.id);
    }
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
