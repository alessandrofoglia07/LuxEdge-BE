import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

/** Check if user's jwt is valid */
const checkUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    const invalid = 'Invalid access token';
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token not found' });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err: unknown, result: unknown) => {
        if (err) {
            if (err instanceof jwt.TokenExpiredError) return res.status(401).json({ message: 'Access token expired' });
            console.log(err);
            return res.status(401).json({ message: invalid });
        } else if (result && typeof result === 'object' && 'userId' in result) {
            const user = await User.findById(result.userId);

            if (!user) return res.status(401).json({ message: invalid });

            req.user = user;

            next();
        } else {
            return res.status(401).json({ message: invalid });
        }
    });
};

export default checkUser;
