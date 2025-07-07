import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
// import MessageController from './controllers/MessageController';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    socket.on("send-message", (message) => {
        console.log("Message received:", message);
        io.emit("new-message", message); // Broadcast to all clients
    });
});

const PORT = Number(process.env.PORT) || 3002;
server.listen(PORT,  () => {
    console.log(`Main service running on port ${PORT}`);
});