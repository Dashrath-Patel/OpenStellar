const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { addGitHubComment } = require('../src/github');

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
const userSchema = new mongoose.Schema({}, { collection: 'users', strict: false });
const User = mongoose.model('User', userSchema);

async function testGitHubNotification() {
    try {
        const creatorGithubId = '108078023'; // From the debug output
        
        console.log('\n🔍 Looking for creator with GitHub ID:', creatorGithubId);
        
        const creator = await User.findOne({ githubId: creatorGithubId });
        
        if (!creator) {
            console.log('❌ Creator not found!');
            process.exit(1);
        }
        
        console.log('✅ Creator found:', creator.github || 'No username');
        console.log('   Has token:', !!creator.githubAccessToken);
        
        if (!creator.githubAccessToken) {
            console.log('\n⚠️  Creator has no GitHub access token!');
            console.log('This means they need to log in via GitHub OAuth again.');
            console.log('\nTo fix this:');
            console.log('1. Log out from the app');
            console.log('2. Log in again using "Continue with GitHub"');
            console.log('3. The access token will be saved');
            process.exit(1);
        }
        
        // Test sending a comment
        console.log('\n📤 Testing GitHub notification...');
        
        const owner = 'Dashrath-Patel';
        const repo = 'OpenStellar';
        const prNumber = 6;
        
        const testComment = `## 🔄 Test Notification from OpenStellar

This is a test comment to verify that GitHub notifications are working correctly!

If you see this, it means the notification system is functioning properly. ✅

---
*This is an automated test message*`;

        await addGitHubComment(creator.githubAccessToken, owner, repo, prNumber, testComment);
        
        console.log('✅ Test comment posted successfully!');
        console.log(`   Check: https://github.com/${owner}/${repo}/pull/${prNumber}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data?.message);
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

testGitHubNotification();
