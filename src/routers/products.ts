import { Router, Request, Response } from 'express';
import Product from '../models/product.js';

const router = Router();

// get all products / search products with query
// query: tags, price, rating, sort, limit, page
// sort: price_asc, price_desc, recommend, newest, oldest
// usage example:
// /products/search?tags=tag1,tag2&price=0,100&rating=3,5&sort=price_asc&limit=10&page=1
router.get('/search', async (req: Request, res: Response) => {
    const tagsQuery = req.query.tags ? String(req.query.tags) : '';
    const priceQuery = req.query.price ? String(req.query.price) : '';
    const ratingQuery = req.query.rating ? String(req.query.rating) : '';
    const sortQuery = req.query.sort ? String(req.query.sort) : '';

    let sort: Record<string, 1 | -1>;

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

    // e.g. tags=tag1,tag2 => tags = ['tag1', 'tag2'] (tags includes tag1 or tag2)
    let tags = tagsQuery
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => Boolean(tag));

    if (!tags || tags.length === 0) {
        tags = ['bedroom', 'bed', 'bookshelf', 'chair', 'desk', 'drawer', 'livingroom', 'sofa', 'table'];
    }

    // e.g. price=0,100 => price = [0, 100] (price >= 0 && price <= 100)
    const price = priceQuery
        .split(',')
        .filter((p) => Boolean(p))
        .map((p) => Number(p.trim()));

    // e.g. rating=3,5 => rating = [3, 5] (rating >= 3 && rating <= 5)
    const rating = ratingQuery
        .split(',')
        .map((r) => Number(r.trim()))
        .filter((r) => Boolean(r));

    if (price.length === 0) price.push(-1, Number.MAX_SAFE_INTEGER);
    if (rating.length === 0) rating.push(-1, Number.MAX_SAFE_INTEGER);

    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const skip = (page - 1) * limit;

    const products = await Product.aggregate()
        .match({
            category: { $in: tags },
            price: { $gte: price[0], $lte: price[1] }
        })
        .lookup({
            from: 'reviews',
            localField: '_id',
            foreignField: 'productId',
            as: 'reviews'
        })
        .addFields({
            score: {
                $ifNull: [{ $round: [{ $avg: '$reviews.rating' }, 2] }, 0]
            }
        })
        .match({
            score: { $gte: rating[0], $lte: rating[1] }
        })
        .project({
            reviews: 0,
            score: 0
        })
        .sort(sort)
        .skip(skip)
        .limit(limit);

    const countObj = (
        await Product.aggregate()
            .match({
                category: { $in: tags },
                price: { $gte: price[0], $lte: price[1] }
            })
            .count('count')
    )[0];

    const count = countObj ? countObj.count : 0;

    if (products === undefined) return res.sendStatus(404);

    res.json({
        products,
        count,
        currPage: page,
        totalPages: Math.ceil(count / limit)
    });
});

// get details of a product from id
router.get('/details/id/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('Reviews');
    if (!product) return res.sendStatus(404);
    res.json(product);
});

// get details of a product from name
router.get('/details/name/:name', async (req: Request, res: Response) => {
    const { name } = req.params;
    const product = await Product.findOne({ name }).populate('reviews').exec();
    if (!product) return res.sendStatus(404);
    res.json(product);
});

export default router;
