// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title ReputationContract
 * @dev Manages reputation scores and Soulbound Tokens (SBTs) for users
 */
contract ReputationContract is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    struct ReputationData {
        uint256 score;
        uint256 totalTransactions;
        uint256 successfulTransactions;
        uint256 disputesParticipated;
        uint256 disputesWon;
        uint256 lastUpdated;
        bool isActive;
    }
    
    struct ArbitrationRecord {
        uint256 disputeId;
        address user;
        bool wasJuror;
        bool won;
        uint256 timestamp;
        string evidenceHash;
    }
    
    // User address => Reputation data
    mapping(address => ReputationData) public reputations;
    
    // User address => Arbitration records
    mapping(address => ArbitrationRecord[]) public arbitrationHistory;
    
    // Reputation tiers
    mapping(uint256 => string) public reputationTiers;
    
    // Events
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 change);
    event ArbitrationRecordAdded(address indexed user, uint256 disputeId, bool wasJuror, bool won);
    event ReputationTierUpdated(uint256 tier, string name);
    
    uint256 private _nextTokenId = 1;
    
    constructor() ERC721("Aegora Reputation", "AEG-REP") {
        // Initialize reputation tiers
        reputationTiers[0] = "Newcomer";
        reputationTiers[100] = "Trusted";
        reputationTiers[500] = "Expert";
        reputationTiers[1000] = "Master";
        reputationTiers[2000] = "Legend";
    }
    
    /**
     * @dev Update reputation after a successful transaction
     * @param user Address of the user
     * @param success Whether the transaction was successful
     */
    function updateTransactionReputation(address user, bool success) external onlyOwner {
        ReputationData storage rep = reputations[user];
        
        rep.totalTransactions++;
        if (success) {
            rep.successfulTransactions++;
            rep.score += 10; // +10 points for successful transaction
        } else {
            rep.score = rep.score > 5 ? rep.score - 5 : 0; // -5 points for failed transaction
        }
        
        rep.lastUpdated = block.timestamp;
        rep.isActive = true;
        
        emit ReputationUpdated(user, rep.score, success ? 10 : -5);
        
        // Mint or update SBT
        _updateSBT(user);
    }
    
    /**
     * @dev Add arbitration record
     * @param user Address of the user
     * @param disputeId ID of the dispute
     * @param wasJuror Whether user was a juror
     * @param won Whether user won the dispute
     * @param evidenceHash IPFS hash of evidence
     */
    function addArbitrationRecord(
        address user,
        uint256 disputeId,
        bool wasJuror,
        bool won,
        string memory evidenceHash
    ) external onlyOwner {
        ReputationData storage rep = reputations[user];
        
        ArbitrationRecord memory record = ArbitrationRecord({
            disputeId: disputeId,
            user: user,
            wasJuror: wasJuror,
            won: won,
            timestamp: block.timestamp,
            evidenceHash: evidenceHash
        });
        
        arbitrationHistory[user].push(record);
        
        if (wasJuror) {
            rep.disputesParticipated++;
            if (won) {
                rep.disputesWon++;
                rep.score += 25; // +25 points for winning as juror
            } else {
                rep.score = rep.score > 10 ? rep.score - 10 : 0; // -10 points for losing as juror
            }
        } else {
            if (won) {
                rep.score += 15; // +15 points for winning dispute
            } else {
                rep.score = rep.score > 5 ? rep.score - 5 : 0; // -5 points for losing dispute
            }
        }
        
        rep.lastUpdated = block.timestamp;
        rep.isActive = true;
        
        emit ArbitrationRecordAdded(user, disputeId, wasJuror, won);
        emit ReputationUpdated(user, rep.score, won ? (wasJuror ? 25 : 15) : (wasJuror ? -10 : -5));
        
        // Mint or update SBT
        _updateSBT(user);
    }
    
    /**
     * @dev Get user's reputation data
     * @param user Address of the user
     */
    function getReputation(address user) external view returns (ReputationData memory) {
        return reputations[user];
    }
    
    /**
     * @dev Get user's arbitration history
     * @param user Address of the user
     */
    function getArbitrationHistory(address user) external view returns (ArbitrationRecord[] memory) {
        return arbitrationHistory[user];
    }
    
    /**
     * @dev Get reputation tier name
     * @param score Reputation score
     */
    function getReputationTier(uint256 score) external view returns (string memory) {
        if (score >= 2000) return reputationTiers[2000];
        if (score >= 1000) return reputationTiers[1000];
        if (score >= 500) return reputationTiers[500];
        if (score >= 100) return reputationTiers[100];
        return reputationTiers[0];
    }
    
    /**
     * @dev Get user's current tier
     * @param user Address of the user
     */
    function getUserTier(address user) external view returns (string memory) {
        return this.getReputationTier(reputations[user].score);
    }
    
    /**
     * @dev Calculate reputation score based on various factors
     * @param user Address of the user
     */
    function calculateReputationScore(address user) external view returns (uint256) {
        ReputationData memory rep = reputations[user];
        
        if (rep.totalTransactions == 0) return 0;
        
        // Base score from successful transactions
        uint256 baseScore = (rep.successfulTransactions * 100) / rep.totalTransactions;
        
        // Bonus for arbitration participation
        uint256 arbitrationBonus = rep.disputesParticipated * 5;
        
        // Bonus for arbitration success rate
        if (rep.disputesParticipated > 0) {
            uint256 successRate = (rep.disputesWon * 100) / rep.disputesParticipated;
            arbitrationBonus += (successRate * rep.disputesParticipated) / 10;
        }
        
        return baseScore + arbitrationBonus;
    }
    
    /**
     * @dev Update reputation tier
     * @param tier Tier level
     * @param name Tier name
     */
    function updateReputationTier(uint256 tier, string memory name) external onlyOwner {
        reputationTiers[tier] = name;
        emit ReputationTierUpdated(tier, name);
    }
    
    /**
     * @dev Internal function to mint or update SBT
     * @param user Address of the user
     */
    function _updateSBT(address user) internal {
        uint256 tokenId = uint256(uint160(user)); // Use address as token ID
        
        if (!_exists(tokenId)) {
            _safeMint(user, tokenId);
        }
        
        // Update token URI with reputation data
        string memory metadata = _generateMetadata(user);
        _setTokenURI(tokenId, metadata);
    }
    
    /**
     * @dev Generate metadata for SBT
     * @param user Address of the user
     */
    function _generateMetadata(address user) internal view returns (string memory) {
        ReputationData memory rep = reputations[user];
        string memory tier = this.getReputationTier(rep.score);
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(abi.encodePacked(
                '{"name":"Aegora Reputation Token",',
                '"description":"Soulbound token representing reputation in Aegora protocol",',
                '"attributes":[',
                '{"trait_type":"Score","value":', _toString(rep.score), '},',
                '{"trait_type":"Tier","value":"', tier, '"},',
                '{"trait_type":"Total Transactions","value":', _toString(rep.totalTransactions), '},',
                '{"trait_type":"Success Rate","value":', _toString((rep.successfulTransactions * 100) / (rep.totalTransactions > 0 ? rep.totalTransactions : 1)), '%},',
                '{"trait_type":"Arbitrations","value":', _toString(rep.disputesParticipated), '}',
                ']}'
            ))
        ));
    }
    
    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
    /**
     * @dev Base64 encode
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, add(32, i))), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(250, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(244, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(238, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(232, input), 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }
    
    // Override required functions
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        require(from == address(0) || to == address(0), "ReputationContract: SBTs cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
