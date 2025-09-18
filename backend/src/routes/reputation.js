const express = require('express');
const router = express.Router();
const Reputation = require('../db/models/Reputation');
const User = require('../db/models/User');
const logger = require('../utils/logger');

// Get reputation by user address
router.get('/:address', async (req, res) => {
  try {
    const reputation = await Reputation.findByUser(req.params.address);
    
    if (!reputation) {
      return res.status(404).json({
        success: false,
        message: 'Reputation not found'
      });
    }
    
    res.json({
      success: true,
      data: reputation
    });
  } catch (error) {
    logger.error('Error fetching reputation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reputation'
    });
  }
});

// Get top reputations
router.get('/leaderboard/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topReputations = await Reputation.getTopReputations(parseInt(limit));
    
    res.json({
      success: true,
      data: topReputations
    });
  } catch (error) {
    logger.error('Error fetching top reputations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top reputations'
    });
  }
});

// Get reputation statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Reputation.getReputationStats();
    const totalUsers = await Reputation.countDocuments();
    const avgScore = await Reputation.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        averageScore: avgScore[0]?.avgScore || 0,
        byTier: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching reputation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reputation statistics'
    });
  }
});

// Get recent reputation activity
router.get('/activity/recent', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const recentActivity = await Reputation.getRecentActivity(parseInt(limit));
    
    res.json({
      success: true,
      data: recentActivity
    });
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
});

// Update reputation (admin only)
router.post('/:address/update', async (req, res) => {
  try {
    const { action, change, reason, relatedId } = req.body;
    
    if (!action || change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    let reputation = await Reputation.findByUser(req.params.address);
    
    if (!reputation) {
      // Create new reputation record
      reputation = new Reputation({
        user: req.params.address.toLowerCase(),
        score: 0
      });
    }
    
    // Update reputation based on action
    switch (action) {
      case 'transaction':
        await reputation.addTransaction(change > 0, relatedId);
        break;
      case 'arbitration':
        await reputation.addArbitration(change > 0, relatedId);
        break;
      case 'badge':
        await reputation.addBadge(reason, 'Badge earned', 'Special');
        break;
      default:
        reputation.score += change;
        reputation.addHistory(action, change, reason, relatedId);
        break;
    }
    
    await reputation.save();
    
    res.json({
      success: true,
      data: reputation,
      message: 'Reputation updated successfully'
    });
  } catch (error) {
    logger.error('Error updating reputation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reputation'
    });
  }
});

// Get user's reputation history
router.get('/:address/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const reputation = await Reputation.findByUser(req.params.address);
    
    if (!reputation) {
      return res.status(404).json({
        success: false,
        message: 'Reputation not found'
      });
    }
    
    const history = reputation.history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        user: reputation.user,
        currentScore: reputation.score,
        currentTier: reputation.tier,
        history
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: reputation.history.length
      }
    });
  } catch (error) {
    logger.error('Error fetching reputation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reputation history'
    });
  }
});

// Get reputation by tier
router.get('/tier/:tier', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const reputations = await Reputation.find({ tier: req.params.tier })
      .sort({ score: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json({
      success: true,
      data: reputations,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Reputation.countDocuments({ tier: req.params.tier })
      }
    });
  } catch (error) {
    logger.error('Error fetching reputations by tier:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reputations by tier'
    });
  }
});

// Get reputation badges
router.get('/:address/badges', async (req, res) => {
  try {
    const reputation = await Reputation.findByUser(req.params.address);
    
    if (!reputation) {
      return res.status(404).json({
        success: false,
        message: 'Reputation not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: reputation.user,
        badges: reputation.badges
      }
    });
  } catch (error) {
    logger.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges'
    });
  }
});

module.exports = router;
