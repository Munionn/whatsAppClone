import { Server } from "socket.io";
import apiClient from "./apiClient";

export const connectSocketHandler = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Add middleware for authentication
        socket.use((packet, next) => {
            try {
                // Verify authentication token if needed
                // const token = socket.handshake.auth.token;
                next();
            } catch (err) {
                next(new Error("Unauthorized"));
            }
        });

        socket.on("join-room", (roomId, callback) => {
            if (!roomId) {
                if (callback) callback({ success: false, error: "Room ID required" });
                return;
            }

            try {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room: ${roomId}`);
                if (callback) callback({ success: true });
            } catch (err) {
                console.error("Join room error:", err);
                if (callback) callback({ success: false, error: "Failed to join room" });
            }
        });

        socket.on("leave-room", (roomId, callback) => {
            if (!roomId) {
                if (callback) callback({ success: false, error: "Room ID required" });
                return;
            }

            try {
                socket.leave(roomId);
                console.log(`User ${socket.id} left room: ${roomId}`);
                if (callback) callback({ success: true });
            } catch (err) {
                console.error("Leave room error:", err);
                if (callback) callback({ success: false, error: "Failed to leave room" });
            }
        });

        socket.on("send-message", async (message, callback) => {
            try {
                // Validate message
                if (!message?.chatId || !message?.content || !message?.senderId) {
                    const error = "Missing required fields";
                    socket.emit("error", error);
                    if (callback) callback({ success: false, error });
                    return;
                }

                // Prepare message data
                const messageData = {
                    chatId: message.chatId,
                    senderId: message.senderId,
                    content: message.content,
                    type: message.type || "text",
                    // Add any additional fields needed by your API
                };

                // Save to database via API
                const response = await apiClient.post("/messages", messageData); //could be main
                const savedMessage = response.data;

                // Broadcast to all in the chat room (including sender)
                io.to(message.chatId).emit("new-message", savedMessage);
                //socket.broadcast.to(chatId).emit("new-message", savedMessage);

                // Send acknowledgment to sender
                if (callback) callback({ success: true, message: savedMessage });

            } catch (err: any) {
                console.error("Error saving message:", err);
                const error = err.response?.data?.message || "Failed to send message";
                socket.emit("error", error);
                if (callback) callback({ success: false, error });
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`User disconnected (${socket.id}):`, reason);
        });

        socket.on("error", (err) => {
            console.error("Socket error:", err);
        });
    });
};