import { Schema, model } from 'mongoose';
import { IReviewDocument } from '../types.js';

const ReviewSchema = new Schema<IReviewDocument>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true,
            default: ''
        }
    },
    { timestamps: true }
);

export default model<IReviewDocument>('Review', ReviewSchema);
