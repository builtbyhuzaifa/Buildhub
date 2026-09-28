
const { getProducts, createProducts, updateProduct, deleteProduct } = require('../controllers/productControllers');
const vailidateProduct = require('../middleware/vailidateProduct');
const express = require('express');
const router = express.Router();

router.get('/', getProducts);
router.post('/', vailidateProduct, createProducts);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;