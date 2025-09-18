const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  reputation: {
    score: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      default: 'Newcomer'
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    successfulTransactions: {
      type: Number,
      default: 0
    },
    disputesParticipated: {
      type: Number,
      default: 0
    },
    disputesWon: {
      type: Number,
      default: 0
    }
  },
  profile: {
    bio: String,
    avatar: String,
    website: String,
    socialLinks: {
      twitter: String,
      discord: String,
      telegram: String
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
userSchema.index({ address: 1 });
userSchema.index({ reputation: 1 });
userSchema.index({ createdAt: -1 });

// Middleware
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
userSchema.methods.updateReputation = function(scoreChange, transactionSuccess = null) {
  this.reputation.score += scoreChange;
  this.reputation.totalTransactions += 1;
  
  if (transactionSuccess !== null) {
    if (transactionSuccess) {
      this.reputation.successfulTransactions += 1;
    }
  }
  
  // Update tier based on score
  if (this.reputation.score >= 2000) {
    this.reputation.tier = 'Legend';
  } else if (this.reputation.score >= 1000) {
    this.reputation.tier = 'Master';
  } else if (this.reputation.score >= 500) {
    this.reputation.tier = 'Expert';
  } else if (this.reputation.score >= 100) {
    this.reputation.tier = 'Trusted';
  } else {
    this.reputation.tier = 'Newcomer';
  }
  
  return this.save();
};

userSchema.methods.addDisputeParticipation = function(won = false) {
  this.reputation.disputesParticipated += 1;
  if (won) {
    this.reputation.disputesWon += 1;
  }
  return this.save();
};

// Static methods
userSchema.statics.findByAddress = function(address) {
  return this.findOne({ address: address.toLowerCase() });
};

userSchema.statics.getTopReputation = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'reputation.score': -1 })
    .limit(limit)
    .select('address username reputation profile');
};

module.exports = mongoose.model('User', userSchema);
