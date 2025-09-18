const Reputation = require('../db/models/Reputation');
const User = require('../db/models/User');
const logger = require('../utils/logger');

class ReputationService {
  /**
   * Calculate reputation score based on various factors
   * @param {Object} userData - User data object
   * @returns {number} - Calculated reputation score
   */
  calculateReputationScore(userData) {
    const {
      totalTransactions = 0,
      successfulTransactions = 0,
      disputesParticipated = 0,
      disputesWon = 0,
      timeActive = 0 // in days
    } = userData;

    if (totalTransactions === 0) return 0;

    // Base score from transaction success rate
    const successRate = successfulTransactions / totalTransactions;
    const baseScore = successRate * 100;

    // Arbitration bonus
    let arbitrationBonus = 0;
    if (disputesParticipated > 0) {
      const arbitrationSuccessRate = disputesWon / disputesParticipated;
      arbitrationBonus = (arbitrationSuccessRate * disputesParticipated * 10) + (disputesParticipated * 5);
    }

    // Time bonus (longer active users get slight bonus)
    const timeBonus = Math.min(timeActive * 0.1, 50); // Max 50 points for time

    // Activity bonus
    const activityBonus = Math.min(totalTransactions * 0.5, 100); // Max 100 points for activity

    return Math.round(baseScore + arbitrationBonus + timeBonus + activityBonus);
  }

  /**
   * Update user reputation after a transaction
   * @param {string} userAddress - User address
   * @param {boolean} success - Whether transaction was successful
   * @param {string} escrowId - Escrow ID
   * @returns {Promise<Object>} - Updated reputation
   */
  async updateTransactionReputation(userAddress, success, escrowId = null) {
    try {
      let reputation = await Reputation.findByUser(userAddress);
      
      if (!reputation) {
        reputation = new Reputation({
          user: userAddress.toLowerCase(),
          score: 0
        });
      }

      await reputation.addTransaction(success, escrowId);
      
      logger.info(`Updated transaction reputation for ${userAddress}: ${success ? '+' : '-'}${success ? 10 : 5}`);
      
      return reputation;
    } catch (error) {
      logger.error('Error updating transaction reputation:', error);
      throw error;
    }
  }

  /**
   * Update user reputation after arbitration
   * @param {string} userAddress - User address
   * @param {boolean} won - Whether user won the arbitration
   * @param {string} disputeId - Dispute ID
   * @returns {Promise<Object>} - Updated reputation
   */
  async updateArbitrationReputation(userAddress, won, disputeId = null) {
    try {
      let reputation = await Reputation.findByUser(userAddress);
      
      if (!reputation) {
        reputation = new Reputation({
          user: userAddress.toLowerCase(),
          score: 0
        });
      }

      await reputation.addArbitration(won, disputeId);
      
      logger.info(`Updated arbitration reputation for ${userAddress}: ${won ? '+' : '-'}${won ? 25 : 10}`);
      
      return reputation;
    } catch (error) {
      logger.error('Error updating arbitration reputation:', error);
      throw error;
    }
  }

  /**
   * Award badge to user
   * @param {string} userAddress - User address
   * @param {string} badgeName - Badge name
   * @param {string} description - Badge description
   * @param {string} category - Badge category
   * @returns {Promise<Object>} - Updated reputation
   */
  async awardBadge(userAddress, badgeName, description, category = 'Special') {
    try {
      let reputation = await Reputation.findByUser(userAddress);
      
      if (!reputation) {
        reputation = new Reputation({
          user: userAddress.toLowerCase(),
          score: 0
        });
      }

      await reputation.addBadge(badgeName, description, category);
      
      logger.info(`Awarded badge ${badgeName} to ${userAddress}`);
      
      return reputation;
    } catch (error) {
      logger.error('Error awarding badge:', error);
      throw error;
    }
  }

  /**
   * Get user reputation with detailed breakdown
   * @param {string} userAddress - User address
   * @returns {Promise<Object>} - Reputation details
   */
  async getUserReputation(userAddress) {
    try {
      const reputation = await Reputation.findByUser(userAddress);
      
      if (!reputation) {
        return {
          user: userAddress.toLowerCase(),
          score: 0,
          tier: 'Newcomer',
          transactions: { total: 0, successful: 0, failed: 0 },
          arbitrations: { participated: 0, won: 0, lost: 0 },
          badges: [],
          successRate: 0,
          arbitrationSuccessRate: 0
        };
      }

      return {
        user: reputation.user,
        score: reputation.score,
        tier: reputation.tier,
        transactions: reputation.transactions,
        arbitrations: reputation.arbitrations,
        badges: reputation.badges,
        successRate: reputation.getSuccessRate(),
        arbitrationSuccessRate: reputation.getArbitrationSuccessRate(),
        lastUpdated: reputation.lastUpdated
      };
    } catch (error) {
      logger.error('Error getting user reputation:', error);
      throw error;
    }
  }

