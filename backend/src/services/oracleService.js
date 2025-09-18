const { ethers } = require('ethers');
const logger = require('../utils/logger');

class OracleService {
  constructor() {
    this.provider = null;
    this.contracts = {};
    this.init();
  }

  async init() {
    try {
      const rpcUrl = process.env.U2U_RPC_URL || 'https://rpc.u2u.xyz';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test connection
      const network = await this.provider.getNetwork();
      logger.info(`Connected to U2U network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Initialize contract instances
      await this.initializeContracts();
    } catch (error) {
      logger.error('Failed to connect to U2U network:', error);
      throw error;
    }
  }

  async initializeContracts() {
    try {
      const contractAddresses = {
        tokenAEG: process.env.TOKEN_AEG_ADDRESS,
        escrowContract: process.env.ESCROW_CONTRACT_ADDRESS,
        disputeContract: process.env.DISPUTE_CONTRACT_ADDRESS,
        reputationContract: process.env.REPUTATION_CONTRACT_ADDRESS,
        governanceContract: process.env.GOVERNANCE_CONTRACT_ADDRESS
      };

      // Load contract ABIs (in production, these would be loaded from files)
      const contractABIs = {
        tokenAEG: require('../../contracts/abis/TokenAEG.json'),
        escrowContract: require('../../contracts/abis/EscrowContract.json'),
        disputeContract: require('../../contracts/abis/DisputeContract.json'),
        reputationContract: require('../../contracts/abis/ReputationContract.json'),
        governanceContract: require('../../contracts/abis/GovernanceContract.json')
      };

      for (const [name, address] of Object.entries(contractAddresses)) {
        if (address && contractABIs[name]) {
          this.contracts[name] = new ethers.Contract(
            address,
            contractABIs[name],
            this.provider
          );
          logger.info(`Initialized ${name} contract at ${address}`);
        }
      }
    } catch (error) {
      logger.error('Error initializing contracts:', error);
    }
  }

  /**
   * Get contract instance
   * @param {string} contractName - Name of the contract
   * @returns {ethers.Contract} - Contract instance
   */
  getContract(contractName) {
    const contract = this.contracts[contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not initialized`);
    }
    return contract;
  }

  /**
   * Get provider instance
   * @returns {ethers.JsonRpcProvider} - Provider instance
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get current block number
   * @returns {Promise<number>} - Current block number
   */
  async getCurrentBlock() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting current block:', error);
      throw error;
    }
  }

  /**
   * Get transaction by hash
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransaction(txHash) {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} - Transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Get balance of an address
   * @param {string} address - Address to check
   * @returns {Promise<string>} - Balance in wei
   */
  async getBalance(address) {
    try {
      return await this.provider.getBalance(address);
    } catch (error) {
      logger.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get token balance
   * @param {string} tokenAddress - Token contract address
   * @param {string} userAddress - User address
   * @returns {Promise<string>} - Token balance
   */
  async getTokenBalance(tokenAddress, userAddress) {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      );
      
      return await tokenContract.balanceOf(userAddress);
    } catch (error) {
      logger.error('Error getting token balance:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   * @param {string} contractName - Name of the contract
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback function
   */
  listenToEvent(contractName, eventName, callback) {
    try {
      const contract = this.getContract(contractName);
      contract.on(eventName, callback);
      logger.info(`Listening to ${eventName} events on ${contractName}`);
    } catch (error) {
      logger.error('Error setting up event listener:', error);
      throw error;
    }
  }

  /**
   * Get past events from contract
   * @param {string} contractName - Name of the contract
   * @param {string} eventName - Name of the event
   * @param {Object} filter - Event filter
   * @param {number} fromBlock - Starting block
   * @param {number} toBlock - Ending block
   * @returns {Promise<Array>} - Array of events
   */
  async getPastEvents(contractName, eventName, filter = {}, fromBlock = 0, toBlock = 'latest') {
    try {
      const contract = this.getContract(contractName);
      return await contract.queryFilter(
        contract.filters[eventName](filter),
        fromBlock,
        toBlock
      );
    } catch (error) {
      logger.error('Error getting past events:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for a transaction
   * @param {Object} tx - Transaction object
   * @returns {Promise<string>} - Estimated gas
   */
  async estimateGas(tx) {
    try {
      return await this.provider.estimateGas(tx);
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  /**
   * Get gas price
   * @returns {Promise<string>} - Current gas price
   */
  async getGasPrice() {
    try {
      return await this.provider.getFeeData();
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   * @param {string} txHash - Transaction hash
   * @param {number} confirmations - Number of confirmations to wait for
   * @returns {Promise<Object>} - Transaction receipt
   */
  async waitForTransaction(txHash, confirmations = 1) {
    try {
      return await this.provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      logger.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  /**
   * Format address to checksum format
   * @param {string} address - Address to format
   * @returns {string} - Checksum address
   */
  formatAddress(address) {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      logger.error('Error formatting address:', error);
      throw error;
    }
  }

  /**
   * Validate address format
   * @param {string} address - Address to validate
   * @returns {boolean} - Valid status
   */
  isValidAddress(address) {
    try {
      ethers.getAddress(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert wei to ether
   * @param {string} wei - Amount in wei
   * @returns {string} - Amount in ether
   */
  formatEther(wei) {
    return ethers.formatEther(wei);
  }

  /**
   * Convert ether to wei
   * @param {string} ether - Amount in ether
   * @returns {string} - Amount in wei
   */
  parseEther(ether) {
    return ethers.parseEther(ether);
  }
}

module.exports = new OracleService();
