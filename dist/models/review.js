import { Schema, model, SchemaTypes } from 'mongoose';
const ReviewSchema = new Schema({
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
}, { timestamps: true });
export default model('Review', ReviewSchema);
