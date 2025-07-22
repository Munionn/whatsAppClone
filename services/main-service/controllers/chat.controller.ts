import { Request, Response } from 'express';
import { Types } from 'mongoose';
import ChatService from "../services/chat.service";
import ApiError from "../errors/ApiError";
import { IChat, IChatCreate } from "../types/types";

class ChatController {
    /**
     * @route POST /api/chats/user-chats
     * @desc Get all chats for a specific user (user ID sent in request body)
     * @access Private
     * @body { userId: string }
     */
    async getUsersChats(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.query;

            // Ensure userId is a string
            if (!userId || typeof userId !== 'string') {
                throw new ApiError(400, 'User ID is required in query parameters');
            }

            // Validate ObjectId format
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

    /**
     * @route POST /api/chats/:chatId/members
     * @desc Add members to a chat
     * @access Private
     * @param chatId - Chat ID
     * @body { userIds: string[], role?: 'admin'|'member' }
     * @returns Updated chat document
     */
    async addMembers(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId } = req.params;
            const { userId ,userIds, role } = req.body;


            // Validate inputs
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            if (!userIds || !Array.isArray(userIds)) {
                throw ApiError.badRequest('userIds must be an array');
            }

            const validUserIds = userIds.map(id => {
                if (!Types.ObjectId.isValid(id)) {
                    throw ApiError.badRequest(`Invalid user ID format: ${id}`);
                }
                return new Types.ObjectId(id);
            });

            const updatedChat = await ChatService.addMembers(
                new Types.ObjectId(chatId),
                validUserIds,
                new Types.ObjectId(userId),
                role
            );

            return res.status(200).json({
                success: true,
                data: updatedChat
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error adding members:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to add members'
            });
        }
    }

    /**
     * @route PATCH /main/chats/update
     * @desc Update chat information (including last activity date)
     * @access Private
     * @body { chatId: string, updates: Partial<IChat> }
     * @returns Updated chat document
     */
    async updateChatDate(req: Request, res: Response): Promise<Response> {
        try {
            const { chatId, updates } = req.body;

            // Validate required fields
            if (!chatId) {
                throw ApiError.badRequest('chatId is required in request body');
            }

            if (!updates || typeof updates !== 'object') {
                throw ApiError.badRequest('updates object is required');
            }

            // Validate ObjectId format
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            const updatedChat = await ChatService.updateChatDate(
                new Types.ObjectId(chatId),
                updates
            );

            return res.status(200).json({
                success: true,
                data: updatedChat
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error updating chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update chat'
            });
        }
    }

    /**
     * @route PATCH /api/chats/members
     * @desc Update chat members (add/remove members or admins)
     * @access Private
     * @body {
     *   chatId: string,
     *   addMembers?: string[],
     *   removeMembers?: string[],
     *   newAdmins?: string[],
     *   removeAdmins?: string[]
     * }
     * @returns Updated chat document
     */
    async updateChatMembers(req: Request, res: Response): Promise<Response> {
        try {
            const { userId ,chatId, addMembers, removeMembers, newAdmins, removeAdmins } = req.body;


            // Validate required fields
            if (!chatId) {
                throw ApiError.badRequest('chatId is required');
            }

            // Validate ObjectId formats
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            // Convert string arrays to ObjectId arrays
            const toObjectIds = (ids?: string[]) =>
                ids?.map(id => {
                    if (!Types.ObjectId.isValid(id)) {
                        throw ApiError.badRequest(`Invalid ID format: ${id}`);
                    }
                    return new Types.ObjectId(id);
                });

            const updateData = {
                addMembers: toObjectIds(addMembers),
                removeMembers: toObjectIds(removeMembers),
                newAdmins: toObjectIds(newAdmins),
                removeAdmins: toObjectIds(removeAdmins)
            };

            // Verify at least one operation is being performed
            if (!updateData.addMembers?.length &&
                !updateData.removeMembers?.length &&
                !updateData.newAdmins?.length &&
                !updateData.removeAdmins?.length) {
                throw ApiError.badRequest('At least one update operation is required');
            }

            const updatedChat = await ChatService.updateChatMembers(
                new Types.ObjectId(chatId),
                new Types.ObjectId(userId),
                updateData
            );

            return res.status(200).json({
                success: true,
                data: updatedChat
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error updating chat members:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update chat members'
            });
        }
    }

    /**
     * @route DELETE /api/chats
     * @desc Delete a chat and all its members
     * @access Private
     * @body { chatId: string }
     * @returns The deleted chat document
     */
    async deleteChat(req: Request, res: Response): Promise<Response> {
        try {
            const {userId, chatId } = req.body;


            // Validate required fields
            if (!chatId) {
                throw ApiError.badRequest('chatId is required');
            }

            // Validate ObjectId format
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            const deletedChat = await ChatService.deleteChat(
                new Types.ObjectId(chatId),
                new Types.ObjectId(userId)
            );

            return res.status(200).json({
                success: true,
                data: deletedChat
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error deleting chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete chat'
            });
        }
    }

    /**
     * @route DELETE /api/chats/members
     * @desc Remove members from a chat
     * @access Private
     * @body { chatId: string, userIds: string[] }
     * @returns Updated chat document
     */
    async deleteMembers(req: Request, res: Response): Promise<Response> {
        try {
            const { userId ,chatId, userIds } = req.body;


            if (!chatId) {
                throw ApiError.badRequest('chatId is required');
            }

            if (!userIds || !Array.isArray(userIds)) {
                throw ApiError.badRequest('userIds must be an array');
            }

            if (userIds.length === 0) {
                throw ApiError.badRequest('At least one user ID is required');
            }

            // Validate ObjectId formats
            if (!Types.ObjectId.isValid(chatId)) {
                throw ApiError.badRequest('Invalid chat ID format');
            }

            const invalidUserIds = userIds.filter(id => !Types.ObjectId.isValid(id));
            if (invalidUserIds.length > 0) {
                throw ApiError.badRequest(`Invalid user ID format: ${invalidUserIds.join(', ')}`);
            }

            const updatedChat = await ChatService.deleteMembers(
                new Types.ObjectId(chatId),
                userIds.map(id => new Types.ObjectId(id)),
                new Types.ObjectId(userId),

            );

            return res.status(200).json({
                success: true,
                data: updatedChat
            });
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            console.error('Error removing members:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to remove members'
            });
        }
    }
}

export default new ChatController();