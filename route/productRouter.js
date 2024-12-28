const express = require('express');
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct } = require('../controller/productController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, isAdmin, createProduct)
router.get('/get/:id', getProduct)
router.get('/all', getAllProducts)
router.put('/update/:id', authMiddleware, isAdmin, updateProduct)
router.delete('/delete/:id', authMiddleware, isAdmin, deleteProduct)

module.exports = router;