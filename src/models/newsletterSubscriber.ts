import { Schema, model } from 'mongoose';
import { INewsletterSubscriberDocument } from '../types.js';

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            maxlength: 320,
            lowercase: true
        }
    },
    { timestamps: true }
);

export default model<INewsletterSubscriberDocument>('NewsletterSubscriber', NewsletterSubscriberSchema);
