const mongoose = require('mongoose');

const reputationSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    lowercase: true
  },
  score: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    default: 'Newcomer'
  },
  transactions: {
    total: {
      type: Number,
      default: 0
    },
    successful: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    }
  },
  arbitrations: {
    participated: {
      type: Number,
      default: 0
    },
    won: {
      type: Number,
      default: 0
    },
    lost: {
      type: Number,
      default: 0
    }
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['Transaction', 'Arbitration', 'Community', 'Special'],
      default: 'Transaction'
    }
  }],
  history: [{
    action: {
      type: String,
      required: true
    },
    change: {
      type: Number,
      required: true
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    relatedId: String // Dispute ID, Escrow ID, etc.
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
reputationSchema.index({ user: 1 });
reputationSchema.index({ score: -1 });
reputationSchema.index({ tier: 1 });
reputationSchema.index({ lastUpdated: -1 });

// Middleware
reputationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Update tier based on score
  if (this.score >= 2000) {
    this.tier = 'Legend';
  } else if (this.score >= 1000) {
    this.tier = 'Master';
  } else if (this.score >= 500) {
    this.tier = 'Expert';
  } else if (this.score >= 100) {
    this.tier = 'Trusted';
  } else {
    this.tier = 'Newcomer';
  }
  
  next();
});

// Methods
reputationSchema.methods.addTransaction = function(successful, escrowId = null) {
  this.transactions.total += 1;
  
  if (successful) {
    this.transactions.successful += 1;
    this.score += 10;
    this.addHistory('Successful Transaction', 10, 'Transaction completed successfully', escrowId);
  } else {
    this.transactions.failed += 1;
    this.score = Math.max(0, this.score - 5);
    this.addHistory('Failed Transaction', -5, 'Transaction failed', escrowId);
  }
  
  return this.save();
};

reputationSchema.methods.addArbitration = function(won, disputeId = null) {
  this.arbitrations.participated += 1;
  
  if (won) {
    this.arbitrations.won += 1;
    this.score += 25;
    this.addHistory('Won Arbitration', 25, 'Successfully arbitrated dispute', disputeId);
  } else {
    this.arbitrations.lost += 1;
    this.score = Math.max(0, this.score - 10);
    this.addHistory('Lost Arbitration', -10, 'Lost arbitration case', disputeId);
  }
  
  return this.save();
};

reputationSchema.methods.addBadge = function(name, description, category = 'Transaction') {
  // Check if badge already exists
  const existingBadge = this.badges.find(badge => badge.name === name);
  if (existingBadge) {
    return this;
  }
  
  this.badges.push({
    name,
    description,
    category,
    earnedAt: new Date()
  });
  
  return this.save();
};

reputationSchema.methods.addHistory = function(action, change, reason, relatedId = null) {
  this.history.push({
    action,
    change,
    reason,
    relatedId,
    timestamp: new Date()
  });
  
  // Keep only last 100 history entries
  if (this.history.length > 100) {
    this.history = this.history.slice(-100);
  }
  
  return this;
};

reputationSchema.methods.getSuccessRate = function() {
  if (this.transactions.total === 0) return 0;
  return (this.transactions.successful / this.transactions.total) * 100;
};

reputationSchema.methods.getArbitrationSuccessRate = function() {
  if (this.arbitrations.participated === 0) return 0;
  return (this.arbitrations.won / this.arbitrations.participated) * 100;
};

// Static methods
reputationSchema.statics.findByUser = function(userAddress) {
  return this.findOne({ user: userAddress.toLowerCase() });
};

reputationSchema.statics.getTopReputations = function(limit = 10) {
  return this.find()
    .sort({ score: -1 })
    .limit(limit)
    .select('user score tier transactions arbitrations badges');
};

reputationSchema.statics.getReputationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$tier',
        count: { $sum: 1 },
        avgScore: { $avg: '$score' }
      }
    },
    {
      $sort: { avgScore: -1 }
    }
  ]);
};

reputationSchema.statics.getRecentActivity = function(limit = 50) {
  return this.aggregate([
    { $unwind: '$history' },
    { $sort: { 'history.timestamp': -1 } },
    { $limit: limit },
    {
      $project: {
        user: 1,
        action: '$history.action',
        change: '$history.change',
        reason: '$history.reason',
        timestamp: '$history.timestamp',
        relatedId: '$history.relatedId'
      }
    }
  ]);
};

module.exports = mongoose.model('Reputation', reputationSchema);
