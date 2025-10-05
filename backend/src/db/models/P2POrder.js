const mongoose = require('mongoose');

const p2pOrderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true },
  maker: { type: String, required: true, lowercase: true, index: true },
  type: { type: String, enum: ['buy', 'sell'], required: true, index: true },
  asset: { type: String, default: 'AEG' },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxAmount: { type: Number, default: 0 },
  paymentMethods: { type: [String], default: [] },
  status: { type: String, enum: ['open', 'filled', 'cancelled'], default: 'open', index: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

p2pOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('P2POrder', p2pOrderSchema);


