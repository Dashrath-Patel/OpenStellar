require('dotenv').config();
const { sendPayment, getBalance, accountExists } = require('../src/stellar/payment');

/**
 * Test Script for Stellar Payment System
 * 
 * This script tests real Stellar blockchain payments by:
 * 1. Checking sender and receiver wallet balances
 * 2. Validating both accounts exist on the network
 * 3. Sending a test payment (100 XLM)
 * 4. Verifying the transaction and new balances
 */

async function testStellarPayment() {
    console.log('\n🚀 Starting Stellar Payment Test\n');
    console.log('═'.repeat(60));

    // Configuration
    const senderSecretKey = process.env.SECRETKEY.trim();
    const senderPublicKey = process.env.PUBLICKEY.trim();
    
    // Developer wallet address (replace with actual developer address)
    const developerPublicKey = 'GBHJVEJETHCGFP52LAWYNY4HF6E6QLCY3EDDUO65L75YX4JGQ2BHVX65';
    
    const testAmount = '100'; // 100 XLM
    const memo = 'Bounty Payment Test'; // Max 28 bytes for text memo

    console.log('📋 Test Configuration:');
    console.log(`   Sender: ${senderPublicKey}`);
    console.log(`   Receiver: ${developerPublicKey}`);
    console.log(`   Amount: ${testAmount} XLM`);
    console.log(`   Memo: ${memo}`);
    console.log(`   Network: ${process.env.STELLAR_NETWORK || 'testnet'}`);
    console.log('═'.repeat(60));

    try {
        // Step 1: Check if sender account exists
        console.log('\n🔍 Step 1: Validating Sender Account...');
        const senderExists = await accountExists(senderPublicKey);
        if (!senderExists) {
            console.error('❌ Sender account does not exist on the network!');
            console.log('\n💡 Make sure your account is funded on the network you\'re using.');
            return;
        }
        console.log('✅ Sender account exists');

        // Step 2: Check sender balance
        console.log('\n💰 Step 2: Checking Sender Balance...');
        const senderBalanceBefore = await getBalance(senderPublicKey);
        console.log(`   Current Balance: ${senderBalanceBefore} XLM`);
        
        if (parseFloat(senderBalanceBefore) < parseFloat(testAmount)) {
            console.error(`❌ Insufficient balance! You have ${senderBalanceBefore} XLM but trying to send ${testAmount} XLM`);
            return;
        }
        console.log('✅ Sufficient balance available');

        // Step 3: Check if receiver account exists
        console.log('\n🔍 Step 3: Validating Receiver Account...');
        const receiverExists = await accountExists(developerPublicKey);
        if (!receiverExists) {
            console.error('❌ Receiver account does not exist on the network!');
            console.log('\n💡 The receiver needs to create and fund their Stellar account first.');
            console.log('   They can use Stellar Laboratory or create account via friendbot (testnet).');
            return;
        }
        console.log('✅ Receiver account exists');

        // Step 4: Check receiver balance before
        console.log('\n💰 Step 4: Checking Receiver Balance Before...');
        const receiverBalanceBefore = await getBalance(developerPublicKey);
        console.log(`   Current Balance: ${receiverBalanceBefore} XLM`);

        // Step 5: Execute payment
        console.log('\n💸 Step 5: Executing Payment Transaction...');
        console.log('   Please wait...');
        
        const paymentResult = await sendPayment(
            senderSecretKey,
            developerPublicKey,
            testAmount,
            memo
        );

        console.log('\n✅ PAYMENT SUCCESSFUL! 🎉\n');
        console.log('═'.repeat(60));
        console.log('📊 Transaction Details:');
        console.log(`   Transaction Hash: ${paymentResult.txHash}`);
        console.log(`   Ledger: ${paymentResult.ledger}`);
        console.log(`   Fee Charged: ${paymentResult.feeCharged} stroops`);
        console.log(`   Created At: ${paymentResult.createdAt}`);
        console.log('═'.repeat(60));

        // Step 6: Verify balances after payment
        console.log('\n🔄 Step 6: Verifying Final Balances...');
        
        const senderBalanceAfter = await getBalance(senderPublicKey);
        const receiverBalanceAfter = await getBalance(developerPublicKey);
        
        const senderDiff = parseFloat(senderBalanceBefore) - parseFloat(senderBalanceAfter);
        const receiverDiff = parseFloat(receiverBalanceAfter) - parseFloat(receiverBalanceBefore);

        console.log('\n📈 Balance Changes:');
        console.log(`   Sender Before:    ${senderBalanceBefore} XLM`);
        console.log(`   Sender After:     ${senderBalanceAfter} XLM`);
        console.log(`   Sender Change:    -${senderDiff.toFixed(7)} XLM`);
        console.log('   ─'.repeat(50));
        console.log(`   Receiver Before:  ${receiverBalanceBefore} XLM`);
        console.log(`   Receiver After:   ${receiverBalanceAfter} XLM`);
        console.log(`   Receiver Change:  +${receiverDiff.toFixed(7)} XLM`);
        console.log('═'.repeat(60));

        // Step 7: Explorer links
        console.log('\n🌐 View Transaction on Stellar Explorer:');
        if (process.env.STELLAR_NETWORK === 'mainnet') {
            console.log(`   https://stellarchain.io/transactions/${paymentResult.txHash}`);
            console.log(`   https://stellar.expert/explorer/public/tx/${paymentResult.txHash}`);
        } else if (process.env.STELLAR_NETWORK === 'testnet' || !process.env.STELLAR_NETWORK) {
            console.log(`   https://stellarchain.io/transactions/${paymentResult.txHash}?network=testnet`);
            console.log(`   https://stellar.expert/explorer/testnet/tx/${paymentResult.txHash}`);
        } else {
            console.log(`   Check your custom network explorer with transaction hash: ${paymentResult.txHash}`);
        }
        console.log('═'.repeat(60));

        console.log('\n✅ TEST COMPLETED SUCCESSFULLY!\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED!\n');
        console.error('═'.repeat(60));
        console.error('Error Details:');
        console.error(`   Message: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
        console.error('═'.repeat(60));
        
        console.log('\n💡 Troubleshooting Tips:');
        console.log('   1. Check if both accounts exist on the network');
        console.log('   2. Ensure sender has sufficient balance');
        console.log('   3. Verify STELLAR_NETWORK environment variable is correct');
        console.log('   4. For custom networks, ensure STELLAR_HORIZON_URL is set');
        console.log('   5. Check network passphrase for custom networks');
        console.log('   6. Verify secret key is correct and not expired\n');
    }
}

// Run the test
testStellarPayment();
