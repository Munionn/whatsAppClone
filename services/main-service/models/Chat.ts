import {Schema, model} from "mongoose";
import {IChat} from "../types/types";

const ChatSchema = new Schema<IChat>(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ["private", "group"], required: true },
        participants: [
            { type: Schema.Types.ObjectId, ref: "User", required: true }
        ],
        lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
        unreadCounts: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default model<IChat>("Chat", ChatSchema);