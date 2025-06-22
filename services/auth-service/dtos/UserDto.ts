export default class UserDto {
    id: string;
    name: string;
    email?: string;
    phone: string;
    status: "online" | "offline";
    lastSeen: Date;
    profilePic?: string | null;

    constructor(model: any) {
        this.id = model._id.toString();
        this.name = model.name;
        this.phone = model.phone;
        this.email = model.email || undefined;
        this.status = model.status || 'offline';
        this.lastSeen = model.lastSeen;
        this.profilePic = model.profilePic || null;
    }
}