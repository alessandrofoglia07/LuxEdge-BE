import { Schema, model } from 'mongoose';
import { IProductDocument } from '../types.js';

const ProductSchema = new Schema<IProductDocument>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
    },
    imagePath: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    }
}, { timestamps: true });

export default model<IProductDocument>("Product", ProductSchema);