export interface IMessage {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    mediaUrl?: string;
    createdAt: Date;
    isRead: boolean;
}