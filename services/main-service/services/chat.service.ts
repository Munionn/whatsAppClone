import ChatMember from "../models/ChatMember";
import Chat from "../models/Chat";
import {Types} from "mongoose";
import {IChat, IChatMember} from "../types/types";

class ChatService {

    // get
    async getUsersChats(userId: Types.ObjectId): Promise<IChat[]> {
        try{
            const userChats: IChat[] = await Chat.find({where: {parciticipants: userId}})
            return userChats;
        }
        catch (error) {
            throw new Error(error);
        }
    }

    async getChat(chatId: Types.ObjectId): Promise<IChat> {
        try{
            const chat = await Chat.findOne({where:{ _id : chatId}})
            return chat;
        }
        catch(err){
            throw new Error(`${chatId} does not exist`);
        }
    }

    async getMembers(chatId: Types.ObjectId): Promise<IChatMember[]> {
        try {
            const membersOfTheChat: IChatMember[] = await ChatMember.find({where:  { chatId}})
            return membersOfTheChat;
        }
        catch (error) {
            throw new Error(`${chatId} does not exist`);
        }
    }

    // post
    // create chat
    async createChat(chat: IChat): Promise<IChat> {
        try {
            // Validate required fields
            if (!chat.name && chat.type !== 'private') {
                throw new Error('Chat name is required for group chats');
            }

            if (!chat.type || !['private', 'group'].includes(chat.type)) {
                throw new Error('Invalid chat type');
            }

            if (!chat.participants || chat.participants.length === 0) {
                throw new Error('At least one participant is required');
            }


            if (chat.type === 'private' && chat.participants.length !== 2) {
                throw new Error('Private chats must have exactly 2 participants');
            }

            // Create the chat document
            const newChat = await Chat.create({
                name: chat.name,
                type: chat.type,
                participants: chat.participants,
                admins: chat.admins || [chat.participants[0]], // First participant is admin by default
                avatar: chat.avatar,
                description: chat.description,
                unreadCounts: {} // Initialize empty unread counts
            });

            // Create chat member records for all participants
            const chatMembers = chat.participants.map((userId, index) => ({
                userId,
                chatId: newChat._id,
                role: index === 0 ? 'creator' : 'member', // First participant is creator
                joinedAt: new Date()
            }));

            await ChatMember.insertMany(chatMembers);

            return newChat.toObject();
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to create chat');
        }
    }

    async addMembers(
        chatId: Types.ObjectId,
        userIds: Types.ObjectId[],
        currentUserId: Types.ObjectId,
        role: 'admin' | 'member' = 'member'
    ): Promise<IChat> {
        try {
            // 1. Verify the chat exists
            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error(`Chat ${chatId} does not exist`);
            }

            // 2. Verify current user has permission to add members (is admin/creator)
            const currentMember = await ChatMember.findOne({
                chatId,
                userId: currentUserId
            });

            if (!currentMember || (currentMember.role !== 'admin' && currentMember.role !== 'creator')) {
                throw new Error('You do not have permission to add members');
            }

            // 3. Filter out existing members
            const existingMembers = await ChatMember.find({
                chatId,
                userId: { $in: userIds }
            });

            const existingUserIds = existingMembers.map(m => m.userId.toString());
            const newUserIds = userIds.filter(id =>
                !existingUserIds.includes(id.toString())
            );

            if (newUserIds.length === 0) {
                throw new Error('All users are already members of this chat');
            }

            // 4. Add new members
            const newMembers = newUserIds.map(userId => ({
                userId,
                chatId,
                role,
                joinedAt: new Date()
            }));

            await ChatMember.insertMany(newMembers);

            // 5. Update chat participants list
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $addToSet: { participants: { $each: newUserIds } },
                    $set: { updatedAt: new Date() }
                },
                { new: true }
            ).populate('participants', 'username profilePic status');

            if (!updatedChat) {
                throw new Error('Failed to update chat');
            }

            return updatedChat.toObject();
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to add members');
        }
    }
}


export default new ChatService();