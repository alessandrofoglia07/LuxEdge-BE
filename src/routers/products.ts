import { Router, Request, Response } from 'express';
import Product from '../models/product.js';

const router = Router();

const randomSort = <T>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

router.get('/suggested', async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const products = await Product.find({}).limit(limit);
    if (!products) return res.sendStatus(404);
    const randomProducts = randomSort(products);
    res.json(randomProducts);
});

router.get('/search', async (req: Request, res: Response) => {
    const query = req.query.q ? String(req.query.q) : '';
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const products = await Product.find({ name: { $regex: query, $options: 'i' } }).limit(limit).skip(skip);
    if (!products) return res.sendStatus(404);

    res.json(products);
});

router.get('/details/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const products = Product.findById(id);
    if (!products) return res.sendStatus(404);
    res.json(products);
});

export default router;