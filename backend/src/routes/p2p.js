const express = require('express');
const router = express.Router();
const P2POrder = require('../db/models/P2POrder');
const logger = require('../utils/logger');

// List orders
router.get('/orders', async (req, res) => {
  try {
    const { type, maker, status = 'open', limit = 20, offset = 0 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (maker) query.maker = maker.toLowerCase();
    if (status) query.status = status;
    const orders = await P2POrder.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(offset));
    res.json({ success: true, data: orders, pagination: { limit: parseInt(limit), offset: parseInt(offset), total: await P2POrder.countDocuments(query) } });
  } catch (error) {
    logger.error('Error listing P2P orders:', error);
    res.status(500).json({ success: false, message: 'Failed to list orders' });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const { maker, type, price, amount, minAmount, maxAmount, paymentMethods, notes } = req.body;
    if (!maker || !type || !price || !amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const last = await P2POrder.findOne().sort({ orderId: -1 });
    const orderId = last ? last.orderId + 1 : 1;
    const order = new P2POrder({
      orderId,
      maker: maker.toLowerCase(),
      type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      remainingAmount: parseFloat(amount),
      minAmount: minAmount ? parseFloat(minAmount) : 0,
      maxAmount: maxAmount ? parseFloat(maxAmount) : 0,
      paymentMethods: Array.isArray(paymentMethods) ? paymentMethods : [],
      notes: notes || ''
    });
    await order.save();
    res.status(201).json({ success: true, data: order, message: 'Order created' });
  } catch (error) {
    logger.error('Error creating P2P order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Cancel order
router.post('/orders/:id/cancel', async (req, res) => {
  try {
    const order = await P2POrder.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.status = 'cancelled';
    await order.save();
    res.json({ success: true, data: order, message: 'Order cancelled' });
  } catch (error) {
    logger.error('Error cancelling P2P order:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
});

module.exports = router;


