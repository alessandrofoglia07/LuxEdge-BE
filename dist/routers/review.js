var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import Review from '../models/review.js';
import Product from '../models/product.js';
import checkActive from '../middlewares/checkActive.js';
import checkUser from '../middlewares/checkUser.js';
const router = Router();
router.post('/add/:id', checkUser, checkActive, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        const review = new Review({
            productId: product._id,
            user: user._id,
            rating,
            comment
        });
        yield review.save();
        product.reviews.push(review._id);
        yield product.save();
        return res.status(201).json({ message: 'Review added successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.get('/get-reviews/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        const reviews = yield Review.find({ productId: product._id })
            .populate({
            path: 'user',
            select: 'username'
        })
            .exec();
        return res.json({ reviews });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.patch('/edit/:id', checkUser, checkActive, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;
    try {
        const review = yield Review.findById(id);
        if (!review)
            return res.status(404).json({ message: 'Review not found' });
        if (review.user.toString() !== user._id.toString())
            return res.status(403).json({ message: 'Forbidden' });
        review.rating = rating;
        review.comment = comment;
        yield review.save();
        return res.json({ message: 'Review updated successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.delete('/delete/:id', checkUser, checkActive, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    try {
        const review = yield Review.findById(id);
        if (!review)
            return res.status(404).json({ message: 'Review not found' });
        if (review.user.toString() !== user._id.toString())
            return res.status(403).json({ message: 'Forbidden' });
        yield review.deleteOne();
        return res.json({ message: 'Review deleted successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
export default router;
