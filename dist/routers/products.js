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
    const tagsQuery = req.query.tags ? String(req.query.tags) : '';
    const priceQuery = req.query.price ? String(req.query.price) : '';
    const ratingQuery = req.query.rating ? String(req.query.rating) : '';
    const sortQuery = req.query.sort ? String(req.query.sort) : '';
    let sort;
    switch (sortQuery) {
        case 'price_asc':
            sort = { price: 1 };
            break;
        case 'price_desc':
            sort = { price: -1 };
            break;
        case 'recommend':
            sort = { sold: -1 };
            break;
        case 'newest':
            sort = { createdAt: -1 };
            break;
        case 'oldest':
            sort = { createdAt: 1 };
            break;
        default:
            sort = { sold: -1 };
            break;
    }
    const tags = tagsQuery.split(',').map((tag) => tag.trim());
    const price = priceQuery.split(',').map((p) => Number(p.trim()));
    const rating = ratingQuery.split(',').map((r) => Number(r.trim()));
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;
    const productsWithNoRatingFilter = yield Product.where('tags')
        .in(tags)
        .where('price')
        .gte(price[0] || 0)
        .lte(price[1] || 999999)
        .limit(limit)
        .skip(skip)
        .sort(sort);
    const products = productsWithNoRatingFilter.filter((product) => {
        if (!rating[0] || !rating[1])
            return true;
        const productRating = product.rating;
        return productRating >= rating[0] && productRating <= rating[1];
    });
    const totCountWithNoRatingFilter = yield Product.where('tags')
        .in(tags)
        .where('price')
        .gte(price[0] || 0)
        .lte(price[1] || 999999);
    const totCount = totCountWithNoRatingFilter.filter((product) => {
        if (!rating[0] || !rating[1])
            return true;
        const productRating = product.rating;
        return productRating >= rating[0] && productRating <= rating[1];
    }).length;
    if (products === undefined || productsWithNoRatingFilter === undefined)
        return res.sendStatus(404);
    res.json({
        products,
        totCount
    });
}));
// get details of a product
router.get('/details/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const product = Product.findById(id);
    if (!product)
        return res.sendStatus(404);
    res.json(product);
}));
export default router;
