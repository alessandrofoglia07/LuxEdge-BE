import { Schema, model } from 'mongoose';
const NewsletterSubscriberSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    }
}, { timestamps: true });
export default model('NewsletterSubscriber', NewsletterSubscriberSchema);
