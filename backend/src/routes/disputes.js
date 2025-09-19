const express = require('express');
const router = express.Router();
const Dispute = require('../db/models/Dispute');
const User = require('../db/models/User');
const Reputation = require('../db/models/Reputation');
// const ipfsService = require('../services/ipfsService'); // Temporarily disabled
const logger = require('../utils/logger');

// Get all disputes
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
        { seller: user.toLowerCase() },
        { 'jurors.address': user.toLowerCase() }
      ];
    }
    
    const disputes = await Dispute.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    res.json({
      success: true,
      data: disputes,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: await Dispute.countDocuments(query)
      }
    });
  } catch (error) {
    logger.error('Error fetching disputes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes'
    });
  }
});

// Get dispute by ID
router.get('/:id', async (req, res) => {
  try {
    const dispute = await Dispute.findOne({ disputeId: req.params.id });
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }
    
    res.json({
      success: true,
      data: dispute
    });
  } catch (error) {
    logger.error('Error fetching dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute'
    });
  }
});

// Create new dispute
router.post('/', async (req, res) => {
  try {
    const { escrowId, buyer, seller, evidenceHash, evidenceDescription, files } = req.query;
    
    // Validate required fields
    if (!escrowId || !buyer || !seller || !evidenceHash) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Get next dispute ID
    const lastDispute = await Dispute.findOne().sort({ disputeId: -1 });
    const disputeId = lastDispute ? lastDispute.disputeId + 1 : 1;
    
    // Create dispute
    const dispute = new Dispute({
      disputeId,
      escrowId: parseInt(escrowId),
      buyer: buyer.toLowerCase(),
      seller: seller.toLowerCase(),
      evidence: {
        hash: evidenceHash,
        description: evidenceDescription || '',
        files: files || []
      },
      timeline: [{
        action: 'Dispute Created',
        actor: buyer.toLowerCase(),
        details: 'Dispute initiated',
        timestamp: new Date()
      }]
    });
    
    await dispute.save();
    
    // Update user reputations
    await Promise.all([
      User.findByAddress(buyer).then(user => user && user.addDisputeParticipation(false)),
      User.findByAddress(seller).then(user => user && user.addDisputeParticipation(false))
    ]);
    
    logger.info(`Dispute ${disputeId} created for escrow ${escrowId}`);
    
    res.status(201).json({
      success: true,
      data: dispute,
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

// Add evidence to dispute
router.post('/:id/evidence', async (req, res) => {
  try {
    const { description, files } = req.body;
    
    const dispute = await Dispute.findOne({ disputeId: req.params.id });
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }
    
    if (dispute.status !== 'Pending' && dispute.status !== 'InProgress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add evidence to resolved dispute'
      });
    }
    
    // Upload files to IPFS if provided
    let uploadedFiles = [];
    if (files && files.length > 0) {
      uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const hash = await ipfsService.uploadFile(file);
          return {
            name: file.name,
            hash,
            size: file.size,
            type: file.type
          };
        })
      );
    }
    
    // Update dispute evidence
    dispute.evidence.description = description || dispute.evidence.description;
    dispute.evidence.files = [...dispute.evidence.files, ...uploadedFiles];
    
    await dispute.addTimelineEvent('Evidence Added', req.user?.address || 'anonymous', description);
    await dispute.save();
    
    res.json({
      success: true,
      data: dispute,
      message: 'Evidence added successfully'
    });
  } catch (error) {
    logger.error('Error adding evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add evidence'
    });
  }
});

// Assign jurors to dispute
router.post('/:id/jurors', async (req, res) => {
  try {
    const { jurors } = req.body;
    
    const dispute = await Dispute.findOne({ disputeId: req.params.id });
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }
    
    if (dispute.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign jurors to non-pending dispute'
      });
    }
    
    // Validate jurors
    if (!jurors || !Array.isArray(jurors) || jurors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid jurors data'
      });
    }
    
    // Add jurors to dispute
    dispute.jurors = jurors.map(juror => ({
      address: juror.address.toLowerCase(),
      stake: juror.stake || 0,
      vote: 'None',
      hasVoted: false
    }));
    
    dispute.status = 'InProgress';
    dispute.votes.totalStake = jurors.reduce((sum, juror) => sum + (juror.stake || 0), 0);
    
    await dispute.addTimelineEvent('Jurors Assigned', 'system', `${jurors.length} jurors assigned`);
    await dispute.save();
    
    res.json({
      success: true,
      data: dispute,
      message: 'Jurors assigned successfully'
    });
  } catch (error) {
    logger.error('Error assigning jurors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign jurors'
    });
  }
});

// Cast vote
router.post('/:id/vote', async (req, res) => {
  try {
    const { jurorAddress, vote } = req.body;
    
    if (!jurorAddress || !vote) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    if (!['Buyer', 'Seller'].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote value'
      });
    }
    
    const dispute = await Dispute.findOne({ disputeId: req.params.id });
    
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }
    
    if (dispute.status !== 'InProgress') {
      return res.status(400).json({
        success: false,
        message: 'Dispute is not in progress'
      });
    }
    
    // Check if juror is assigned to this dispute
    const juror = dispute.jurors.find(j => j.address === jurorAddress.toLowerCase());
    if (!juror) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to vote on this dispute'
      });
    }
    
    if (juror.hasVoted) {
      return res.status(400).json({
        success: false,
        message: 'Already voted on this dispute'
      });
    }
    
    // Update vote
    await dispute.updateVote(jurorAddress.toLowerCase(), vote);
    await dispute.addTimelineEvent('Vote Cast', jurorAddress.toLowerCase(), `Voted for ${vote}`);
    
    // Check if all jurors have voted
    const allVoted = dispute.jurors.every(j => j.hasVoted);
    if (allVoted) {
      // Resolve dispute
      const winner = dispute.votes.buyerVotes > dispute.votes.sellerVotes ? dispute.buyer : dispute.seller;
      await dispute.resolveDispute(winner, 'All jurors voted');
      
      // Update reputations
      await Promise.all([
        Reputation.findByUser(dispute.buyer).then(rep => rep && rep.addArbitration(winner === dispute.buyer, dispute.disputeId)),
        Reputation.findByUser(dispute.seller).then(rep => rep && rep.addArbitration(winner === dispute.seller, dispute.disputeId))
      ]);
      
      logger.info(`Dispute ${dispute.disputeId} resolved. Winner: ${winner}`);
    }
    
    res.json({
      success: true,
      data: dispute,
      message: 'Vote cast successfully'
    });
  } catch (error) {
    logger.error('Error casting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cast vote'
    });
  }
});

// Get dispute statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Dispute.getDisputeStats();
    
    const totalDisputes = await Dispute.countDocuments();
    const activeDisputes = await Dispute.countDocuments({ status: { $in: ['Pending', 'InProgress'] } });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'Resolved' });
    
    res.json({
      success: true,
      data: {
        total: totalDisputes,
        active: activeDisputes,
        resolved: resolvedDisputes,
        byStatus: stats
      }
    });
  } catch (error) {
    logger.error('Error fetching dispute stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute statistics'
    });
  }
});

module.exports = router;
