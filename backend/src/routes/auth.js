const { Router } = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getAccessToken, getGitHubUser } = require('../github');
const UserModel = require('../models/user');

const router = Router();

/**
 * Step 1: Initiate GitHub OAuth
 * User clicks "Connect with GitHub" → Redirect to this URL
 */
router.get('/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=repo,user`;
    
    res.redirect(githubAuthUrl);
});

/**
 * Step 2: GitHub OAuth Callback
 * GitHub redirects here with code → Exchange for access token → Create/update user
 */
router.get('/github/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }
    
    try {
        // Step 2a: Exchange code for access token
        const accessToken = await getAccessToken(
            code,
            process.env.GITHUB_CLIENT_ID,
            process.env.GITHUB_CLIENT_SECRET
        );
        
        if (!accessToken) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
        }
        
        // Step 2b: Get GitHub user info
        const githubUser = await getGitHubUser(accessToken);
        
        // Step 2c: Find or create user in database
        let user = await UserModel.findOne({ githubId: githubUser.id.toString() });
        
        if (user) {
            // Update existing user
            user.github = githubUser.login;
            user.name = githubUser.name || githubUser.login;
            user.email = githubUser.email;
            user.avatar = githubUser.avatar_url;
            user.githubAccessToken = accessToken; // Store encrypted in production
            user.lastLogin = new Date();
            await user.save();
        } else {
            // Create new user
            user = new UserModel({
                githubId: githubUser.id.toString(),
                github: githubUser.login,
                name: githubUser.name || githubUser.login,
                email: githubUser.email,
                avatar: githubUser.avatar_url,
                githubAccessToken: accessToken, // Store encrypted in production
                lastLogin: new Date()
            });
            await user.save();
        }
        
        // Step 2d: Create JWT token for our platform
        const jwtToken = jwt.sign(
            { 
                userId: user._id,
                githubId: user.githubId,
                github: user.github
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        // Step 2e: Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${jwtToken}`);
        
    } catch (error) {
        console.error('GitHub OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
});

/**
 * Get current user info
 * Protected route - requires JWT token
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.userId).select('-githubAccessToken');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user data in a format the frontend expects
        res.json({
            _id: user._id,
            name: user.name,
            github: user.github,
            githubId: user.githubId,
            email: user.email,
            avatar: user.avatar,
            avatarUrl: user.avatar || `https://github.com/${user.github}.png`,
            wallet: user.wallet,
            stellarPublicKey: user.stellarPublicKey,
            role: user.role,
            discord: user.discord,
            totalBountiesCreated: user.totalBountiesCreated,
            totalBountiesCompleted: user.totalBountiesCompleted,
            totalEarned: user.totalEarned,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user info' });
    }
});

/**
 * Link Stellar wallet to GitHub account
 */
router.post('/link-wallet', authenticateToken, async (req, res) => {
    const { wallet, stellarPublicKey } = req.body;
    
    if (!stellarPublicKey) {
        return res.status(400).json({ error: 'Stellar public key required' });
    }
    
    try {
        const user = await UserModel.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update wallet if provided, otherwise use stellarPublicKey for both
        user.wallet = wallet || stellarPublicKey;
        user.stellarPublicKey = stellarPublicKey;
        await user.save();
        
        res.json({ 
            status: 'success',
            message: 'Wallet linked successfully',
            user: {
                id: user._id,
                wallet: user.wallet,
                stellarPublicKey: user.stellarPublicKey
            }
        });
    } catch (error) {
        console.error('Error linking wallet:', error);
        res.status(500).json({ error: 'Failed to link wallet' });
    }
});

/**
 * Logout
 */
router.post('/logout', authenticateToken, (req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ status: 'success', message: 'Logged out successfully' });
});

/**
 * Middleware: Authenticate JWT token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
