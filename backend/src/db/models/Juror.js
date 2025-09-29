const mongoose = require('mongoose');

const jurorSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  stake: {
    type: Number,
    required: true,
    min: 0
  },
  reputation: {
    type: Number,
    default: 100,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  disputesParticipated: {
    type: Number,
    default: 0
  },
  disputesResolved: {
    type: Number,
    default: 0
  },
  totalRewards: {
    type: Number,
    default: 0
  },
  totalPenalties: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
jurorSchema.index({ address: 1 });
jurorSchema.index({ isActive: 1 });
jurorSchema.index({ reputation: -1 });

// Pre-save middleware
jurorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
jurorSchema.methods.updateReputation = function(change) {
  this.reputation = Math.max(0, this.reputation + change);
  this.lastActive = new Date();
  return this.save();
};

jurorSchema.methods.addDisputeParticipation = function() {
  this.disputesParticipated += 1;
  this.lastActive = new Date();
  return this.save();
};

jurorSchema.methods.addDisputeResolution = function() {
  this.disputesResolved += 1;
  this.lastActive = new Date();
  return this.save();
};

jurorSchema.methods.addReward = function(amount) {
  this.totalRewards += amount;
  this.lastActive = new Date();
  return this.save();
};

jurorSchema.methods.addPenalty = function(amount) {
  this.totalPenalties += amount;
  this.lastActive = new Date();
  return this.save();
};

jurorSchema.methods.updateAccuracy = function() {
  if (this.disputesParticipated > 0) {
    this.accuracy = (this.disputesResolved / this.disputesParticipated) * 100;
  }
  return this.save();
};

// Static methods
jurorSchema.statics.findActiveJurors = function() {
  return this.find({ isActive: true }).sort({ reputation: -1 });
};

jurorSchema.statics.findTopJurors = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ reputation: -1, accuracy: -1 })
    .limit(limit);
};

jurorSchema.statics.findByAddress = function(address) {
  return this.findOne({ address: address.toLowerCase() });
};

jurorSchema.statics.getJurorStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$isActive',
        count: { $sum: 1 },
        totalStake: { $sum: '$stake' },
        avgReputation: { $avg: '$reputation' },
        avgAccuracy: { $avg: '$accuracy' }
      }
    }
  ]);
};

module.exports = mongoose.model('Juror', jurorSchema);

