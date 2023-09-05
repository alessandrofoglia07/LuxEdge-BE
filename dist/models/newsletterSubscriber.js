import { Schema, model } from 'mongoose';
const NewsletterSubscriberSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 320,
        lowercase: true
    }
}, { timestamps: true });
export default model('NewsletterSubscriber', NewsletterSubscriberSchema);
