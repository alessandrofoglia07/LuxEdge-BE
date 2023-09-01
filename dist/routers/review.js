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
            userId: user._id,
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
router.get('/getReviews/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        const reviews = yield Review.find({ productId: product._id }).populate('userId', 'username');
        return res.json({ reviews });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.get('/getScore/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (!id)
            return res.status(404).json({ message: 'Product not found' });
        const reviews = yield Review.find({ productId: id });
        const score = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        return res.json({ score });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
