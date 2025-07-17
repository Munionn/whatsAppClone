import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { io, Socket } from "socket.io-client";
import chatStore from "../store/chatStore";
import type { IMessage } from "../models/Message";
import {authStore} from "../store/authStore.ts";


const SOCKET_URL = "http://localhost:3000"; // Gateway URL

const ChatPage: React.FC = observer(() => {
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const selectedChat = chatStore.selectedChat;

  // Assume you have a way to get messages for the selected chat
  // For example, selectedChat?.messages or a separate store
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    if (!selectedChat) return;

    // Connect to the gateway's Socket.IO endpoint
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // allow both
      withCredentials: true,
    });
    socketRef.current = socket;

    // Join the chat room
    socket.emit("join-room", selectedChat._id);

    const loadMessages = async () => {
      const fetchedMessages = await chatStore.fetchMessages();
      setMessages(fetchedMessages);
    };

    loadMessages();
    
    // Listen for new messages
    socket.on("new-message", (msg: IMessage) => {
      if (msg.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
        chatStore.addMessage(msg); // ✅ Add this line
      }
    });

    // Cleanup on unmount or when chat changes
    return () => {
      socket.emit("leave-room", selectedChat._id);
      socket.disconnect();
    };
  }, [selectedChat?._id]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current && selectedChat && authStore.user) {
      const message = {
        chatId: selectedChat._id,
        content: input,
        senderId: authStore.user.id,
        createdAt: new Date().toISOString(),
        type: "text",
      };

      socketRef.current.emit("send-message", message);
      setInput("");
    }
  };

  if (!selectedChat) {
    return <div style={{ textAlign: "center", marginTop: 40, display: "flex" }}>Select a chat to start messaging.</div>;
  }

  return (
    <div style={{ margin: "40px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>{selectedChat.name}</h2>
      <div style={{ minHeight: 200, border: "1px solid #eee", padding: 10, marginBottom: 10, borderRadius: 4, background: "#fafafa", overflowY: "auto", maxHeight: 300 }}>
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} style={{ margin: "4px 0" }}>
            <b>{msg.senderId}:</b> {msg.text}
          </div>
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
});

export default ChatPage;