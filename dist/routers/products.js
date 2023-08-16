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
import Product from '../models/product.js';
const router = Router();
const randomSort = (arr) => {
    if (arr && arr.length) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    return arr;
};
// get random products
router.get('/suggested', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const products = yield Product.aggregate([
        { $sample: { size: limit } },
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'productId', as: 'reviews' } },
        { $addFields: { rawScore: { $avg: '$reviews.rating' } } },
        { $addFields: { score: { $round: ['$rawScore', 2] } } },
        { $unset: ['reviews', 'rawScore'] }
    ]);
    if (!products)
        return res.sendStatus(404);
    const randomProducts = randomSort(products);
    res.json(randomProducts);
}));
// get all products / search products with query
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.q ? String(req.query.q) : '';
    const tagsQuery = req.query.tags ? String(req.query.tags) : '';
    const tags = tagsQuery.split(',').map((tag) => tag.trim());
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;
    const products = yield Product.aggregate([
        {
            $match: {
                $and: [{ name: { $regex: query, $options: 'i' } }, { tags: { $in: tags } }]
            }
        },
        { $limit: limit },
        { $skip: skip },
        { $lookup: { from: 'reviews', localField: '_id', foreignField: 'productId', as: 'reviews' } },
        { $addFields: { rawScore: { $avg: '$reviews.rating' } } },
        { $addFields: { score: { $round: ['$score', 2] } } },
        { $unset: ['reviews', 'rawScore'] },
        { $sort: { sold: -1 } }
    ]);
    if (products === undefined)
        return res.sendStatus(404);
    res.json(products);
}));
// get details of a product
router.get('/details/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const products = Product.findById(id);
    if (!products)
        return res.sendStatus(404);
    res.json(products);
}));
export default router;
