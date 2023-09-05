import { detect } from 'curse-filter';
import { z } from 'zod';
const bannedUsernames = ['post', 'comment', 'admin', 'administrator', 'moderator', 'mod', 'user', 'users'];
/** Check if username, email and password are valid */
const checkCredentials = (req, res, next) => {
    let { username, email, password } = req.body;
    username = username.trim();
    const userLengthErr = 'Username must be 3-20 characters long';
    const userCharsErr = 'Username cannot contain spaces or asterisks';
    const userNotAllowedErr = 'Username not allowed';
    const passLengthErr = 'Password must be 6-16 characters long';
    const passCharsErr = 'Password cannot contain spaces';
    const UserSchema = z.object({
        username: z
            .string()
            .min(3, userLengthErr)
            .max(20, userLengthErr)
            .trim()
            .refine((value) => !bannedUsernames.includes(value) && !detect(value), userNotAllowedErr)
            .refine((value) => !value.includes(' ') && !value.includes('*'), userCharsErr),
        email: z.string().email('Invalid email'),
        password: z
            .string()
            .min(6, passLengthErr)
            .max(16, passLengthErr)
            .refine((value) => !value.includes(' '), passCharsErr)
    });
    const result = UserSchema.safeParse({ username, email, password });
    if (result.success === false)
        return res.status(400).json({ message: result.error.errors.map((err) => err.message).join('\n') });
    next();
};
export default checkCredentials;
