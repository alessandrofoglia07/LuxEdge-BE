import { Schema, model, SchemaTypes } from 'mongoose';
import { IReviewDocument } from '../types.js';

const ReviewSchema = new Schema<IReviewDocument>(
    {
        productId: {
            type: SchemaTypes.ObjectId,
            ref: 'Product',
            required: true
        },
        user: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: {
            type: String,
            required: true,
            minlength: 20,
            maxlength: 500,
            default: '',
            trim: true
        }
    },
    { timestamps: true }
);

export default model<IReviewDocument>('Review', ReviewSchema);
