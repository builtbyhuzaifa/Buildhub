const productService = require('../services/productService');

const getProducts = async (req, res) => {
  const result = await productService.getProducts(req.query);
  res.status(200).json(result);
};

const getMyProducts = async (req, res) => {
  const result = await productService.getProducts({
    ...req.query,
    seller: req.user._id.toString(),
  });
  res.status(200).json(result);
};

const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ product });
};

const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);
  res.status(201).json({ message: 'Product created', product });
};

const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user);
  res.status(200).json({ message: 'Product updated', product });
};

const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user);
  res.status(200).json({ message: 'Product deleted' });
};

module.exports = {
  getProducts,
  getMyProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
