import { Schema, model} from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline',
    },
    lastSeen: {
        type: Date,
    },
    profilePic: {
        type: String,
        default: null, // could be a URL or file path
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default model("User", UserSchema);