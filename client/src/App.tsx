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
  join_room: (room: string) => void;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);

  const joinRoom = useCallback(() => {
    if (room !== "") {
      socket.emit("join_room", room);
      setJoined(true);
    }
  }, [room]);

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
    const handleReceiveMessage = (data: Message) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleSystemMessage = (message: string) => {
      setMessages((prev) => [...prev, { message, senderId: "System" }]);
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("welcome_message", handleSystemMessage);
    socket.on("user_joined", handleSystemMessage);
    socket.on("user_left", handleSystemMessage);

    return () => {
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
                  {msg.senderId === socket.id ? "You" : msg.senderId}:
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
