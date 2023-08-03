import { Router, Response } from 'express';
import { AuthRequest } from '../types.js';
import checkUser from '../middlewares/checkUser.js';
import Product from '../models/product.js';

const router = Router();

router.use(checkUser);

// add to cart
router.patch('/addToCart/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.sendStatus(404);

        const user = req.user!;

        user.cart.push(product._id);
        await user.save();

        res.json(user.cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// remove from cart
router.patch('/removeFromCart/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.sendStatus(404);

        const user = req.user!;

        user.cart = user.cart.filter(productId => productId.toString() !== product._id.toString());
        await user.save();

        res.json(user.cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// clear cart
router.patch('/clearCart', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        user.cart = [];
        await user.save();
        res.json(user.cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// get cart
router.get('/cart', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        const cart = await Product.find({ _id: { $in: user.cart } });
        res.json(cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// add to favorites 
router.patch('/addToFavorites/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.sendStatus(404);

        const user = req.user!;

        user.favorites.push(product._id);
        await user.save();

        res.json(user.favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// remove from favorites
router.patch('/removeFromFavorites/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const user = req.user!;

        user.favorites = user.favorites.filter(productId => productId.toString() !== id);
        await user.save();

        res.json(user.favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// get favorites
router.get('/favorites', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        const favorites = await Product.find({ _id: { $in: user.favorites } });
        res.json(favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;