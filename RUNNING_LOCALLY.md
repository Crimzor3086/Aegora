# Run Aegora locally

This document shows the exact commands to run the entire Aegora stack locally (frontend, backend, and smart-contract tooling). Use these steps on a development machine (Linux/macOS/WSL).

## Prerequisites

- Node.js 18+ and npm (check with `node -v` and `npm -v`)
- Git
- MongoDB (local or remote). For local: MongoDB community server or Docker image.
- (Optional) Docker & Docker Compose
- (Optional) npx and hardhat for contracts

## Quick steps (copy/paste)

# 1) Clone repository
git clone https://github.com/aegora/aegora.git
cd aegora

# 2) Install root dev tools and libs
npm install

# 3) Install frontend & backend deps
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 4) Create environment files
# Copy example env files (edit values as needed)
cp .env.example .env || true
cp frontend/.env.example frontend/.env.local || true
cp backend/.env.example backend/.env || true

# 5) Start MongoDB (local)
# If you have MongoDB installed:
#   sudo service mongod start
# OR using Docker:
#   docker run -d --name aegora-mongo -p 27017:27017 -v aegora-mongo-data:/data/db mongo:6

# 6) Start backend (port 3001)
cd backend
npm run dev
# backend should log listening on port 3001
cd ..

# 7) Start frontend (port 3000)
cd frontend
npm run dev
# frontend should log listening on port 3000
cd ..

# 8) Open the app
# Frontend: http://localhost:3000
# Backend health (example): http://localhost:3001/health

## Smart contracts (optional)
# Compile contracts
npm run compile
# Deploy to U2U testnet (if you have env vars configured)
npm run deploy:testnet

## Smoke tests (curl)
# Check backend health
curl -s http://localhost:3001/health | jq
# Get reputation for an address
curl -s http://localhost:3001/api/reputation/0x0000000000000000000000000000000000000000 | jq

## Troubleshooting
- If frontend cannot reach backend, ensure `frontend/src/config/env.js`'s `apiUrl` matches your backend host (default: http://localhost:3001)
- If Mongo errors occur, ensure MongoDB is running and `MONGODB_URI` in `backend/.env` is correct

## Notes
- The `npm run dev` script from the repository root runs both frontend and backend concurrently (requires `concurrently`).
- For production builds, run `npm run build` and then `npm run build:frontend` and start the servers with `npm start` in their respective directories.

---
If you want, I can add a small `Makefile` or `docker-compose.yml` snippet to simplify starting everything with a single command.