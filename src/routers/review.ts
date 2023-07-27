import { Router, Response } from "express";
import { AuthRequest } from "../types.js";
import Review from "../models/review.js";
import Product from "../models/product.js";
import checkActive from "../middlewares/checkActive.js";
import checkUser from "../middlewares/checkUser.js";

const router = Router();

router.use([checkUser, checkActive]);

router.post('/add/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user!;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const review = new Review({
            productId: product._id,
            userId: user._id,
            rating,
            comment
        });
        await review.save();

        product.reviews.push(review._id);
        await product.save();

        return res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getReviews/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const reviews = await Review.find({ productId: product._id }).populate('userId', 'username');
        return res.json({ reviews });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});