import { Request, Response } from 'express';
import MessageService from "../services/message.service";
import { IMessage } from '../types/types';

class MessageController {
    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();
    }

    // Helper method to handle errors
    private handleError(error: unknown, res: Response): Response {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'An unknown error occurred' });
    }

    async createMessage(req: Request, res: Response): Promise<Response> {
        try {
            const messageData: IMessage = req.body;
            const newMessage = await this.messageService.createMessage(messageData);
            return res.status(201).json(newMessage);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async getMessages(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId } = req.params;
            const messages = await this.messageService.getMessages(chatId);
            return res.status(200).json(messages);
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async getSpecificMessage(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId, messageId } = req.params;
            const message = await this.messageService.getSpecificMessages(chatId, messageId);
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
            await this.messageService.readMessages(chatId, messageId);
            return res.status(200).json({ message: 'Message marked as read' });
        } catch (error) {
            return this.handleError(error, res);
        }
    }

    async updateMessage(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId, messageId } = req.params;
            const { content } = req.body;
            const updatedMessage = await this.messageService.editMessage(chatId, messageId, content);
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
            const deletedMessage = await this.messageService.deleteMessage(messageId);
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
            const messages = await this.messageService.getUnreadMessages(chatId);
            return res.status(200).json(messages);
        } catch (error) {
            return this.handleError(error, res);
        }
    }
}

export default MessageController;