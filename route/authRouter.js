const express = require('express');
const { registerUser, login, getAllUsers, getOneUser, handleRefreshToken, 
    logout, updateUser, deleteUser, blockUser, unblockUser } = require('../controller/userController');
    
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/logout', logout)
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.get('/refresh', handleRefreshToken)
router.get('/get/:id', authMiddleware, isAdmin, getOneUser)
router.put('/update/:id', authMiddleware, updateUser)
router.delete('/delete/:id', authMiddleware, isAdmin, deleteUser)
router.patch('/block/:id', authMiddleware, isAdmin, blockUser)
router.patch('/unblock/:id', authMiddleware, isAdmin, unblockUser)

module.exports = router;