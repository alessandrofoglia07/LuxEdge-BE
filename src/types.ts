import { Request } from 'express';
import mongoose, { ObjectId, Document } from 'mongoose';

export const toObjectId = (str: string): mongoose.Types.ObjectId => new mongoose.Types.ObjectId(str);

export interface IUserDocument extends Document {
    email: string;
    username: string;
    password: string;
    cart: ObjectId[];
    favorites: ObjectId[];
    role: 'user' | 'admin';
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProductDocument extends Document {
    name: string;
    description: string;
    price: number;
    imagePath: string;
    tags: string[];
    sold: number;
    available: boolean;
    reviews: ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IReviewDocument extends Document {
    productId: ObjectId;
    userId: ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthRequest extends Request {
    user?: IUserDocument;
}

export interface ITokenDocument extends Document {
    userId: ObjectId;
    token: string;
}
