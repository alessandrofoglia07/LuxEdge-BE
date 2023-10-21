import { Router, Request, Response } from 'express';
import NewsletterSubscriber from '../models/newsletterSubscriber.js';
import sendEmail from '../utils/sendEmail.js';
import Product from '../models/product.js';
import { HTMLEmailOptions, IProductDocument, NewsletterOptions } from '../types.js';
import * as cron from 'node-cron';
import { z } from 'zod';
import { toPlural } from '../utils/singularPlural.js';

const router = Router();

// Subscribe
router.post('/subscribe', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        z.string().email().parse(email);
    } catch (err) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        const subscriber = await NewsletterSubscriber.findOne({ email });

        if (subscriber && subscriber.subscribed) return res.sendStatus(409);

        if (subscriber && !subscriber.subscribed) {
            subscriber.subscribed = true;
            await subscriber.save();
            return res.sendStatus(200);
        }

        const newSubscriber = new NewsletterSubscriber({ email });
        await newSubscriber.save();
        return res.sendStatus(201);
    } catch (err: unknown) {
        console.log(err);
        return res.sendStatus(500);
    }
});

router.post('/resubscribe/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const subscriber = await NewsletterSubscriber.findById(id);

        if (!subscriber) return res.sendStatus(404);

        subscriber.subscribed = true;

        await subscriber.save();

        return res.sendStatus(200);
    } catch (err: unknown) {
        console.log(err);
        return res.sendStatus(500);
    }
});

// Unsubscribe
router.post('/unsubscribe/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const subscriber = await NewsletterSubscriber.findById(id);

        if (!subscriber) return res.sendStatus(404);

        subscriber.subscribed = false;

        await subscriber.save();

        res.sendStatus(200);

        setTimeout(async () => {
            const subscriber = await NewsletterSubscriber.findById(id);
            await subscriber?.deleteOne();
        }, 1000 * 60 * 60 * 24 * 7);
    } catch (err: unknown) {
        console.log(err);
        return res.sendStatus(500);
    }
});

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
                const user = await NewsletterSubscriber.findOne({ email });
                if (!user) return;
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
        imgSrc: `${process.env.MEDIA_URL}/${product.imagePath}`,
        link: {
            href: `${process.env.CLIENT_URL}/products/${toPlural(product.category)}/${product.name}`,
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
        imgSrc: `${process.env.MEDIA_URL}/${product.imagePath}`,
        link: {
            href: `${process.env.CLIENT_URL}/products/${toPlural(product.category)}/${product.name}`,
            text: product.name
        }
    };

    await sendNewsletter(`${product.name} - New product!`, NewsletterOptions);
};

export default router;
