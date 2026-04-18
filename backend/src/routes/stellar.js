const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const { getBalance, accountExists } = require('../stellar/payment');
const User = require('../models/user');

/**
 * GET /api/stellar/balance
 * Get current XLM balance for authenticated user's wallet
 * Query params:
 *   - network: 'testnet' | 'mainnet' (defaults to STELLAR_NETWORK env or 'testnet')
 */
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const network = req.query.network;

        if (!user || !user.stellarPublicKey) {
            return res.status(400).json({
                success: false,
                message: 'Stellar wallet not configured for this user'
            });
        }

        const publicKey = user.stellarPublicKey;

        // Check if account exists
        const exists = await accountExists(publicKey, network);
        if (!exists) {
            return res.json({
                success: true,
                balance: '0',
                exists: false,
                message: 'Account not found on network',
                network
            });
        }

        // Get balance
        const balance = await getBalance(publicKey, network);

        res.json({
            success: true,
            balance,
            publicKey,
            exists: true,
            network
        });

    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch balance',
            error: error.message
        });
    }
});

/**
 * GET /api/stellar/balance/:publicKey
 * Get XLM balance for any public key (no auth required)
 * Query params:
 *   - network: 'testnet' | 'mainnet' (defaults to STELLAR_NETWORK env or 'testnet')
 */
router.get('/balance/:publicKey', async (req, res) => {
    try {
        const { publicKey } = req.params;
        const network = req.query.network;

        // Check if account exists
        const exists = await accountExists(publicKey, network);
        if (!exists) {
            return res.json({
                success: true,
                balance: '0',
                exists: false,
                message: 'Account not found on network',
                network
            });
        }

        // Get balance
        const balance = await getBalance(publicKey, network);

        res.json({
            success: true,
            balance,
            publicKey,
            exists: true,
            network
        });

    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch balance',
            error: error.message
        });
    }
});

module.exports = router;
