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
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import checkCredentials from '../middlewares/checkCredentials.js';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import sendEmail from '../utils/sendEmail.js';
import { v4 as uuidv4 } from 'uuid';
import Token from '../models/token.js';
import NewsletterSubscriber from '../models/newsletterSubscriber.js';
const router = Router();
// Register
router.post('/register', checkCredentials, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        const emailAlreadyExists = Boolean(yield User.findOne({ email: email }));
        const userAlreadyExists = Boolean(yield User.findOne({ username: username }));
        if (emailAlreadyExists)
            return res.status(409).json({ message: 'Email already registered.' });
        if (userAlreadyExists)
            return res.status(409).json({ message: 'Username already taken.' });
        const hash = yield bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hash,
            cart: [],
            favorites: [],
            role: 'user',
            active: false
        });
        yield user.save();
        const newsletter = new NewsletterSubscriber({ email: email });
        yield newsletter.save();
        res.status(201).json({ message: 'User registered. An email has been sent to activate your account.' });
        const text = 'Please click on the link below to activate your account.';
        const link = {
            href: `${process.env.CLIENT_URL}/user/activate/${user._id}`,
            text: 'Activate account'
        };
        const HTMLOptions = {
            user: newsletter,
            text,
            link,
            important: true
        };
        yield sendEmail(email, 'LuxEdge - Activate Account', HTMLOptions);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// Activate account
router.post('/activate/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield User.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (user.active)
            return res.status(409).json({ message: 'Account already activated' });
        user.active = true;
        yield user.save();
        res.json({ message: 'Account activated' });
        const newsletter = yield NewsletterSubscriber.findOne({ email: user.email });
        if (!newsletter)
            return;
        const HTMLEmailOptions = {
            user: newsletter,
            text: 'Your account has been successfully activated and you are now all set to start shopping!',
            important: true
        };
        yield sendEmail(user.email, 'LuxEdge - Confirmation email', HTMLEmailOptions);
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// Login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'All fields required' });
    function invalid() {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    try {
        const user = yield User.findOne({ email: email });
        if (!user)
            return invalid();
        const isPasswordValid = yield bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return invalid();
        const accessToken = yield generateAccessToken(user);
        const refreshToken = yield generateRefreshToken(user);
        res.json({ accessToken, refreshToken, userId: user._id, email: email, username: user.username, role: user.role, active: user.active, message: 'Login successful' });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// Refresh token
router.post('/refresh-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                console.log(err);
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            if (!result || typeof result !== 'object' || !('userId' in result))
                return res.status(403).json({ message: 'Invalid refresh token' });
            const userId = result.userId;
            const user = yield User.findById(userId);
            if (!user)
                return res.status(403).json({ message: 'Invalid refresh token' });
            const accessToken = yield generateAccessToken(user);
            res.json({ accessToken, message: 'New access token generated' });
        }));
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// Forgot password
router.post('/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User.findOne({ email: email });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const tokenExists = yield Token.findOne({ userId: user._id });
        if (tokenExists)
            return res.status(409).json({ message: 'A password reset email has already been sent' });
        const token = uuidv4();
        const url = `${process.env.CLIENT_URL}/user/reset-password/${user._id}/${token}`;
        const newsletter = yield NewsletterSubscriber.findOne({ email: user.email });
        if (!newsletter)
            throw new Error('Newsletter subscriber not found');
        yield new Token({
            userId: user._id,
            token: token
        }).save();
        const HTMLEmailOptions = {
            user: newsletter,
            text: 'Please click on the link below to reset your password. If you did not request this, please ignore this email.',
            link: {
                href: url,
                text: 'Reset password'
            },
            important: true
        };
        yield sendEmail(email, 'LuxEdge - Reset Password', HTMLEmailOptions);
        res.json({ message: 'Email sent' });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
// Reset password
router.post('/reset-password/:userId/:token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const { userId, token } = req.params;
    try {
        const result = yield Token.findOne({ userId: userId, token: token });
        if (!result)
            return res.status(404).json({ message: 'Invalid token' });
        if (result.expiresAt.getTime() < Date.now()) {
            yield result.deleteOne();
            return res.status(403).json({ message: 'Token expired' });
        }
        const user = yield User.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const samePassword = yield bcrypt.compare(password, user.password);
        if (samePassword)
            return res.status(409).json({ message: 'New password cannot be the same as the old one' });
        user.password = yield bcrypt.hash(password, 10);
        yield user.save();
        yield result.deleteOne();
        res.json({ message: 'Password reset' });
    }
    catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}));
export default router;