  /**
   * Get reputation leaderboard
   * @param {number} limit - Number of users to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} - Leaderboard data
   */
  async getLeaderboard(limit = 10, offset = 0) {
    try {
      const reputations = await Reputation.find()
        .sort({ score: -1 })
        .limit(limit)
        .skip(offset)
        .select('user score tier transactions arbitrations badges');

      return reputations.map((rep, index) => ({
        rank: offset + index + 1,
        user: rep.user,
        score: rep.score,
        tier: rep.tier,
        transactions: rep.transactions,
        arbitrations: rep.arbitrations,
        badges: rep.badges,
        successRate: rep.getSuccessRate(),
        arbitrationSuccessRate: rep.getArbitrationSuccessRate()
      }));
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get reputation statistics
   * @returns {Promise<Object>} - Statistics data
   */
  async getReputationStats() {
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

      const scoreDistribution = await Reputation.aggregate([
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 100, 500, 1000, 2000, Infinity],
            default: '2000+',
            output: {
              count: { $sum: 1 },
              avgScore: { $avg: '$score' }
            }
          }
        }
      ]);

      return {
        totalUsers,
        averageScore: avgScore[0]?.avgScore || 0,
        byTier: stats,
        scoreDistribution
      };
    } catch (error) {
      logger.error('Error getting reputation stats:', error);
      throw error;
    }
  }

  /**
   * Check if user qualifies for badge
   * @param {string} userAddress - User address
   * @param {string} badgeName - Badge name
   * @returns {Promise<boolean>} - Qualification status
   */
  async checkBadgeQualification(userAddress, badgeName) {
    try {
      const reputation = await Reputation.findByUser(userAddress);
      
      if (!reputation) return false;

      // Check if badge already exists
      const existingBadge = reputation.badges.find(badge => badge.name === badgeName);
      if (existingBadge) return false;

      // Badge qualification logic
      switch (badgeName) {
        case 'First Transaction':
          return reputation.transactions.total >= 1;
        case 'Trusted Trader':
          return reputation.transactions.successful >= 10 && reputation.getSuccessRate() >= 90;
        case 'Arbitration Expert':
          return reputation.arbitrations.participated >= 5 && reputation.getArbitrationSuccessRate() >= 80;
        case 'Community Leader':
          return reputation.score >= 1000;
        case 'Legend':
          return reputation.score >= 2000;
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking badge qualification:', error);
      return false;
    }
  }

  /**
   * Auto-award badges based on user activity
   * @param {string} userAddress - User address
   * @returns {Promise<Array>} - Newly awarded badges
   */
  async autoAwardBadges(userAddress) {
    try {
      const badges = [
        { name: 'First Transaction', description: 'Completed first transaction' },
        { name: 'Trusted Trader', description: 'Completed 10+ successful transactions with 90%+ success rate' },
        { name: 'Arbitration Expert', description: 'Participated in 5+ arbitrations with 80%+ success rate' },
        { name: 'Community Leader', description: 'Achieved 1000+ reputation score' },
        { name: 'Legend', description: 'Achieved 2000+ reputation score' }
      ];

      const newlyAwarded = [];

      for (const badge of badges) {
        const qualifies = await this.checkBadgeQualification(userAddress, badge.name);
        if (qualifies) {
          await this.awardBadge(userAddress, badge.name, badge.description);
          newlyAwarded.push(badge);
        }
      }

      return newlyAwarded;
    } catch (error) {
      logger.error('Error auto-awarding badges:', error);
      return [];
    }
  }

  /**
   * Get reputation history for user
   * @param {string} userAddress - User address
   * @param {number} limit - Number of history entries
   * @returns {Promise<Array>} - Reputation history
   */
  async getReputationHistory(userAddress, limit = 50) {
    try {
      const reputation = await Reputation.findByUser(userAddress);
      
      if (!reputation) return [];

      return reputation.history
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting reputation history:', error);
      return [];
    }
  }
}

module.exports = new ReputationService();
