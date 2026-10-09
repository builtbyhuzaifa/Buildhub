const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

// Takes stock for each item one at a time with a conditional update, so two
// buyers can never both take the last unit. If any item is short, the stock
// already taken for this order is put back.
const reserveStock = async (items) => {
  const reserved = [];
  try {
    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, inventory: { $gte: item.quantity } },
        { $inc: { inventory: -item.quantity } },
        { returnDocument: 'after' }
      );
      if (!product) {
        throw new AppError(`Not enough stock for ${item.name}`, 409);
      }
      reserved.push(item);
    }
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }
};

const releaseStock = (items) =>
  Promise.all(
    items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { inventory: item.quantity } })
    )
  );

const createOrder = async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  // Merge duplicate lines and validate quantities.
  const quantities = new Map();
  for (const line of items) {
    const qty = Number(line.quantity);
    if (!mongoose.isValidObjectId(line.product) || !Number.isInteger(qty) || qty < 1) {
      throw new AppError('Each item needs a valid product and quantity', 400);
    }
    quantities.set(line.product, (quantities.get(line.product) || 0) + qty);
  }

  // Prices always come from the database, never from the client.
  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  if (products.length !== quantities.size) {
    throw new AppError('Some products in your cart are no longer available', 400);
  }

  const orderItems = products.map((p) => ({
    product: p._id,
    seller: p.seller,
    name: p.name,
    price: p.price,
    unit: p.unit,
    quantity: quantities.get(String(p._id)),
  }));
  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  await reserveStock(orderItems);

  try {
    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      total,
      shippingAddress,
    });
    res.status(201).json({ message: 'Order placed', order });
  } catch (err) {
    await releaseStock(orderItems);
    throw err;
  }
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ orders });
};

// Orders that contain at least one of this seller's products.
// Only the seller's own lines are returned.
const getSellerOrders = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { 'items.seller': req.user._id };
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate('buyer', 'name email');

  const result = orders.map((order) => {
    const obj = order.toObject();
    if (req.user.role !== 'admin') {
      obj.items = obj.items.filter((i) => i.seller.equals(req.user._id));
      obj.sellerTotal = obj.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
    return obj;
  });

  res.status(200).json({ orders: result });
};

const NEXT_STATUS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  const isBuyer = order.buyer.equals(req.user._id);
  const isSeller = order.items.some((i) => i.seller.equals(req.user._id));
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new AppError('You cannot change this order', 403);
  }
  // Buyers may only cancel, and only before the order ships.
  if (isBuyer && !isSeller && !isAdmin && status !== 'cancelled') {
    throw new AppError('Buyers can only cancel an order', 403);
  }
  if (!NEXT_STATUS[order.status].includes(status)) {
    throw new AppError(`An order that is ${order.status} cannot become ${status}`, 400);
  }

  // Only update if the status hasn't changed since we read it, so two
  // cancel clicks at once can't put the stock back twice.
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { status },
    { returnDocument: 'after' }
  );
  if (!updated) {
    throw new AppError('This order was just updated, please refresh', 409);
  }

  if (status === 'cancelled') {
    await releaseStock(updated.items);
  }

  res.status(200).json({ message: `Order ${status}`, order: updated });
};

module.exports = { createOrder, getMyOrders, getSellerOrders, updateOrderStatus };
