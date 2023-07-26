import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

/** Check if user's jwt is valid */
const checkUser = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token not found' });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err: any, result: any) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ message: 'Invalid access token' });
        } else {
            const user = await User.findById(result.userId);

            if (!user) return res.status(401).json({ message: 'Invalid access token' });

            req.user = user;

            next();
        }
    });
};

export default checkUser;