var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Schema, model, SchemaTypes } from 'mongoose';
const ProductSchema = new Schema({
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
ProductSchema.virtual('rating').get(function () {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.reviews.length === 0)
            return 0;
        yield this.populate('reviews');
        const reviews = this.reviews;
        const totalRating = reviews.reduce((acc, review) => {
            const reviewDocument = review;
            return acc + reviewDocument.rating;
        }, 0);
        const avgRating = totalRating / this.reviews.length;
        return Math.round(avgRating * 10) / 10;
    });
});
ProductSchema.set('toJSON', {
    virtuals: true
});
export default model('Product', ProductSchema);
