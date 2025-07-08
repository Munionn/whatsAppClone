import type {IMessage} from "./Message.ts";

export interface IChat {
    id: string;
    name: string;
    participants: string[];
    type: 'private' | 'group';
    lastMessage?: IMessage;
    avatar?: string;
    unread: number;
}