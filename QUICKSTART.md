# 🚀 Aegora Quick Start Guide

Get Aegora up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- Git installed
- A U2U network wallet (for deployment)
- MongoDB (for backend)

## 🏃‍♂️ Quick Setup

### 1. Run the Setup Script

```bash
./setup.sh
```

This will:
- Install all dependencies
- Create environment files
- Set up the project structure

### 2. Configure Environment Variables

Edit the following files with your actual values:

**`.env` (Root)**
```bash
PRIVATE_KEY=your-private-key-here
U2U_API_KEY=your-u2u-api-key
```

**`frontend/.env.local`**
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

**`backend/.env`**
```bash
MONGODB_URI=mongodb://localhost:27017/aegora
PRIVATE_KEY=your-private-key-here
```

### 3. Deploy Smart Contracts

```bash
npm run deploy:u2u
```

This will deploy all contracts to U2U network and update the environment files with contract addresses.

### 4. Start Development Servers

```bash
npm run dev
```

This starts both frontend (port 3000) and backend (port 3001).

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies
cd backend && npm install && cd ..
```

### 2. Create Environment Files

Copy the example files and update with your values:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Deploy and Run

```bash
npm run deploy:u2u
npm run dev
```

## 🧪 Testing the Setup

### 1. Check Frontend
- Open http://localhost:3000
- Connect your wallet
- Navigate through the pages

### 2. Check Backend
- Visit http://localhost:3001/health
- Should return: `{"status":"OK","timestamp":"..."}`

### 3. Check Smart Contracts
- Visit U2U Explorer: https://explorer.u2u.xyz
- Search for your deployed contract addresses

## 🐛 Troubleshooting

### Common Issues

**1. "useConfig must be used within WagmiConfig"**
- Make sure you're running the frontend with `npm run dev`
- Check that `_app.jsx` is properly configured

**2. "Cannot connect to MongoDB"**
- Make sure MongoDB is running
- Check the `MONGODB_URI` in `backend/.env`

**3. "Contract deployment failed"**
- Check your private key in `.env`
- Ensure you have U2U tokens for gas fees
- Verify U2U RPC URL is accessible

**4. "Wallet connection failed"**
- Check WalletConnect Project ID
- Make sure you're on the correct network (U2U)

### Getting Help

- Check the [README.md](README.md) for detailed documentation
- Join our [Discord](https://discord.gg/aegora) for support
- Open an issue on [GitHub](https://github.com/aegora/aegora)

## 📚 Next Steps

1. **Explore the Features**
   - Create an escrow transaction
   - Participate in dispute resolution
   - Check your reputation score
   - Vote on governance proposals

2. **Integrate with Your Project**
   - Use the Aegora SDK
   - Integrate the API endpoints
   - Customize the frontend

3. **Deploy to Production**
   - Set up production environment
   - Configure monitoring
   - Set up CI/CD pipeline

## 🎯 Key Features to Try

- **Escrow**: Create a secure transaction
- **Disputes**: File a dispute and see arbitration
- **Reputation**: Build your trust score
- **Governance**: Participate in DAO decisions

Happy building! 🚀
