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
import NewsletterSubscriber from '../models/newsletterSubscriber.js';
import sendEmail from '../utils/sendEmail.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import * as cron from 'node-cron';
import { z } from 'zod';
import { toPlural } from '../utils/singularPlural.js';
const router = Router();
// Subscribe
router.post('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        z.string().email().parse(email);
    }
    catch (err) {
        return res.status(400).json({ message: 'Invalid email address' });
    }
    try {
        const subscriber = yield NewsletterSubscriber.findOne({ email });
        if (subscriber)
            return res.sendStatus(409);
        const newSubscriber = new NewsletterSubscriber({ email });
        yield newSubscriber.save();
        return res.sendStatus(201);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// Unsubscribe
router.post('/unsubscribe/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    try {
        const subscriber = NewsletterSubscriber.findOne({ email });
        if (!subscriber)
            return res.sendStatus(404);
        yield subscriber.deleteOne();
        return res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
/** Send newsletter email to all the subscribers (10 emails at a time) */
const sendNewsletter = (title, NewsletterOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const subscribers = yield NewsletterSubscriber.find();
    const batchSize = 10;
    const totalSubscribers = subscribers.length;
    const totalBatches = Math.ceil(totalSubscribers / batchSize);
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, totalSubscribers);
        const batchEmails = subscribers.slice(start, end).map((subscriber) => subscriber.email);
        yield Promise.all(batchEmails.map((email) => __awaiter(void 0, void 0, void 0, function* () {
            const user = (yield User.findOne({ email })) || new User({ username: email, email, password: '' });
            const HTMLOptions = {
                user,
                text: NewsletterOptions.text,
                imgSrc: NewsletterOptions.imgSrc,
                link: NewsletterOptions.link
            };
            yield sendEmail(email, title, HTMLOptions);
        })));
    }
});
const sendProductOfTheWeek = () => __awaiter(void 0, void 0, void 0, function* () {
    const product = (yield Product.aggregate([{ $sample: { size: 1 } }]))[0];
    const NewsletterOptions = {
        text: `This week's product of the week is the ${product.name}!`,
        imgSrc: `${process.env.BASE_URL}/products/${product.imagePath}`,
        link: {
            href: `${process.env.CLIENT_URL}/products/details/${toPlural(product.category)}/${product.name}`,
            text: 'Check it out here!'
        }
    };
    yield sendNewsletter(`${product.name} - Product of the week!`, NewsletterOptions);
});
cron.schedule('0 9 * * 0', sendProductOfTheWeek);
export const sendNewProduct = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield Product.findById(productId);
    if (!product)
        return;
    const NewsletterOptions = {
        text: `The brand new ${product.name} is now available in LuxEdge store! Check it out!`,
        imgSrc: `${process.env.BASE_URL}/products/${product.imagePath}`,
        link: {
            href: `${process.env.CLIENT_URL}/products/details/${toPlural(product.category)}/${product.name}`,
            text: product.name
        }
    };
    yield sendNewsletter(`${product.name} - New product!`, NewsletterOptions);
});
export default router;
