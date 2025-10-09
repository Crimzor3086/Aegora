#!/bin/bash

# Aegora Setup Script
echo "🚀 Setting up Aegora - Decentralized Arbitration & Trust Marketplace"
echo "=================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOF
# Aegora Frontend Environment Variables

# U2U Network Configuration
NEXT_PUBLIC_CHAIN_ID=39
NEXT_PUBLIC_RPC_URL=https://rpc.u2u.xyz
NEXT_PUBLIC_EXPLORER_URL=https://explorer.u2u.xyz

# Contract Addresses (will be updated after deployment)
NEXT_PUBLIC_TOKEN_AEG_ADDRESS=
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=
NEXT_PUBLIC_DISPUTE_CONTRACT_ADDRESS=
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS=
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=
NEXT_PUBLIC_TIMELOCK_CONTROLLER_ADDRESS=

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id

# Alchemy API Key (optional, for better RPC performance)
NEXT_PUBLIC_ALCHEMY_ID=your-alchemy-api-key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    echo "✅ Created frontend/.env.local"
else
    echo "⚠️  frontend/.env.local already exists"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Aegora Backend Environment Variables

# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aegora

# U2U Network
U2U_RPC_URL=https://rpc.u2u.xyz
U2U_API_KEY=your-u2u-api-key

# IPFS Configuration
IPFS_URL=http://localhost:5001
IPFS_GATEWAY=https://ipfs.io/ipfs/

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Secret (generate a secure random string)
JWT_SECRET=your-jwt-secret-key

# Private Key for contract interactions (keep secure!)
PRIVATE_KEY=your-private-key
EOF
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

# Root .env
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Aegora Root Environment Variables

# U2U Network Configuration
U2U_RPC_URL=https://rpc.u2u.xyz
U2U_API_KEY=your-u2u-api-key

# Private Key for deployment (keep secure!)
PRIVATE_KEY=your-private-key

# Alchemy API Key (optional)
ALCHEMY_API_KEY=your-alchemy-api-key
EOF
    echo "✅ Created .env"
else
    echo "⚠️  .env already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the environment files with your actual values:"
echo "   - Get a WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "   - Add your private key (keep it secure!)"
echo "   - Set up MongoDB if you haven't already"
echo ""
echo "2. Deploy smart contracts:"
echo "   npm run deploy:u2u"
echo ""
echo "3. Start the development servers:"
echo "   npm run dev"
echo ""
echo "📚 For more information, see the README.md file"
echo ""
echo "🔗 Useful links:"
echo "   - U2U Network: https://u2u.xyz"
echo "   - U2U Explorer: https://explorer.u2u.xyz"
echo "   - WalletConnect: https://cloud.walletconnect.com/"
echo ""
echo "Happy building! 🚀"
