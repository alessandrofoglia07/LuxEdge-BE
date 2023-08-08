import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types.js';

/** Check if user's account is active */
const checkActive = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Invalid access token' });

    if (!req.user.active) return res.status(401).json({ message: 'Account not activated' });

    next();
};

export default checkActive;
