const {
  createProduct,
  getProducts: getProductsFromService,
  updateProduct: updateProductFromservice,
  deleteProduct: deleteProductFromService
} = require('../services/productService');


const getProducts = async (req, res) => {

  const {
    minPrice,
    maxPrice,
    category,
    seller,
    search,
    sort,
    page,
    limit,
    fields
  } = req.query;

  const products = await getProductsFromService(
    minPrice,
    maxPrice,
    category,
    seller,
    search,
    sort,
    page,
    limit,
    fields
  );

  res.status(200).json({ products });

};


const createProducts = async (req, res) => {

  const {
    name,
    price,
    description,
    category,
    image,
    inventory,
    seller
  } = req.body;

  const product = await createProduct(
    name,
    price,
    description,
    category,
    image,
    inventory,
    seller
  );

  res.status(201).json({
    message: 'Product created',
    product
  });

};


const updateProduct = async (req, res) => {

  const product = await updateProductFromservice(
    req.params.id,
    req.body
  );

  if (!product) {
    return res.status(404).json({
      message: 'Product not found'
    });
  }

  res.status(200).json({
    message: 'Product updated',
    product
  });

};


const deleteProduct = async (req, res) => {

  const product = await deleteProductFromService(req.params.id);

  if (!product) {
    return res.status(404).json({
      message: 'Product not found'
    });
  }

  res.status(200).json({
    message: 'Product deleted',
    product
  });

};


module.exports = {
  getProducts,
  createProducts,
  updateProduct,
  deleteProduct
};