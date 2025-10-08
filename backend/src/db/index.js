const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection options
const options = {
  autoIndex: true,     // Build indexes
  maxPoolSize: 10,     // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000,  // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000,          // Close sockets after 45 seconds of inactivity
  family: 4,                       // Use IPv4, skip trying IPv6
  retryWrites: true
};

const connect = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aegora';
    
    await mongoose.connect(mongoUri, options);
    
    logger.info('✅ MongoDB connected');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect
};
