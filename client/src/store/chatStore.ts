import { makeAutoObservable, runInAction} from "mobx";
import api from "../service/api.ts";
import type {IChat} from "../models/Chat.ts";
import type {IMessage} from "../models/Message.ts";
import {authStore} from "./authStore.ts";

class ChatStore {
    chats: Map<string, IChat> = new Map<string, IChat>();
    selectedChatId: string | null = null;
    isLoading: boolean = false;
    error: Error | null = null;
    constructor() {
        makeAutoObservable(this);
    }

    fetchChats = async () => {
        this.isLoading = true;
        this.error = null;

        try {
            const userJson = localStorage.getItem('user');
            if (!userJson) {
                throw new Error('User not found in localStorage');
            }

            const user = JSON.parse(userJson);

            const response = await api.get('/main/chats', {
                params: {
                    userId: user.id,
                }
            });

            runInAction(() => {
                this.setChats(response.data);
            });
        } catch (err) {
            runInAction(() => {
                this.error = err as Error;
            });
            console.error('Failed to fetch chats:', err);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };


    setChats(chats: IChat[]) {
        chats.forEach((chat: IChat) => {
            this.chats.set(chat.id, chat);
        })
    }

    addChat(chat: IChat) {
        this.chats.set(chat.id, chat);
    }

    updateLastMessage(chatId: string, message: IMessage) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.lastMessage = message;
            this.chats.set(chatId, chat);
        }
    }

    increaseUnreadMessage(chatId: string) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.unread ++;
            this.chats.set(chatId, chat);
        }
    }

    resetUnreadMessage(chatId: string) {
        const chat = this.chats.get(chatId);
        if (chat) {
            chat.unread = 0;
            this.chats.set(chatId, chat);
        }
    }

    selectChat(chatId: string) {
        this.selectedChatId = chatId;
    }

    get selectedChat(): IChat | undefined {
        return this.chats.get(this.selectedChatId || "");
    }

    get chatList(): IChat[] {
        return Array.from(this.chats.values());
    }

    removeChat(chat: IChat) {
        this.chats.delete(chat.id);
    }

}

const chatStore = new ChatStore();

export default chatStore;