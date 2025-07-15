import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ChatService from "../services/chat.service";
import ApiError from "../errors/ApiError";
import {IChat, IChatCreate} from "../types/types";


class ChatController {
    /**
     * @route POST /api/chats/user-chats
     * @desc Get all chats for a specific user (user ID sent in request body)
     * @access Private
     * @body { userId: string }
     */
    async getUsersChats(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.body;

            // Validate userId exists in request body
            if (!userId) {
                throw new ApiError(400, 'User ID is required in request body');
            }

            // Validate userId is a valid MongoDB ObjectId
            if (!Types.ObjectId.isValid(userId)) {
                throw new ApiError(400, 'Invalid user ID format');
            }

            const chats = await ChatService.getUsersChats(new Types.ObjectId(userId));

            return res.status(200).json(chats);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Error fetching user chats:', error);
            return res.status(500).json({ error: 'Failed to fetch user chats' });
        }
    }
    /**
     * @route GET /api/chats/:chatId
     * @desc Get a specific chat by ID
     * @access Private
     * @param chatId - The ID of the chat to retrieve
     * @returns The chat document
     */
    async getChat(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId } = req.params;

            // Validate chatId is a valid MongoDB ObjectId
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            const chat = await ChatService.getChat(new Types.ObjectId(chatId));

            if (!chat) {
                throw ApiError.notFound('Chat not found');
            }

            return res.status(200).json(chat);
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error fetching chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while fetching chat'
            });
        }
    }

    async getMembers(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId } = req.params;

            // Validate chatId is a valid MongoDB ObjectId
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            const members = await ChatService.getMembers(new Types.ObjectId(chatId));

            return res.status(200).json({
                success: true,
                data: members
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error(`Error fetching members for chat ${req.params.chatId}:`, error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch chat members'
            });
        }
    }
    /**
     * @route POST /api/chats
     * @desc Create a new chat
     * @access Private
     * @body { name?: string, type: 'private'|'group', participants: string[], avatar?: string, description?: string }
     * @returns The created chat document
     */
    async createChat(req: Request, res: Response): Promise<Response> {
        try {
            const { name, type, participants, avatar, description } = req.body;

            // Convert string IDs to ObjectIds
            const participantIds = participants.map((id: string) => new Types.ObjectId(id));

            const chatData: IChatCreate = {
                name,
                type,
                participants: participantIds,
                avatar,
                description
            };

            const newChat = await ChatService.createChat(chatData);

            return res.status(201).json({
                success: true,
                data: newChat
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error creating chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create chat'
            });
        }
    }

}

export default new ChatController();

