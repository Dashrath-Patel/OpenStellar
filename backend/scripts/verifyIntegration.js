require('dotenv').config();
const { getBalance, accountExists } = require('../src/stellar/payment');

/**
 * Verification Script - Check Stellar Integration Setup
 */

async function verifyIntegration() {
    console.log('\n🔍 Verifying Stellar Integration Setup\n');
    console.log('═'.repeat(60));

    const network = process.env.STELLAR_NETWORK || 'testnet';
    const publicKey = process.env.PUBLICKEY?.trim();
    const secretKey = process.env.SECRETKEY?.trim();

    console.log('📋 Configuration:');
    console.log(`   Network: ${network}`);
    console.log(`   Public Key: ${publicKey}`);
    console.log(`   Secret Key: ${secretKey ? '✅ Set' : '❌ Not set'}`);
    console.log('═'.repeat(60));

    if (!publicKey || !secretKey) {
        console.error('\n❌ CONFIGURATION ERROR!');
        console.error('   PUBLICKEY or SECRETKEY not found in .env file');
        return;
    }

    try {
        // Check account exists
        console.log('\n🔍 Checking account on network...');
        const exists = await accountExists(publicKey);
        
        if (!exists) {
            console.error('❌ Account does not exist on the network!');
            console.log('\n💡 To fix this:');
            if (network === 'testnet') {
                console.log(`   Run: curl "https://friendbot.stellar.org?addr=${publicKey}"`);
            } else {
                console.log('   Fund your account on the network you are using');
            }
            return;
        }
        console.log('✅ Account exists on the network');

        // Check balance
        console.log('\n💰 Checking account balance...');
        const balance = await getBalance(publicKey);
        console.log(`   Balance: ${balance} XLM`);

        if (parseFloat(balance) < 100) {
            console.warn('\n⚠️ LOW BALANCE WARNING!');
            console.warn(`   You have ${balance} XLM`);
            console.warn('   Make sure you have enough XLM to pay bounties');
        } else {
            console.log('✅ Sufficient balance for payments');
        }

        console.log('\n═'.repeat(60));
        console.log('✅ INTEGRATION VERIFIED SUCCESSFULLY!');
        console.log('═'.repeat(60));
        console.log('\n📝 Summary:');
        console.log(`   ✅ Network: ${network}`);
        console.log(`   ✅ Account exists: Yes`);
        console.log(`   ✅ Balance: ${balance} XLM`);
        console.log(`   ✅ Ready to process bounty payments`);
        console.log('\n💡 Next Steps:');
        console.log('   1. Ensure developer wallets exist on the network');
        console.log('   2. Approve work submissions through the UI');
        console.log('   3. Real XLM will be transferred on approval!');
        console.log('   4. Check transactions on Stellar Explorer\n');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED!');
        console.error('═'.repeat(60));
        console.error('Error:', error.message);
        console.error('═'.repeat(60));
    }
}

verifyIntegration();
