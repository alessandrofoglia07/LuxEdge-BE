import { Schema, model, SchemaTypes } from 'mongoose';
import { IProductDocument, IReviewDocument } from '../types.js';

const ProductSchema = new Schema<IProductDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true
        },
        imagePath: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        sold: {
            type: Number,
            required: true,
            default: 0
        },
        available: {
            type: Boolean,
            required: true,
            default: true
        },
        reviews: {
            type: [SchemaTypes.ObjectId],
            ref: 'Review',
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

ProductSchema.virtual('rating').get(async function () {
    if (this.reviews.length === 0) return 0;

    const reviews = this.reviews as unknown as IReviewDocument[];

    const totalRating = reviews.reduce((acc, review) => {
        const reviewDocument = review;

        return acc + reviewDocument.rating;
    }, 0);

    const avgRating = totalRating / this.reviews.length;

    return Math.round(avgRating * 10) / 10;
});

export default model<IProductDocument>('Product', ProductSchema);
