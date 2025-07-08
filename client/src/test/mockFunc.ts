import {mockChats} from "./mockData.ts";
import chatStore from '../store/chatStore';
import type { IChat} from "../models/Chat.ts";
import type { IMessage } from "../models/Message.ts";

export const fetchChats = async (): Promise<void> => {
    try {
        // Simulate API call
        const response = await new Promise<IChat[]>((resolve) => {
            setTimeout(() => resolve(mockChats), 500);
        });

        // Set in store
        chatStore.setChats(response);

    } catch (error) {
        console.error('Failed to fetch chats:', error);
    }
};
