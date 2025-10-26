const StellarSdk = require('@stellar/stellar-sdk');

/**
 * Stellar Payment Service
 * Handles XLM transfers on the Stellar network
 */

// Network configuration
const getNetworkConfig = (network = null) => {
    const targetNetwork = network || process.env.STELLAR_NETWORK || 'testnet';
    
    if (targetNetwork === 'mainnet') {
        return {
            horizonUrl: 'https://horizon.stellar.org',
            passphrase: StellarSdk.Networks.PUBLIC,
            name: 'mainnet'
        };
    } else {
        return {
            horizonUrl: 'https://horizon-testnet.stellar.org',
            passphrase: StellarSdk.Networks.TESTNET,
            name: 'testnet'
        };
    }
};

// Get initial network config
const initialConfig = getNetworkConfig();
const NETWORK = initialConfig.name;
const HORIZON_URL = initialConfig.horizonUrl;

// Create server instance (will be recreated when network changes)
let server = new StellarSdk.Horizon.Server(HORIZON_URL);

/**
 * Get or create a server instance for a specific network
 * @param {string} network - 'mainnet' or 'testnet'
 * @returns {Object} Server instance and network config
 */
function getServerForNetwork(network = null) {
    const config = getNetworkConfig(network);
    
    // Create a new server instance for this network
    const networkServer = new StellarSdk.Horizon.Server(config.horizonUrl);
    
    return {
        server: networkServer,
        passphrase: config.passphrase,
        network: config.name
    };
}

/**
 * Send XLM payment from one account to another
 * @param {string} senderSecretKey - Secret key of the sender (maintainer)
 * @param {string} recipientPublicKey - Public key of the recipient (developer)
 * @param {string|number} amount - Amount of XLM to send
 * @param {string} memo - Optional memo for the transaction
 * @param {string} network - Optional network ('mainnet' or 'testnet'). Defaults to env setting.
 * @returns {Promise<Object>} Transaction result with hash
 */
async function sendPayment(senderSecretKey, recipientPublicKey, amount, memo = '', network = null) {
    try {
        // Get network-specific server and config
        const networkInfo = getServerForNetwork(network);
        const txServer = networkInfo.server;
        const networkPassphrase = networkInfo.passphrase;
        const networkName = networkInfo.network;
        
        console.log('\n💰 Initiating Stellar Payment...');
        console.log(`   Network: ${networkName}`);
        console.log(`   Horizon: ${networkInfo.server.serverURL}`);
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
        const senderAccount = await txServer.loadAccount(senderPublicKey);
        console.log('   ✅ Sender account loaded');

        // Build transaction with proper network passphrase
        const transaction = new StellarSdk.TransactionBuilder(senderAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: networkPassphrase
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: recipientPublicKey,
                    asset: StellarSdk.Asset.native(), // XLM
                    amount: amount.toString()
                })
            )
            .setTimeout(180);

        // Add memo if provided (max 28 bytes for text memo)
        if (memo) {
            // Truncate memo to 28 bytes if necessary
            const truncatedMemo = memo.length > 28 ? memo.substring(0, 28) : memo;
            transaction.addMemo(StellarSdk.Memo.text(truncatedMemo));
        }

        const builtTransaction = transaction.build();

        // Sign transaction
        builtTransaction.sign(senderKeypair);
        console.log('   ✅ Transaction signed');

        // Submit transaction
        const transactionResult = await txServer.submitTransaction(builtTransaction);
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
            network: networkName
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
 * @param {string} network - Optional network ('mainnet' or 'testnet')
 * @returns {Promise<string>} XLM balance
 */
async function getBalance(publicKey, network = null) {
    try {
        const networkInfo = getServerForNetwork(network);
        const txServer = networkInfo.server;
        
        const account = await txServer.loadAccount(publicKey);
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
 * @param {string} network - Optional network ('mainnet' or 'testnet')
 * @returns {Promise<boolean>} True if account exists
 */
async function accountExists(publicKey, network = null) {
    try {
        const networkInfo = getServerForNetwork(network);
        const txServer = networkInfo.server;
        
        await txServer.loadAccount(publicKey);
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
 * @param {string} network - Optional network ('mainnet' or 'testnet')
 * @returns {Promise<Object>} Transaction details
 */
async function getTransaction(txHash, network = null) {
    try {
        const networkInfo = getServerForNetwork(network);
        const txServer = networkInfo.server;
        
        const transaction = await txServer.transactions().transaction(txHash).call();
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
    getServerForNetwork,
    getNetworkConfig,
    NETWORK,
    HORIZON_URL
};
