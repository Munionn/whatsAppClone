import Message from "../models/Message";
import {IMessage} from "../types/types";
import chat from "../models/Chat";

export default class MessageService {

    async createMessage(data: IMessage): Promise<IMessage> {
        const {
            chatId,
            senderId,
            content,
            type = 'text',
            timestamp,
            isRead,
            replyTo,
            editedAt,
        } = data;
        if ( !chatId || !senderId || !content) {
            throw new Error("Can't create message.");
        }

        const message = new Message(data);
        await message.save();
        return message;
    }

    async getMessages(chatId: string): Promise<IMessage[]> {
        const chatMessages: IMessage[] = await Message.find({where: { chatId: chatId}}).sort({createdAt: 1}).exec();
        if(chatMessages === null ) return [];

        return chatMessages;
    }

    async getSpecificMessages(chatId: string, messageId: string): Promise<IMessage> {
        const message = await Message.findOne({where: {_id: messageId, chatId}})
            .exec();
        if(!message) return null;
        return message;
    }

    async readMessages(chatId: string, messageId: string): Promise<void> {
        try {
            const updateMessage = await Message.findOneAndUpdate(
                {
                    _id: messageId,
                    chatId
                },
                { $set: { isRead: true } },
                { new: true }
            )
            .exec();

            if(!updateMessage){
                console.warn(`Message with ID ${messageId} not found in chat ${chatId} or could not be updated.`);
                return null;
            }
        }
        catch(err) {
            console.log(err);
            throw new Error(err.message);
        }
    }


    async editMessage(chatId: string, messageId: string, content: string): Promise<IMessage> {
        try {
            const updateMessage = await Message.findOneAndUpdate(
                {_id: messageId, chatId},
                { $set: { content, editedAt: Date() } },
                {new: true}
            ).exec();
            if(!updateMessage){
                console.warn(`Message with ID ${messageId} not found in chat.`);
                return null;
            }
            return updateMessage;
        }
        catch(err) {
            throw new Error(err.message);
        }
    }
    async deleteMessage(messageId: string): Promise<IMessage> {
        try {
            const deleteMessage: IMessage = await Message.findOneAndDelete(
                {_id: messageId},
            ).exec();
            if(!deleteMessage){
                console.warn(`Message with ID ${messageId} not found in chat.`);
                return null;
            }
            return deleteMessage;
        }
        catch(err) {
            throw new Error(err.message);
        }
    }

    async getUnreadMessages(chatId: string): Promise<IMessage[]> {
        try{
            const messages: IMessage[] = await Message.find({where: {chatId, isRead: false}}).sort({createdAt: 1}).exec();
            if(messages === null ) return [];
            return messages;
        }
        catch(err) {
            throw new Error(err.message);
        }
    }
}
