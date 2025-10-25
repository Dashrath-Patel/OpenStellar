const { Schema, model } = require('mongoose');

const bountySchema = new Schema(
    {
        // Contract Data
        bountyId: { type: Number, required: true, unique: true }, 
        creator: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
        
        // Basic Info
        title: { type: String, required: true }, 
        description: { type: String }, 
        payAmount: { type: Number, required: true }, 
        
        // GitHub Integration
        projectId: { type: Schema.Types.ObjectId, ref: 'Project' }, // Link to project
        githubIssueNumber: { type: Number }, // GitHub issue #
        githubIssueUrl: { type: String }, // Full URL to GitHub issue
        githubIssueId: { type: String }, // GitHub's internal issue ID
        
        // Assignment Data
        assignee: { type: Schema.Types.ObjectId, ref: 'User' }, // Assigned contributor
        assignedAt: { type: Date },
        
        // PR Tracking
        prUrl: { type: String }, // Pull request URL
        prMergedAt: { type: Date }, // When PR was merged
        
        // Dates
        startDate: { type: Date, default: Date.now }, 
        endDate: { type: Date }, // Deadline
        completedAt: { type: Date },
        paidAt: { type: Date },
        
        // Categories
        type: { type: Number }, // 0=Development, 1=Design, 2=Marketing, etc.
        topic: { type: Number }, // 0=Smart Contracts, 1=Frontend, etc.
        difficulty: { type: Number }, // 0=Beginner, 1=Intermediate, 2=Advanced
        
        // Additional Info
        skills: [{ type: String }], // Required skills
        requirements: [{ type: String }], // Requirements
        
        // Repository Info
        gitRepo: { type: String }, // GitHub repo URL
        
        // Blockchain Data
        block: { type: Number }, // Block number
        stellarTxHash: { type: String }, // Transaction hash for payment
        
        // Status Tracking
        status: { 
            type: String, 
            enum: [
                'pending_github',      // Created on platform, waiting for GitHub issue
                'pending_blockchain',  // GitHub issue created, waiting for blockchain
                'open',               // Active, available for contributors
                'assigned',           // Assigned to contributor
                'in_review',         // PR submitted, under review
                'completed',         // PR merged, waiting for payment
                'paid',              // Payment released
                'cancelled'          // Bounty cancelled
            ],
            default: 'pending_github'
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt
    }
);

// Indexes for better query performance
bountySchema.index({ creator: 1, status: 1 });
bountySchema.index({ assignee: 1, status: 1 });
bountySchema.index({ githubIssueNumber: 1, projectId: 1 });
bountySchema.index({ status: 1, endDate: 1 });

module.exports = model('Bounty', bountySchema);
