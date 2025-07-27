export interface IMessage {
    _id: string;
    chatId: string;
    senderId: string;
    content: string;
    mediaUrl?: string;
    createdAt: string;
    updatedAt?: string;
    isRead: boolean;
    readBy?: string[];
    formattedTime?: string;
}