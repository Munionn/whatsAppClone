import { makeAutoObservable, runInAction } from "mobx";
import api from "../service/api.ts";
import type { IChat } from "../models/Chat";
import type { IMessage } from "../models/Message";
// import { authStore } from "./authStore";

class ChatStore {
    chats: Map<string, IChat> = new Map();
    selectedChatId: string | null = null;
    messages: IMessage[] = [];
    isLoading: boolean = false;
    error: Error | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // Fetch all chats for the current user
    fetchChats = async () => {
        this.isLoading = true;
        this.error = null;

        try {
            const userJson = localStorage.getItem("user");
            if (!userJson) {
                throw new Error("User not found in localStorage");
            }

            const user = JSON.parse(userJson);

            const response = await api.get("/main/chats", {
                params: {
                    userId: user.id,
                },
            });

            runInAction(() => {
                this.setChats(response.data as IChat[]);
            });
        } catch (err) {
            runInAction(() => {
                this.error = err as Error;
            });
            console.error("Failed to fetch chats:", err);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };

    // Set chats into the map
    setChats(chats: IChat[]) {
        chats.forEach((chat: IChat) => {
            const chatId = chat._id;
            if (!chatId) {
                console.error("Chat missing _id", chat);
                return;
            }
            this.chats.set(chatId, chat);
        });
    }

    // Select a chat
    selectChat(chatId: string) {
        runInAction(() => {
            this.selectedChatId = chatId;
        });
    }

    // Get selected chat
    get selectedChat(): IChat | undefined {
        return this.chats.get(this.selectedChatId || "");
    }

    // Get list of chats as array
    get chatList(): IChat[] {
        return Array.from(this.chats.values());
    }

    // Fetch messages for selected chat
    fetchMessages = async (): Promise<IMessage[]> => {
        if (!this.selectedChatId) {
            console.warn("No chat selected to fetch messages");
            return [];
        }

        try {
            const response = await api.get(`/main/messages/${this.selectedChatId}`);
            const fetchedMessages = response.data || [];

            runInAction(() => {
                this.messages = fetchedMessages as IMessage[];
            });

            return fetchedMessages as IMessage[];
        } catch (err) {
            console.error("Failed to fetch messages:", err);
            runInAction(() => {
                this.messages = [];
            });
            return [];
        }
    }

    // Add a new message to store
    addMessage(message: IMessage) {
        runInAction(() => {
            this.messages.push(message);
        });
    }

    // Reset messages when chat changes
    resetMessages() {
        runInAction(() => {
            this.messages = [];
        });
    }

    // Utility: Get messages for selected chat
    get messageList(): IMessage[] {
        return this.messages;
    }

    // Update lastMessage for chat
    updateLastMessage(chatId: string, message: IMessage) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.lastMessage = message;
            this.chats.set(chatId, chat);
        }
    }

    // Increase unread count
    increaseUnreadMessage(chatId: string) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.unread = (chat.unread || 0) + 1;
            this.chats.set(chatId, chat);
        }
    }

    // Reset unread count
    resetUnreadMessage(chatId: string) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.unread = 0;
            this.chats.set(chatId, chat);
        }
    }
}

const chatStore = new ChatStore();
export default chatStore;