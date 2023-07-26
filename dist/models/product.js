import { Schema, model } from 'mongoose';
const ProductSchema = new Schema({
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
export default model("Product", ProductSchema);
