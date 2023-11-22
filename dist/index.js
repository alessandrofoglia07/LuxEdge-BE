var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import userRouter from './routers/user.js';
import adminRouter from './routers/admin.js';
import productsRouter from './routers/products.js';
import listsRouter from './routers/lists.js';
import newsletterRouter from './routers/newsletter.js';
import reviewRouter from './routers/review.js';
import paymentRouter from './routers/payment.js';
dotenv.config();
const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(mongoSanitize());
app.use(limiter);
app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/payment', paymentRouter);
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || '';
await (() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connect(MONGO);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    catch (err) {
        console.log(err);
    }
}))();
app.use(express.static('public/images'));
app.get('/', (req, res) => {
    const url = process.env.CLIENT_URL;
    url ? res.redirect(url) : res.sendStatus(404);
});
app.all('*', (req, res) => res.sendStatus(404));
