import { Schema, model, SchemaTypes } from 'mongoose';
import { IUserDocument } from '../types.js';

const UserSchema = new Schema<IUserDocument>(
    {
        username: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 20,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            maxlength: 320,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 16
        },
        cart: {
            type: [SchemaTypes.ObjectId],
            ref: 'Product'
        },
        favorites: {
            type: [SchemaTypes.ObjectId],
            ref: 'Product'
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
    },
    { timestamps: true }
);

export default model<IUserDocument>('User', UserSchema);
