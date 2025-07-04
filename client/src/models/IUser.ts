export interface IUser {
    id: string;
    phone: string;
    name: string;
    status: 'online' | 'offline';
}