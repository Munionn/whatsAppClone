import { model, Schema } from 'mongoose';

const TokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
});

export default model('Token', TokenSchema);