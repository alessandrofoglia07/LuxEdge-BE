/** Check if user's account is active */
const checkActive = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ message: 'Invalid access token' });
    if (!req.user.active)
        return res.status(401).json({ message: 'Account not activated' });
    next();
};
export default checkActive;
