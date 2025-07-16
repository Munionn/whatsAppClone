import ChatMember from "../models/ChatMember";
import Chat from "../models/Chat";
import mongoose, { Types } from "mongoose";
import { IChat, IChatCreate, IChatMember } from "../types/types";
import ApiError from "../errors/ApiError";

class ChatService {
    // GET METHODS
    async getUsersChats(userId: Types.ObjectId): Promise<IChat[]> {
        try {
            console.log("Fetching chats for userId:", userId); // Debug

            if (!(userId instanceof Types.ObjectId)) {
                throw new ApiError(400, 'userId must be a valid ObjectId');
            }

            const userChats = await Chat.find({ participants: userId })
                .lean();

            console.log("Found chats:", userChats); // Debug

            return userChats;
        } catch (error) {
            console.error("Error in getUsersChats:", error); // Log the real error
            throw new ApiError(500, 'Failed to fetch user chats');
        }
    }

    async getChat(chatId: Types.ObjectId): Promise<IChat> {
        try {
            const chat = await Chat.findById(chatId)
                .populate('participants', 'username profilePic status')
                .populate('lastMessage')
                .lean();

            if (!chat) {
                throw new ApiError(404, 'Chat not found');
            }
            return chat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid chat ID format');
            }
            throw new ApiError(500, 'Failed to fetch chat');
        }
    }

    async getMembers(chatId: Types.ObjectId): Promise<IChatMember[]> {
        try {
            const members = await ChatMember.find({ chatId })
                .populate('userId', 'username profilePic status')
                .lean();
            return members;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid chat ID format');
            }
            throw new ApiError(500, 'Failed to fetch members');
        }
    }

    // POST METHODS
    async createChat(chatData: IChatCreate): Promise<IChat> {
        try {
            // Validate required fields
            if (!chatData.name && chatData.type !== 'private') {
                throw new ApiError(400, 'Chat name is required for group chats');
            }

            if (!chatData.type || !['private', 'group'].includes(chatData.type)) {
                throw new ApiError(400, 'Invalid chat type');
            }

            if (!chatData.participants || chatData.participants.length === 0) {
                throw new ApiError(400, 'At least one participant is required');
            }

            if (chatData.type === 'private' && chatData.participants.length !== 2) {
                throw new ApiError(400, 'Private chats must have exactly 2 participants');
            }

            // Create the chat document
            const newChat = await Chat.create({
                ...chatData,
                admins: chatData.admins || [chatData.participants[0]],
                unreadCounts: {}
            });

            // Create chat member records
            const chatMembers = chatData.participants.map((userId, index) => ({
                userId,
                chatId: newChat._id,
                role: index === 0 ? 'creator' : 'member',
                joinedAt: new Date()
            }));

            await ChatMember.insertMany(chatMembers);

            // Return populated chat
            const populatedChat = await Chat.findById(newChat._id)
                .populate('participants', 'username profilePic status')
                .populate('lastMessage')
                .lean();

            if (!populatedChat) {
                throw new ApiError(500, 'Failed to retrieve created chat');
            }

            return populatedChat;
        } catch (error) {
            throw new ApiError(500, 'Failed to create chat');
        }
    }

    async addMembers(
        chatId: Types.ObjectId,
        userIds: Types.ObjectId[],
        currentUserId: Types.ObjectId,
        role: 'admin' | 'member' = 'member'
    ): Promise<IChat> {
        try {
            // Verify the chat exists
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new ApiError(404, 'Chat not found');
            }

            // Verify current user has permission
            const currentMember = await ChatMember.findOne({
                chatId,
                userId: currentUserId
            });

            if (!currentMember || (currentMember.role !== 'admin' && currentMember.role !== 'creator')) {
                throw new ApiError(403, 'Only admins can add members');
            }

            // Filter out existing members
            const existingMembers = await ChatMember.find({
                chatId,
                userId: { $in: userIds }
            });

            const existingUserIds = existingMembers.map(m => m.userId.toString());
            const newUserIds = userIds.filter(id => !existingUserIds.includes(id.toString()));

            if (newUserIds.length === 0) {
                throw new ApiError(400, 'All users are already members');
            }

            // Add new members
            const newMembers = newUserIds.map(userId => ({
                userId,
                chatId,
                role,
                joinedAt: new Date()
            }));

            await ChatMember.insertMany(newMembers);

            // Update chat
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $addToSet: { participants: { $each: newUserIds } },
                    $set: { updatedAt: new Date() }
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('participants', 'username profilePic status')
                .populate('lastMessage')
                .lean();

            if (!updatedChat) {
                throw new ApiError(500, 'Failed to update chat');
            }

            return updatedChat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid ID format');
            }
            throw new ApiError(500, 'Failed to add members');
        }
    }

    // PATCH METHODS
    async updateChatDate(chatId: Types.ObjectId, updates: Partial<IChat>): Promise<IChat> {
        try {
            const { _id, createdAt, updatedAt, ...safeUpdates } = updates;

            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $set: {
                        ...safeUpdates,
                        updatedAt: new Date()
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('participants', 'username profilePic status')
                .populate('lastMessage')
                .lean();

            if (!updatedChat) {
                throw new ApiError(404, 'Chat not found');
            }

            return updatedChat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid chat ID format');
            }
            if (error instanceof mongoose.Error.ValidationError) {
                throw new ApiError(400, `Validation error: ${error.message}`);
            }
            throw new ApiError(500, "Failed to update chat");
        }
    }

    async updateChatMembers(
        chatId: Types.ObjectId,
        currentUserId: Types.ObjectId,
        updateData: {
            addMembers?: Types.ObjectId[];
            removeMembers?: Types.ObjectId[];
            newAdmins?: Types.ObjectId[];
            removeAdmins?: Types.ObjectId[];
        }
    ): Promise<IChat> {
        try {
            // Verify chat exists
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new ApiError(404, 'Chat not found');
            }

            // Verify current user has permission
            const currentMember = await ChatMember.findOne({
                chatId,
                userId: currentUserId
            });

            if (!currentMember || (currentMember.role !== 'admin' && currentMember.role !== 'creator')) {
                throw new ApiError(403, 'Only admins can update members');
            }

            // Prepare update operations
            const updateOps: Record<string, any> = { updatedAt: new Date() };

            if (updateData.addMembers?.length) {
                updateOps.$addToSet = { participants: { $each: updateData.addMembers } };
            }

            if (updateData.removeMembers?.length) {
                updateOps.$pull = {
                    participants: { $in: updateData.removeMembers },
                    admins: { $in: updateData.removeMembers }
                };
            }

            if (updateData.newAdmins?.length) {
                updateOps.$addToSet = { admins: { $each: updateData.newAdmins } };
            }

            if (updateData.removeAdmins?.length) {
                updateOps.$pull = { admins: { $in: updateData.removeAdmins } };
            }

            // Perform the update
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                updateOps,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('participants', 'username profilePic status')
                .populate('lastMessage')
                .lean();

            if (!updatedChat) {
                throw new ApiError(500, 'Failed to update chat members');
            }

            // Update ChatMember collection
            if (updateData.addMembers?.length) {
                const newMembers = updateData.addMembers.map(userId => ({
                    userId,
                    chatId,
                    role: 'member',
                    joinedAt: new Date()
                }));
                await ChatMember.insertMany(newMembers);
            }

            if (updateData.removeMembers?.length) {
                await ChatMember.deleteMany({
                    chatId,
                    userId: { $in: updateData.removeMembers }
                });
            }

            if (updateData.newAdmins?.length) {
                await ChatMember.updateMany(
                    { chatId, userId: { $in: updateData.newAdmins } },
                    { $set: { role: 'admin' } }
                );
            }

            if (updateData.removeAdmins?.length) {
                await ChatMember.updateMany(
                    { chatId, userId: { $in: updateData.removeAdmins } },
                    { $set: { role: 'member' } }
                );
            }

            return updatedChat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid ID format');
            }
            throw new ApiError(500, 'Failed to update members');
        }
    }

    // DELETE METHODS
    async deleteChat(chatId: Types.ObjectId, currentUserId: Types.ObjectId): Promise<IChat> {
        try {
            // Verify chat exists and user has permission
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new ApiError(404, 'Chat not found');
            }

            const member = await ChatMember.findOne({
                chatId,
                userId: currentUserId
            });

            if (!member || (member.role !== 'admin' && member.role !== 'creator')) {
                throw new ApiError(403, 'Only admins can delete chats');
            }

            // Delete chat and members
            const deletedChat = await Chat.findByIdAndDelete(chatId)
                .populate('participants', 'username profilePic status')
                .lean();

            if (!deletedChat) {
                throw new ApiError(500, 'Failed to delete chat');
            }

            await ChatMember.deleteMany({ chatId });

            return deletedChat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid chat ID format');
            }
            throw new ApiError(500, 'Failed to delete chat');
        }
    }

    async deleteMembers(
        chatId: Types.ObjectId,
        userIds: Types.ObjectId[],
        currentUserId: Types.ObjectId
    ): Promise<IChat> {
        try {
            // Verify chat exists
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new ApiError(404, 'Chat not found');
            }

            // Verify current user has permission
            const currentMember = await ChatMember.findOne({
                chatId,
                userId: currentUserId
            });

            if (!currentMember || (currentMember.role !== 'admin' && currentMember.role !== 'creator')) {
                throw new ApiError(403, 'Only admins can remove members');
            }

            // Prevent self-removal
            if (userIds.some(id => id.equals(currentUserId))) {
                throw new ApiError(400, 'Cannot remove yourself from chat');
            }

            // Update chat document
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $pull: {
                        participants: { $in: userIds },
                        admins: { $in: userIds }
                    },
                    $set: { updatedAt: new Date() }
                },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('participants', 'username profilePic status')
                .populate('lastMessage')
                .lean();

            if (!updatedChat) {
                throw new ApiError(500, 'Failed to update chat');
            }

            // Remove from ChatMember collection
            await ChatMember.deleteMany({
                chatId,
                userId: { $in: userIds }
            });

            return updatedChat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new ApiError(400, 'Invalid ID format');
            }
            throw new ApiError(500, 'Failed to remove members');
        }
    }
}

export default new ChatService();