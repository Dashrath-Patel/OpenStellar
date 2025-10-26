const StellarSdk = require('@stellar/stellar-sdk');

/**
 * Stellar Payment Service
 * Handles XLM transfers on the Stellar network
 */

// Configure Stellar SDK
const NETWORK = process.env.STELLAR_NETWORK || 'testnet'; // 'testnet' or 'mainnet'
const HORIZON_URL = NETWORK === 'mainnet' 
    ? 'https://horizon.stellar.org'
    : 'https://horizon-testnet.stellar.org';

const server = new StellarSdk.Horizon.Server(HORIZON_URL);
StellarSdk.Networks[NETWORK.toUpperCase()] = NETWORK === 'mainnet'
    ? StellarSdk.Networks.PUBLIC
    : StellarSdk.Networks.TESTNET;

/**
 * Send XLM payment from one account to another
 * @param {string} senderSecretKey - Secret key of the sender (maintainer)
 * @param {string} recipientPublicKey - Public key of the recipient (developer)
 * @param {string|number} amount - Amount of XLM to send
 * @param {string} memo - Optional memo for the transaction
 * @returns {Promise<Object>} Transaction result with hash
 */
async function sendPayment(senderSecretKey, recipientPublicKey, amount, memo = '') {
    try {
        console.log('\n💰 Initiating Stellar Payment...');
        console.log(`   Network: ${NETWORK}`);
        console.log(`   Amount: ${amount} XLM`);
        console.log(`   To: ${recipientPublicKey}`);

        // Validate recipient address
        if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipientPublicKey)) {
            throw new Error('Invalid recipient Stellar address');
        }

        // Load sender keypair
        const senderKeypair = StellarSdk.Keypair.fromSecret(senderSecretKey);
        const senderPublicKey = senderKeypair.publicKey();

        console.log(`   From: ${senderPublicKey}`);

        // Load sender account
        const senderAccount = await server.loadAccount(senderPublicKey);
        console.log('   ✅ Sender account loaded');

        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks[NETWORK.toUpperCase()]
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: recipientPublicKey,
                    asset: StellarSdk.Asset.native(), // XLM
                    amount: amount.toString()
                })
            )
            .setTimeout(180);

        // Add memo if provided
        if (memo) {
            transaction.addMemo(StellarSdk.Memo.text(memo));
        }

        const builtTransaction = transaction.build();

        // Sign transaction
        builtTransaction.sign(senderKeypair);
        console.log('   ✅ Transaction signed');

        // Submit transaction
        const transactionResult = await server.submitTransaction(builtTransaction);
        console.log('   ✅ Transaction submitted successfully!');
        console.log(`   TX Hash: ${transactionResult.hash}`);

        return {
            success: true,
            txHash: transactionResult.hash,
            ledger: transactionResult.ledger,
            fee: transactionResult.fee_charged,
            from: senderPublicKey,
            to: recipientPublicKey,
            amount: amount,
            network: NETWORK
        };

    } catch (error) {
        console.error('   ❌ Payment failed:', error.message);
        
        // Provide more detailed error messages
        if (error.response) {
            const result = error.response.data;
            console.error('   Error details:', result.extras?.result_codes);
            
            // Common error messages
            if (result.extras?.result_codes?.operations?.includes('op_underfunded')) {
                throw new Error('Insufficient XLM balance in sender account');
            }
            if (result.extras?.result_codes?.operations?.includes('op_no_destination')) {
                throw new Error('Recipient account does not exist on Stellar network');
            }
        }

        throw new Error(`Stellar payment failed: ${error.message}`);
    }
}

/**
 * Check account balance
 * @param {string} publicKey - Public key to check
 * @returns {Promise<string>} XLM balance
 */
async function getBalance(publicKey) {
    try {
        const account = await server.loadAccount(publicKey);
        const xlmBalance = account.balances.find(b => b.asset_type === 'native');
        return xlmBalance ? xlmBalance.balance : '0';
    } catch (error) {
        console.error('Failed to get balance:', error.message);
        throw new Error(`Failed to check balance: ${error.message}`);
    }
}

/**
 * Verify if an account exists
 * @param {string} publicKey - Public key to verify
 * @returns {Promise<boolean>} True if account exists
 */
async function accountExists(publicKey) {
    try {
        await server.loadAccount(publicKey);
        return true;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return false;
        }
        throw error;
    }
}

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction details
 */
async function getTransaction(txHash) {
    try {
        const transaction = await server.transactions().transaction(txHash).call();
        return transaction;
    } catch (error) {
        console.error('Failed to get transaction:', error.message);
        throw new Error(`Failed to fetch transaction: ${error.message}`);
    }
}

module.exports = {
    sendPayment,
    getBalance,
    accountExists,
    getTransaction,
    NETWORK,
    HORIZON_URL
};
