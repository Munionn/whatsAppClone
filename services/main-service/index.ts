// @ts-ignore
import express from 'express';
// @ts-ignore
import http from 'http';
import { Server } from 'socket.io';
import mongoose from "mongoose";
import Message from "./models/Message";
import {connectSocketHandler} from "./socket/socket.handler";
import messageRoute from "./routes/message.route";

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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use("/messages", messageRoute);

connectSocketHandler(io);


const PORT = Number(process.env.PORT) || 3002;
const startServer = () => {
    server.listen(PORT, () => {
        console.log(`Main service running on port ${PORT}`);
    });
};

connectToMongoDB().then(startServer);
