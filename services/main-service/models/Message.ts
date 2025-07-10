import mongoose, { Schema, Document } from 'mongoose';
import {IMessage} from "../types/types";


const MessageSchema = new Schema<IMessage>({
    id:           { type: String, required: true, unique: true },
    chatId:       { type: String, required: true },
    senderId:     { type: String, required: true },
    content:      { type: String, required: true },
    type:         { type: String, enum: ['text', 'image', 'file', 'audio', 'video'], required: true },
    timestamp:    { type: Date, required: true },
    isRead:       { type: Boolean, required: true },
    replyTo:      { type: String, required: false },
    editedAt:     { type: Date, required: false },
});

export default mongoose.model('Message', MessageSchema);