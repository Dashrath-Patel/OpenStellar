<div align="center">
  
  # 🌟 OpenStellar
  
  **Decentralized Bounty Platform on Stellar Blockchain**
  
  [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Stellar](https://img.shields.io/badge/Stellar-Blockchain-blue)](https://stellar.org)
  [![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-green)](https://soroban.stellar.org)
  
  [Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)
  
</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
  - [Prerequisites](#prerequisites)
  - [Smart Contract Deployment](#1-smart-contract-deployment)
  - [Backend Setup](#2-backend-setup)
  - [Frontend Setup](#3-frontend-setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Smart Contract Modules](#-smart-contract-modules)
- [Workflow](#-workflow)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact & Resources](#-contact--resources)

---

## 🎯 Overview

**OpenStellar** is a decentralized bounty management platform built on the Stellar blockchain, leveraging Soroban smart contracts for secure escrow functionality. The platform enables developers and organizations to create, participate in, and complete bounties with transparent, blockchain-based payment settlements.

### Key Highlights

- 🔒 **Secure Escrow**: Smart contract-based fund management
- 💰 **Real Stellar Payments**: Automatic XLM/token transfers on work approval
- 🔗 **GitHub Integration**: Seamless issue tracking and notifications
- 🎨 **Modern UI**: Built with React, Material-UI, and TailwindCSS
- 🌐 **Decentralized**: Transparent and trustless bounty management

---

## ✨ Features

### For Bounty Creators
- ✅ Create bounties with customizable rewards
- ✅ Link GitHub issues to bounties
- ✅ Review and approve/reject submitted work
- ✅ Automatic payment settlement via Stellar blockchain
- ✅ Cancel bounties and receive refunds

### For Developers
- ✅ Browse and apply for bounties
- ✅ Submit work for review
- ✅ Receive payments directly to Stellar wallet
- ✅ Track application and work status
- ✅ GitHub notifications for updates

### Platform Features
- ✅ GitHub OAuth authentication
- ✅ Real-time bounty status updates
- ✅ Transaction history and verification
- ✅ Responsive design for mobile and desktop
- ✅ Multiple wallet support (Freighter, Albedo, xBull)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│              (React + Material-UI + TailwindCSS)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      Backend API Server                          │
│              (Node.js + Express + MongoDB)                       │
│  • Authentication  • GitHub Integration  • Payment Processing   │
└────────────┬───────────────────────────────────┬────────────────┘
             │                                    │
┌────────────┴────────────┐         ┌───────────┴────────────────┐
│   Stellar Network       │         │   GitHub API               │
│  • Payment Settlement   │         │  • Issue Tracking          │
│  • Transaction Verify   │         │  • Notifications           │
└─────────────────────────┘         └────────────────────────────┘
             │
┌────────────┴────────────┐
│  Soroban Smart Contract │
│  • Bounty Management    │
│  • Escrow Logic         │
│  • Fee Management       │
└─────────────────────────┘
```

### Workflow Diagram

```
Creator                  Platform                  Participant
   │                        │                          │
   ├─── Create Bounty ─────>│                          │
   │                        ├─── Fund Escrow ────>     │
   │                        │                          │
   │                        │<──── Apply for Bounty ───┤
   │<─── Review Application─┤                          │
   ├─── Approve Application>│                          │
   │                        ├─── Assignment Notice ───>│
   │                        │                          │
   │                        │<──── Submit Work ────────┤
   │<─── Review Work ───────┤                          │
   │                        │                          │
   ├─── Approve Work ──────>│                          │
   │                        ├─── Release Payment ────>│
   │                        │    (Stellar Blockchain)  │
   │                        ├─── Notify via GitHub ──>│
```

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **UI Libraries**: Material-UI 5.18, TailwindCSS 3.4
- **State Management**: Redux Toolkit 2.3
- **Routing**: React Router 6.28
- **Stellar Integration**: Stellar Wallets Kit, Stellar SDK 14.3
- **Build Tool**: Vite 5.4

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18
- **Database**: MongoDB 5.5 with Mongoose 7.0
- **Authentication**: JWT, GitHub OAuth
- **Blockchain**: Stellar SDK 14.3
- **Process Manager**: PM2 5.3

### Smart Contracts
- **Platform**: Soroban (Stellar)
- **Language**: Rust (Edition 2021)
- **SDK**: soroban-sdk 23

### DevOps
- **Web Server**: Nginx
- **Version Control**: Git
- **Package Manager**: npm/yarn

---

## 🚀 Quick Start

### One-Command Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Dashrath-Patel/OpenStellar.git
cd OpenStellar/openstellar

# Install all dependencies
npm run install-all  # (if available)

# Or manually:
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && cargo build
```

### Run the Application

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm start

# Access at: http://localhost:5173
```

---

## 📚 Detailed Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Rust** (latest stable) - [Install](https://rustup.rs/)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- **Soroban CLI** (v0.8.0+)
  ```bash
  cargo install --locked soroban-cli
  ```
- **WebAssembly Target**
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- **Git** - [Download](https://git-scm.com/)

### 1. Smart Contract Deployment

#### Build the Contract

```bash
cd contracts

# Build the smart contract
soroban contract build
# or
make build
```

#### Deploy to Stellar Network

**Testnet Deployment:**

```bash
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/soroban_escrow_smart_contract.wasm \
    --source <YOUR_SECRET_KEY> \
    --rpc-url https://soroban-testnet.stellar.org \
    --network-passphrase 'Test SDF Network ; September 2015'
```

**Save the Contract ID** that is returned - you'll need it for configuration.

#### Generate TypeScript Bindings

```bash
soroban contract bindings typescript \
    --wasm target/wasm32-unknown-unknown/release/soroban_escrow_smart_contract.wasm \
    --output-dir ../frontend/openstellar_module \
    --contract-id <YOUR_CONTRACT_ID> \
    --rpc-url https://soroban-testnet.stellar.org \
    --network-passphrase 'Test SDF Network ; September 2015'
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/openstellar

# GitHub OAuth (Get from: https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Stellar Configuration
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_CONTRACT_ID=<YOUR_CONTRACT_ID>

# Creator Wallet (for testing)
SECRETKEY=<YOUR_STELLAR_SECRET_KEY>

# Encryption Key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=<GENERATED_ENCRYPTION_KEY>
```

#### Setup GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: OpenStellar Local
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env`

#### Start the Backend

```bash
# Development mode
npm start

# Production mode with PM2
npm run start-server

# Stop PM2 server
npm run stop-server
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STELLAR_NETWORK=testnet
VITE_CONTRACT_ID=<YOUR_CONTRACT_ID>
```

#### Start the Frontend

```bash
# Development server
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend will run on `http://localhost:5173`

---

## 📁 Project Structure

```
openstellar/
├── 📄 README.md                    # This file
├── 📄 LICENSE                      # GPL v3 License
│
├── 📂 contracts/                   # Soroban Smart Contracts
│   ├── 📄 Cargo.toml              # Rust dependencies
│   ├── 📄 Makefile                # Build automation
│   ├── 📂 src/
│   │   ├── 📄 lib.rs              # Contract entry point
│   │   ├── 📄 bounty.rs           # Bounty management
│   │   ├── 📄 work.rs             # Work submission logic
│   │   ├── 📄 fee.rs              # Fee management
│   │   ├── 📄 admin.rs            # Admin functions
│   │   ├── 📄 storage_types.rs    # Data structures
│   │   └── 📄 test.rs             # Contract tests
│   └── 📂 scripts/                # Deployment scripts
│
├── 📂 backend/                     # Node.js Backend
│   ├── 📄 package.json
│   ├── 📄 .env.example            # Environment template
│   ├── 📂 src/
│   │   ├── 📄 index.js            # Express server
│   │   ├── 📂 routes/             # API endpoints
│   │   │   ├── 📄 auth.js         # Authentication
│   │   │   ├── 📄 bounty.js       # Bounty CRUD
│   │   │   ├── 📄 applications.js # Application management
│   │   │   ├── 📄 workSubmissions.js
│   │   │   ├── 📄 github.js       # GitHub integration
│   │   │   ├── 📄 stellar.js      # Stellar queries
│   │   │   └── 📄 webhooks.js     # GitHub webhooks
│   │   ├── 📂 models/             # MongoDB schemas
│   │   │   ├── 📄 bounty.js
│   │   │   ├── 📄 user.js
│   │   │   ├── 📄 application.js
│   │   │   ├── 📄 work.js
│   │   │   ├── 📄 transaction.js
│   │   │   └── 📄 project.js
│   │   ├── 📂 stellar/            # Stellar SDK integration
│   │   │   └── 📄 payment.js      # Payment processing
│   │   ├── 📂 github/             # GitHub API integration
│   │   ├── 📂 db/                 # Database connection
│   │   └── 📂 log/                # Logging utilities
│   └── 📂 scripts/                # Utility scripts
│
├── 📂 frontend/                    # React Frontend
│   ├── 📄 package.json
│   ├── 📄 vite.config.js          # Vite configuration
│   ├── 📄 tailwind.config.js      # TailwindCSS config
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📄 App.jsx             # Root component
│   │   ├── 📄 index.jsx           # Entry point
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── 📂 home/
│   │   │   ├── 📂 explore_bounties/
│   │   │   ├── 📂 bounty_detail/
│   │   │   ├── 📂 my_bounties/
│   │   │   ├── 📂 in_progress/
│   │   │   └── 📂 submit_work/
│   │   ├── 📂 components/         # Reusable components
│   │   │   ├── 📂 bounty/
│   │   │   ├── 📂 auth/
│   │   │   ├── 📂 wallet/
│   │   │   └── 📂 layout/
│   │   ├── 📂 contexts/           # React Context providers
│   │   │   ├── 📂 WalletContext/
│   │   │   ├── 📂 ContractContext/
│   │   │   └── 📂 GlobalContext/
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   ├── 📂 lib/                # Utilities
│   │   │   └── 📂 stellar/        # Stellar utilities
│   │   └── 📂 theme/              # MUI theme configuration
│   └── 📂 openstellar_module/     # Generated contract bindings
│
└── 📂 hosting/                     # Nginx configuration
    └── 📂 etc/nginx/
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### `POST /api/auth/github`
Initiate GitHub OAuth flow

#### `GET /api/auth/github/callback`
GitHub OAuth callback

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "github_username",
    "email": "user@example.com"
  }
}
```

### Bounty Endpoints

#### `GET /api/bounty`
Get all bounties

**Query Parameters:**
- `status` - Filter by status (open, in_progress, completed, cancelled)
- `creator` - Filter by creator ID

**Response:**
```json
{
  "bounties": [
    {
      "id": "bounty_id",
      "title": "Fix authentication bug",
      "description": "...",
      "reward": "100",
      "token": "XLM",
      "status": "open",
      "creator": {...},
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/bounty`
Create a new bounty

**Request Body:**
```json
{
  "title": "Bounty Title",
  "description": "Detailed description",
  "reward": "100",
  "token": "XLM",
  "deadline": "2025-12-31T23:59:59Z",
  "githubIssueUrl": "https://github.com/user/repo/issues/1"
}
```

#### `GET /api/bounty/:id`
Get bounty details

#### `PUT /api/bounty/:id`
Update bounty

#### `DELETE /api/bounty/:id`
Delete/Cancel bounty

### Application Endpoints

#### `POST /api/applications/:bountyId/apply`
Apply for a bounty

**Request Body:**
```json
{
  "message": "I'm interested in this bounty...",
  "estimatedTime": "3 days"
}
```

#### `GET /api/applications/my-applications`
Get user's applications

#### `PUT /api/applications/:applicationId/approve`
Approve an application (Creator only)

#### `PUT /api/applications/:applicationId/reject`
Reject an application (Creator only)

### Work Submission Endpoints

#### `POST /api/work-submissions/:bountyId/submit`
Submit work for review

**Request Body:**
```json
{
  "workUrl": "https://github.com/user/repo/pull/1",
  "description": "Work description",
  "notes": "Additional notes"
}
```

#### `GET /api/work-submissions/:bountyId`
Get work submissions for a bounty

#### `PUT /api/work-submissions/:bountyId/approve`
Approve work and release payment

**Response:**
```json
{
  "success": true,
  "transaction": {
    "hash": "stellar_transaction_hash",
    "explorerUrl": "https://stellar.expert/explorer/testnet/tx/...",
    "amount": "100",
    "token": "XLM"
  }
}
```

#### `PUT /api/work-submissions/:bountyId/reject`
Reject submitted work

### Stellar Endpoints

#### `GET /api/stellar/balance/:address`
Get Stellar account balance

**Response:**
```json
{
  "balances": [
    {
      "asset_type": "native",
      "balance": "1000.00"
    }
  ]
}
```

#### `GET /api/stellar/transaction/:hash`
Get transaction details

---

## 🔧 Smart Contract Modules

### 1. Fee Module (`fee.rs`)
Manages platform fees and fee wallet configuration.

**Functions:**
- `set_fee(rate: u32, wallet: Address)` - Set fee rate and wallet
- `get_fee() -> FeeInfo` - Retrieve current fee configuration

### 2. Bounty Module (`bounty.rs`)
Core bounty management functionality.

**Functions:**
- `create_bounty(creator, name, reward, token, deadline) -> u64` - Create new bounty
- `fund_bounty(creator, bounty_id)` - Add funds to escrow
- `cancel_bounty(creator, bounty_id)` - Cancel and refund
- `close_bounty(admin, bounty_id)` - Close expired bounty
- `count_bounties() -> u64` - Get total bounties

### 3. Work Module (`work.rs`)
Work submission and approval logic.

**Functions:**
- `submit_work(worker, bounty_id, repo_url) -> u64` - Submit work
- `approve_work(creator, work_id)` - Approve and release payment
- `reject_work(creator, work_id)` - Reject submission

### 4. Admin Module (`admin.rs`)
Administrative functions for platform management.

### 5. Storage Types (`storage_types.rs`)
Data structures and enums:

**Enums:**
```rust
enum BountyStatus {
    Open,
    InProgress,
    Completed,
    Cancelled,
    Expired
}

enum WorkStatus {
    Submitted,
    Approved,
    Rejected
}
```

**Structs:**
```rust
struct BountyInfo {
    id: u64,
    creator: Address,
    name: String,
    reward: i128,
    token: Address,
    deadline: u64,
    status: BountyStatus,
    worker: Option<Address>
}

struct WorkInfo {
    id: u64,
    bounty_id: u64,
    worker: Address,
    repo_url: String,
    status: WorkStatus,
    submitted_at: u64
}
```

---

## 🔄 Workflow

### 1. Create Bounty Flow

```mermaid
sequenceDiagram
    Creator->>Frontend: Create bounty form
    Frontend->>Backend: POST /api/bounty
    Backend->>MongoDB: Save bounty
    Backend->>Stellar: Fund escrow (optional)
    Stellar-->>Backend: Transaction hash
    Backend-->>Frontend: Bounty created
    Frontend-->>Creator: Success notification
```

### 2. Apply for Bounty Flow

```mermaid
sequenceDiagram
    Developer->>Frontend: Browse bounties
    Frontend->>Backend: GET /api/bounty
    Backend-->>Frontend: Bounty list
    Developer->>Frontend: Click "Apply"
    Frontend->>Backend: POST /api/applications/:id/apply
    Backend->>MongoDB: Save application
    Backend->>GitHub: Create issue comment
    Backend-->>Frontend: Application submitted
    Frontend-->>Developer: Success message
```

### 3. Work Submission & Payment Flow

```mermaid
sequenceDiagram
    Developer->>Frontend: Submit work
    Frontend->>Backend: POST /api/work-submissions/:id/submit
    Backend->>MongoDB: Save submission
    Backend->>GitHub: Notify creator
    Creator->>Frontend: Review work
    Creator->>Frontend: Approve work
    Frontend->>Backend: PUT /api/work-submissions/:id/approve
    Backend->>Stellar: Verify recipient wallet
    Backend->>Stellar: Send payment (100 XLM)
    Stellar-->>Backend: Transaction hash
    Backend->>MongoDB: Update status
    Backend->>GitHub: Notify with transaction link
    Backend-->>Frontend: Payment successful
    Frontend-->>Creator: Confirmation
    Frontend-->>Developer: GitHub notification
```

---

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts

# Run all tests
cargo test

# Run specific test
cargo test test_create_bounty

# Run with output
cargo test -- --nocapture
```

**Test Cases:**
- ✅ Bounty creation and funding
- ✅ Work submission and approval
- ✅ Payment release verification
- ✅ Cancellation and refund logic
- ✅ Fee calculation

### Backend Tests

```bash
cd backend

# Run integration tests (if available)
npm test

# Test Stellar payment
node scripts/testStellarPayment.js

# Test GitHub integration
node scripts/testGitHubNotification.js

# Debug bounty
node scripts/debugBounty.js <bounty_id>
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Manual Testing Checklist

- [ ] User can authenticate with GitHub
- [ ] Creator can create a bounty
- [ ] Developer can browse bounties
- [ ] Developer can apply for bounty
- [ ] Creator can approve/reject applications
- [ ] Developer can submit work
- [ ] Creator can approve work
- [ ] Payment is sent via Stellar
- [ ] Transaction appears on Stellar Explorer
- [ ] GitHub notifications are sent

---

## 🚀 Deployment

### Deploy Smart Contract to Mainnet

```bash
cd contracts

# Build optimized contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to mainnet
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/soroban_escrow_smart_contract.wasm \
    --source <MAINNET_SECRET_KEY> \
    --rpc-url https://soroban-mainnet.stellar.org \
    --network-passphrase 'Public Global Stellar Network ; September 2015'
```

### Deploy Backend

#### Option 1: VPS with PM2

```bash
# On your server
git clone <repository_url>
cd openstellar/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
npm run start-server

# Monitor
pm2 logs openstellar-backend
pm2 monit
```

#### Option 2: Docker (Recommended)

```dockerfile
# Dockerfile (backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

```bash
# Build and run
docker build -t openstellar-backend .
docker run -d -p 5000:5000 --env-file .env openstellar-backend
```

### Deploy Frontend

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Option 2: Nginx

```bash
# Build production bundle
cd frontend
npm run build

# Copy to web server
sudo cp -r dist/* /var/www/openstellar/

# Configure Nginx (see hosting/etc/nginx/)
sudo systemctl restart nginx
```

### Environment Variables for Production

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://user:pass@host:27017/openstellar
GITHUB_CLIENT_ID=<production_client_id>
GITHUB_CLIENT_SECRET=<production_secret>
GITHUB_CALLBACK_URL=https://api.openstellar.com/api/auth/github/callback
JWT_SECRET=<strong_secret_key>
FRONTEND_URL=https://openstellar.com
STELLAR_NETWORK=mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
SECRETKEY=<mainnet_secret_key>
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.openstellar.com/api
VITE_STELLAR_NETWORK=mainnet
VITE_CONTRACT_ID=<mainnet_contract_id>
```

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Yes | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Yes | - |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |
| `STELLAR_NETWORK` | testnet or mainnet | Yes | testnet |
| `STELLAR_HORIZON_URL` | Horizon API endpoint | Yes | - |
| `STELLAR_CONTRACT_ID` | Deployed contract ID | Yes | - |
| `SECRETKEY` | Stellar secret key | Yes | - |
| `ENCRYPTION_KEY` | For encrypting sensitive data | Yes | - |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_STELLAR_NETWORK` | Stellar network | Yes |
| `VITE_CONTRACT_ID` | Smart contract ID | Yes |

---

## ❗ Troubleshooting

### Common Issues

#### 1. Contract Build Fails
```bash
# Update Rust and dependencies
rustup update
cargo clean
cargo build --target wasm32-unknown-unknown --release
```

#### 2. Backend Won't Start
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check .env file exists
ls -la backend/.env

# View logs
npm start 2>&1 | tee error.log
```

#### 3. Frontend Connection Error
- Verify backend is running on correct port
- Check CORS settings in backend
- Verify `VITE_API_URL` in frontend `.env`

#### 4. Stellar Payment Fails
- Verify secret key is valid
- Check account has sufficient balance
- Ensure recipient wallet is funded (min 1 XLM)
- Check network configuration (testnet vs mainnet)

#### 5. GitHub OAuth Not Working
- Verify callback URL matches in GitHub app settings
- Check client ID and secret in `.env`
- Ensure frontend URL is correct

### Debug Commands

```bash
# Check MongoDB connection
node -e "require('./backend/src/db').connect()"

# Test Stellar payment
node backend/scripts/testStellarPayment.js

# Verify contract deployment
soroban contract invoke \
    --id <CONTRACT_ID> \
    --source <SECRET_KEY> \
    --rpc-url https://soroban-testnet.stellar.org \
    -- count_bounties
```

### Get Help

- 📖 [Stellar Documentation](https://developers.stellar.org/)
- 🤖 [Soroban Discord](https://discord.gg/stellar)
- 💬 [GitHub Issues](https://github.com/Dashrath-Patel/OpenStellar/issues)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/OpenStellar.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test thoroughly
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

### Code Standards

- **Frontend**: Follow React best practices, use ESLint
- **Backend**: Follow Node.js conventions, use meaningful variable names
- **Smart Contracts**: Follow Rust and Soroban guidelines
- **Documentation**: Update README for significant changes

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌐 Internationalization

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

### What This Means

- ✅ You can use this software commercially
- ✅ You can modify the software
- ✅ You can distribute the software
- ✅ You can use the software privately
- ⚠️ You must disclose the source code
- ⚠️ You must license derivative works under GPL v3
- ⚠️ You must include the original license and copyright

---

## 📞 Contact & Resources

### Project Links

- 🌐 **Website**: [Open Stellar](https://open-stellar.vercel.app/)
- 💻 **GitHub**: [github.com/Dashrath-Patel/OpenStellar](https://github.com/Dashrath-Patel/OpenStellar)
- 📧 **Email**: [Your Contact Email]

### Stellar Resources

- 🔗 **Stellar Network**: [stellar.org](https://stellar.org)
- 📚 **Soroban Docs**: [soroban.stellar.org](https://soroban.stellar.org)
- 🔍 **Testnet Explorer**: [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet)
- 💰 **Testnet Faucet**: [friendbot.stellar.org](https://friendbot.stellar.org)

### Community

- 💬 **Discord**: [Stellar Developers](https://discord.gg/stellar)
- 🐦 **Twitter**: [@StellarOrg](https://twitter.com/StellarOrg)
- 📝 **Blog**: [stellar.org/blog](https://stellar.org/blog)

---

<div align="center">
  
  ### ⭐ Star this repository if you find it helpful!
  
  **Built with ❤️ on the Stellar Blockchain**
  
  © 2025 OpenStellar. All rights reserved.
  
</div>
