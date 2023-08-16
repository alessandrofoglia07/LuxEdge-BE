import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import userRouter from './routers/user.js';
import adminRouter from './routers/admin.js';
import productsRouter from './routers/products.js';
import listsRouter from './routers/lists.js';
import newsletterRouter from './routers/newsletter.js';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL
    })
);
app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/newsletter', newsletterRouter);

// Multer storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});

// File upload with multer
export const upload: any = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimetype = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Images only'));
    }
}).single('image');

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || '';

await (async () => {
    try {
        await connect(MONGO);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.log(err);
    }
})();

app.use(express.static('public/images'));

app.get('/', (req: Request, res: Response) => {
    const url = process.env.CLIENT_URL;
    url ? res.redirect(url) : res.sendStatus(404);
});

app.all('*', (req: Request, res: Response) => res.sendStatus(404));
