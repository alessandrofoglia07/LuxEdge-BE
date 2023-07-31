import { detect } from 'curse-filter';
const bannedUsernames = ['post', 'comment', 'admin', 'administrator', 'moderator', 'mod', 'user', 'users'];
/** Check if username, email and password are valid */
const checkCredentials = (req, res, next) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const { username, email, password } = req.body;
    if (bannedUsernames.includes(username) || username.includes('*') || detect(username))
        return res.status(400).json({ message: 'Username not allowed' });
    if (!username || !email || !password)
        return res.status(400).json({ message: 'All fields required' });
    if (username.length < 3 || username.length > 20)
        return res.status(400).json({ message: 'Username must be 3-20 characters long' });
    if (password.length < 6 || password.length > 16)
        return res.status(400).json({ message: 'Password must be 6-16 characters long' });
    if (username.includes(' '))
        return res.status(400).json({ message: 'Username cannot contain spaces' });
    if (email.includes(' '))
        return res.status(400).json({ message: 'Email cannot contain spaces' });
    if (password.includes(' '))
        return res.status(400).json({ message: 'Password cannot contain spaces' });
    if (!emailRegex.test(email))
        return res.status(400).json({ message: 'Invalid email' });
    next();
};
export default checkCredentials;
