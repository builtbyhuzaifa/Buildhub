const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res) => {
  const { name, email, password, role, company } = req.body;

  // Anyone can sign up as a buyer or a seller; admins are created manually.
  const safeRole = role === 'seller' ? 'seller' : 'buyer';

  const user = await User.create({ name, email, password, role: safeRole, company });
  res.status(201).json({ token: signToken(user), user });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    throw new AppError('Incorrect email or password', 401);
  }

  res.status(200).json({ token: signToken(user), user });
};

const me = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, me };
