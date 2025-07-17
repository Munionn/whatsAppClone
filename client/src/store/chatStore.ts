import { makeAutoObservable, runInAction} from "mobx";
import api from "../service/api.ts";
import type {IChat} from "../models/Chat.ts";
import type {IMessage} from "../models/Message.ts";


class ChatStore {
    chats: Map<string, IChat> = new Map<string, IChat>();
    selectedChatId: string | null = null;
    messages: IMessage[] = [];
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
                this.setChats(response.data as IChat[]);
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

    // message function
    fetchMessages = async () => {
        try{
            const response = await api.get(`/messages/${this.selectedChatId}`)
            this.messages = response.data as IMessage[];
            return this.messages;
        }
        catch(err){
            throw err as Error;
        }
    }

    setMessages = async (data: IMessage[]) => {
        this.messages = data;
    }

    addMessage(message: IMessage) {
        runInAction(() => {
            this.messages.push(message);
        });
    }

    // -----------------------------------
    setChats(chats: IChat[]) {
        chats.forEach((chat: IChat) => {
            const chatId =  chat._id;
            if (!chatId) {
                console.error("Chat missing id or _id", chat);
                return;
            }
            this.chats.set(chatId, chat);
        });
    }

    addChat(chat: IChat) {
        this.chats.set(chat._id, chat);
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
        if (!this.selectedChatId) return undefined;
        return this.chats.get(this.selectedChatId);
    }

    get chatList(): IChat[] {
        return Array.from(this.chats.values());
    }

    removeChat(chat: IChat) {
        this.chats.delete(chat._id);
    }

}

const chatStore = new ChatStore();

export default chatStore;