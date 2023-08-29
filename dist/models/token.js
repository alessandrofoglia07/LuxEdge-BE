import { Schema, model } from 'mongoose';
const tokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        unique: true,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 3600)
    }
});
export default model('Token', tokenSchema);
