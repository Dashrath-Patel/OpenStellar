const mongoose = require('mongoose');

const bountyIssueSchema = new mongoose.Schema({
    // GitHub Information
    repoFullName: {
        type: String,
        required: true,
        index: true
    },
    githubIssueNumber: {
        type: Number
    },
    githubIssueUrl: {
        type: String
    },
    
    // Issue Details
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    skills: [{
        type: String
    }],
    
    // Bounty Information
    bountyAmount: {
        type: Number,
        required: true,
        min: 1
    },
    deadline: {
        type: Date
    },
    
    // Stellar Blockchain
    stellarTxHash: {
        type: String
    },
    contractBountyId: {
        type: String
    },
    
    // Status Tracking
    status: {
        type: String,
        enum: ['pending_github', 'pending_blockchain', 'open', 'in_progress', 'under_review', 'completed', 'cancelled'],
        default: 'pending_github'
    },
    
    // Users
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assigneeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Assignment Details
    assignedApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    assignedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    
    // Blockchain Transactions
    lockTransactionHash: {
        type: String  // When funds locked on assignment
    },
    releaseTransactionHash: {
        type: String  // When payment released
    },
    
    // Pull Request
    prNumber: {
        type: Number
    },
    prUrl: {
        type: String
    },
    prSubmittedAt: {
        type: Date
    },
    prMergedAt: {
        type: Date
    },
    
    // Metadata
    labels: [{
        type: String
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
bountyIssueSchema.index({ status: 1, createdAt: -1 });
bountyIssueSchema.index({ creatorId: 1 });
bountyIssueSchema.index({ assigneeId: 1 });
bountyIssueSchema.index({ repoFullName: 1, status: 1 });

const BountyIssue = mongoose.model('BountyIssue', bountyIssueSchema);

module.exports = BountyIssue;
