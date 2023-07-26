var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
/** Check if user's jwt is valid */
const checkUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Access token not found' });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.status(401).json({ message: 'Invalid access token' });
        }
        else {
            const user = yield User.findById(result.userId);
            if (!user)
                return res.status(401).json({ message: 'Invalid access token' });
            req.user = user;
            next();
        }
    }));
};
export default checkUser;
