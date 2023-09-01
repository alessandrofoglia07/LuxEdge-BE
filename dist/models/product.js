import { Schema, model, SchemaTypes } from 'mongoose';
const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true,
        default: []
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
}, { timestamps: true });
export default model('Product', ProductSchema);
