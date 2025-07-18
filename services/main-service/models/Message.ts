import { Schema, model, Types } from 'mongoose';
import { IMessage } from "../types/types";

const MessageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'image', 'file', 'audio', 'video'],
            default: 'text'
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readBy: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

// Indexes for better query performance
MessageSchema.index({ chatId: 1, createdAt: -1 }); // For fetching messages in a chat
MessageSchema.index({ senderId: 1 }); // For finding messages by sender
MessageSchema.index({ 'metadata.fileName': 'text' }); // For text search on filenames

export default model('Message', MessageSchema);