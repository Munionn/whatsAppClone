import ChatMember from "../models/ChatMember";
import Chat from "../models/Chat";
import mongoose, {Types} from "mongoose";
import {IChat, IChatCreate, IChatMember} from "../types/types";




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
    async createChat(chat: IChatCreate): Promise<IChat> {
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
                admins: chat.admins || [chat.participants[0]],
                avatar: chat.avatar,
                description: chat.description,
                unreadCounts: {} // Initialize empty unread counts
            });


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
    // patch methods

    async updateChatDate(chatId: Types.ObjectId, chatInfo: Partial<IChat>): Promise<IChat> {
        try {
            const updateChat = await Chat.findByIdAndUpdate(
                chatId,
                {
                    $set: {
                        ...chatInfo,
                        updatedAt: new Date() // Always update the timestamp
                    }
                },
                {
                    new: true, // Return the updated document
                    runValidators: true // Run schema validators on update
                }
            )
                .populate('participants', 'username profilePic status')
                .populate('lastMessage');

            if (!updateChat) {
                throw new Error('Chat not found');
            }

            return updateChat.toObject();
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new Error('Invalid chat ID format');
            }
            if (error instanceof mongoose.Error.ValidationError) {
                throw new Error(`Validation error: ${error.message}`);
            }
            throw new Error("Failed to update chat's date");
        }
    }

    // update chat member
    async updateChatMembers(
        chatId: Types.ObjectId,
        userId: Types.ObjectId, // The user making the request
        updateData: {
            addMembers?: Types.ObjectId[];
            removeMembers?: Types.ObjectId[];
            newAdmins?: Types.ObjectId[];
            removeAdmins?: Types.ObjectId[];
        }
    ): Promise<IChat> {
        try {

            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error('Chat not found');
            }


            if (!chat.admins?.some(adminId => adminId.equals(userId))) {
                throw new Error('Only admins can update chat members');
            }


            const updateOps: any = { updatedAt: new Date() };

            if (updateData.addMembers?.length) {
                updateOps.$addToSet = { participants: { $each: updateData.addMembers } };
            }

            if (updateData.removeMembers?.length) {
                updateOps.$pullAll = { participants: updateData.removeMembers };
                // Also remove from admins if they were admins
                updateOps.$pullAll = { ...updateOps.$pullAll, admins: updateData.removeMembers };
            }

            if (updateData.newAdmins?.length) {
                updateOps.$addToSet = { admins: { $each: updateData.newAdmins } };
            }

            if (updateData.removeAdmins?.length) {
                updateOps.$pullAll = { admins: updateData.removeAdmins };
            }

            // 3. Perform the update
            const updatedChat = await Chat.findByIdAndUpdate(
                chatId,
                updateOps,
                { new: true, runValidators: true }
            ).populate('participants', 'username profilePic status');

            if (!updatedChat) {
                throw new Error('Failed to update chat members');
            }

            return updatedChat;
        } catch (error) {
            if (error instanceof Error) throw error;
            throw new Error('Error updating chat members');
        }
    }

    // delete

    async deleteChat(chatId: Types.ObjectId): Promise<IChat> {
        try {
            const deletedChat  = await Chat.findByIdAndDelete({_id: chatId})
            await ChatMember.deleteMany({chatId})
            return deletedChat;
        }
        catch (error) {
            throw  new Error('Failed to delete chat');
        }
    }

    async deleteMembers(
        chatId: Types.ObjectId,
        userIds: Types.ObjectId[]
    ): Promise<IChat> {
        try {

            const chat = await Chat.findById(chatId);
            if (!chat) {
                throw new Error('Chat not found');
            }


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
                .populate('lastMessage');

            if (!updatedChat) {
                throw new Error('Failed to remove members from chat');
            }

            return updatedChat;
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                throw new Error('Invalid chat or user ID format');
            }
            throw error; // Re-throw other errors
        }
    }

}


export default new ChatService();