import { Router, Response, Request } from 'express';
import { AuthRequest } from '../types.js';
import Review from '../models/review.js';
import Product from '../models/product.js';
import checkActive from '../middlewares/checkActive.js';
import checkUser from '../middlewares/checkUser.js';

const router = Router();

router.post('/add/:id', checkUser, checkActive, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user!;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const review = new Review({
            productId: product._id,
            user: user._id,
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

router.get('/get-reviews/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const reviews = await Review.find({ productId: product._id })
            .populate({
                path: 'user',
                select: 'username'
            })
            .exec();
        return res.json({ reviews });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/edit/:id', checkUser, checkActive, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user!;

    try {
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user.toString() !== user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

        review.rating = rating;
        review.comment = comment;

        await review.save();

        return res.json({ message: 'Review updated successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/delete/:id', checkUser, checkActive, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user!;

    try {
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user.toString() !== user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

        await review.deleteOne();

        return res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
