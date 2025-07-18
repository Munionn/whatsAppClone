import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { io, Socket } from "socket.io-client";
import chatStore from "../store/chatStore";
import type { IMessage } from "../models/Message";
import { authStore } from "../store/authStore.ts";

const SOCKET_URL = "http://localhost:3000";

const ChatPage: React.FC = observer(() => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const selectedChat = chatStore.selectedChat;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!selectedChat || !authStore.user) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: {
        userId: authStore.user.id,
        chatId: selectedChat._id
      },
      withCredentials: true,
      transports: ["websocket"]
    });

    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      socket.emit("join-chat", selectedChat._id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    // Message events
    socket.on("new-message", (msg: IMessage) => {
      if (msg.chatId === selectedChat._id) {
        setMessages(prev => [...prev, msg]);
        chatStore.addMessage(msg);
      }
    });

    // Load initial messages
    const loadMessages = async () => {
      try {
        const fetchedMessages = await chatStore.fetchMessages(selectedChat._id);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    // Cleanup
    return () => {
      socket.emit("leave-chat", selectedChat._id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedChat?._id, authStore.user?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !selectedChat || !authStore.user) return;

    const tempId = Date.now().toString();
    const message = {
      chatId: selectedChat._id,
      content: input,
      senderId: authStore.user.id,
      type: "text",
      _id: tempId,
      createdAt: new Date().toISOString(),
      isRead: false,
      readBy: []
    };

    // Optimistic update
    setMessages(prev => [...prev, message]);
    setInput("");

    try {
      await new Promise<void>((resolve, reject) => {
        if (!socketRef.current) return reject("Socket not connected");

        socketRef.current.timeout(5000).emit("send-message", message, (err: Error | null, response: { success: boolean, error?: string }) => {
          if (err || !response?.success) {
            reject(err || response?.error || "Failed to send message");
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      // Optionally show error to user
      alert("Failed to send message. Please try again.");
    }
  };

  if (!selectedChat) {
    return (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          Select a chat to start messaging.
        </div>
    );
  }

  return (
      <div style={{
        width: "100%",
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8
      }}>
        {/* Connection status indicator */}
        <div style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "5px 10px",
          borderRadius: 5,
          background: isConnected ? "#4CAF50" : "#F44336",
          color: "white"
        }}>
          {isConnected ? "Connected" : "Disconnected"}
        </div>

        <h2 style={{ marginBottom: 20 }}>{selectedChat.name}</h2>

        {/* Messages container */}
        <div style={{
          height: 400,
          border: "1px solid #eee",
          padding: 10,
          marginBottom: 10,
          borderRadius: 4,
          background: "#fafafa",
          overflowY: "auto"
        }}>
          {messages.map((msg) => (
              <div
                  key={msg._id}
                  style={{
                    margin: "8px 0",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    maxWidth: "70%",
                    wordBreak: "break-word",
                    alignSelf: msg.senderId === authStore.user?.id ? "flex-end" : "flex-start",
                    backgroundColor: msg.senderId === authStore.user?.id ? "#e3f2fd" : "#f5f5f5",
                    marginLeft: msg.senderId === authStore.user?.id ? "auto" : 0
                  }}
              >
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {msg.senderId === authStore.user?.id ? "You" : "Other User"}
                </div>
                <div style={{ marginBottom: 4 }}>{msg.content}</div>
                <div style={{ fontSize: "0.75rem", color: "#666", textAlign: "right" }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input form */}
        <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 4,
                border: "1px solid #ccc"
              }}
              autoComplete="off"
          />
          <button
              type="submit"
              disabled={!input.trim()}
              style={{
                padding: "8px 16px",
                borderRadius: 4,
                border: "none",
                background: "#1976d2",
                color: "#fff",
                cursor: "pointer",
                opacity: !input.trim() ? 0.5 : 1
              }}
          >
            Send
          </button>
        </form>
      </div>
  );
});

export default ChatPage;