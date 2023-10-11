const checkAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'admin') {
        next();
    }
    else {
        return res.status(401).json({ message: 'Not authorized as an admin' });
    }
};
export default checkAdmin;
