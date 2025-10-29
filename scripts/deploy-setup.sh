#!/bin/bash

# OpenStellar Deployment Script
# This script automates the initial server setup for OpenStellar deployment
# Run on a fresh Ubuntu 22.04 server

set -e  # Exit on error

echo "=================================================="
echo "   OpenStellar Production Deployment Script"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_status "Starting OpenStellar deployment setup..."
echo ""

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"
echo ""

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl git nginx certbot python3-certbot-nginx ufw htop build-essential
print_success "Essential packages installed"
echo ""

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node_version=$(node --version)
print_success "Node.js installed: $node_version"
echo ""

# Install PM2
print_status "Installing PM2 process manager..."
npm install -g pm2
print_success "PM2 installed"
echo ""

# Install Rust
print_status "Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
print_success "Rust installed"
echo ""

# Install Soroban CLI
print_status "Installing Soroban CLI..."
cargo install --locked soroban-cli
print_success "Soroban CLI installed"
echo ""

# Create non-root user
print_status "Creating 'openstellar' user..."
if id "openstellar" &>/dev/null; then
    print_status "User 'openstellar' already exists"
else
    adduser --disabled-password --gecos "" openstellar
    usermod -aG sudo openstellar
    print_success "User 'openstellar' created"
fi
echo ""

# Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
print_success "Firewall configured"
echo ""

# Enable Nginx
print_status "Configuring Nginx..."
systemctl enable nginx
systemctl start nginx
print_success "Nginx enabled and started"
echo ""

print_success "Server setup complete!"
echo ""
echo "=================================================="
echo "   Next Steps:"
echo "=================================================="
echo "1. Switch to openstellar user: su - openstellar"
echo "2. Clone your repository"
echo "3. Configure environment variables"
echo "4. Deploy smart contract"
echo "5. Set up backend and frontend"
echo "6. Configure Nginx and SSL"
echo ""
echo "See DEPLOYMENT_CHECKLIST.md for detailed steps"
echo "=================================================="
