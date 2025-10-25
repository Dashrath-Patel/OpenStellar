const { Schema, model } = require('mongoose');

const assignmentRequestSchema = new Schema(
    {
        // Request Details
        bountyId: { type: Schema.Types.ObjectId, ref: 'Bounty', required: true },
        contributor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        
        // Message from contributor
        message: { type: String },
        estimatedCompletionDays: { type: Number }, // How long they think it will take
        
        // Portfolio/Past Work
        portfolioLinks: [{ type: String }],
        relevantExperience: { type: String },
        
        // Status
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'withdrawn'],
            default: 'pending'
        },
        
        // Response from maintainer
        maintainerResponse: { type: String },
        respondedAt: { type: Date },
        
        // Timestamps
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }
);

// Indexes
assignmentRequestSchema.index({ bountyId: 1, status: 1 });
assignmentRequestSchema.index({ contributor: 1, status: 1 });
assignmentRequestSchema.index({ bountyId: 1, contributor: 1 }, { unique: true });

module.exports = model('AssignmentRequest', assignmentRequestSchema);
