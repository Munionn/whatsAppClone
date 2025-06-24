import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './router';


const PORT = process.env.PORT || 3001;
const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/', router);
// app.use(errorMiddleware);

const start = async () => {
    try {
        if (!process.env.DB_URL) {
            throw new Error('DB_URL is not defined in environment variables');
        }
        await mongoose.connect(process.env.DB_URL);
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));
    } catch (e) {
        console.error(e);
    }
};

start();