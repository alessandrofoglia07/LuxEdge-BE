import { Request } from 'express';
import { Types, Document } from 'mongoose';

export interface IUserDocument extends Document {
    email: string;
    username: string;
    password: string;
    cart: Types.ObjectId[];
    favorites: Types.ObjectId[];
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
    reviews: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IReviewDocument extends Document {
    productId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthRequest extends Request {
    user?: IUserDocument;
}

export interface ITokenDocument extends Document {
    userId: Types.ObjectId;
    token: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface INewsletterSubscriberDocument extends Document {
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export type HTMLEmailOptions = {
    user: IUserDocument;
    text: string;
    imgSrc?: string;
    link?: {
        href: string;
        text: string;
    };
};
