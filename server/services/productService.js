const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');

const ALLOWED_FIELDS = ['name', 'price', 'unit', 'description', 'category', 'image', 'inventory', 'seller', 'createdAt'];
const SORTS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  name: { name: 1 },
};

// Escape user input before using it in a regex so a search like "(a+)+"
// can't be used to slow the database down.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accepts either a category id or a slug like "cement".
const resolveCategoryId = async (category) => {
  if (mongoose.isValidObjectId(category)) return category;
  const found = await Category.findOne({ slug: String(category).toLowerCase() });
  return found ? found._id : null;
};

const createProduct = async (data, sellerId) => {
  const categoryId = await resolveCategoryId(data.category);
  if (!categoryId || !(await Category.exists({ _id: categoryId }))) {
    throw new AppError('Category not found', 400);
  }

  const product = await Product.create({
    name: data.name,
    price: data.price,
    unit: data.unit,
    description: data.description,
    category: categoryId,
    image: data.image,
    inventory: data.inventory,
    seller: sellerId,
  });

  return product.populate([
    { path: 'category', select: 'name slug' },
    { path: 'seller', select: 'name company' },
  ]);
};

const getProducts = async ({
  minPrice,
  maxPrice,
  category,
  seller,
  search,
  inStock,
  sort,
  page = 1,
  limit = 12,
  fields,
} = {}) => {
  const filter = {};

  if (minPrice !== undefined && minPrice !== '') {
    filter.price = { $gte: Number(minPrice) };
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    filter.price = { ...filter.price, $lte: Number(maxPrice) };
  }

  if (category) {
    const categoryId = await resolveCategoryId(category);
    if (!categoryId) {
      return { products: [], pagination: { page: 1, limit: Number(limit) || 12, totalProducts: 0, totalPages: 0 } };
    }
    filter.category = categoryId;
  }

  if (seller) {
    if (!mongoose.isValidObjectId(seller)) throw new AppError('Invalid seller id', 400);
    filter.seller = seller;
  }

  if (inStock === 'true') {
    filter.inventory = { $gt: 0 };
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(String(search).slice(0, 100)), 'i');
    filter.$or = [{ name: pattern }, { description: pattern }];
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 12, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  let query = Product.find(filter)
    .sort(SORTS[sort] || SORTS.newest)
    .skip(skip)
    .limit(limitNumber)
    .populate('category', 'name slug')
    .populate('seller', 'name company');

  if (fields) {
    const selected = String(fields)
      .split(',')
      .map((f) => f.trim())
      .filter((f) => ALLOWED_FIELDS.includes(f));
    if (selected.length) query = query.select(selected.join(' '));
  }

  const [products, totalProducts] = await Promise.all([
    query,
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNumber),
    },
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate('category', 'name slug')
    .populate('seller', 'name company email');
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

// Only the seller who listed the product (or an admin) may change it.
const findOwnedProduct = async (id, user) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);
  if (user.role !== 'admin' && !product.seller.equals(user._id)) {
    throw new AppError('You can only manage your own products', 403);
  }
  return product;
};

const updateProduct = async (id, data, user) => {
  const product = await findOwnedProduct(id, user);

  const editable = ['name', 'price', 'unit', 'description', 'image', 'inventory'];
  editable.forEach((field) => {
    if (data[field] !== undefined) product[field] = data[field];
  });

  if (data.category !== undefined) {
    const categoryId = await resolveCategoryId(data.category);
    if (!categoryId || !(await Category.exists({ _id: categoryId }))) {
      throw new AppError('Category not found', 400);
    }
    product.category = categoryId;
  }

  await product.save();
  return product.populate([
    { path: 'category', select: 'name slug' },
    { path: 'seller', select: 'name company' },
  ]);
};

const deleteProduct = async (id, user) => {
  const product = await findOwnedProduct(id, user);
  await product.deleteOne();
  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
