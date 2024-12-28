const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const validateProductData = (data) => {
    const { title, price, category, brand, color } = data;
    if (!title || !price || !category || !brand || !color) {
        throw new Error('All fields (title, price, category, brand, color) are required.');
    }
    if (typeof price !== 'number' || price <= 0) {
        throw new Error('Price must be a positive number.');
    }
};

const createProduct = asyncHandler(async (req, res) => {
    const { title } = req.body;

    try {
        validateProductData(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

    const slug = slugify(title, { lower: true, strict: true });
    req.body.slug = slug;

    try {
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with this slug already exists.' });
        }

        const product = await Product.create(req.body);
        res.status(201).json({
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating product',
            error: error.message || 'An unexpected error occurred',
        });
    }
});

const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
            });
        }

        res.status(200).json({
            message: 'Product retrieved successfully',
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving product',
            error: error.message || 'An unexpected error occurred',
        });
    }
});

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();
        if (products.length === 0) {
            return res.status(200).json({
                message: 'No products found',
                products: [],
            });
        }
        res.status(200).json({
            message: 'Products retrieved successfully',
            products,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving products',
            error: error.message || 'An unexpected error occurred',
        });
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    const { title, price, category, brand, color } = req.body;

    try {
        validateProductData(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({
            message: 'Product not found',
        });
    }
    if (title && title !== product.title) {
        req.body.slug = slugify(title, {
            lower: true,
            strict: true
        });
    }
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(400).json({
                message: 'Product update failed',
            });
        }
        res.status(200).json({
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating product',
            error: error.message || 'An unexpected error occurred',
        });
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoId(id);
    try {
        validateProductData(req.body);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({
            message: 'Product not found',
        });
    }
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(400).json({
                message: 'Product delete failed',
            });
        }
        res.status(200).json({
            message: 'Product deleted successfully',
            product: deletedProduct,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting product',
            error: error.message || 'An unexpected error occurred',
        });
    }
})


module.exports = { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct };
