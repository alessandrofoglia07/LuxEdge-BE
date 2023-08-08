import { Router, Request, Response } from 'express';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import checkCredentials from '../middlewares/checkCredentials.js';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import sendEmail from '../utils/sendEmail.js';
import { v4 as uuidv4 } from 'uuid';
import Token from '../models/token.js';

const router = Router();

// Register
router.post('/register', checkCredentials, async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        const emailAlreadyExists = Boolean(await User.findOne({ email: email }));
        const userAlreadyExists = Boolean(await User.findOne({ username: username }));

        if (emailAlreadyExists) return res.status(409).json({ message: 'Email already registered' });
        if (userAlreadyExists) return res.status(409).json({ message: 'Username already taken' });

        const hash = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hash,
            cart: [],
            favorites: [],
            role: 'user',
            active: false
        });

        await user.save();

        const text = `Hi ${username},\n\nPlease click on the link below to activate your account:\n${process.env.CLIENT_URL}/user/activate/${user._id}\n\nThanks,\nLuxEdge Team`;

        await sendEmail(email, 'LuxEdge - Activate Account', text);

        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Activate account
router.post('/activate/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.active = true;
        await user.save();

        const text = `Hi ${user.username},\n\nYour account has been activated.\n\nThanks,\nLuxEdge Team`;

        await sendEmail(user.email, 'LuxEdge - Confirmation email', text);

        res.json({ message: 'Account activated' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });

    function invalid() {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) return invalid();

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return invalid();

        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        res.json({ accessToken, refreshToken, userId: user._id, email: email, username: user.username, role: user.role, active: user.active, message: 'Login successful' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Refresh token
router.post('/refresh-token', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: any, result: any) => {
            if (err) {
                console.log(err);
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const userId = result.userId;
            const user = await User.findById(userId);

            if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

            const accessToken = await generateAccessToken(user);
            res.json({ accessToken, message: 'New access token generated' });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Forgot password
router.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const token = uuidv4();
        const url = `${process.env.CLIENT_URL}/user/reset-password/${user._id}/${token}`;

        await new Token({
            userId: user._id,
            token: token
        }).save();

        const text = `Hi ${user.username},\n\nPlease click on the link below to reset your password:\n${url}\n\nIf you did not request this, please ignore this email.\n\nThanks,\nLuxEdge Team`;

        await sendEmail(email, 'LuxEdge - Reset Password', text);

        res.json({ message: 'Email sent' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
    const { userId, token, password } = req.body;

    try {
        const result = await Token.findOne({ userId: userId, token: token });
        if (!result) return res.status(404).json({ message: 'Invalid token' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const samePassword = await bcrypt.compare(password, user.password);
        if (samePassword) return res.status(409).json({ message: 'New password cannot be the same as the old one' });

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        await result.deleteOne();

        res.json({ message: 'Password reset' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
