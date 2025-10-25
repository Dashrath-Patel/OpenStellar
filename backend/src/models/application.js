const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    // Reference to bounty issue
    bountyIssueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BountyIssue',
        required: true
    },
    
    // Applicant details
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Application content
    proposal: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 2000
    },
    
    estimatedDays: {
        type: Number,
        required: true,
        min: 1,
        max: 365
    },
    
    walletAddress: {
        type: String,
        required: true,
        trim: true
    },
    
    // Additional info
    githubUsername: {
        type: String,
        required: true
    },
    
    portfolio: {
        type: String,
        trim: true
    },
    
    // Status tracking
    status: {
        type: String,
        enum: ['pending_approval', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending_approval'
    },
    
    // Review by creator
    reviewComment: {
        type: String,
        maxlength: 500
    },
    
    reviewedAt: {
        type: Date
    },
    
    // Timestamps
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
applicationSchema.index({ bountyIssueId: 1, applicantId: 1 });
applicationSchema.index({ applicantId: 1, status: 1 });
applicationSchema.index({ bountyIssueId: 1, status: 1 });

// Prevent duplicate applications
applicationSchema.index(
    { bountyIssueId: 1, applicantId: 1 },
    { unique: true }
);

module.exports = mongoose.model('Application', applicationSchema);
