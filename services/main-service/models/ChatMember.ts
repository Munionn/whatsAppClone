import {Schema, model} from "mongoose";
import { IChatMember} from "../types/types";

const ChatMemberSchema = new Schema<IChatMember>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
    lastReadMessageId: { type: Schema.Types.ObjectId, ref: "Message", default: null },
});

export default model('ChatMember',ChatMemberSchema);