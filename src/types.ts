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
    category: string;
    sold: number;
    available: boolean;
    reviews: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    rating: number;
}

export interface IReviewDocument extends Document {
    productId: Types.ObjectId;
    user: Types.ObjectId;
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
    subscribed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type HTMLEmailOptions = {
    user: INewsletterSubscriberDocument;
    text: string;
    imgSrc?: string;
    link?: {
        href: string;
        text: string;
    };
    important?: boolean;
};

export interface NewsletterOptions {
    text: string;
    imgSrc?: string | undefined;
    link?: {
        href: string;
        text: string;
    };
}

export interface IOrderDocument extends Document {
    sessionId: string;
    user: Types.ObjectId;
    products: Types.ObjectId[];
    totalPrice: number;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentType: 'card' | 'paypal';
    createdAt: Date;
    updatedAt: Date;
}
