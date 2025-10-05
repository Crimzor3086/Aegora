const { ethers } = require('ethers');
const logger = require('./logger');

// Get AEG token balance for an address
async function getAEGBalance(address, tokenAddress, rpcUrl) {
  try {
    if (!address || !tokenAddress || !rpcUrl) {
      throw new Error('Missing required parameters: address, tokenAddress, rpcUrl');
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // AEG Token ABI (minimal for balance check)
    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)"
    ];
    
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
    
    // Get balance and decimals
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals()
    ]);
    
    // Convert to readable format
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    return {
      raw: balance.toString(),
      formatted: parseFloat(formattedBalance),
      decimals: decimals
    };
  } catch (error) {
    logger.error('Error fetching AEG balance:', error);
    throw error;
  }
}

module.exports = {
  getAEGBalance
};
