const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
        wallet: { type: String, unique: true }, 
        name: { type: String }, 
        
        // GitHub Integration
        github: { type: String }, // GitHub username (display)
        githubId: { type: String, unique: true, sparse: true }, // GitHub user ID
        githubAccessToken: { type: String }, // Encrypted access token
        email: { type: String }, // GitHub email
        
        // Other socials
        discord: { type: String }, 
        avatar: { type: String }, 
        
        // Stellar Integration
        stellarPublicKey: { type: String }, // User's Stellar wallet address
        
        // Role
        role: { type: String, enum: ['contributor', 'maintainer', 'both'], default: 'contributor' },
        
        // Stats
        totalBountiesCreated: { type: Number, default: 0 },
        totalBountiesCompleted: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        
        // Timestamps
        createdAt: { type: Date, default: Date.now },
        lastLogin: { type: Date }
    }
);

module.exports = model('User', userSchema);
