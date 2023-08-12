import { Router, Request, Response } from 'express';
import NewsletterSubscriber from '../models/newsletterSubscriber.js';
import sendEmail from '../utils/sendEmail.js';
import Product from '../models/product.js';
import { HTMLEmailOptions, IProductDocument } from '../types.js';
import User from '../models/user.js';
import * as cron from 'node-cron';

const router = Router();

// Subscribe
router.post('/subscribe', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const newSubscriber = new NewsletterSubscriber({ email });
        await newSubscriber.save();
        return res.sendStatus(201);
    } catch (err: unknown) {
        console.log(err);
        return res.sendStatus(500);
    }
});

// Unsubscribe
router.post('/unsubscribe/:email', async (req: Request, res: Response) => {
    const { email } = req.params;

    try {
        const subscriber = NewsletterSubscriber.findOne({ email });

        if (!subscriber) return res.sendStatus(404);

        await subscriber.deleteOne();

        return res.sendStatus(200);
    } catch (err: unknown) {
        console.log(err);
        return res.sendStatus(500);
    }
});

interface NewsletterOptions {
    text: string;
    imgSrc?: string | undefined;
    link?: {
        href: string;
        text: string;
    };
}

/** Send newsletter email to all the subscribers (10 emails at a time) */
const sendNewsletter = async (title: string, NewsletterOptions: NewsletterOptions) => {
    const subscribers = await NewsletterSubscriber.find();

    const batchSize = 10;
    const totalSubscribers = subscribers.length;
    const totalBatches = Math.ceil(totalSubscribers / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, totalSubscribers);

        const batchEmails = subscribers.slice(start, end).map((subscriber) => subscriber.email);

        await Promise.all(
            batchEmails.map(async (email) => {
                const user = (await User.findOne({ email })) || new User({ username: email, email, password: '' });
                const HTMLOptions: HTMLEmailOptions = {
                    user,
                    text: NewsletterOptions.text,
                    imgSrc: NewsletterOptions.imgSrc,
                    link: NewsletterOptions.link
                };
                await sendEmail(email, title, HTMLOptions);
            })
        );
    }
};

const sendProductOfTheWeek = async () => {
    const product: IProductDocument = (await Product.aggregate([{ $sample: { size: 1 } }]))[0];

    const NewsletterOptions: NewsletterOptions = {
        text: `This week's product of the week is the ${product.name}!`,
        imgSrc: `${process.env.BASE_URL}/products/${product.imagePath}`,
        link: {
            href: `${process.env.CLIENT_URL}/products/details/${product.name}`,
            text: 'Check it out here!'
        }
    };

    await sendNewsletter(`${product.name} - Product of the week!`, NewsletterOptions);
};

cron.schedule('0 9 * * 0', sendProductOfTheWeek);

export const sendNewProduct = async (productId: string) => {
    const product = await Product.findById(productId);

    if (!product) return;

    const NewsletterOptions: NewsletterOptions = {
        text: `The brand new ${product.name} is now available in LuxEdge store! Check it out!`,
        imgSrc: `${process.env.BASE_URL}/products/${product.imagePath}`,
        link: {
            href: `${process.env.CLIENT_URL}/products/details/${product.name}`,
            text: product.name
        }
    };

    await sendNewsletter(`${product.name} - New product!`, NewsletterOptions);
};

export default router;
