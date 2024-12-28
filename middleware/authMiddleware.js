const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req?.headers?.authorization?.split(' ')[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
                if (!req.user) {
                    res.status(401);
                    throw new Error('User not found');
                }
                next();
            } else {
                res.status(401);
                throw new Error('Token not provided');
            }
        } catch (error) {
            res.status(401).json({ message: 'Invalid token', error: error.message });
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token found');
    }
});

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Unauthorized, you are not an admin' });
    }
};

module.exports = { authMiddleware, isAdmin };
