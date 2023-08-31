import { Schema, model, SchemaTypes } from 'mongoose';
import { IReviewDocument } from '../types.js';

const ReviewSchema = new Schema<IReviewDocument>(
    {
        productId: {
            type: SchemaTypes.ObjectId,
            ref: 'Product',
            required: true
        },
        userId: {
            type: SchemaTypes.ObjectId,
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
