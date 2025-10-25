const { Schema, model } = require('mongoose');

const projectSchema = new Schema(
    {
        // Basic Info
        name: { type: String, required: true },
        description: { type: String },
        
        // Owner/Maintainer
        maintainer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        
        // GitHub Integration
        githubRepoUrl: { type: String, required: true }, // https://github.com/owner/repo
        githubOwner: { type: String, required: true }, // owner name
        githubRepo: { type: String, required: true }, // repo name
        githubRepoId: { type: String }, // GitHub's internal repo ID
        
        // Stellar Integration
        stellarEscrowAccount: { type: String }, // Optional escrow account for this project
        
        // Stats
        totalBounties: { type: Number, default: 0 },
        totalPaid: { type: Number, default: 0 },
        activeBounties: { type: Number, default: 0 },
        
        // Settings
        autoCreateIssues: { type: Boolean, default: true }, // Auto create GitHub issues
        requireApproval: { type: Boolean, default: true }, // Maintainer must approve assignments
        
        // Status
        isActive: { type: Boolean, default: true },
        
        // Metadata
        tags: [{ type: String }],
        website: { type: String },
        
        // Timestamps
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
);

// Indexes
projectSchema.index({ maintainer: 1 });
projectSchema.index({ githubOwner: 1, githubRepo: 1 }, { unique: true });

module.exports = model('Project', projectSchema);
