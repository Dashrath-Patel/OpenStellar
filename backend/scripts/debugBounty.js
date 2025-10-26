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

// Define schemas
const bountyIssueSchema = new mongoose.Schema({}, { collection: 'bountyissues', strict: false });
const userSchema = new mongoose.Schema({}, { collection: 'users', strict: false });

const BountyIssue = mongoose.model('BountyIssue', bountyIssueSchema);
const User = mongoose.model('User', userSchema);

async function debugBounty() {
    try {
        const bountyId = '68fd6f42fef92f8a27a8225a';
        
        console.log(`\n🔍 Fetching bounty: ${bountyId}\n`);
        
        const bounty = await BountyIssue.findById(bountyId);
        
        if (!bounty) {
            console.log('❌ Bounty not found!');
            process.exit(1);
        }
        
        console.log('📋 Bounty Details:');
        console.log('   Title:', bounty.title);
        console.log('   Status:', bounty.status);
        console.log('   Creator ID:', bounty.creatorId);
        console.log('   Assignee ID:', bounty.assigneeId);
        console.log('   PR URL:', bounty.prUrl);
        console.log('   PR Number:', bounty.prNumber);
        
        // Try to find creator
        console.log('\n🔍 Looking for Creator...');
        if (bounty.creatorId) {
            const creator = await User.findById(bounty.creatorId);
            if (creator) {
                console.log('✅ Creator Found:');
                console.log('   Username:', creator.username);
                console.log('   GitHub ID:', creator.githubId);
                console.log('   Has Access Token:', !!creator.accessToken);
                console.log('   Token Length:', creator.accessToken ? creator.accessToken.length : 0);
            } else {
                console.log('❌ Creator NOT found in users collection!');
            }
        } else {
            console.log('❌ No creatorId in bounty!');
        }
        
        // Try to find assignee/developer
        console.log('\n🔍 Looking for Developer/Assignee...');
        if (bounty.assigneeId) {
            const developer = await User.findById(bounty.assigneeId);
            if (developer) {
                console.log('✅ Developer Found:');
                console.log('   Username:', developer.username);
                console.log('   GitHub ID:', developer.githubId);
            } else {
                console.log('❌ Developer NOT found in users collection!');
            }
        } else {
            console.log('❌ No assigneeId in bounty!');
        }
        
        // List all users
        console.log('\n📋 All Users in Database:');
        const allUsers = await User.find({});
        allUsers.forEach(user => {
            console.log(`   - ${user.username} (ID: ${user._id}, GitHub: ${user.githubId})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

debugBounty();
