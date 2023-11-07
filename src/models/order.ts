import { Schema, model, SchemaTypes } from 'mongoose';
import { IOrderDocument } from '../types.js';

const OrderSchema = new Schema<IOrderDocument>(
    {
        sessionId: {
            type: String,
            required: true
        },
        user: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true
        },
        products: {
            type: [SchemaTypes.ObjectId],
            ref: 'Product'
        },
        totalPrice: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        paymentType: {
            type: String,
            required: true,
            enum: ['card', 'paypal'],
            default: 'card'
        }
    },
    { timestamps: true }
);

export default model<IOrderDocument>('Order', OrderSchema);
