import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from 'mongoose';
import userRouter from './routers/user.js';
import adminRouter from './routers/admin.js';
import productsRouter from './routers/products.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
}));
app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);

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

app.all('*', (req, res) => res.sendStatus(404));