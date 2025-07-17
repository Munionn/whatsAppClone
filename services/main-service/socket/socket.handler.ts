import { Server } from "socket.io";
import Message from "../models/Message";

export const connectSocketHandler = (io: Server) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        socket.on("leave-room", (roomId) => {
            socket.leave(roomId);
            console.log(`User left room: ${roomId}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });

        socket.on("send-message", async (message): Promise<void> => {
            const { chatId, senderId, text, type } = message;

            if (!chatId || !text || !senderId) {
                socket.emit("error", "Missing required fields");
                return ;
            }

            const newMessage = new Message({
                chatId,
                senderId,
                content: text,
                type: type || "text"
            });

            try {
                await newMessage.save();
                io.to(chatId).emit("new-message", newMessage);
            } catch (err) {
                console.error("Error saving message:", err);
                socket.emit("error", "Failed to send message");
                return;
            }
        });
    });
};