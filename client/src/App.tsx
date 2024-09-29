import React, { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  receive_message: (data: {
    message: string;
    senderId: string;
    timestamp: string;
  }) => void;
  welcome_message: (message: string) => void;
  user_joined: (message: string) => void;
  user_left: (message: string) => void;
}

interface ClientToServerEvents {
  join_room: (data: { room: string; username: string }) => void;
  send_message: (data: { room: string; message: string }) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3001"
);

interface Message {
  message: string;
  senderId: string;
  timestamp?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]); // 메시지 목록
  const [message, setMessage] = useState<string>(""); // 사용자가 입력한 메시지
  const [room, setRoom] = useState<string>(""); // 사용자가 입력한 방 번호
  const [username, setUsername] = useState<string>(""); // 사용자가 입력한 사용자 이름
  const [joined, setJoined] = useState<boolean>(false); // 사용자가 방에 참가했는지 여부

  // 사용자가 방에 참가하는 함수 (join room)
  const joinRoom = useCallback(() => {
    if (room !== "" && username !== "") {
      // 사용자 정의 이름(username)과 방 번호(room)를 서버로 전송
      socket.emit("join_room", { room, username });
      setJoined(true);
    }
  }, [room, username]);

  // 사용자가 메시지를 방에 전송하는 함수 (send message to server)
  const sendMessage = useCallback(() => {
    if (message !== "" && room !== "") {
      const messageData = {
        room: room,
        message: message,
      };
      socket.emit("send_message", messageData);
      setMessage("");
    }
  }, [message, room]);

  useEffect(() => {
    // 서버로부터 메시지를 받았을 때, 메시지 목록에 추가 (ex. 사용자가 메시지를 전송했을 때)
    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    // 시스템 메시지를 받았을 때, 메시지 목록에 추가 (ex. 사용자가 방에 참가했을 때, 사용자가 방을 나갔을 때)
    const handleSystemMessage = (message: string) => {
      setMessages((prev) => [...prev, { message, senderId: "System" }]);
    };

    // 서버로부터 받은 이벤트에 대한 이벤트 핸들러 등록
    socket.on("receive_message", handleReceiveMessage);
    socket.on("welcome_message", handleSystemMessage);
    socket.on("user_joined", handleSystemMessage);
    socket.on("user_left", handleSystemMessage);

    return () => {
      // 컴포넌트가 언마운트될 때, 이벤트 핸들러 제거
      socket.off("receive_message", handleReceiveMessage);
      socket.off("welcome_message", handleSystemMessage);
      socket.off("user_joined", handleSystemMessage);
      socket.off("user_left", handleSystemMessage);
    };
  }, []);

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat Room</h1>

      {!joined ? (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username..."
            className="border p-2 mr-2"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Room Number..."
            className="border p-2 mr-2"
            value={room}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRoom(e.target.value)
            }
          />
          <button
            onClick={joinRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Join Room
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Message..."
              className="border p-2 mr-2"
              value={message}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setMessage(e.target.value)
              }
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Send Message
            </button>
          </div>

          <div className="border p-4 h-80 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <strong>
                  {msg.senderId === username ? "You" : msg.senderId}:
                </strong>{" "}
                {msg.message}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default App;
