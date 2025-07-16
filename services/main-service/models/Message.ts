import { Schema, model, Types } from 'mongoose';
import { IMessage } from "../types/types";

const MessageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['text', 'image', 'file', 'audio', 'video'],
            required: true,
            default: 'text'
        },
        isRead: {
            type: Boolean,
            required: true,
            default: false
        },
        readBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        },
        editedAt: {
            type: Date
        },
        metadata: {
            fileSize: Number,
            fileName: String,
            duration: Number, // For audio/video
            thumbnail: String, // For images/video
            width: Number, // For images/video
            height: Number // For images/video
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

// Indexes for better query performance
MessageSchema.index({ chatId: 1, createdAt: -1 }); // For fetching messages in a chat
MessageSchema.index({ senderId: 1 }); // For finding messages by sender
MessageSchema.index({ 'metadata.fileName': 'text' }); // For text search on filenames

export default model('Message', MessageSchema);