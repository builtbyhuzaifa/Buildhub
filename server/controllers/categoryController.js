const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getCategories = async (req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  const countById = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.status(200).json({
    categories: categories.map((c) => ({
      ...c.toObject(),
      productCount: countById[String(c._id)] || 0,
    })),
  });
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const category = await Category.create({ name, description });
  res.status(201).json({ message: 'Category created', category });
};

const deleteCategory = async (req, res) => {
  const inUse = await Product.exists({ category: req.params.id });
  if (inUse) {
    throw new AppError('Move or delete the products in this category first', 409);
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  res.status(200).json({ message: 'Category deleted' });
};

module.exports = { getCategories, createCategory, deleteCategory };
