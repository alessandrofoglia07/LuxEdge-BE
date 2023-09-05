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
}, { timestamps: true });
export default model('Review', ReviewSchema);
