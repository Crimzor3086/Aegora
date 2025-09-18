const express = require('express');
const router = express.Router();
const Escrow = require('../db/models/Escrow');
const User = require('../db/models/User');
const Reputation = require('../db/models/Reputation');
const logger = require('../utils/logger');

// Get all escrows
router.get('/', async (req, res) => {
  try {
    const { status, user, limit = 20, offset = 0 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (user) {
      query.$or = [
        { buyer: user.toLowerCase() },
        { seller: user.toLowerCase() }
      ];
    }
    
    const escrows = await Escrow.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json({
      success: true,
      data: escrows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Escrow.countDocuments(query)
      }
    });
  } catch (error) {
    logger.error('Error fetching escrows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrows'
    });
  }
});

// Get escrow by ID
router.get('/:id', async (req, res) => {
  try {
    const escrow = await Escrow.findOne({ escrowId: req.params.id });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    res.json({
      success: true,
      data: escrow
    });
  } catch (error) {
    logger.error('Error fetching escrow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow'
    });
  }
});

// Create new escrow
router.post('/', async (req, res) => {
  try {
    const { buyer, seller, arbitrator, amount, tokenAddress, termsHash } = req.body;
    
    // Validate required fields
    if (!buyer || !seller || !amount || !termsHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (buyer.toLowerCase() === seller.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Buyer and seller cannot be the same'
      });
    }
    
    // Get next escrow ID
    const lastEscrow = await Escrow.findOne().sort({ escrowId: -1 });
    const escrowId = lastEscrow ? lastEscrow.escrowId + 1 : 1;
    
    // Create escrow
    const escrow = new Escrow({
      escrowId,
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      arbitrator: arbitrator ? arbitrator.toLowerCase() : null,
      amount: parseFloat(amount),
      tokenAddress: tokenAddress || null,
      termsHash,
      status: 'Active',
      timeline: [{
        action: 'Escrow Created',
        actor: buyer.toLowerCase(),
        details: `Escrow created with ${amount} tokens`,
        timestamp: new Date()
      }]
    });
    
    await escrow.save();
    
    logger.info(`Escrow ${escrowId} created between ${buyer} and ${seller}`);
    
    res.status(201).json({
      success: true,
      data: escrow,
      message: 'Escrow created successfully'
    });
  } catch (error) {
    logger.error('Error creating escrow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create escrow'
    });
  }
});

// Confirm completion
router.post('/:id/confirm', async (req, res) => {
  try {
    const { userAddress } = req.body;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        message: 'User address is required'
      });
    }
    
    const escrow = await Escrow.findOne({ escrowId: req.params.id });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    if (escrow.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Escrow is not active'
      });
    }
    
    const userAddr = userAddress.toLowerCase();
    if (userAddr !== escrow.buyer && userAddr !== escrow.seller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this escrow'
      });
    }
    
    // Update confirmation
    if (userAddr === escrow.buyer) {
      escrow.buyerConfirmed = true;
    } else {
      escrow.sellerConfirmed = true;
    }
    
    await escrow.addTimelineEvent('Completion Confirmed', userAddr, 'User confirmed completion');
    
    // Check if both parties confirmed
    if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
      escrow.status = 'Completed';
      escrow.completedAt = new Date();
      
      await escrow.addTimelineEvent('Escrow Completed', 'system', 'Both parties confirmed completion');
      
      // Update reputations
      await Promise.all([
        Reputation.findByUser(escrow.buyer).then(rep => rep && rep.addTransaction(true, escrow.escrowId)),
        Reputation.findByUser(escrow.seller).then(rep => rep && rep.addTransaction(true, escrow.escrowId))
      ]);
      
      logger.info(`Escrow ${escrow.escrowId} completed successfully`);
    }
    
    await escrow.save();
    
    res.json({
      success: true,
      data: escrow,
      message: 'Confirmation recorded successfully'
    });
  } catch (error) {
    logger.error('Error confirming escrow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm escrow'
    });
  }
});

// Create dispute from escrow
router.post('/:id/dispute', async (req, res) => {
  try {
    const { userAddress, evidenceHash, evidenceDescription } = req.body;
    
    if (!userAddress || !evidenceHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const escrow = await Escrow.findOne({ escrowId: req.params.id });
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }
    
    if (escrow.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Escrow is not active'
      });
    }
    
    const userAddr = userAddress.toLowerCase();
    if (userAddr !== escrow.buyer && userAddr !== escrow.seller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create dispute for this escrow'
      });
    }
    
    // Update escrow status
    escrow.status = 'Disputed';
    escrow.evidenceHash = evidenceHash;
    escrow.evidenceDescription = evidenceDescription || '';
    
    await escrow.addTimelineEvent('Dispute Created', userAddr, 'Dispute initiated');
    await escrow.save();
    
    // Create dispute record
    const Dispute = require('../db/models/Dispute');
    const lastDispute = await Dispute.findOne().sort({ disputeId: -1 });
    const disputeId = lastDispute ? lastDispute.disputeId + 1 : 1;
    
    const dispute = new Dispute({
      disputeId,
      escrowId: escrow.escrowId,
      buyer: escrow.buyer,
      seller: escrow.seller,
      evidence: {
        hash: evidenceHash,
        description: evidenceDescription || ''
      },
      status: 'Pending',
      timeline: [{
        action: 'Dispute Created',
        actor: userAddr,
        details: 'Dispute initiated from escrow',
        timestamp: new Date()
      }]
    });
    
    await dispute.save();
    
    logger.info(`Dispute ${disputeId} created for escrow ${escrow.escrowId}`);
    
    res.status(201).json({
      success: true,
      data: {
        escrow,
        dispute
      },
      message: 'Dispute created successfully'
    });
  } catch (error) {
    logger.error('Error creating dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute'
    });
  }
});

// Get escrow statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalEscrows = await Escrow.countDocuments();
    const activeEscrows = await Escrow.countDocuments({ status: 'Active' });
    const completedEscrows = await Escrow.countDocuments({ status: 'Completed' });
    const disputedEscrows = await Escrow.countDocuments({ status: 'Disputed' });
    
    const stats = await Escrow.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalEscrows,
        active: activeEscrows,
        completed: completedEscrows,
        disputed: disputedEscrows,
        byStatus: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching escrow stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow statistics'
    });
  }
});

module.exports = router;
