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
import checkUser from '../middlewares/checkUser.js';
import Product from '../models/product.js';
const router = Router();
router.use(checkUser);
// add to cart
router.patch('/cart/add/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.sendStatus(404);
        const user = req.user;
        user.cart.push(product._id);
        user.cart = removeDuplicates(user.cart);
        yield user.save();
        res.json(user.cart);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// remove from cart
router.patch('/cart/remove/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.sendStatus(404);
        const user = req.user;
        user.cart = user.cart.filter((productId) => productId.toString() !== product._id.toString());
        user.cart = removeDuplicates(user.cart);
        yield user.save();
        res.json(user.cart);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// clear cart
router.patch('/cart/clear', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        user.cart = [];
        yield user.save();
        res.json(user.cart);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// get cart
router.get('/cart', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect('/lists/cart/ids');
}));
router.get('/cart/ids', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.json(user.cart);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.get('/cart/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const cart = yield Product.find({ _id: { $in: user.cart } });
        res.json(cart);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
const removeDuplicates = (arr) => [...new Set(arr)];
// add to favorites
router.patch('/favorites/add/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.sendStatus(404);
        const user = req.user;
        user.favorites.push(product._id);
        user.favorites = removeDuplicates(user.favorites);
        yield user.save();
        res.json(user.favorites);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.patch('/favorites/add-multiple', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    try {
        const user = req.user;
        const products = yield Product.find({ _id: { $in: ids } });
        user.favorites.push(...products.map((product) => product._id));
        user.favorites = removeDuplicates(user.favorites);
        yield user.save();
        res.json(user.favorites);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// remove from favorites
router.patch('/favorites/remove/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = req.user;
        user.favorites = user.favorites.filter((productId) => productId.toString() !== id);
        user.favorites = removeDuplicates(user.favorites);
        yield user.save();
        res.json(user.favorites);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
router.patch('/favorites/clear', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        user.favorites = [];
        yield user.save();
        res.json(user.favorites);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// get favorites
router.get('/favorites', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect('/lists/favorites/ids');
}));
/** Get user favorites ids */
router.get('/favorites/ids', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.json(user.favorites);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
/** Get user favorites ids */
router.get('/favorites/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const favorites = yield Product.find({ _id: { $in: user.favorites } });
        res.json(favorites);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
export default router;
