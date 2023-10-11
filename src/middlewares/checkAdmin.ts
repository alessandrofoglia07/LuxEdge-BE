import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types.js';

const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role === 'admin') {
        next();
    } else {
        return res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export default checkAdmin;
