import { Request, Response } from 'express';
import { Types } from 'mongoose';
import MessageService from "../services/message.service";
import { IMessage } from '../types/types';

class MessageController {
    // Helper method to handle errors
    private handleError(error: unknown, res: Response): Response {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'An unknown error occurred' });
    }

    // Helper to validate and convert string ID to ObjectId
    private toObjectId(id: string): Types.ObjectId {
        return new Types.ObjectId(id);
    }

    async createMessage(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.body) {
                return res.status(400).json({ error: "Request body is missing" });
            }

            const { chatId, senderId, content } = req.body;

            if (!chatId || !senderId || !content) {
                return res.status(400).json({
                    error: "Missing required fields: chatId, senderId, or content"
                });
            }

            const messageData: IMessage = {
                ...req.body,
                chatId: this.toObjectId(chatId),
                senderId: this.toObjectId(senderId),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const newMessage = await MessageService.createMessage(messageData);
            return res.status(201).json(newMessage);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async getMessages(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId } = req.params;
            const messages = await MessageService.getMessages(this.toObjectId(chatId));
            return res.status(200).json(messages);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async getSpecificMessage(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId, messageId } = req.params;
            const message = await MessageService.getSpecificMessages(
                this.toObjectId(chatId),
                this.toObjectId(messageId)
            );
            if (!message) {
                return res.status(404).json({ error: 'Message not found' });
            }
            return res.status(200).json(message);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async markAsRead(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId, messageId } = req.params;
            await MessageService.readMessages(
                this.toObjectId(chatId),
                this.toObjectId(messageId)
            );
            return res.status(200).json({ message: 'Message marked as read' });
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async updateMessage(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId, messageId } = req.params;
            const { content } = req.body;
            const updatedMessage = await MessageService.editMessage(
                this.toObjectId(chatId),
                this.toObjectId(messageId),
                content
            );
            if (!updatedMessage) {
                return res.status(404).json({ error: 'Message not found' });
            }
            return res.status(200).json(updatedMessage);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async removeMessage(req: Request, res: Response): Promise<Response> {
        try {
            const { messageId } = req.params;
            const deletedMessage = await MessageService.deleteMessage(
                this.toObjectId(messageId)
            );
            if (!deletedMessage) {
                return res.status(404).json({ error: 'Message not found' });
            }
            return res.status(200).json(deletedMessage);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async getUnreadMessages(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId } = req.params;
            const messages = await MessageService.getUnreadMessages(
                this.toObjectId(chatId)
            );
            return res.status(200).json(messages);
        } catch (error) {
            return this.handleError(error, res);
        }
    }
}

export default new MessageController();