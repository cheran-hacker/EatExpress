// backend/routes/orders.js
const express = require('express');
const Order = require('../models/Order');

const auth = require('../middleware/auth');

const router = express.Router();

// Helper to simulate status progress over time (2 mins total)
const getSimulatedStatus = (order) => {
  if (order.status === 'CANCELLED') return 'CANCELLED';

  const now = new Date();
  const created = new Date(order.createdAt);
  const diffSeconds = (now - created) / 1000;

  if (diffSeconds < 20) return 'PLACED';
  if (diffSeconds < 60) return 'ACCEPTED';
  if (diffSeconds < 120) return 'PREPARING';
  if (diffSeconds < 180) return 'OUT_FOR_DELIVERY';
  return 'DELIVERED';
};

// GET /api/orders/my
router.get('/my', auth, async (req, res) => {
  try {
    let orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('restaurantId');

    // Simulate Realtime Updates
    const updatedOrders = await Promise.all(orders.map(async (order) => {
      const newStatus = getSimulatedStatus(order);
      if (order.status !== newStatus && order.status !== 'CANCELLED' && order.status !== 'DELIVERED') {
        // Use findByIdAndUpdate to avoid validation errors on legacy data (missing address)
        order.status = newStatus;
        await Order.findByIdAndUpdate(order._id, { status: newStatus });
      }
      return order;
    }));

    res.json(updatedOrders);
  } catch (err) {
    console.error('my orders error', err);
    res.status(500).json({ msg: 'Server error fetching orders' });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { userId, restaurantId, items, totalAmount, address, paymentMethod } =
      req.body;

    if (!items || !items.length) {
      return res.status(400).json({ msg: 'No items in order' });
    }

    let order = await Order.create({
      userId,
      restaurantId,
      items,
      totalAmount,
      address,
      paymentMethod,
      customerName: req.body.customerName,
      email: req.body.email,
      phone: req.body.phone,
      paymentId: req.body.paymentId,
      status: 'PLACED',
    });

    // Populate restaurant details before sending to frontend
    order = await Order.findById(order._id).populate('restaurantId');

    res.status(201).json(order);
  } catch (err) {
    console.error('order create error', err);
    res.status(500).json({ msg: 'Server error creating order' });
  }
});

// POST /api/orders/cancel/:id
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      return res.status(400).json({ msg: 'Cannot cancel this order' });
    }

    order.status = 'CANCELLED';
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('cancel error', err);
    res.status(500).json({ msg: 'Server error cancelling order' });
  }
});

// PUT /api/orders/address/:id
router.put('/address/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.userId.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    if (order.status !== 'PLACED') {
      return res.status(400).json({ msg: 'Can only change address for placed orders' });
    }

    order.address = req.body.address;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('address error', err);
    res.status(500).json({ msg: 'Server error updating address' });
  }
});

module.exports = router;
