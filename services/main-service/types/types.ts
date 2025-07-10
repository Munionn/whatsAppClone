export interface User {
  id: string;
  username: string;
  email: string;
  profilePIc?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  timestamp: Date;
  isRead: boolean;
  replyTo?: string; // ID of the message being replied to
  editedAt?: Date;
}

export interface Chat {
  id: string;
  name: string;
  type: 'private' | 'group';
  participants: string[]; // User IDs
  lastMessage?: IMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}



export interface ChatMember {
  userId: string;
  chatId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastReadMessageId?: string;
}


export interface SocketUser {
  userId: string;
  socketId: string;
  username: string;
}

export interface TypingEvent {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageEvent {
  message: IMessage;
  chatId: string;
}

export interface UserStatusEvent {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

export interface ChatInviteEvent {
  chatId: string;
  invitedUserId: string;
  invitedBy: string;
}

export interface ServerToClientEvents {
  message: (data: MessageEvent) => void;
  userStatus: (data: UserStatusEvent) => void;
  typing: (data: TypingEvent) => void;
  chatInvite: (data: ChatInviteEvent) => void;
  userJoined: (userId: string) => void;
  userLeft: (userId: string) => void;
}

export interface ClientToServerEvents {
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: { chatId: string; content: string; type: 'text' | 'image' | 'file' | 'audio' | 'video' }) => void;
  typing: (data: TypingEvent) => void;
  markAsRead: (messageId: string) => void;
  editMessage: (data: { messageId: string; content: string }) => void;
  deleteMessage: (messageId: string) => void;
} 