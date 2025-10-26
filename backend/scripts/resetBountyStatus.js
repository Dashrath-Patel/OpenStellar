const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Define BountyIssue schema (minimal version)
const bountyIssueSchema = new mongoose.Schema({
    title: String,
    status: String,
    notes: String,
    prUrl: String,
    prNumber: Number
}, { collection: 'bountyissues' });

const BountyIssue = mongoose.model('BountyIssue', bountyIssueSchema);

async function resetBountyStatus() {
    try {
        const bountyId = '68fd6f42fef92f8a27a8225a';
        
        console.log(`\n🔍 Looking for bounty: ${bountyId}`);
        
        const bounty = await BountyIssue.findById(bountyId);
        
        if (!bounty) {
            console.log('❌ Bounty not found!');
            process.exit(1);
        }
        
        console.log('\n📋 Current Status:');
        console.log('  Status:', bounty.status);
        console.log('  PR URL:', bounty.prUrl);
        console.log('  PR Number:', bounty.prNumber);
        console.log('  Notes:', bounty.notes ? bounty.notes.substring(0, 100) : 'None');
        
        // Reset to under_review
        bounty.status = 'under_review';
        
        // Clean up the "Changes Requested" note if it was added
        if (bounty.notes && bounty.notes.includes('Changes Requested:')) {
            const lines = bounty.notes.split('\n\n');
            bounty.notes = lines.filter(line => !line.startsWith('Changes Requested:')).join('\n\n');
        }
        
        await bounty.save();
        
        console.log('\n✅ Bounty status reset to "under_review"');
        console.log('\n📋 New Status:');
        console.log('  Status:', bounty.status);
        console.log('  Notes:', bounty.notes ? bounty.notes.substring(0, 100) : 'None');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

resetBountyStatus();
