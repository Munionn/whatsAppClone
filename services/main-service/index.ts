import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from "mongoose";
import Message from "./src/models/Message";
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
const DB_URL = process.env.DB_URL ||'mongodb://localhost:27017/whatsapp';

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(DB_URL);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

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

const PORT = Number(process.env.PORT) || 3002;
const startServer = () => {
    server.listen(PORT, () => {
        console.log(`Main service running on port ${PORT}`);
    });
};

connectToMongoDB().then(startServer);