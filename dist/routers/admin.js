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
import checkActive from '../middlewares/checkActive.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { upload } from '../index.js';
import Product from '../models/product.js';
const router = Router();
router.use([checkUser, checkActive, checkAdmin]);
// add product
router.post('/addProduct', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file.' });
        }
        const { filename } = req.file;
        const { name, price, description, tags } = JSON.parse(req.body.data);
        try {
            const product = new Product({
                name,
                description,
                price,
                imagePath: filename,
                tags: tags.split(',').map((tag) => tag.trim())
            });
            yield product.save();
            return res.status(201).json({ message: 'Product added successfully' });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }));
}));
// Delete product
router.delete('/deleteProduct/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield Product.findByIdAndDelete(id);
        return res.json({ message: 'Product deleted successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
// Edit product
router.put('/editProduct/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Product.findById(id);
        if (!product)
            return res.status(404).json({ message: 'Product not found' });
        const { name, price, description, tags } = req.body;
        product.name = name;
        product.price = price;
        product.description = description;
        product.tags = tags.split(',').map((tag) => tag.trim());
        yield product.save();
        return res.json({ message: 'Product updated successfully' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}));
export default router;
