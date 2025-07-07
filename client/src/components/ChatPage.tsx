import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Replace with your actual API URL or gateway URL
const SOCKET_URL = "http://localhost:3000"; // Gateway URL

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the gateway's Socket.IO endpoint
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    // Listen for new messages
    socket.on("new-message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Optionally listen for connection/disconnection
    socket.on("connect", () => {
      console.log("Connected to chat server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from chat server");
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit("send-message", input);
      setInput("");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Simple Chat</h2>
      <div style={{ minHeight: 200, border: "1px solid #eee", padding: 10, marginBottom: 10, borderRadius: 4, background: "#fafafa", overflowY: "auto", maxHeight: 300 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "4px 0" }}>{msg}</div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }} autoComplete="off">
        <input
          id="chat-message"
          name="message"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          autoComplete="off"
        />
        <button type="submit" style={{ padding: "8px 16px", borderRadius: 4, border: "none", background: "#1976d2", color: "#fff" }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;