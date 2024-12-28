const User = require('../models/userModel');
const validateMongoId = require('../utils/validateMongoId');
const asyncHandler = require('express-async-handler');
const jwtToken = require('jsonwebtoken');
const { generateToken } = require('../config/jwtToken');
const { generateRefreshToken } = require('../config/refreshToken');

const registerUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User already exist");
    }
});


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
        const refreshToken = await generateRefreshToken(user?._id)
        const updateUser = await User.findByIdAndUpdate(user?._id, {
            refreshToken: refreshToken,
        }, {
            new: true,
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: user?.id,
            firstname: user?.firstname,
            lastname: user?.lastname,
            email: user?.email,
            mobile: user?.mobile,
            token: generateToken(user?._id)
            // token : `Bearer ${generateToken(user)}`,
        });
    } else {
        throw new Error("Invalid email or password");
    }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
    const coookie = req.cookies
    if (!cookie?.refreshToken) throw new Error('no refresh token !')
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error('no refresh token found')
    jwtToken.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) throw new Error('invalid refresh token')
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    })
})

const getOneUser = asyncHandler(async (req, res) => {
    const id = req.params.id
    try {
        validateMongoId(id)
        const getUser = await User.findById(id)
        if (!getUser) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        res.status(200).json(getUser)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
});

const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
        });
        return res.sendStatus(204);
    }

    user.refreshToken = "";
    await user.save();

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.user;
    validateMongoId(id)
    const { firstname, lastname, email, mobile, password } = req.body;

    try {
        if (password) {
            req.body.password = password;
        }

        const updatedUser = await User.findByIdAndUpdate(id, {
            firstname,
            lastname,
            email,
            mobile,
            password: req.body.password
        }, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User deleted successfully',
            user: deletedUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error',
            error: err.message || 'An unexpected error occurred'
        });
    }
});

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true
        }, {
            new: true
        });
        res.json({
            message: 'User blocked successfully',
            user: block
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message || 'An unexpected error occurred'
        });
    }
})

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false
        }, {
            new: true
        });
        res.json({
            message: 'User unblocked successfully',
            user: unblock
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message || 'An unexpected error occurred'
        });
    }
})




module.exports = { deleteUser, registerUser, logout, login, updateUser, getAllUsers, getOneUser, handleRefreshToken, blockUser, unblockUser }
