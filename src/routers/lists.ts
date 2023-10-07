import { Router, Response } from 'express';
import { AuthRequest } from '../types.js';
import checkUser from '../middlewares/checkUser.js';
import Product from '../models/product.js';

const router = Router();

router.use(checkUser);

// add to cart
router.patch('/cart/add/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.sendStatus(404);

        const user = req.user!;

        user.cart.push(product._id);
        user.cart = removeDuplicates(user.cart);
        await user.save();

        res.json(user.cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// remove from cart
router.patch('/cart/remove/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.sendStatus(404);

        const user = req.user!;

        user.cart = user.cart.filter((productId) => productId.toString() !== product._id.toString());
        user.cart = removeDuplicates(user.cart);
        await user.save();

        res.json(user.cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// clear cart
router.patch('/cart/clear', async (req: AuthRequest, res: Response) => {
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
    res.redirect('/lists/cart/ids');
});

router.get('/cart/ids', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        res.json(user.cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/cart/products', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        const cart = await Product.find({ _id: { $in: user.cart } });
        res.json(cart);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

const removeDuplicates = <T>(arr: T[]) => [...new Set(arr)];

// add to favorites
router.patch('/favorites/add/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.sendStatus(404);

        const user = req.user!;

        user.favorites.push(product._id);
        user.favorites = removeDuplicates(user.favorites);
        await user.save();

        res.json(user.favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/favorites/add-multiple', async (req: AuthRequest, res: Response) => {
    const { ids } = req.body;

    try {
        const user = req.user!;

        const products = await Product.find({ _id: { $in: ids } });

        user.favorites.push(...products.map((product) => product._id));
        user.favorites = removeDuplicates(user.favorites);
        await user.save();

        res.json(user.favorites);
    } catch (err: unknown) {
        console.log(err);
        return res.sendStatus(500);
    }
});

// remove from favorites
router.patch('/favorites/remove/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const user = req.user!;

        user.favorites = user.favorites.filter((productId) => productId.toString() !== id);
        user.favorites = removeDuplicates(user.favorites);
        await user.save();

        res.json(user.favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.patch('/favorites/clear', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        user.favorites = [];
        await user.save();
        res.json(user.favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// get favorites
router.get('/favorites', async (req: AuthRequest, res: Response) => {
    res.redirect('/lists/favorites/ids');
});

/** Get user favorites ids */
router.get('/favorites/ids', async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        res.json(user.favorites);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/** Get user favorites products */
router.get('/favorites/products', async (req: AuthRequest, res: Response) => {
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
