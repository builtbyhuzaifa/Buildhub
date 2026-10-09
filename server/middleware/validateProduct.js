// Checks the request body before a product is created or updated.
// For PATCH requests only the fields that are present are checked.
const validateProduct = (req, res, next) => {
  const isCreate = req.method === 'POST';
  const { name, price, description, category, inventory, image } = req.body;
  const errors = [];

  if (isCreate || name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }
  }

  if (isCreate || price !== undefined) {
    if (price === undefined || price === '' || Number.isNaN(Number(price)) || Number(price) < 0) {
      errors.push('Price must be a positive number');
    }
  }

  if (isCreate || description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }
  }

  if (isCreate && !category) {
    errors.push('Category is required');
  }

  if (inventory !== undefined && (!Number.isInteger(Number(inventory)) || Number(inventory) < 0)) {
    errors.push('Inventory must be a whole number of 0 or more');
  }

  if (image !== undefined && !Array.isArray(image)) {
    errors.push('Image must be a list of URLs');
  }

  if (errors.length) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  next();
};

module.exports = validateProduct;
