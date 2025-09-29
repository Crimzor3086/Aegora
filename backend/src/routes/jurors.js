const express = require('express');
const router = express.Router();
const Juror = require('../db/models/Juror');
const logger = require('../utils/logger');

// Get all active jurors
router.get('/', async (req, res) => {
  try {
    const jurors = await Juror.findActiveJurors();
    
    res.json({
      success: true,
      data: jurors,
      count: jurors.length
    });
  } catch (error) {
    logger.error('Error fetching jurors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jurors'
    });
  }
});

// Get top jurors
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const jurors = await Juror.findTopJurors(limit);
    
    res.json({
      success: true,
      data: jurors,
      count: jurors.length
    });
  } catch (error) {
    logger.error('Error fetching top jurors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top jurors'
    });
  }
});

// Get juror by address
router.get('/:address', async (req, res) => {
  try {
    const juror = await Juror.findByAddress(req.params.address);
    
    if (!juror) {
      return res.status(404).json({
        success: false,
        message: 'Juror not found'
      });
    }
    
    res.json({
      success: true,
      data: juror
    });
  } catch (error) {
    logger.error('Error fetching juror:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch juror'
    });
  }
});

// Register as juror
router.post('/register', async (req, res) => {
  try {
    const { address, stake } = req.body;
    
    if (!address || !stake) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: address and stake'
      });
    }
    
    if (stake < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stake required is 1000 AEG tokens'
      });
    }
    
    // Check if already registered
    const existingJuror = await Juror.findByAddress(address);
    if (existingJuror) {
      return res.status(400).json({
        success: false,
        message: 'Address is already registered as a juror'
      });
    }
    
    // Create new juror
    const juror = new Juror({
      address: address.toLowerCase(),
      stake: stake,
      reputation: 100,
      isActive: true
    });
    
    await juror.save();
    
    logger.info(`New juror registered: ${address} with stake: ${stake}`);
    
    res.json({
      success: true,
      data: juror,
      message: 'Successfully registered as juror'
    });
  } catch (error) {
    logger.error('Error registering juror:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register as juror'
    });
  }
});

// Unregister as juror
router.post('/unregister', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: address'
      });
    }
    
    const juror = await Juror.findByAddress(address);
    if (!juror) {
      return res.status(404).json({
        success: false,
        message: 'Juror not found'
      });
    }
    
    if (!juror.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Juror is already inactive'
      });
    }
    
    // Deactivate juror
    juror.isActive = false;
    await juror.save();
    
    logger.info(`Juror unregistered: ${address}`);
    
    res.json({
      success: true,
      data: juror,
      message: 'Successfully unregistered as juror'
    });
  } catch (error) {
    logger.error('Error unregistering juror:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister as juror'
    });
  }
});

// Update juror stake
router.put('/stake', async (req, res) => {
  try {
    const { address, newStake } = req.body;
    
    if (!address || !newStake) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: address and newStake'
      });
    }
    
    if (newStake < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stake required is 1000 AEG tokens'
      });
    }
    
    const juror = await Juror.findByAddress(address);
    if (!juror) {
      return res.status(404).json({
        success: false,
        message: 'Juror not found'
      });
    }
    
    juror.stake = newStake;
    await juror.save();
    
    logger.info(`Juror stake updated: ${address} to ${newStake}`);
    
    res.json({
      success: true,
      data: juror,
      message: 'Stake updated successfully'
    });
  } catch (error) {
    logger.error('Error updating juror stake:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stake'
    });
  }
});

// Get juror statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Juror.getJurorStats();
    
    // Process stats
    const activeStats = stats.find(s => s._id === true) || { count: 0, totalStake: 0, avgReputation: 0, avgAccuracy: 0 };
    const inactiveStats = stats.find(s => s._id === false) || { count: 0, totalStake: 0, avgReputation: 0, avgAccuracy: 0 };
    
    res.json({
      success: true,
      data: {
        active: activeStats.count,
        inactive: inactiveStats.count,
        total: activeStats.count + inactiveStats.count,
        totalStake: activeStats.totalStake,
        avgReputation: Math.round(activeStats.avgReputation || 0),
        avgAccuracy: Math.round(activeStats.avgAccuracy || 0)
      }
    });
  } catch (error) {
    logger.error('Error fetching juror stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch juror statistics'
    });
  }
});

module.exports = router;

