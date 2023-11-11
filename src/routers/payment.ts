import { Stripe } from 'stripe';
import { Router, Response } from 'express';
import { AuthRequest, HTMLEmailOptions } from '../types.js';
import checkUser from '../middlewares/checkUser.js';
import checkActive from '../middlewares/checkActive.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import sendEmail from '../utils/sendEmail.js';
import NewsletterSubscriber from '../models/newsletterSubscriber.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

const router = Router();

router.use([checkUser, checkActive]);

router.post('/create-checkout-session', async (req: AuthRequest, res: Response) => {
    const user = req.user;

    const cart = user?.cart;

    if (!cart) return res.status(400).json({ message: 'Cart is empty' });

    const items: LineItem[] = [];

    for (const item of cart) {
        const product = await Product.findById(item);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const sameProduct = (item: LineItem) => item.price_data?.product_data?.name === product.name;

        if (items.some(sameProduct)) {
            const index = items.findIndex(sameProduct);
            items[index]!.quantity! += 1;
        } else {
            items.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: [`${process.env.MEDIA_URL}/${product.imagePath}`]
                    },
                    unit_amount: product.price * 100
                },
                quantity: 1
            });
        }
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal'],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
            line_items: items
        });

        const order = new Order({
            sessionId: session.id,
            user: user._id,
            products: cart,
            paymentStatus: 'pending',
            paymentType: session.payment_method_types[0],
            totalPrice: session.amount_total! / 100
        });
        await order.save();

        res.json({ id: session.id, url: session.url });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/confirm', async (req: AuthRequest, res: Response) => {
    const { session_id } = req.query;
    const user = req.user!;

    if (!session_id || typeof session_id !== 'string') return res.sendStatus(400);

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const order = await Order.findOne({ sessionId: session.id });
            if (!order) throw new Error('Order not found');

            if (order.paymentStatus === 'completed') return res.json({ message: 'Payment already completed' });

            order.paymentStatus = 'completed';
            await order.save();

            user.cart = [];
            await user.save();

            res.json({ message: 'Payment successful' });

            if (!session.customer_email) return;

            const newsletterUser = await NewsletterSubscriber.findOne({ email: user.email });
            if (!newsletterUser) throw new Error('Newsletter subscriber not found');

            const email: HTMLEmailOptions = {
                user: newsletterUser,
                text: 'Your order has been successfully completed. Thank you for choosing LuxEdge. We hope to see you again soon!',
                important: true,
                link: {
                    href: `${process.env.CLIENT_URL}/user/orders`,
                    text: 'View order'
                }
            };
            await sendEmail(session.customer_email, 'Thank you for your purchase!', email);
        } else {
            const order = await Order.findOne({ sessionId: session.id });
            if (!order) throw new Error('Order not found');

            order.paymentStatus = 'failed';
            await order.save();

            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/cancel', async (req: AuthRequest, res: Response) => {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== 'string') return res.sendStatus(400);

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') return res.json({ message: 'Payment already completed' });

        await Order.deleteOne({ sessionId: session.id });

        res.json({ message: 'Payment cancelled' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/orders', async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    try {
        const orders = await Order.find({ user: user._id });

        res.json(orders);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
