import type { IChat } from '../models/Chat';

export const mockChats: IChat[] = [
    {
        id: 'chat_001',
        name: 'Alice',
        participants: ['user_001', 'user_002'],
        type: 'private',
        lastMessage: {
            id: 'msg_001',
            chatId: 'chat_001',
            senderId: 'user_002',
            text: 'Hey, how are you?',
            createdAt: new Date('2025-04-05T10:00:00Z'),
            isRead: true,
        },
        unread: 0,
    },
    {
        id: 'chat_002',
        name: 'Bob',
        participants: ['user_001', 'user_003'],
        type: 'private',
        lastMessage: {
            id: 'msg_002',
            chatId: 'chat_002',
            senderId: 'user_003',
            text: 'I’m online!',
            createdAt: new Date('2025-04-05T09:55:00Z'),
            isRead: false,
        },
        unread: 2,
    },
    {
        id: 'chat_003',
        name: 'Family Group',
        participants: ['user_001', 'user_004', 'user_005'],
        type: 'group',
        lastMessage: {
            id: 'msg_003',
            chatId: 'chat_003',
            senderId: 'user_004',
            text: 'Don’t forget mom’s birthday tomorrow.',
            createdAt: new Date('2025-04-05T08:45:00Z'),
            isRead: false,
        },
        unread: 3,
    }
];