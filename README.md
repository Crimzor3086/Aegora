# Aegora – The Decentralized Arbitration & Trust Marketplace


contract address 0x7c538b83D0295f94C4bBAf8302095d9ED4b2Ad5f


Aegora is a decentralized arbitration and reputation protocol designed to solve the problem of trust in peer-to-peer digital interactions.

## 🌟 Overview

In today's Web3 economy, millions of transactions occur daily across NFT markets, DeFi platforms, freelance marketplaces, and P2P trades. But when deals go wrong — disputes, fraud, or broken agreements — users often have no fair and transparent way to resolve conflicts.

Aegora introduces a trustless dispute resolution system where escrow, arbitration, and reputation are handled entirely on-chain, governed by a DAO instead of centralized platforms.

## ✨ Key Features

### 🔒 Decentralized Escrow
- Funds are locked in smart contracts
- Automatically released when terms are met
- If disputes arise, funds move to arbitration

### ⚖️ On-Chain Arbitration
- Disputes are resolved by randomly selected jurors
- Jurors stake $AEG tokens to participate
- Voting is commit-reveal, ensuring fairness
- Rewards for honest jurors, penalties for misconduct

### 🏆 Reputation System
- Every user and arbitrator has a trust score
- Scores increase with successful trades and fair rulings
- Soulbound tokens (SBTs) store arbitration history

### 🗳️ DAO Governance
- The AegoraDAO decides policies, fees, and upgrades
- Token holders vote on arbitration rules, juror rewards, and integration priorities

### 🔗 Interoperable Trust Layer
- SDK + APIs let any Web3 project integrate Aegora
- NFT markets, DeFi protocols, and freelance platforms can plug into Aegora's arbitration system
- Cross-chain support ensures global adoption

## 🎯 Problem Aegora Solves

- **Centralized Arbitration**: Current marketplaces (e.g., Upwork, OpenSea) control dispute resolution with no transparency
- **Fraud & Scams**: Users can be scammed in P2P trades without recourse
- **Lack of Global Trust**: Reputation systems are siloed per platform
- **Expensive & Slow Courts**: Traditional legal systems are inaccessible for small digital disputes

Aegora solves this with a borderless, transparent, decentralized arbitration court that anyone can use.

## 🔗 Use Cases

- **NFT trades**: Disputes on authenticity or delivery
- **Freelance contracts**: Disputes over milestones and payments
- **P2P crypto trades**: Trustless escrow for OTC deals
- **DeFi agreements**: Resolution of governance or DAO treasury disputes
- **Cross-border commerce**: Global arbitration without relying on local legal systems

## ⚡ Technology Stack

- **Smart Contracts**: Ethereum + L2s → Escrow, disputes, governance
- **IPFS/Arweave**: Off-chain evidence storage
- **The Graph**: Fast dispute & reputation queries
- **Zero-Knowledge Proofs**: Privacy for sensitive credentials
- **$AEG Token**: Used for staking, governance, and fee payments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- U2U network RPC access

### Installation

1. **Clone the repository**
   See `RUNNING_LOCALLY.md` for copy-paste commands to clone and prepare the repository.

2. **Install dependencies**

   See `RUNNING_LOCALLY.md` for exact install commands for root, frontend and backend dependencies.

3. **Set up environment variables**

   See `RUNNING_LOCALLY.md` for example env file locations and recommended variables to set.

4. **Deploy smart contracts**

   Deployment commands and smart-contract steps are documented in `RUNNING_LOCALLY.md`.

5. **Start the development servers**

   Start-up commands for the full development stack (frontend, backend, and MongoDB) are in `RUNNING_LOCALLY.md`.

> For a concise, copy-paste friendly set of commands to run the whole stack locally (frontend, backend, MongoDB, and optional contract steps), see `RUNNING_LOCALLY.md` in the repo root.


## 📁 Project Structure

```
aegora/
├── contracts/           # Smart contracts
│   ├── TokenAEG.sol
│   ├── EscrowContract.sol
│   ├── DisputeContract.sol
│   ├── ReputationContract.sol
│   └── GovernanceContract.sol
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── backend/             # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── db/
│   └── package.json
├── subgraph/            # The Graph indexing
├── scripts/             # Deployment scripts
├── test/               # Test files
└── docs/               # Documentation
```

## 🔧 Development

### Smart Contracts

See `RUNNING_LOCALLY.md` for quick copy-paste commands to compile, test, and deploy contracts.

### Frontend

Frontend run/build/start commands are documented in `RUNNING_LOCALLY.md` (copy-paste friendly).

### Backend

Backend run/build/start/test commands are documented in `RUNNING_LOCALLY.md`.

## 🧪 Testing

See `RUNNING_LOCALLY.md` for example test commands and how to run each component's tests.

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Governance Guide](docs/GOVERNANCE.md)
- [Tokenomics](docs/TOKENOMICS.md)

## 🌐 Network Configuration

### U2U Network

- **Chain ID**: 39 (Mainnet), 248 (Testnet)
- **RPC URL**: https://rpc.u2u.xyz
- **Explorer**: https://explorer.u2u.xyz

### Environment Variables

```bash
# Smart Contracts
PRIVATE_KEY=your_private_key
U2U_RPC_URL=https://rpc.u2u.xyz
U2U_API_KEY=your_api_key

# Backend
MONGODB_URI=mongodb://localhost:27017/aegora
IPFS_URL=http://localhost:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Frontend
NEXT_PUBLIC_CHAIN_ID=39
NEXT_PUBLIC_RPC_URL=https://rpc.u2u.xyz
NEXT_PUBLIC_TOKEN_AEG_ADDRESS=0x...
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.aegora.io](https://docs.aegora.io)
- **Discord**: [discord.gg/aegora](https://discord.gg/aegora)
- **Twitter**: [@AegoraProtocol](https://twitter.com/AegoraProtocol)
- **Email**: support@aegora.io

## 🗺️ Roadmap

### Phase 1: Core Protocol (Q1 2024)
- [x] Smart contract development
- [x] Basic escrow functionality
- [x] Dispute resolution system
- [x] Reputation mechanism

### Phase 2: Platform Launch (Q2 2024)
- [x] Frontend application
- [x] Backend API
- [x] U2U network deployment
- [ ] Public beta testing

### Phase 3: Ecosystem Growth (Q3 2024)
- [ ] SDK development
- [ ] Third-party integrations
- [ ] Cross-chain support
- [ ] Advanced features

### Phase 4: Global Adoption (Q4 2024)
- [ ] Mobile applications
- [ ] Enterprise solutions
- [ ] Regulatory compliance
- [ ] Global partnerships

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- The Graph for indexing infrastructure
- U2U Network for blockchain infrastructure
- The Web3 community for inspiration and support

---

**Built with ❤️ by the Aegora Team**

*Trust Without Centralization*
