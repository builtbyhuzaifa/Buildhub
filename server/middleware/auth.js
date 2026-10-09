const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Requires a valid "Authorization: Bearer <token>" header and
// attaches the logged-in user to req.user.
const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new AppError('Please log in to continue', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError('Account no longer exists', 401);
  }

  req.user = user;
  next();
};

// Usage: authorize('seller', 'admin')
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new AppError('You do not have permission to do this', 403);
  }
  next();
};

module.exports = { protect, authorize };
