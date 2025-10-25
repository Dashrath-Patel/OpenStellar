const { Schema, model } = require('mongoose');

const transactionSchema = new Schema(
    {
        // Transaction Type
        type: { 
            type: String, 
            enum: ['bounty_creation', 'payment_release', 'refund', 'fee_payment'],
            required: true 
        },
        
        // Related Entities
        bountyId: { type: Schema.Types.ObjectId, ref: 'Bounty', required: true },
        from: { type: Schema.Types.ObjectId, ref: 'User' },
        to: { type: Schema.Types.ObjectId, ref: 'User' },
        
        // Amount
        amount: { type: Number, required: true }, // In XLM
        feeAmount: { type: Number, default: 0 }, // Platform fee
        
        // Stellar Data
        stellarTxHash: { type: String, required: true, unique: true },
        stellarFrom: { type: String }, // Stellar address
        stellarTo: { type: String }, // Stellar address
        ledger: { type: Number }, // Ledger/block number
        
        // Status
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'failed'],
            default: 'pending'
        },
        
        // Metadata
        description: { type: String },
        errorMessage: { type: String }, // If failed
        
        // Timestamps
        createdAt: { type: Date, default: Date.now },
        confirmedAt: { type: Date }
    }
);

// Indexes
transactionSchema.index({ bountyId: 1 });
transactionSchema.index({ from: 1, type: 1 });
transactionSchema.index({ to: 1, type: 1 });
transactionSchema.index({ stellarTxHash: 1 });

module.exports = model('Transaction', transactionSchema);
