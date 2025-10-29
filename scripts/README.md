# Deployment Scripts

This directory contains scripts to help with OpenStellar deployment.

## Available Scripts

### `deploy-setup.sh`

Automated server setup script for Ubuntu 22.04.

**What it does:**
- Updates system packages
- Installs Node.js 18
- Installs Nginx
- Installs PM2 process manager
- Installs Rust and Soroban CLI
- Creates non-root user
- Configures basic firewall

**Usage:**

```bash
# On your VPS (as root)
wget https://raw.githubusercontent.com/Dashrath-Patel/OpenStellar/main/scripts/deploy-setup.sh
chmod +x deploy-setup.sh
sudo ./deploy-setup.sh
```

**Time:** ~10-15 minutes

## Manual Deployment

For complete manual deployment instructions, see:
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Detailed step-by-step guide
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Quick checklist

## Support

If you encounter issues during deployment:
1. Check the logs for error messages
2. Refer to the troubleshooting section in DEPLOYMENT_GUIDE.md
3. Create an issue on GitHub with details
