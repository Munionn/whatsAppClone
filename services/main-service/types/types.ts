import { Types } from 'mongoose';

// Base Document interface for MongoDB documents
interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

export interface User extends BaseDocument {
  username: string;
  email: string;
  profilePic?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  socketIds?: string[]; // Track multiple socket connections
  chats?: Types.ObjectId[]; // Reference to Chat documents
}

export interface IMessage extends BaseDocument {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  isRead: boolean;
  readBy?: Types.ObjectId[]; // Array of user IDs who read the message
  replyTo?: Types.ObjectId; // Reference to another message
  editedAt?: Date;
  metadata?: {
    fileSize?: number;
    fileName?: string;
    duration?: number; // For audio/video
    thumbnail?: string; // For images/video
  };
}

export interface IChat extends BaseDocument {
  name: string;
  type: 'private' | 'group';
  participants: Types.ObjectId[]; // Reference to User documents
  lastMessage?: Types.ObjectId; // Reference to Message document
  unreadCounts?: Record<string, number>; // Map of userId to unread count
  admins?: Types.ObjectId[]; // Reference to User documents
  avatar?: string;
  description?: string;
}

export interface IChatMember extends BaseDocument {
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  role: 'admin' | 'member' | 'creator';
  joinedAt: Date;
  lastReadMessageId?: Types.ObjectId;
  mutedUntil?: Date;
  customSettings?: {
    notification: 'all' | 'mentions' | 'none';
  };
}

// Socket-related interfaces
export interface SocketUser {
  userId: Types.ObjectId;
  socketId: string;
  username: string;
  lastActive: Date;
}

export interface TypingEvent {
  chatId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  isTyping: boolean;
}

export interface MessageEvent {
  message: IMessage;
  chatId: Types.ObjectId | string;
}

export interface UserStatusEvent {
  userId: Types.ObjectId | string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export interface ChatInviteEvent {
  chatId: Types.ObjectId | string;
  invitedUserId: Types.ObjectId | string;
  invitedBy: Types.ObjectId | string;
}

// Socket.IO Events
export interface ServerToClientEvents {
  message: (data: MessageEvent) => void;
  messageUpdated: (data: { message: IMessage; chatId: string }) => void;
  messageDeleted: (data: { messageId: string; chatId: string }) => void;
  userStatus: (data: UserStatusEvent) => void;
  typing: (data: TypingEvent) => void;
  chatInvite: (data: ChatInviteEvent) => void;
  userJoined: (data: { userId: string; chatId: string }) => void;
  userLeft: (data: { userId: string; chatId: string }) => void;
  chatUpdated: (data: { chatId: string; updates: Partial<IChat> }) => void;
}

export interface ClientToServerEvents {
  joinChat: (chatId: string, callback?: (success: boolean) => void) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: {
    chatId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    replyTo?: string;
  }, callback?: (message: IMessage | null, error?: Error) => void) => void;
  typing: (data: TypingEvent) => void;
  markAsRead: (data: { messageId: string; chatId: string }) => void;
  editMessage: (data: { messageId: string; content: string }, callback?: (success: boolean) => void) => void;
  deleteMessage: (data: { messageId: string; chatId: string }, callback?: (success: boolean) => void) => void;
}

// Additional utility types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  page: number;
  hasNext: boolean;
}

export type UserPreview = Pick<User, '_id' | 'username' | 'profilePic' | 'status'>;
export type MessagePreview = Pick<IMessage, '_id' | 'content' | 'type' | 'senderId' | 'createdAt'>;
export type ChatPreview = Pick<IChat, '_id' | 'name' | 'type' | 'lastMessage'> & {
  unreadCount?: number;
};