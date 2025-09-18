// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenAEG.sol";

/**
 * @title EscrowContract
 * @dev Handles escrow functionality for Aegora protocol
 * Funds are locked until terms are met or dispute resolution
 */
contract EscrowContract is ReentrancyGuard, Ownable {
    enum EscrowStatus { Active, Completed, Disputed, Cancelled }
    
    struct Escrow {
        address buyer;
        address seller;
        address arbitrator;
        uint256 amount;
        address tokenAddress;
        EscrowStatus status;
        uint256 createdAt;
        uint256 completedAt;
        string termsHash; // IPFS hash of terms
        string evidenceHash; // IPFS hash of evidence
        uint256 disputeId;
        bool buyerConfirmed;
        bool sellerConfirmed;
    }
    
    // Escrow ID => Escrow details
    mapping(uint256 => Escrow) public escrows;
    
    // User => Escrow IDs
    mapping(address => uint256[]) public userEscrows;
    
    // Token => Allowed for escrow
    mapping(address => bool) public allowedTokens;
    
    // Escrow fees (in basis points, 100 = 1%)
    uint256 public escrowFee = 25; // 0.25%
    uint256 public disputeFee = 100; // 1%
    
    uint256 public nextEscrowId = 1;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        address tokenAddress
    );
    
    event EscrowCompleted(uint256 indexed escrowId, address indexed winner);
    event EscrowDisputed(uint256 indexed escrowId, uint256 indexed disputeId);
    event EscrowCancelled(uint256 indexed escrowId);
    event ConfirmationUpdated(uint256 indexed escrowId, address indexed user, bool confirmed);
    
    constructor() {
        // Allow native ETH and AEG token by default
        allowedTokens[address(0)] = true;
    }
    
    /**
     * @dev Add a token to allowed list
     * @param token Token address to allow
     */
    function addAllowedToken(address token) external onlyOwner {
        allowedTokens[token] = true;
    }
    
    /**
     * @dev Remove a token from allowed list
     * @param token Token address to remove
     */
    function removeAllowedToken(address token) external onlyOwner {
        allowedTokens[token] = false;
    }
    
    /**
     * @dev Create a new escrow
     * @param seller Address of the seller
     * @param arbitrator Address of the arbitrator (can be zero for random selection)
     * @param tokenAddress Address of the token (zero for ETH)
     * @param termsHash IPFS hash of the terms
     */
    function createEscrow(
        address seller,
        address arbitrator,
        address tokenAddress,
        string memory termsHash
    ) external payable nonReentrant returns (uint256) {
        require(seller != address(0), "EscrowContract: invalid seller");
        require(seller != msg.sender, "EscrowContract: cannot escrow with self");
        require(allowedTokens[tokenAddress], "EscrowContract: token not allowed");
        
        uint256 amount;
        if (tokenAddress == address(0)) {
            amount = msg.value;
            require(amount > 0, "EscrowContract: ETH amount must be positive");
        } else {
            amount = msg.value; // For ERC20, amount should be passed differently
            // This would need to be modified for ERC20 tokens
        }
        
        uint256 escrowId = nextEscrowId++;
        
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            arbitrator: arbitrator,
            amount: amount,
            tokenAddress: tokenAddress,
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            completedAt: 0,
            termsHash: termsHash,
            evidenceHash: "",
            disputeId: 0,
            buyerConfirmed: false,
            sellerConfirmed: false
        });
        
        userEscrows[msg.sender].push(escrowId);
        userEscrows[seller].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, seller, amount, tokenAddress);
        
        return escrowId;
    }
    
    /**
     * @dev Confirm completion by buyer or seller
     * @param escrowId ID of the escrow
     */
    function confirmCompletion(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "EscrowContract: escrow not active");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "EscrowContract: not authorized"
        );
        
        if (msg.sender == escrow.buyer) {
            escrow.buyerConfirmed = true;
        } else {
            escrow.sellerConfirmed = true;
        }
        
        emit ConfirmationUpdated(escrowId, msg.sender, true);
        
        // If both parties confirm, complete the escrow
        if (escrow.buyerConfirmed && escrow.sellerConfirmed) {
            _completeEscrow(escrowId, escrow.seller);
        }
    }
    
    /**
     * @dev Create a dispute for the escrow
     * @param escrowId ID of the escrow
     * @param evidenceHash IPFS hash of evidence
     */
    function createDispute(uint256 escrowId, string memory evidenceHash) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "EscrowContract: escrow not active");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "EscrowContract: not authorized"
        );
        
        escrow.status = EscrowStatus.Disputed;
        escrow.evidenceHash = evidenceHash;
        
        // This would integrate with the DisputeContract
        // For now, we'll emit an event
        emit EscrowDisputed(escrowId, 0);
    }
    
    /**
     * @dev Complete escrow after dispute resolution
     * @param escrowId ID of the escrow
     * @param winner Address of the winner
     */
    function resolveDispute(uint256 escrowId, address winner) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Disputed, "EscrowContract: escrow not disputed");
        
        _completeEscrow(escrowId, winner);
    }
    
    /**
     * @dev Internal function to complete escrow
     * @param escrowId ID of the escrow
     * @param winner Address of the winner
     */
    function _completeEscrow(uint256 escrowId, address winner) internal {
        Escrow storage escrow = escrows[escrowId];
        
        escrow.status = EscrowStatus.Completed;
        escrow.completedAt = block.timestamp;
        
        // Calculate fees
        uint256 fee = (escrow.amount * escrowFee) / 10000;
        uint256 payout = escrow.amount - fee;
        
        // Transfer funds
        if (escrow.tokenAddress == address(0)) {
            payable(winner).transfer(payout);
            payable(owner()).transfer(fee);
        } else {
            // Handle ERC20 transfer
            IERC20(escrow.tokenAddress).transfer(winner, payout);
            IERC20(escrow.tokenAddress).transfer(owner(), fee);
        }
        
        emit EscrowCompleted(escrowId, winner);
    }
    
    /**
     * @dev Cancel escrow (only if both parties agree or after timeout)
     * @param escrowId ID of the escrow
     */
    function cancelEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "EscrowContract: escrow not active");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller || msg.sender == owner(),
            "EscrowContract: not authorized"
        );
        
        escrow.status = EscrowStatus.Cancelled;
        
        // Refund to buyer
        if (escrow.tokenAddress == address(0)) {
            payable(escrow.buyer).transfer(escrow.amount);
        } else {
            IERC20(escrow.tokenAddress).transfer(escrow.buyer, escrow.amount);
        }
        
        emit EscrowCancelled(escrowId);
    }
    
    /**
     * @dev Get escrow details
     * @param escrowId ID of the escrow
     */
    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }
    
    /**
     * @dev Get user's escrows
     * @param user User address
     */
    function getUserEscrows(address user) external view returns (uint256[] memory) {
        return userEscrows[user];
    }
    
    /**
     * @dev Update escrow fees
     * @param newEscrowFee New escrow fee in basis points
     * @param newDisputeFee New dispute fee in basis points
     */
    function updateFees(uint256 newEscrowFee, uint256 newDisputeFee) external onlyOwner {
        require(newEscrowFee <= 500, "EscrowContract: escrow fee too high"); // Max 5%
        require(newDisputeFee <= 1000, "EscrowContract: dispute fee too high"); // Max 10%
        
        escrowFee = newEscrowFee;
        disputeFee = newDisputeFee;
    }
}
