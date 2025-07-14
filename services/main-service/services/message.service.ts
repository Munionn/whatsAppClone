import Message from "../models/Message";
import {IMessage} from "../types/types";
import chat from "../models/Chat";
import { Types } from 'mongoose';

class MessageService {

    async createMessage(data: IMessage): Promise<IMessage> {
        const {
            chatId,
            senderId,
            content,
            type,
            isRead,
            replyTo,
            editedAt,
        } = data;
        if (!chatId || !senderId || !content) {
            throw new Error("Can't create message.");
        }

        const message = new Message(data);
        await message.save();
        return message;
    }

    async getMessages(chatId: Types.ObjectId): Promise<IMessage[]> {
        const chatMessages = await Message.find({ chatId }).sort({ createdAt: 1 }).exec();
        return chatMessages || [];
    }

    async getSpecificMessages(chatId: Types.ObjectId, messageId: Types.ObjectId): Promise<IMessage | null> {
        const message = await Message.findOne({ _id: messageId, chatId }).exec();
        return message;
    }

    async readMessages(chatId: Types.ObjectId, messageId: Types.ObjectId): Promise<void> {
        try {
            const updateMessage = await Message.findOneAndUpdate(
                { _id: messageId, chatId },
                { $set: { isRead: true } },
                { new: true }
            ).exec();

            if (!updateMessage) {
                console.warn(`Message with ID ${messageId} not found in chat ${chatId} or could not be updated.`);
                return;
            }
        } catch (err: unknown) {
            console.log(err);
            throw err instanceof Error ? err : new Error('Unknown error occurred');
        }
    }

    async editMessage(chatId: Types.ObjectId, messageId: Types.ObjectId, content: string): Promise<IMessage | null> {
        try {
            const updateMessage = await Message.findOneAndUpdate(
                { _id: messageId, chatId },
                { $set: { content, editedAt: new Date() } },
                { new: true }
            ).exec();

            if (!updateMessage) {
                console.warn(`Message with ID ${messageId} not found in chat.`);
                return null;
            }
            return updateMessage;
        } catch (err: unknown) {
            throw err instanceof Error ? err : new Error('Unknown error occurred');
        }
    }

    async deleteMessage(messageId: Types.ObjectId): Promise<IMessage | null> {
        try {
            const deleteMessage = await Message.findOneAndDelete({ _id: messageId }).exec();
            if (!deleteMessage) {
                console.warn(`Message with ID ${messageId} not found in chat.`);
                return null;
            }
            return deleteMessage;
        } catch (err: unknown) {
            throw err instanceof Error ? err : new Error('Unknown error occurred');
        }
    }

    async getUnreadMessages(chatId: Types.ObjectId): Promise<IMessage[]> {
        try {
            const messages = await Message.find({ chatId, isRead: false }).sort({ createdAt: 1 }).exec();
            return messages || [];
        } catch (err: unknown) {
            throw err instanceof Error ? err : new Error('Unknown error occurred');
        }
    }
}

export default new MessageService();