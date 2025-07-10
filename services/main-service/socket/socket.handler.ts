import { Server} from "socket.io";
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

        socket.on("send-message", async (message) => {
            console.log("Message received:", message);
            const saveMessage = await Message.create(message);
            io.to(message.id).emit("message", saveMessage);
        });
    });

}