import { Schema, model } from 'mongoose';
import { IUserDocument } from '../types.js';

const UserSchema = new Schema<IUserDocument>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        type: [Schema.Types.ObjectId],
        ref: "Product",
    },
    favorites: {
        type: [Schema.Types.ObjectId],
        ref: "Product",
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default model<IUserDocument>("User", UserSchema);