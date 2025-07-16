import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from "mongoose";
import Message from "./models/Message";

import Chat from "./models/Chat";
import ChatMember from "./models/ChatMember";
import {connectSocketHandler} from "./socket/socket.handler";
import messageRoute from "./routes/message.route";
import chatRoute from "./routes/chat.route";

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/whatsapp';
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(DB_URL, {
            connectTimeoutMS: 5000,
            socketTimeoutMS: 30000,
        });
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
        origin: FRONTEND_URL,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(express.json());

// Routes
app.use("/messages", messageRoute);
app.use("/chats", chatRoute);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Socket.IO
connectSocketHandler(io);
io.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", err);
});

// Server startup
const PORT = Number(process.env.PORT) || 3002;
if (isNaN(PORT)) {
    console.error('Invalid PORT value');
    process.exit(1);
}

const startServer = () => {
    server.listen(PORT, () => {
        console.log(`Main service running on port ${PORT}`);
    });
};

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the application
connectToMongoDB().then(startServer).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});