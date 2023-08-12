import { Router, Response } from 'express';
import checkUser from '../middlewares/checkUser.js';
import checkActive from '../middlewares/checkActive.js';
import checkAdmin from '../middlewares/checkAdmin.js';
import { AuthRequest } from '../types.js';
import { upload } from '../index.js';
import Product from '../models/product.js';
import { sendNewProduct } from './newsletter.js';

const router = Router();

router.use([checkUser, checkActive, checkAdmin]);

// add product
router.post('/addProduct', async (req: AuthRequest, res: Response) => {
    upload(req, res, async (err: any) => {
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
                tags: tags.split(',').map((tag: string) => tag.trim())
            });
            await product.save();

            res.status(201).json({ message: 'Product added successfully' });

            await sendNewProduct(product._id.toString());
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// Delete product
router.delete('/deleteProduct/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        await Product.findByIdAndDelete(id);
        return res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit product
router.put('/editProduct/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, price, description, tags } = req.body;
        product.name = name;
        product.price = price;
        product.description = description;
        product.tags = tags.split(',').map((tag: string) => tag.trim());

        await product.save();

        return res.json({ message: 'Product updated successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
